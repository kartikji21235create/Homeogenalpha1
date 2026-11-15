# Runbook: Database Restore Drill & Disaster Recovery (Problem 28)

**Target Frequency:** Once per quarter / Before commercial launch  
**RTO Objective (Recovery Time Objective):** < 30 minutes  
**RPO Objective (Recovery Point Objective):** < 5 minutes (with Supabase PITR)  

---

## 1. Prerequisites
- Access to Supabase Project Dashboard / CLI.
- A dedicated **staging environment** (`homeogen-staging`). Never perform live restore drills directly on the production instance.
- Supabase PITR (Point-in-Time Recovery) enabled on the production database tier.

---

## 2. Restore Procedure (Step-by-Step)

### Step 1: Record Drill Timestamp & Target State
1. Note current wall-clock UTC time ($T_{\text{target}}$).
2. Insert a marked canary record in `audit_log`:
   ```sql
   INSERT INTO audit_log (id, doctor_id, action, entity_type, entity_id)
   VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'RESTORE_DRILL_CANARY', 'CANARY', 'canary-drill-v1');
   ```

### Step 2: Initiate Point-in-Time Recovery to Staging
1. In the Supabase Dashboard, navigate to **Project Settings &rarr; Database &rarr; Backups &rarr; Point in Time**.
2. Select target timestamp: $T_{\text{target}} - \text{1 minute}$.
3. Choose **Restore to New Project** / **Restore to Staging Database**.
4. Start restore operation and start timer.

### Step 3: Validate Restored Database Schema & Data Integrity
Once the restore completes:
1. Verify the 18 schema tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
2. Verify reference data row counts match production:
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM rubrics) AS rubrics_count,
     (SELECT COUNT(*) FROM remedies) AS remedies_count,
     (SELECT COUNT(*) FROM medicine_rubric_mapping) AS mappings_count;
   ```
3. Run the scoring determinism test suite against the restored database:
   ```bash
   DATABASE_URL="<restored_staging_db_url>" npx tsx --test tests/test_scoring.test.ts
   ```

### Step 4: Measure & Record RTO and RPO
- **Actual Restoration Duration ($RTO$):** Record elapsed minutes from trigger to passing test suite.
- **Data Loss Window ($RPO$):** Inspect latest transaction timestamp in restored `prescriptions` vs production.
- Sign off drill in compliance log.
