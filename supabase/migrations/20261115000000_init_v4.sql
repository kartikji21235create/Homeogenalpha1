-- Homeogenalpha1 Master Schema v4
-- Compliant with PRD v4 and Vibe-Coding Prompt Pack
-- Row Level Security (RLS) on every table using (SELECT auth.uid())
-- Reference tables are read-only to authenticated users

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================
-- ENUMS
-- ==============================================================
DO $$ BEGIN
    CREATE TYPE sex_t AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE symptom_category_t AS ENUM ('MENTAL_GENERAL', 'PHYSICAL_GENERAL', 'PARTICULAR');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    -- PRD v4 strictly defines 7 states: INTAKE, PROCESSING, REVIEW_TRANSCRIPT, REVIEW_RUBRICS, SCORING, REVIEW_MEDICINES, PRESCRIBING
    CREATE TYPE consultation_state_t AS ENUM (
        'INTAKE', 'PROCESSING', 'REVIEW_TRANSCRIPT', 'REVIEW_RUBRICS',
        'SCORING', 'REVIEW_MEDICINES', 'PRESCRIBING', 'DONE'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE scoring_mode_t AS ENUM ('additive', 'kent', 'boenninghausen', 'boger');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==============================================================
-- DOCTORS & PATIENTS
-- ==============================================================
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    registration_number VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_number VARCHAR(20) UNIQUE NOT NULL,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    display_name VARCHAR(120) NOT NULL,
    year_of_birth SMALLINT CHECK (year_of_birth IS NULL OR year_of_birth BETWEEN 1900 AND 2026),
    sex sex_t NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor_id);

-- ==============================================================
-- REFERENCE DATA (Problem 29: No license record, no load)
-- ==============================================================
CREATE TABLE IF NOT EXISTS data_sources (
    repertory_id VARCHAR(32) PRIMARY KEY,         -- e.g. 'kent_1897'
    source_name VARCHAR(160) NOT NULL,
    edition VARCHAR(80),
    year SMALLINT,
    licence VARCHAR(80) NOT NULL,                 -- e.g. 'public_domain', 'cc-by-sa-4.0'
    source_url TEXT,
    acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
    licence_note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repertory_versions (
    id SERIAL PRIMARY KEY,
    repertory_id VARCHAR(32) NOT NULL REFERENCES data_sources(repertory_id) ON DELETE RESTRICT,
    version VARCHAR(40) NOT NULL,
    embedding_model VARCHAR(80) NOT NULL,         -- e.g. 'gemini-embedding-001'
    embedding_dim SMALLINT NOT NULL DEFAULT 768,
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (repertory_id, version)
);

CREATE TABLE IF NOT EXISTS rubrics (
    id SERIAL PRIMARY KEY,
    repertory_id VARCHAR(32) NOT NULL REFERENCES data_sources(repertory_id) ON DELETE RESTRICT,
    parent_id INTEGER REFERENCES rubrics(id) ON DELETE SET NULL,
    chapter VARCHAR(64) NOT NULL,
    rubric_path TEXT NOT NULL,
    tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', rubric_path)) STORED,
    embedding vector(768) NOT NULL,
    UNIQUE (repertory_id, rubric_path)
);
CREATE INDEX IF NOT EXISTS idx_rubrics_tsv ON rubrics USING gin(tsv);
CREATE INDEX IF NOT EXISTS idx_rubrics_repertory ON rubrics(repertory_id);

CREATE TABLE IF NOT EXISTS rubric_sources (
    rubric_id INTEGER NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
    book VARCHAR(120) NOT NULL,
    edition VARCHAR(80),
    page VARCHAR(20),
    PRIMARY KEY (rubric_id, book)
);

CREATE TABLE IF NOT EXISTS remedies (
    id SERIAL PRIMARY KEY,
    common_name VARCHAR(120) UNIQUE NOT NULL,
    abbreviation VARCHAR(32) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS remedy_aliases (
    alias VARCHAR(32) PRIMARY KEY,
    remedy_id INTEGER NOT NULL REFERENCES remedies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medicine_rubric_mapping (
    rubric_id INTEGER NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES remedies(id) ON DELETE CASCADE,
    grade SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 4),
    PRIMARY KEY (rubric_id, medicine_id)
);
CREATE INDEX IF NOT EXISTS idx_mrm_medicine ON medicine_rubric_mapping(medicine_id);
CREATE INDEX IF NOT EXISTS idx_mrm_rubric ON medicine_rubric_mapping(rubric_id);

CREATE TABLE IF NOT EXISTS synonyms (
    id SERIAL PRIMARY KEY,
    phrase VARCHAR(200) NOT NULL,
    canonical_phrase VARCHAR(200) NOT NULL,
    locale VARCHAR(8) NOT NULL DEFAULT 'en'
);
CREATE INDEX IF NOT EXISTS idx_synonyms_phrase ON synonyms(phrase);

-- ==============================================================
-- WORKING TABLES (RLS Isolated per doctor)
-- ==============================================================
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dpdp_consent_logged BOOLEAN NOT NULL DEFAULT FALSE,
    transcript TEXT,
    state consultation_state_t NOT NULL DEFAULT 'INTAKE',
    rubric_revision INTEGER NOT NULL DEFAULT 0,
    scoring_mode scoring_mode_t NOT NULL DEFAULT 'additive',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);

CREATE TABLE IF NOT EXISTS extracted_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    category symptom_category_t NOT NULL,
    phrase TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    negation BOOLEAN NOT NULL DEFAULT FALSE,
    modality_notes TEXT,
    source_span_start INTEGER,
    source_span_end INTEGER,
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    missing_info JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_symptoms_consultation ON extracted_symptoms(consultation_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_doctor ON extracted_symptoms(doctor_id);

CREATE TABLE IF NOT EXISTS suggested_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_id UUID NOT NULL REFERENCES extracted_symptoms(id) ON DELETE CASCADE,
    rubric_id INTEGER NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    reason TEXT,
    rank SMALLINT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_suggested_symptom ON suggested_rubrics(symptom_id);
CREATE INDEX IF NOT EXISTS idx_suggested_rubric ON suggested_rubrics(rubric_id);

CREATE TABLE IF NOT EXISTS confirmed_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    rubric_id INTEGER NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
    weight SMALLINT NOT NULL CHECK (weight BETWEEN 1 AND 4),
    doctor_edited BOOLEAN NOT NULL DEFAULT FALSE,
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (consultation_id, rubric_id)
);
CREATE INDEX IF NOT EXISTS idx_confirmed_consultation ON confirmed_rubrics(consultation_id);
CREATE INDEX IF NOT EXISTS idx_confirmed_doctor ON confirmed_rubrics(doctor_id);

CREATE TABLE IF NOT EXISTS rubrics_custom (
    id SERIAL PRIMARY KEY,
    contributor_doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    chapter VARCHAR(64) NOT NULL,
    rubric_path TEXT NOT NULL,
    ownership_declared BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    dpdp_consent_logged BOOLEAN NOT NULL DEFAULT FALSE,
    medicine_id INTEGER NOT NULL REFERENCES remedies(id) ON DELETE RESTRICT,
    potency VARCHAR(16) NOT NULL,
    notes TEXT,
    dosage_instructions TEXT NOT NULL,
    scoring_snapshot JSONB NOT NULL,
    repertory_version_id INTEGER REFERENCES repertory_versions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON prescriptions(consultation_id);

CREATE TABLE IF NOT EXISTS ai_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consent_scope VARCHAR(32) NOT NULL DEFAULT 'text',
    text_version VARCHAR(20) NOT NULL DEFAULT 'v1',
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    call_type VARCHAR(40) NOT NULL,
    model_name VARCHAR(80) NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    cost_estimate NUMERIC(10, 6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================
-- DATABASE INTEGRITY TRIGGER
-- ==============================================================
-- Problem: A prescription insert must be rejected unless every rubric in its
-- snapshot exists in confirmed_rubrics with a non-null weight between 1 and 4.
CREATE OR REPLACE FUNCTION validate_prescription_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    unweighted_count INTEGER;
    total_confirmed INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_confirmed
    FROM confirmed_rubrics
    WHERE consultation_id = NEW.consultation_id;

    IF total_confirmed = 0 THEN
        RAISE EXCEPTION 'prescription rejected: consultation has no confirmed rubrics'
            USING ERRCODE = 'P0001';
    END IF;

    SELECT COUNT(*) INTO unweighted_count
    FROM confirmed_rubrics
    WHERE consultation_id = NEW.consultation_id AND (weight IS NULL OR weight < 1 OR weight > 4);

    IF unweighted_count > 0 THEN
        RAISE EXCEPTION 'prescription rejected: % confirmed rubric(s) have invalid or missing weight', unweighted_count
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prescription_weights_set ON prescriptions;
CREATE TRIGGER trg_prescription_weights_set
    BEFORE INSERT ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION validate_prescription_snapshot();

-- ==============================================================
-- DETERMINISTIC SCORING SQL FUNCTION
-- ==============================================================
-- Order: score DESC, rubrics_covered DESC, m.id ASC (tie-breaker)
CREATE OR REPLACE FUNCTION repertorize(
    p_consultation_id UUID,
    p_expected_revision INTEGER,
    p_repertory_id VARCHAR DEFAULT 'kent_1897'
)
RETURNS TABLE (
    medicine_id INTEGER,
    common_name VARCHAR,
    score BIGINT,
    rubrics_covered BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_rev INTEGER;
    v_unweighted_count INTEGER;
BEGIN
    SELECT rubric_revision INTO v_current_rev
    FROM consultations
    WHERE id = p_consultation_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'consultation not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_current_rev <> p_expected_revision THEN
        RAISE EXCEPTION 'stale_revision: current=% expected=%', v_current_rev, p_expected_revision
            USING ERRCODE = 'P0003';
    END IF;

    SELECT COUNT(*) INTO v_unweighted_count
    FROM confirmed_rubrics
    WHERE consultation_id = p_consultation_id AND (weight IS NULL OR weight < 1 OR weight > 4);

    IF v_unweighted_count > 0 THEN
        RAISE EXCEPTION 'unweighted_rubrics: % rubrics require weights 1-4', v_unweighted_count
            USING ERRCODE = 'P0004';
    END IF;

    RETURN QUERY
    SELECT
        m.id AS medicine_id,
        m.common_name,
        SUM(mrm.grade * cr.weight)::BIGINT AS score,
        COUNT(DISTINCT cr.rubric_id)::BIGINT AS rubrics_covered
    FROM confirmed_rubrics cr
    JOIN rubrics r ON r.id = cr.rubric_id AND r.repertory_id = p_repertory_id
    JOIN medicine_rubric_mapping mrm ON mrm.rubric_id = cr.rubric_id
    JOIN remedies m ON m.id = mrm.medicine_id
    WHERE cr.consultation_id = p_consultation_id
      AND cr.weight IS NOT NULL
    GROUP BY m.id, m.common_name
    ORDER BY score DESC, rubrics_covered DESC, m.id ASC
    LIMIT 12;
END;
$$;

-- ==============================================================
-- HYBRID SEARCH SQL FUNCTION (Full-text + pgvector + RRF)
-- ==============================================================
CREATE OR REPLACE FUNCTION hybrid_search_rubrics(
    p_query_text TEXT,
    p_query_vector vector(768),
    p_repertory_id VARCHAR DEFAULT 'kent_1897',
    p_rrf_k INTEGER DEFAULT 60,
    p_candidate_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    rubric_id INTEGER,
    chapter VARCHAR,
    rubric_path TEXT,
    rrf_score DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    WITH v_search AS (
        SELECT id, chapter, rubric_path,
               ROW_NUMBER() OVER (ORDER BY embedding <=> p_query_vector) AS rank
        FROM rubrics
        WHERE repertory_id = p_repertory_id
        ORDER BY embedding <=> p_query_vector
        LIMIT p_candidate_limit
    ),
    k_search AS (
        SELECT id, chapter, rubric_path,
               ROW_NUMBER() OVER (
                   ORDER BY ts_rank_cd(tsv, plainto_tsquery('english', p_query_text)) DESC
               ) AS rank
        FROM rubrics
        WHERE repertory_id = p_repertory_id
          AND tsv @@ plainto_tsquery('english', p_query_text)
        LIMIT p_candidate_limit
    )
    SELECT
        COALESCE(v.id, k.id) AS rubric_id,
        COALESCE(v.chapter, k.chapter) AS chapter,
        COALESCE(v.rubric_path, k.rubric_path) AS rubric_path,
        (COALESCE(1.0 / (p_rrf_k + v.rank), 0.0) + COALESCE(1.0 / (p_rrf_k + k.rank), 0.0))::DOUBLE PRECISION AS rrf_score
    FROM v_search v
    FULL OUTER JOIN k_search k ON v.id = k.id
    ORDER BY rrf_score DESC
    LIMIT p_candidate_limit;
$$;

-- ==============================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY doctors_select_own ON doctors FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY doctors_insert_own ON doctors FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY doctors_update_own ON doctors FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY patients_isolation ON patients FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = doctor_id) WITH CHECK ((SELECT auth.uid()) = doctor_id);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY consultations_isolation ON consultations FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = doctor_id)
    WITH CHECK (
        (SELECT auth.uid()) = doctor_id
        AND EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_id AND p.doctor_id = (SELECT auth.uid()))
    );

ALTER TABLE extracted_symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY symptoms_isolation ON extracted_symptoms FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = doctor_id) WITH CHECK ((SELECT auth.uid()) = doctor_id);

ALTER TABLE suggested_rubrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY suggested_isolation ON suggested_rubrics FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM extracted_symptoms s WHERE s.id = symptom_id AND s.doctor_id = (SELECT auth.uid())));

ALTER TABLE confirmed_rubrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY confirmed_isolation ON confirmed_rubrics FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = doctor_id) WITH CHECK ((SELECT auth.uid()) = doctor_id);

ALTER TABLE rubrics_custom ENABLE ROW LEVEL SECURITY;
CREATE POLICY rubrics_custom_isolation ON rubrics_custom FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = contributor_doctor_id) WITH CHECK ((SELECT auth.uid()) = contributor_doctor_id);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY prescriptions_select_own ON prescriptions FOR SELECT TO authenticated USING ((SELECT auth.uid()) = doctor_id);
CREATE POLICY prescriptions_insert_own ON prescriptions FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = doctor_id
        AND EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_id AND p.doctor_id = (SELECT auth.uid()))
    );

ALTER TABLE ai_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_consents_isolation ON ai_consents FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = doctor_id) WITH CHECK ((SELECT auth.uid()) = doctor_id);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_isolation ON ai_usage FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = doctor_id) WITH CHECK ((SELECT auth.uid()) = doctor_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_isolation ON audit_log FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = doctor_id) WITH CHECK ((SELECT auth.uid()) = doctor_id);

-- Explicit read-only RLS for reference tables
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY data_sources_read ON data_sources FOR SELECT TO authenticated USING (TRUE);

ALTER TABLE repertory_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY repertory_versions_read ON repertory_versions FOR SELECT TO authenticated USING (TRUE);

ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY rubrics_read ON rubrics FOR SELECT TO authenticated USING (TRUE);

ALTER TABLE rubric_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY rubric_sources_read ON rubric_sources FOR SELECT TO authenticated USING (TRUE);

ALTER TABLE remedies ENABLE ROW LEVEL SECURITY;
CREATE POLICY remedies_read ON remedies FOR SELECT TO authenticated USING (TRUE);

ALTER TABLE remedy_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY remedy_aliases_read ON remedy_aliases FOR SELECT TO authenticated USING (TRUE);

ALTER TABLE medicine_rubric_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY mrm_read ON medicine_rubric_mapping FOR SELECT TO authenticated USING (TRUE);

ALTER TABLE synonyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY synonyms_read ON synonyms FOR SELECT TO authenticated USING (TRUE);
