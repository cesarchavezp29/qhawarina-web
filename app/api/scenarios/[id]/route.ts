/**
 * Individual Scenario API Endpoint
 *
 * GET /api/scenarios/:id
 * Returns detailed counterfactual analysis for a specific scenario
 */

import { NextRequest } from "next/server";
import { withApiMiddleware, successResponse, errorResponse } from "../../middleware";
import fs from "fs";
import path from "path";

async function handler(
  req: NextRequest,
  context: { tier: string; params: { id: string } }
) {
  try {
    // Only pro/enterprise can access scenarios
    if (context.tier === "anonymous" || context.tier === "free") {
      return errorResponse(
        "Scenarios API requires Pro or Enterprise tier",
        "TIER_UPGRADE_REQUIRED",
        403
      );
    }

    const scenarioId = context.params.id;
    const scenarioPath = path.join(
      process.cwd(),
      "public",
      "assets",
      "data",
      "scenarios",
      `scenario_${scenarioId}.json`
    );

    if (!fs.existsSync(scenarioPath)) {
      return errorResponse(`Scenario '${scenarioId}' not found`, "SCENARIO_NOT_FOUND", 404);
    }

    const rawData = fs.readFileSync(scenarioPath, "utf-8");
    const data = JSON.parse(rawData);

    // Format response
    const response = {
      id: scenarioId,
      metadata: data.metadata,
      baseline: {
        gdp: data.baseline.gdp,
        inflation: data.baseline.inflation,
      },
      counterfactual: {
        gdp: data.counterfactual.gdp,
        inflation: data.counterfactual.inflation,
      },
      direct_impacts: data.direct_impacts,
      propagated_impacts: {
        individual: data.propagated_impacts.individual,
        aggregate: data.propagated_impacts.aggregate,
        interpretation: data.propagated_impacts.interpretation,
      },
      shocks: data.shocks,
      analysis: {
        gdp_change_pp: data.direct_impacts.gdp,
        inflation_change_pp: data.direct_impacts.inflation,
        poverty_change_pp: data.propagated_impacts.aggregate.poverty_total_pp,
        employment_impact: data.propagated_impacts.individual.gdp_shock?.employment_impact_pp,
      },
    };

    return successResponse(response, {
      tier: context.tier,
      cache: "public, max-age=3600",
    });
  } catch (error: any) {
    console.error("Scenario Detail API Error:", error);
    return errorResponse("Failed to fetch scenario details", "FETCH_ERROR", 500);
  }
}

// Next.js dynamic route requires this pattern
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiMiddleware((request, context) =>
    handler(request, { ...context, params })
  )(req);
}
