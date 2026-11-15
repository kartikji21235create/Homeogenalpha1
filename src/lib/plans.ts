/**
 * Plans, AI Metering & Spend Alarm (PRD Section 16, Problem 21)
 */

export interface PlanLimits {
  tier: "FREE" | "PRO";
  maxConsultationsPerMonth: number;
  monthlyAiCreditAllowance: number; // in credits (1 credit ~= 1000 tokens)
  dailyAiCapCredits: number;
  exportPdfEnabled: boolean;
  materiaMedicaEnabled: boolean;
}

export const PLAN_CONFIGS: Record<"FREE" | "PRO", PlanLimits> = {
  FREE: {
    tier: "FREE",
    maxConsultationsPerMonth: 5,
    monthlyAiCreditAllowance: 50,
    dailyAiCapCredits: 10,
    exportPdfEnabled: false,
    materiaMedicaEnabled: false,
  },
  PRO: {
    tier: "PRO",
    maxConsultationsPerMonth: 1000,
    monthlyAiCreditAllowance: 1000,
    dailyAiCapCredits: 100,
    exportPdfEnabled: true,
    materiaMedicaEnabled: true,
  },
};

export interface UsageRecord {
  id: string;
  doctor_id: string;
  consultation_id?: string;
  call_type: "EXTRACTION" | "SELECTION" | "SYNONYM_EMBED";
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  credits_consumed: number;
  cost_estimate_usd: number;
  timestamp: string;
}

export interface SpendAlarmStatus {
  alarmTriggered: boolean;
  currentSpendUsd: number;
  spendThresholdUsd: number;
  dailyUsageCredits: number;
  dailyCapCredits: number;
  tier: "FREE" | "PRO";
}

// In-memory ledger for AI usage and spend controls
const usageLedger: UsageRecord[] = [];
const DEFAULT_GLOBAL_SPEND_THRESHOLD_USD = 50.0; // Spend alarm threshold

export function recordAiUsage(
  doctorId: string,
  callType: UsageRecord["call_type"],
  promptTokens: number,
  completionTokens: number,
  consultationId?: string
): UsageRecord {
  const totalTokens = promptTokens + completionTokens;
  const credits = Math.ceil(totalTokens / 1000);
  // Estimate: Gemini 2.0 Flash is ~$0.10 per 1M input tokens, ~$0.40 per 1M output tokens
  const costUsd = (promptTokens * 0.0000001) + (completionTokens * 0.0000004);

  const record: UsageRecord = {
    id: `usg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    doctor_id: doctorId,
    consultation_id: consultationId,
    call_type: callType,
    model_name: process.env.EXTRACTION_MODEL || "gemini-2.0-flash",
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    credits_consumed: credits,
    cost_estimate_usd: costUsd,
    timestamp: new Date().toISOString(),
  };

  usageLedger.push(record);
  return record;
}

export function checkSpendAlarm(
  doctorId: string,
  tier: "FREE" | "PRO" = "PRO",
  thresholdUsd = DEFAULT_GLOBAL_SPEND_THRESHOLD_USD
): SpendAlarmStatus {
  const limits = PLAN_CONFIGS[tier];

  // Calculate doctor's daily credits
  const today = new Date().toISOString().slice(0, 10);
  const dailyCredits = usageLedger
    .filter((r) => r.doctor_id === doctorId && r.timestamp.startsWith(today))
    .reduce((sum, r) => sum + r.credits_consumed, 0);

  // Calculate total spend across all calls
  const totalSpend = usageLedger.reduce((sum, r) => sum + r.cost_estimate_usd, 0);

  const alarmTriggered = totalSpend >= thresholdUsd || dailyCredits >= limits.dailyAiCapCredits;

  return {
    alarmTriggered,
    currentSpendUsd: totalSpend,
    spendThresholdUsd: thresholdUsd,
    dailyUsageCredits: dailyCredits,
    dailyCapCredits: limits.dailyAiCapCredits,
    tier,
  };
}

export function getDoctorUsageSummary(doctorId: string): {
  totalCalls: number;
  totalTokens: number;
  totalCredits: number;
  totalCostUsd: number;
  records: UsageRecord[];
} {
  const doctorRecords = usageLedger.filter((r) => r.doctor_id === doctorId);
  const totalTokens = doctorRecords.reduce(
    (sum, r) => sum + r.prompt_tokens + r.completion_tokens,
    0
  );
  const totalCredits = doctorRecords.reduce((sum, r) => sum + r.credits_consumed, 0);
  const totalCostUsd = doctorRecords.reduce((sum, r) => sum + r.cost_estimate_usd, 0);

  return {
    totalCalls: doctorRecords.length,
    totalTokens,
    totalCredits,
    totalCostUsd,
    records: doctorRecords.slice(-50),
  };
}
