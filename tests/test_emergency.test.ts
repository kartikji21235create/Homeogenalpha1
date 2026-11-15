import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import { detectEmergencySigns } from "../src/lib/ai/emergency";

describe("Rule-Based Emergency Detector (PRD Section 13, Rule 5)", () => {
  test("detects cardiac emergency presentation", () => {
    const text = "Patient presents with crushing chest pain radiating to left arm and cold sweating.";
    const result = detectEmergencySigns(text);

    assert.equal(result.detected, true);
    assert.equal(result.category, "CARDIAC");
    assert.ok(result.bannerMessage?.includes("cardiac emergency"));
  });

  test("detects stroke presentation (FAST protocol)", () => {
    const text = "Elderly patient noticed sudden weakness in right side and sudden slurred speech this morning.";
    const result = detectEmergencySigns(text);

    assert.equal(result.detected, true);
    assert.equal(result.category, "STROKE");
    assert.ok(result.bannerMessage?.includes("stroke symptoms"));
  });

  test("detects severe trauma", () => {
    const text = "Patient suffered severe head injury with unconsciousness after a vehicular collision.";
    const result = detectEmergencySigns(text);

    assert.equal(result.detected, true);
    assert.equal(result.category, "TRAUMA");
    assert.ok(result.bannerMessage?.includes("trauma"));
  });

  test("returns false for non-emergency clinical presentations", () => {
    const text = "Patient has chronic anxiety about health, desire for warm drinks, fastidious habits.";
    const result = detectEmergencySigns(text);

    assert.equal(result.detected, false);
    assert.equal(result.matchedKeywords.length, 0);
  });
});
