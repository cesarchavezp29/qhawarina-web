/**
 * Poverty Nowcast API Endpoint
 *
 * GET /api/nowcast/poverty
 * Returns latest national poverty rate nowcast
 */

import { NextRequest } from "next/server";
import { withApiMiddleware, successResponse, errorResponse } from "../../middleware";
import fs from "fs";
import path from "path";

async function handler(req: NextRequest, context: { tier: string }) {
  try {
    // Read poverty nowcast data
    const dataPath = path.join(process.cwd(), "public", "assets", "data", "poverty_nowcast.json");

    if (!fs.existsSync(dataPath)) {
      return errorResponse("Poverty nowcast data not available", "DATA_NOT_FOUND", 404);
    }

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(rawData);

    // Format response
    const response = {
      indicator: "poverty",
      nowcast: {
        national: {
          poverty_rate: data.national.poverty_rate,
          extreme_poverty_rate: data.national.extreme_poverty_rate,
          target_year: data.national.target_year,
          unit: "% of population",
        },
        urban: data.urban ? {
          poverty_rate: data.urban.poverty_rate,
          extreme_poverty_rate: data.urban.extreme_poverty_rate,
        } : undefined,
        rural: data.rural ? {
          poverty_rate: data.rural.poverty_rate,
          extreme_poverty_rate: data.rural.extreme_poverty_rate,
        } : undefined,
      },
      model: {
        name: data.model?.name || "GBR Panel",
        method: data.model?.method || "Gradient Boosting",
        approach: "Change prediction",
      },
      backtest_metrics: data.backtest_metrics,
      metadata: {
        generated_at: data.metadata.generated_at,
        source: "INEI ENAHO, NTL Satelital",
        coverage: "25 departamentos",
      },
    };

    // Add departmental breakdown for pro/enterprise tiers
    if (context.tier === "pro" || context.tier === "enterprise") {
      if (data.departmental) {
        response.departmental = data.departmental;
      }
    }

    return successResponse(response, {
      tier: context.tier,
      cache: "public, max-age=7200", // Cache for 2 hours (updates less frequently)
    });
  } catch (error: any) {
    console.error("Poverty API Error:", error);
    return errorResponse("Failed to fetch poverty nowcast", "FETCH_ERROR", 500);
  }
}

export const GET = withApiMiddleware(handler);
