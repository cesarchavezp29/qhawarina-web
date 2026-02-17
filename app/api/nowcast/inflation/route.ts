/**
 * Inflation Nowcast API Endpoint
 *
 * GET /api/nowcast/inflation
 * Returns latest inflation nowcast
 */

import { NextRequest } from "next/server";
import { withApiMiddleware, successResponse, errorResponse } from "../../middleware";
import fs from "fs";
import path from "path";

async function handler(req: NextRequest, context: { tier: string }) {
  try {
    // Read inflation nowcast data
    const dataPath = path.join(process.cwd(), "public", "assets", "data", "inflation_nowcast.json");

    if (!fs.existsSync(dataPath)) {
      return errorResponse("Inflation nowcast data not available", "DATA_NOT_FOUND", 404);
    }

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(rawData);

    // Format response
    const response = {
      indicator: "inflation",
      nowcast: {
        value: data.nowcast.value,
        target_period: data.nowcast.target_period,
        unit: "% monthly",
        annualized: data.nowcast.value * 12,
      },
      model: {
        name: data.model.name,
        factors: data.model.k_factors,
        includes_lags: data.model.include_factor_lags > 0,
        includes_ar: data.model.include_target_ar,
        r2: data.model.direct_r2,
      },
      backtest_metrics: {
        rmse: data.backtest_metrics.rmse,
        mae: data.backtest_metrics.mae,
        r2: data.backtest_metrics.r2,
        relative_rmse_vs_ar1: data.backtest_metrics.relative_rmse_vs_ar1,
      },
      metadata: {
        generated_at: data.metadata.generated_at,
        data_through: data.metadata.data_through,
        n_series: data.metadata.n_series,
        source: "INEI, BCRP, MIDAGRI, Supermercados",
      },
    };

    // Add historical data for pro/enterprise tiers
    if (context.tier === "pro" || context.tier === "enterprise") {
      response.historical = data.historical_monthly?.slice(-24); // Last 2 years
    }

    return successResponse(response, {
      tier: context.tier,
      cache: "public, max-age=3600",
    });
  } catch (error: any) {
    console.error("Inflation API Error:", error);
    return errorResponse("Failed to fetch inflation nowcast", "FETCH_ERROR", 500);
  }
}

export const GET = withApiMiddleware(handler);
