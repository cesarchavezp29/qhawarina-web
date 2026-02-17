/**
 * Political Risk Index API Endpoint
 *
 * GET /api/nowcast/political
 * Returns latest political instability index
 */

import { NextRequest } from "next/server";
import { withApiMiddleware, successResponse, errorResponse } from "../../middleware";
import fs from "fs";
import path from "path";

async function handler(req: NextRequest, context: { tier: string }) {
  try {
    // Read political index data
    const dataPath = path.join(
      process.cwd(),
      "public",
      "assets",
      "data",
      "political_index_daily.json"
    );

    if (!fs.existsSync(dataPath)) {
      return errorResponse("Political index data not available", "DATA_NOT_FOUND", 404);
    }

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(rawData);

    // Get latest value
    const latest = data.daily_index[data.daily_index.length - 1];

    // Format response
    const response = {
      indicator: "political_risk",
      current: {
        index: latest.index,
        z_score: latest.z_score,
        date: latest.date,
        interpretation: getInterpretation(latest.z_score),
        severity: getSeverity(latest.z_score),
      },
      components: {
        event_score: latest.event_score,
        financial_stress: latest.financial_stress,
        business_confidence: latest.business_confidence,
      },
      statistics: {
        mean_30d: calculateMean(data.daily_index.slice(-30)),
        volatility_30d: calculateVolatility(data.daily_index.slice(-30)),
        max_6m: Math.max(...data.daily_index.slice(-180).map((d: any) => d.z_score)),
        min_6m: Math.min(...data.daily_index.slice(-180).map((d: any) => d.z_score)),
      },
      metadata: {
        generated_at: data.metadata.generated_at,
        source: "81 RSS feeds, GPT-4o classification, BCRP",
        update_frequency: "Daily at 08:00 PET",
      },
    };

    // Add recent events for pro/enterprise tiers
    if (context.tier === "pro" || context.tier === "enterprise") {
      response.recent_events = data.recent_events?.slice(-10);
      response.historical_daily = data.daily_index.slice(-90); // Last 3 months
    }

    return successResponse(response, {
      tier: context.tier,
      cache: "public, max-age=1800", // Cache for 30 minutes
    });
  } catch (error: any) {
    console.error("Political API Error:", error);
    return errorResponse("Failed to fetch political index", "FETCH_ERROR", 500);
  }
}

function getInterpretation(zScore: number): string {
  if (zScore > 2) return "Crisis política severa";
  if (zScore > 1) return "Inestabilidad elevada";
  if (zScore > 0.5) return "Inestabilidad moderada";
  if (zScore > -0.5) return "Estabilidad normal";
  return "Alta estabilidad";
}

function getSeverity(zScore: number): "critical" | "high" | "medium" | "low" | "minimal" {
  if (zScore > 2) return "critical";
  if (zScore > 1) return "high";
  if (zScore > 0.5) return "medium";
  if (zScore > -0.5) return "low";
  return "minimal";
}

function calculateMean(data: any[]): number {
  const sum = data.reduce((acc, d) => acc + d.z_score, 0);
  return sum / data.length;
}

function calculateVolatility(data: any[]): number {
  const mean = calculateMean(data);
  const variance = data.reduce((acc, d) => acc + Math.pow(d.z_score - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

export const GET = withApiMiddleware(handler);
