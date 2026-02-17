/**
 * Scenarios List API Endpoint
 *
 * GET /api/scenarios
 * Returns list of available counterfactual scenarios
 */

import { NextRequest } from "next/server";
import { withApiMiddleware, successResponse, errorResponse } from "../middleware";
import fs from "fs";
import path from "path";

async function handler(req: NextRequest, context: { tier: string }) {
  try {
    // Only pro/enterprise can access scenarios
    if (context.tier === "anonymous" || context.tier === "free") {
      return errorResponse(
        "Scenarios API requires Pro or Enterprise tier",
        "TIER_UPGRADE_REQUIRED",
        403
      );
    }

    const scenariosDir = path.join(process.cwd(), "public", "assets", "data", "scenarios");

    // Check if scenarios directory exists
    if (!fs.existsSync(scenariosDir)) {
      return successResponse({ scenarios: [], message: "No scenarios available yet" });
    }

    // Read all scenario files
    const files = fs.readdirSync(scenariosDir).filter((f) => f.endsWith(".json"));

    const scenarios = files.map((file) => {
      const filePath = path.join(scenariosDir, file);
      const rawData = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(rawData);

      return {
        id: file.replace("scenario_", "").replace(".json", ""),
        name: data.metadata.scenario_name,
        description: data.metadata.scenario_description,
        tags: data.metadata.tags,
        shocks: {
          exogenous_count: data.shocks.exogenous.length,
          endogenous_count: data.shocks.endogenous.length,
        },
        impacts_summary: {
          gdp: data.direct_impacts.gdp,
          inflation: data.direct_impacts.inflation,
          poverty: data.propagated_impacts?.aggregate?.poverty_total_pp,
        },
      };
    });

    return successResponse(
      {
        scenarios,
        count: scenarios.length,
      },
      {
        tier: context.tier,
        cache: "public, max-age=3600",
      }
    );
  } catch (error: any) {
    console.error("Scenarios List API Error:", error);
    return errorResponse("Failed to fetch scenarios list", "FETCH_ERROR", 500);
  }
}

export const GET = withApiMiddleware(handler);
