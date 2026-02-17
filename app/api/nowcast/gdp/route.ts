/**
 * GDP Nowcast API Endpoint
 *
 * GET /api/nowcast/gdp
 * Returns latest GDP growth nowcast
 */

import { NextRequest } from "next/server";
import { withApiMiddleware, successResponse, errorResponse } from "../../middleware";
import fs from "fs";
import path from "path";

async function handler(req: NextRequest, context: { tier: string }) {
  try {
    // Read GDP nowcast data
    const dataPath = path.join(process.cwd(), "public", "assets", "data", "gdp_nowcast.json");

    if (!fs.existsSync(dataPath)) {
      return errorResponse("GDP nowcast data not available", "DATA_NOT_FOUND", 404);
    }

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(rawData);

    // Format response
    const response: any = {
      indicator: "gdp",
      nowcast: {
        value: data.nowcast.value,
        target_period: data.nowcast.target_period,
        unit: "% YoY",
        bridge_r2: data.nowcast.bridge_r2 || null,
      },
      model: {
        name: data.metadata?.model || "DynamicFactorModel",
        factors: data.metadata?.model_params?.k_factors || 2,
        bridge_method: data.metadata?.model_params?.bridge_method || "ridge",
        bridge_alpha: data.metadata?.model_params?.bridge_alpha || 1.0,
      },
      metadata: {
        generated_at: data.metadata?.generated_at,
        data_vintage: data.metadata?.data_vintage,
        series_coverage: data.metadata?.series_coverage,
        source: "BCRP, INEI",
      },
    };

    // Add forecasts for all tiers
    if (data.forecasts) {
      response.forecasts = data.forecasts.slice(0, 3); // Next 3 quarters
    }

    // Add historical data for pro/enterprise tiers
    if (context.tier === "pro" || context.tier === "enterprise") {
      if (data.quarterly_series) {
        response.historical = data.quarterly_series
          .filter((q: any) => q.official !== null)
          .slice(-20); // Last 5 years
      }
    }

    return successResponse(response, {
      tier: context.tier,
      cache: "public, max-age=3600", // Cache for 1 hour
    });
  } catch (error: any) {
    console.error("GDP API Error:", error);
    return errorResponse("Failed to fetch GDP nowcast", "FETCH_ERROR", 500);
  }
}

export const GET = withApiMiddleware(handler);
