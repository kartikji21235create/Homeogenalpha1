import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptimeSeconds = Math.floor(process.uptime());
  const memUsage = process.memoryUsage();

  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "your-gemini-api-key" &&
      process.env.GEMINI_API_KEY !== "mock"
  );

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "http://127.0.0.1:54321" &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const isHealthy =
    db.remedies.length > 0 &&
    db.rubrics.length > 0 &&
    db.materiaMedica.length > 0;

  const responsePayload = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime_seconds: uptimeSeconds,
    system: {
      node_version: process.version,
      memory: {
        rss_mb: Math.round(memUsage.rss / 1024 / 1024),
        heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
    },
    database: {
      remedies_count: db.remedies.length,
      rubrics_count: db.rubrics.length,
      monographs_count: db.materiaMedica.length,
      synonyms_count: db.synonyms.length,
      data_sources_count: db.dataSources.length,
      persistence_mode: supabaseConfigured ? "supabase_hybrid" : "standalone_seed",
    },
    ai_pipeline: {
      gemini_configured: geminiConfigured,
      extraction_model: process.env.EXTRACTION_MODEL || "gemini-2.0-flash",
      embedding_dim: 768,
      closed_set_enforced: true,
      clause_parser_active: true,
    },
    scoring: {
      active_version: process.env.SCORING_VERSION || "v1",
      v2_available: true,
      rules: ["grade_times_weight", "deterministic_tiebreaker", "eliminators_support"],
    },
    compliance: {
      dpdp_act_2023: "enforced",
      clinical_sovereignty: "AI proposes, doctor decides",
      pii_redaction: "active",
      emergency_detector: "active",
    },
  };

  return NextResponse.json(responsePayload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
