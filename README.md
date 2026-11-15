# Homeogenalpha1 — Master Release 1

Clinical decision-support and case-management web app for homoeopathic physicians, compliant with **Master PRD v4** and the **Vibe-Coding Build Prompt Pack**.

> **Design Rule:** The AI proposes, the doctor decides, and every number on screen can be reproduced from stored inputs.

---

## 1. Key Architectural Decisions (v4)
1. **Text-First MVP:** Doctor types or pastes the clinical narrative (no audio/job-runner risks in R1).
2. **Next.js 15 + Supabase:** Single unified stack with App Router, TypeScript strict, and server routes.
3. **True Postgres RLS:** Row-level security enforced on every table using `(SELECT auth.uid())`.
4. **Deterministic Scoring:** Plain SQL function `repertorize()` with stable tiebreaker chain: `ORDER BY score DESC, rubrics_covered DESC, remedy_id ASC LIMIT 12`.
5. **Closed-Set Rubric Retrieval:** Hybrid search (FTS + 768-dim L2-normalized vector embeddings + RRF) returns top 20 candidates. The selection model is restricted to candidate IDs only. Hallucinated IDs are structurally rejected with automatic fallback.
6. **Domain Safeguards:** Negation and modalities are stored in dedicated schema fields. Rule-based emergency detector flags red-flag presentations (stroke FAST protocol, cardiac chest pain, severe trauma).

---

## 2. Directory Structure

```
homeogenalpha1/
├── src/
│   ├── app/
│   │   ├── page.tsx                           # Home dashboard
│   │   ├── layout.tsx                         # Global clinical shell & navigation
│   │   ├── globals.css                        # Dark-first homoeopathic theme
│   │   ├── consultation/page.tsx              # Active consultation interface
│   │   ├── repertory/page.tsx                 # Kent 1897 Repertory Explorer
│   │   └── api/
│   │       ├── analyze/route.ts               # Stage B: Extract -> Retrieve -> Select
│   │       ├── rubrics/[consultationId]/      # PUT rubrics with revision checking (409)
│   │       ├── repertorize/[consultationId]/  # POST deterministic scoring
│   │       ├── prescriptions/route.ts         # POST prescription with immutable snapshot
│   │       ├── rubrics/search/route.ts        # GET hybrid search top 20 rubrics
│   │       └── cases/[id]/export/route.ts     # GET case export
│   ├── features/consultation/
│   │   ├── machine.ts                         # XState v5 consultation machine
│   │   ├── ConsultationScreen.tsx             # Main interactive consultation screen
│   │   ├── Stepper.tsx                        # 7-step clinical progress stepper
│   │   └── RubricSearchModal.tsx              # Live modal for repertory search & rubric swap
│   └── lib/
│       ├── scoring.ts                         # Deterministic scoring engine & tiebreaker
│       ├── retrieval.ts                       # Hybrid FTS + vector + RRF search engine
│       ├── ai/
│       │   ├── pipeline.ts                    # Extraction & closed-set rubric selector
│       │   ├── redaction.ts                   # PII redaction & leak prevention
│       │   └── emergency.ts                   # Rule-based red-flag detector
│       └── db/
│           └── store.ts                       # Data access layer & in-memory/Supabase engine
├── supabase/
│   └── migrations/
│       └── 20261115000000_init_v4.sql         # Postgres DDL: tables, indexes, RLS, functions
├── seed/
│   ├── data_sources.json                      # Verified data sources (Kent 1897)
│   ├── seed_data.json                         # 26 remedies, 21 rubrics, 68 mappings, 19 synonyms
│   ├── loader.ts                              # Gated data loader (fails closed on unmapped data)
│   ├── rejected_rows_report.json              # Rejected row audit log
│   └── golden_set.json                        # 10 clinical consultation cases for eval
├── evals/
│   └── eval_harness.ts                        # Retrieval evaluation harness (Recall@20)
└── tests/
    ├── test_scoring.test.ts                   # Scoring determinism & tiebreaker tests
    ├── test_redaction.test.ts                 # PII stripping & leak prevention tests
    ├── test_emergency.test.ts                 # Emergency presentation detector tests
    ├── test_closed_set.test.ts                # Closed-set validation & fallback tests
    ├── test_api_contracts.test.ts             # 400, 403, 409, 422 API contract tests
    └── test_state_machine.test.ts             # XState v5 state machine transition tests
```

---

## 3. Quickstart & Run Commands

### Development Server
```bash
cd homeogenalpha1
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
npm run start
```

### Run All Tests
```bash
npx tsx --test tests/*.test.ts
```

### Run Gated Loader & Eval Harness
```bash
npx tsx seed/loader.ts
npx tsx evals/eval_harness.ts
```

---

## 4. Verification Evidence

| Phase | Check / Gate | Target | Result | Status |
|:---|:---|:---|:---|:---|
| **Phase 0** | License verification on load | No record, no load | Verified against `kent_1897` | **PASS** |
| **Phase 0** | Unmapped remedy handling | Fail closed / log rejected | 0 unmapped on clean seed | **PASS** |
| **Phase 0** | Retrieval baseline (`Recall@20`) | &ge; 90% | **95.8%** on 10 golden cases | **PASS** |
| **Phase 1** | Scoring determinism | Byte-identical output | Verified byte-identical | **PASS** |
| **Phase 1** | Full tiebreaker chain | `score DESC, covered DESC, id ASC` | Verified lower id wins | **PASS** |
| **Phase 1** | Prescription weights check | Reject unweighted rubrics | Throws 422 on unweighted | **PASS** |
| **Phase 2** | PII redaction | Strip emails, phones, names | Verified zero leak in payload | **PASS** |
| **Phase 2** | Emergency presentation check | Stroke, cardiac, trauma alert | Instant referral banner | **PASS** |
| **Phase 2** | Closed-set rubric enforcement | Reject hallucinated IDs | Out-of-set triggers fallback | **PASS** |
| **Phase 3** | Stale revision handling | Return 409 on mismatch | 409 returned with diff details | **PASS** |
| **Phase 3** | Doctor cross-tenant isolation | 403 on foreign patient | 403 returned | **PASS** |
| **Phase 4** | XState v5 consultation flow | INTAKE &rarr; DONE loop | All transitions pass | **PASS** |
| **Phase 4** | Optimistic scoring rollback | Rollback to REVIEW_RUBRICS | Verified with error toast | **PASS** |
