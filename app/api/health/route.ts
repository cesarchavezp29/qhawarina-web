/**
 * Health Check API Endpoint
 *
 * GET /api/health
 * Returns API status and version
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    // Check if data files exist
    const dataDir = path.join(process.cwd(), "public", "assets", "data");
    const requiredFiles = [
      "gdp_nowcast.json",
      "inflation_nowcast.json",
      "poverty_nowcast.json",
      "political_index_daily.json",
    ];

    const checks = requiredFiles.map((file) => {
      const filePath = path.join(dataDir, file);
      const exists = fs.existsSync(filePath);
      let lastUpdated = null;

      if (exists) {
        try {
          const rawData = fs.readFileSync(filePath, "utf-8");
          const data = JSON.parse(rawData);
          lastUpdated = data.metadata?.generated_at || data.generated_at;
        } catch (e) {
          // Ignore parse errors
        }
      }

      return {
        file,
        status: exists ? "ok" : "missing",
        last_updated: lastUpdated,
      };
    });

    const allHealthy = checks.every((c) => c.status === "ok");

    return NextResponse.json({
      status: allHealthy ? "healthy" : "degraded",
      version: "1.0.0",
      api_version: "v1",
      timestamp: new Date().toISOString(),
      services: {
        gdp_nowcast: checks[0].status,
        inflation_nowcast: checks[1].status,
        poverty_nowcast: checks[2].status,
        political_index: checks[3].status,
      },
      data_freshness: checks.map((c) => ({
        indicator: c.file.replace("_nowcast.json", "").replace("_daily.json", ""),
        last_updated: c.last_updated,
      })),
      rate_limits: {
        anonymous: "20 requests/hour",
        free: "100 requests/hour",
        pro: "1,000 requests/hour",
        enterprise: "10,000 requests/hour",
      },
      documentation: "/api/docs",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
