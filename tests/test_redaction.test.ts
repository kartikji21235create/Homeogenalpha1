import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import { redactIdentifiers, assertNoIdentifiersLeaked } from "../src/lib/ai/redaction";

describe("PII Redaction & Safety (PRD Section 11, Problem 22)", () => {
  test("redacts phone numbers and email addresses", () => {
    const raw = "Patient John can be reached at john.doe@example.com or +91-9876543210 for follow-up.";
    const redacted = redactIdentifiers(raw);

    assert.ok(!redacted.includes("john.doe@example.com"));
    assert.ok(!redacted.includes("9876543210"));
    assert.ok(redacted.includes("[redacted-email]"));
    assert.ok(redacted.includes("[redacted-phone]"));
  });

  test("redacts patient full name and individual tokens when provided", () => {
    const patientName = "Aarav Sharma";
    const raw = "Patient Aarav Sharma complains of burning feet. Aarav stated he cannot sleep.";
    const redacted = redactIdentifiers(raw, patientName);

    assert.ok(!redacted.toLowerCase().includes("aarav"));
    assert.ok(!redacted.toLowerCase().includes("sharma"));
    assert.ok(redacted.includes("[patient]"));
  });

  test("assertNoIdentifiersLeaked raises when unredacted email or phone is present", () => {
    assert.throws(
      () => assertNoIdentifiersLeaked("Contact: patient@clinic.org"),
      /email pattern was detected/
    );
    assert.throws(
      () => assertNoIdentifiersLeaked("Call 9988776655 immediately"),
      /phone pattern was detected/
    );
  });

  test("assertNoIdentifiersLeaked passes on clean redacted text", () => {
    assert.doesNotThrow(() => {
      assertNoIdentifiersLeaked("Patient has burning in stomach, better from warm water.", "Aarav Sharma");
    });
  });
});
