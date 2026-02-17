# Qhawarina API Documentation

## Overview

The Qhawarina API provides programmatic access to Peru's economic nowcasts and counterfactual scenario analysis. Built with Next.js API routes, it offers:

- ✅ **Real-time nowcasts** (GDP, Inflation, Poverty, Political Risk)
- ✅ **Counterfactual analysis** (10 pre-built scenarios)
- ✅ **Rate limiting** (20-10,000 requests/hour depending on tier)
- ✅ **API key authentication** (optional for free tier)
- ✅ **CORS enabled** (cross-origin requests supported)

## Base URL

```
Production: https://qhawarina.pe/api
Development: http://localhost:3000/api
```

## Authentication

Include your API key in the `X-API-Key` header or as a query parameter:

```bash
# Method 1: Header (recommended)
curl -H "X-API-Key: your_api_key" https://qhawarina.pe/api/nowcast/gdp

# Method 2: Query parameter
curl https://qhawarina.pe/api/nowcast/gdp?api_key=your_api_key
```

**Demo API Keys** (for testing):
- Free: `demo_free_key_12345`
- Pro: `demo_pro_key_67890`
- Enterprise: `demo_enterprise_key_abcdef`

## Rate Limits

| Tier | Requests/Hour | Cost | Access |
|------|--------------|------|--------|
| Anonymous | 20 | Free | No API key required |
| Free | 100 | Free | Requires API key |
| Pro | 1,000 | $49/month | Historical data + Scenarios |
| Enterprise | 10,000 | Custom | White-label + Priority support |

Rate limit headers are included in every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 2026-02-16T15:00:00Z
```

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check API status and data freshness.

```bash
curl https://qhawarina.pe/api/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "gdp_nowcast": "ok",
    "inflation_nowcast": "ok",
    "poverty_nowcast": "ok",
    "political_index": "ok"
  },
  "data_freshness": [
    {
      "indicator": "gdp",
      "last_updated": "2026-02-16T08:15:00Z"
    }
  ]
}
```

---

### 2. GDP Nowcast

**GET** `/api/nowcast/gdp`

Latest GDP growth nowcast (YoY %).

**Tier**: Free

```bash
curl -H "X-API-Key: your_key" https://qhawarina.pe/api/nowcast/gdp
```

Response:
```json
{
  "success": true,
  "data": {
    "indicator": "gdp",
    "nowcast": {
      "value": 2.26,
      "target_period": "2025-Q4",
      "confidence_interval": [-0.5, 5.0],
      "unit": "% YoY"
    },
    "model": {
      "name": "DFM-Ridge",
      "factors": 2,
      "bridge_method": "ridge",
      "r2": 0.934
    },
    "backtest_metrics": {
      "rmse": 1.47,
      "mae": 1.12,
      "r2": 0.76,
      "relative_rmse_vs_ar1": 0.69
    },
    "metadata": {
      "generated_at": "2026-02-16T08:15:00Z",
      "data_through": "2025-11",
      "n_series": 33,
      "source": "BCRP, INEI"
    }
  },
  "meta": {
    "timestamp": "2026-02-16T14:30:00Z",
    "tier": "free",
    "cache": "public, max-age=3600"
  }
}
```

**Pro/Enterprise Only**: Response includes `historical` array with quarterly data.

---

### 3. Inflation Nowcast

**GET** `/api/nowcast/inflation`

Latest inflation nowcast (monthly %).

**Tier**: Free

```bash
curl https://qhawarina.pe/api/nowcast/inflation
```

Response:
```json
{
  "success": true,
  "data": {
    "indicator": "inflation",
    "nowcast": {
      "value": 0.21,
      "target_period": "2026-02",
      "unit": "% monthly",
      "annualized": 2.52
    },
    "model": {
      "name": "DFM-AR(1)",
      "factors": 2,
      "includes_lags": true,
      "includes_ar": true,
      "r2": 0.75
    },
    "backtest_metrics": {
      "rmse": 0.319,
      "relative_rmse_vs_ar1": 0.991
    }
  }
}
```

---

### 4. Poverty Nowcast

**GET** `/api/nowcast/poverty`

Latest poverty rate nowcast (%).

**Tier**: Free

```bash
curl https://qhawarina.pe/api/nowcast/poverty
```

Response:
```json
{
  "success": true,
  "data": {
    "indicator": "poverty",
    "nowcast": {
      "national": {
        "poverty_rate": 26.3,
        "extreme_poverty_rate": 4.8,
        "target_year": 2024,
        "unit": "% of population"
      }
    },
    "model": {
      "name": "GBR Panel",
      "method": "Gradient Boosting",
      "approach": "Change prediction"
    },
    "backtest_metrics": {
      "rmse": 2.54,
      "relative_rmse_vs_ar1": 0.953
    }
  }
}
```

**Pro/Enterprise Only**: Response includes `departmental` breakdown (25 departments).

---

### 5. Political Risk Index

**GET** `/api/nowcast/political`

Latest political instability index (z-score).

**Tier**: Free

```bash
curl https://qhawarina.pe/api/nowcast/political
```

Response:
```json
{
  "success": true,
  "data": {
    "indicator": "political_risk",
    "current": {
      "index": 0.34,
      "z_score": 0.52,
      "date": "2026-02-16",
      "interpretation": "Inestabilidad moderada",
      "severity": "medium"
    },
    "components": {
      "event_score": 0.28,
      "financial_stress": 0.15,
      "business_confidence": -0.10
    },
    "statistics": {
      "mean_30d": 0.42,
      "volatility_30d": 0.18,
      "max_6m": 1.85,
      "min_6m": -0.32
    }
  }
}
```

**Pro/Enterprise Only**: Response includes `recent_events` array and `historical_daily` (90 days).

---

### 6. List Scenarios

**GET** `/api/scenarios`

List all available counterfactual scenarios.

**Tier**: Pro or Enterprise

```bash
curl -H "X-API-Key: demo_pro_key_67890" https://qhawarina.pe/api/scenarios
```

Response:
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "mild_recession",
        "name": "Recesión Leve",
        "description": "GDP growth slows to 0%, mild political instability increase",
        "tags": ["recession", "mild", "domestic"],
        "shocks": {
          "exogenous_count": 1,
          "endogenous_count": 1
        },
        "impacts_summary": {
          "gdp": -2.5,
          "inflation": 0.0,
          "poverty": 1.25
        }
      },
      {
        "id": "inflation_spike",
        "name": "Spike Inflacionario",
        "description": "Inflation jumps to 0.5% monthly (6% annual)",
        "tags": ["inflation", "food", "external"],
        "impacts_summary": {
          "gdp": 0.0,
          "inflation": 0.35,
          "poverty": 0.85
        }
      }
    ],
    "count": 10
  }
}
```

---

### 7. Get Scenario Details

**GET** `/api/scenarios/:id`

Detailed counterfactual analysis for a specific scenario.

**Tier**: Pro or Enterprise

```bash
curl -H "X-API-Key: demo_pro_key_67890" https://qhawarina.pe/api/scenarios/mild_recession
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "mild_recession",
    "metadata": {
      "scenario_name": "Mild Recession",
      "scenario_description": "GDP growth slows to 0%, mild political instability increase",
      "tags": ["recession", "mild", "domestic"],
      "generated_at": "2026-02-16T16:18:08Z",
      "target_period_gdp": "2025-10",
      "target_period_inflation": "2026-02"
    },
    "baseline": {
      "gdp": { "gdp_yoy": 2.5 },
      "inflation": { "ipc_monthly_var": 0.25 }
    },
    "counterfactual": {
      "gdp": { "gdp_yoy": 0.0, "forced": true },
      "inflation": { "ipc_monthly_var": 0.25 }
    },
    "direct_impacts": {
      "gdp": -2.5,
      "inflation": 0.0
    },
    "propagated_impacts": {
      "aggregate": {
        "gdp_total_pp": -2.5,
        "inflation_total_monthly_pp": 0.0,
        "poverty_total_pp": 1.25
      },
      "interpretation": "GDP would decrease by 2.5pp. Poverty would increase by 1.2pp."
    },
    "shocks": {
      "exogenous": [
        {
          "series_id": "FINANCIAL_STRESS_INDEX",
          "shock_type": "sigma",
          "shock_value": 1.0,
          "description": "Financial stress rises to +1 sigma"
        }
      ],
      "endogenous": [
        {
          "target": "gdp",
          "forced_value": 0.0,
          "description": "GDP growth constrained to 0%",
          "period": "2026-Q2"
        }
      ]
    },
    "analysis": {
      "gdp_change_pp": -2.5,
      "inflation_change_pp": 0.0,
      "poverty_change_pp": 1.25,
      "employment_impact": -1.5
    }
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-02-16T14:30:00Z"
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|------------|------|-------------|
| 401 | `INVALID_API_KEY` | API key is invalid |
| 403 | `TIER_UPGRADE_REQUIRED` | Endpoint requires higher tier |
| 404 | `DATA_NOT_FOUND` | Requested resource not found |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error |

Example:
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "limit": 100,
  "resetAt": "2026-02-16T15:00:00Z",
  "timestamp": "2026-02-16T14:30:00Z"
}
```

---

## Code Examples

### Python

```python
import requests

API_KEY = "your_api_key"
BASE_URL = "https://qhawarina.pe/api"

headers = {"X-API-Key": API_KEY}

# Get GDP nowcast
response = requests.get(f"{BASE_URL}/nowcast/gdp", headers=headers)
data = response.json()

print(f"GDP Nowcast: {data['data']['nowcast']['value']}%")

# Get scenario
response = requests.get(f"{BASE_URL}/scenarios/mild_recession", headers=headers)
scenario = response.json()

print(f"Baseline GDP: {scenario['data']['baseline']['gdp']['gdp_yoy']}%")
print(f"Counterfactual GDP: {scenario['data']['counterfactual']['gdp']['gdp_yoy']}%")
```

### JavaScript (Node.js)

```javascript
const API_KEY = "your_api_key";
const BASE_URL = "https://qhawarina.pe/api";

async function getNowcast(indicator) {
  const response = await fetch(`${BASE_URL}/nowcast/${indicator}`, {
    headers: { "X-API-Key": API_KEY }
  });
  return response.json();
}

// Get inflation nowcast
const data = await getNowcast("inflation");
console.log(`Inflation: ${data.data.nowcast.value}%`);
```

### cURL

```bash
# Get all nowcasts
curl -H "X-API-Key: your_key" https://qhawarina.pe/api/nowcast/gdp
curl -H "X-API-Key: your_key" https://qhawarina.pe/api/nowcast/inflation
curl -H "X-API-Key: your_key" https://qhawarina.pe/api/nowcast/poverty
curl -H "X-API-Key: your_key" https://qhawarina.pe/api/nowcast/political

# Get scenarios
curl -H "X-API-Key: your_pro_key" https://qhawarina.pe/api/scenarios
curl -H "X-API-Key: your_pro_key" https://qhawarina.pe/api/scenarios/mild_recession
```

---

## Best Practices

### 1. Cache Responses
API responses include cache headers. Respect them to reduce unnecessary requests:

```python
import requests_cache

# Cache for 1 hour
session = requests_cache.CachedSession(expire_after=3600)
response = session.get(f"{BASE_URL}/nowcast/gdp", headers=headers)
```

### 2. Handle Rate Limits
Check rate limit headers and implement exponential backoff:

```python
response = requests.get(url, headers=headers)

remaining = int(response.headers.get("X-RateLimit-Remaining", 0))
if remaining < 10:
    print("Warning: Approaching rate limit")
    time.sleep(60)  # Wait 1 minute
```

### 3. Error Handling
Always check for errors:

```python
response = requests.get(url, headers=headers)

if response.status_code == 429:
    reset_time = response.headers.get("X-RateLimit-Reset")
    print(f"Rate limited. Reset at {reset_time}")
elif response.status_code == 403:
    print("Upgrade to Pro for this endpoint")
elif not response.ok:
    print(f"Error: {response.json().get('error')}")
```

### 4. Secure Your API Key
- Never commit API keys to git
- Use environment variables
- Never expose keys in client-side code

```python
import os
API_KEY = os.environ.get("QHAWARINA_API_KEY")
```

---

## Changelog

### v1.0.0 (2026-02-16)
- ✅ Initial release
- ✅ Nowcast endpoints (GDP, Inflation, Poverty, Political)
- ✅ Scenarios endpoints (counterfactual analysis)
- ✅ Rate limiting & authentication
- ✅ Health check endpoint

---

## Support

**Questions?**
- Email: info@qhawarina.pe
- Documentation: https://qhawarina.pe/api/docs
- GitHub: https://github.com/btorressz/nexus

**Upgrade to Pro?**
Contact info@qhawarina.pe for:
- Higher rate limits (1,000-10,000 req/hour)
- Historical data access
- Scenario analysis API
- Priority support

---

**Built with ❤️ for Peru • Open source, always free (core features)**
