import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import {
  recordAiUsage,
  checkSpendAlarm,
  getDoctorUsageSummary,
  PLAN_CONFIGS,
} from "../src/lib/plans";

describe("Plans, AI Credits & Spend Alarm (PRD Section 16, Problem 21)", () => {
  const doctorId = "doc_spend_test_001";

  test("accurately records token usage and calculates credits and cost estimate", () => {
    const record = recordAiUsage(
      doctorId,
      "EXTRACTION",
      1200, // prompt tokens
      300   // completion tokens
    );

    assert.ok(record.id);
    assert.equal(record.prompt_tokens, 1200);
    assert.equal(record.completion_tokens, 300);
    // 1500 tokens -> Math.ceil(1500 / 1000) = 2 credits
    assert.equal(record.credits_consumed, 2);
    assert.ok(record.cost_estimate_usd > 0);
  });

  test("fires spend alarm when daily credit cap is reached on Free tier", () => {
    const freeDoctorId = "doc_free_cap_test";
    const freeCap = PLAN_CONFIGS.FREE.dailyAiCapCredits; // 10 credits

    // Record usage equal to daily cap (10 credits = 10,000 tokens)
    recordAiUsage(freeDoctorId, "EXTRACTION", 5000, 5000);

    const alarmStatus = checkSpendAlarm(freeDoctorId, "FREE");
    assert.equal(alarmStatus.tier, "FREE");
    assert.equal(alarmStatus.dailyCapCredits, freeCap);
    assert.equal(alarmStatus.alarmTriggered, true);
  });

  test("fires spend alarm when configured dollar threshold is breached", () => {
    const proDoctorId = "doc_pro_dollar_test";
    // Check alarm with a low test threshold of $0.0001
    const testThreshold = 0.0001;

    // Record call that costs more than threshold
    recordAiUsage(proDoctorId, "SELECTION", 2000000, 500000); // 2.5M tokens

    const alarmStatus = checkSpendAlarm(proDoctorId, "PRO", testThreshold);
    assert.ok(alarmStatus.currentSpendUsd >= testThreshold);
    assert.equal(alarmStatus.alarmTriggered, true);
  });

  test("returns accurate doctor usage summary", () => {
    const summary = getDoctorUsageSummary(doctorId);
    assert.ok(summary.totalCalls >= 1);
    assert.ok(summary.totalTokens >= 1500);
    assert.ok(summary.totalCredits >= 2);
  });
});
