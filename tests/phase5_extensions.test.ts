import { describe, it } from "node:test";
import assert from "node:assert";
import {
  addCaseEvent,
  listCaseEvents,
  createCaseFolder,
  listCaseFolders,
  assignCaseFolder,
  getCaseFolder,
  createShareLink,
  getShareLink,
  createCustomRubric,
  listCustomRubrics,
} from "../src/lib/db/store";

describe("PRD v4 Release 1 Extensions (Timeline, Shares, Folders, Custom Rubrics)", () => {
  const doctorId = "00000000-0000-0000-0000-000000000001";
  const patientId = "00000000-0000-0000-0000-000000000002";
  const consultationId = "cs_test_ext_001";

  it("records case timeline events and follow-ups with response assessment", async () => {
    const event = await addCaseEvent(consultationId, {
      patient_id: patientId,
      doctor_id: doctorId,
      event_type: "follow_up",
      title: "Follow-up Day 14",
      description: "Patient reports 50% reduction in anxiety and sound sleep.",
      response_assessment: "amelioration",
    });

    assert.ok(event.id);
    assert.strictEqual(event.consultation_id, consultationId);
    assert.strictEqual(event.response_assessment, "amelioration");

    const events = await listCaseEvents(consultationId);
    assert.ok(events.length >= 1);
    assert.strictEqual(events[events.length - 1].title, "Follow-up Day 14");
  });

  it("creates and retrieves expiring share tokens", async () => {
    const share = await createShareLink(consultationId, doctorId, 168); // 7 days
    assert.ok(share.token);
    assert.strictEqual(share.consultation_id, consultationId);

    const retrieved = await getShareLink(share.token);
    assert.ok(retrieved);
    assert.strictEqual(retrieved?.token, share.token);

    // Non-existent token returns null
    const notFound = await getShareLink("non_existent_token_xyz");
    assert.strictEqual(notFound, null);
  });

  it("manages case folders and case folder assignment", async () => {
    const folder = await createCaseFolder(doctorId, "Pediatric Cases", "#4ade80");
    assert.ok(folder.id);
    assert.strictEqual(folder.name, "Pediatric Cases");

    const folders = await listCaseFolders(doctorId);
    assert.ok(folders.some((f) => f.id === folder.id));

    await assignCaseFolder(consultationId, folder.id);
    const assigned = await getCaseFolder(consultationId);
    assert.ok(assigned);
    assert.strictEqual(assigned?.name, "Pediatric Cases");
  });

  it("allows doctors to author custom rubrics and adds them to search", async () => {
    const custom = await createCustomRubric(doctorId, {
      rubric_path: "Mind; Anxiety; climate change, regarding",
      chapter: "Mind",
      notes: "Observed in multiple adolescent cases with insomnia",
      contributor: "Dr. K. Sharma, MD (Hom)",
    });

    assert.ok(custom.id);
    assert.strictEqual(custom.rubric_path, "Mind; Anxiety; climate change, regarding");

    const doctorRubrics = await listCustomRubrics(doctorId);
    assert.ok(doctorRubrics.some((r) => r.id === custom.id));
  });
});
