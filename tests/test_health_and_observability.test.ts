import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET as getHealth } from "../src/app/api/health/route";
import { POST as postSearchMiss } from "../src/app/api/rubrics/search/miss/route";
import { logAuditTrail, getAuditLogs, getSearchMisses } from "../src/lib/db/store";

describe("Production Health & Observability (Audit Step 3 & 6)", () => {
  it("GET /api/health returns system readiness and knowledge base inventory", async () => {
    const res = await getHealth();
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, "healthy");
    assert.ok(data.uptime_seconds >= 0);

    // Verify knowledge base inventory
    assert.ok(data.database.remedies_count >= 636);
    assert.ok(data.database.rubrics_count >= 728);
    assert.ok(data.database.monographs_count >= 636);
    assert.ok(data.database.synonyms_count >= 348);
    assert.ok(data.database.data_sources_count >= 11);

    // Verify compliance flags
    assert.equal(data.compliance.clinical_sovereignty, "AI proposes, doctor decides");
    assert.equal(data.compliance.dpdp_act_2023, "enforced");
    assert.equal(data.scoring.v2_available, true);
  });

  it("POST /api/rubrics/search/miss logs unmapped search queries for synonym mining", async () => {
    const req = new NextRequest("http://localhost:3000/api/rubrics/search/miss", {
      method: "POST",
      body: JSON.stringify({
        query: "chhaati me chubhan jaisi feeling",
        chapter: "Chest",
        results_count: 0,
        reason: "doctor rejected all proposed rubrics",
      }),
    });

    const res = await postSearchMiss(req);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.ok, true);
    assert.ok(body.data.id.startsWith("miss_"));

    const misses = await getSearchMisses(10);
    const found = misses.find((m) => m.query === "chhaati me chubhan jaisi feeling");
    assert.ok(found);
    assert.equal(found?.chapter, "Chest");
  });

  it("logAuditTrail generates immutable clinical governance records", async () => {
    const doctorId = "doc_audit_test_01";
    await logAuditTrail(doctorId, "modify_rubric_weight", "rubric", "cr_101", {
      old_weight: 2,
      new_weight: 4,
    });

    const logs = await getAuditLogs(doctorId);
    assert.ok(logs.length >= 1);
    const targetLog = logs.find((l) => l.target_id === "cr_101");
    assert.ok(targetLog);
    assert.equal(targetLog?.action, "modify_rubric_weight");
    assert.equal(targetLog?.details?.new_weight, 4);
  });
});
