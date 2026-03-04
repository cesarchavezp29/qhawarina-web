'use client';

import { useState } from 'react';

function ApiKeyForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [use, setUse] = useState('research');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Qhawarina API Key] Solicitud de ${name}`);
    const body = encodeURIComponent(
      `Nombre: ${name}\nEmail: ${email}\nOrganización: ${org}\nUso previsto: ${use}\n\nPor favor envíame una API key de Qhawarina.`
    );
    window.location.href = `mailto:info@qhawarina.pe?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
        ✓ Se abrió tu cliente de correo. Responderemos en 24–48 horas.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
          <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Organización</label>
          <input type="text" value={org} onChange={e => setOrg(e.target.value)} placeholder="Universidad, empresa, etc."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Uso previsto *</label>
          <select required value={use} onChange={e => setUse(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="research">Investigación académica</option>
            <option value="journalism">Periodismo / medios</option>
            <option value="business">Análisis empresarial</option>
            <option value="government">Sector público</option>
            <option value="personal">Proyecto personal</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>
      <button type="submit"
        className="px-5 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
        Solicitar API Key →
      </button>
      <p className="text-xs text-gray-400">Gratuita para investigación y uso no comercial. Respuesta en 24–48 h.</p>
    </form>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API de Qhawarina
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            API REST para acceso programático a nowcasts económicos y análisis contrafactual.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{`# Sin API key (20 requests/hora)
curl https://qhawarina.pe/api/nowcast/gdp

# Con API key (100-10,000 requests/hora según tier)
curl -H "X-API-Key: tu_api_key" https://qhawarina.pe/api/nowcast/gdp`}</code>
            </pre>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Solicita tu API key</p>
            <p className="text-xs text-gray-500 mb-3">Gratuita para investigación. Mayor throughput para uso comercial.</p>
            <ApiKeyForm />
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {/* Nowcast Endpoints */}
          <EndpointSection
            title="Nowcast Endpoints"
            description="Obtén los últimos nowcasts de indicadores económicos"
            endpoints={[
              {
                method: "GET",
                path: "/api/nowcast/gdp",
                description: "Nowcast de crecimiento del PBI (YoY %)",
                tier: "Free",
                response: `{
  "success": true,
  "data": {
    "indicator": "gdp",
    "nowcast": {
      "value": 2.26,
      "target_period": "2025-Q4",
      "unit": "% YoY"
    },
    "model": {
      "name": "DFM-Ridge",
      "factors": 2,
      "r2": 0.934
    },
    "backtest_metrics": {
      "rmse": 1.47,
      "relative_rmse_vs_ar1": 0.69
    }
  }
}`,
              },
              {
                method: "GET",
                path: "/api/nowcast/inflation",
                description: "Nowcast de inflación mensual (%)",
                tier: "Free",
                response: `{
  "success": true,
  "data": {
    "indicator": "inflation",
    "nowcast": {
      "value": 0.21,
      "target_period": "2026-02",
      "unit": "% monthly",
      "annualized": 2.52
    }
  }
}`,
              },
              {
                method: "GET",
                path: "/api/nowcast/poverty",
                description: "Nowcast de tasa de pobreza nacional (%)",
                tier: "Free",
                response: `{
  "success": true,
  "data": {
    "indicator": "poverty",
    "nowcast": {
      "national": {
        "poverty_rate": 26.3,
        "extreme_poverty_rate": 4.8,
        "target_year": 2024
      }
    }
  }
}`,
              },
              {
                method: "GET",
                path: "/api/nowcast/political",
                description: "Índice de inestabilidad política (z-score)",
                tier: "Free",
                response: `{
  "success": true,
  "data": {
    "indicator": "political_risk",
    "current": {
      "index": 0.34,
      "z_score": 0.52,
      "date": "2026-02-16",
      "interpretation": "Inestabilidad moderada",
      "severity": "medium"
    }
  }
}`,
              },
            ]}
          />

          {/* Scenarios Endpoints */}
          <EndpointSection
            title="Scenarios Endpoints (Premium)"
            description="Análisis contrafactual - simula escenarios económicos"
            endpoints={[
              {
                method: "GET",
                path: "/api/scenarios",
                description: "Lista de escenarios disponibles",
                tier: "Pro",
                response: `{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "mild_recession",
        "name": "Recesión Leve",
        "description": "PBI cae a 0%, estrés financiero +1σ",
        "tags": ["recession", "mild"],
        "impacts_summary": {
          "gdp": -2.5,
          "inflation": 0.0,
          "poverty": 1.25
        }
      }
    ],
    "count": 10
  }
}`,
              },
              {
                method: "GET",
                path: "/api/scenarios/:id",
                description: "Detalles de escenario específico",
                tier: "Pro",
                response: `{
  "success": true,
  "data": {
    "id": "mild_recession",
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
        "poverty_total_pp": 1.25,
        "employment_impact_pp": -1.5
      },
      "interpretation": "GDP caería 2.5pp..."
    }
  }
}`,
              },
            ]}
          />

          {/* Health Check */}
          <EndpointSection
            title="Utility Endpoints"
            description="Endpoints de utilidad y monitoreo"
            endpoints={[
              {
                method: "GET",
                path: "/api/health",
                description: "Estado de la API y freshness de datos",
                tier: "Public",
                response: `{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "gdp_nowcast": "ok",
    "inflation_nowcast": "ok",
    "poverty_nowcast": "ok",
    "political_index": "ok"
  }
}`,
              },
            ]}
          />
        </div>

        {/* Rate Limits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Limits</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-600 mb-1">
                Anonymous
              </div>
              <div className="text-2xl font-bold text-gray-900">20/hora</div>
              <div className="text-xs text-gray-500 mt-1">Sin API key</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-600 mb-1">Free</div>
              <div className="text-2xl font-bold text-gray-900">100/hora</div>
              <div className="text-xs text-gray-500 mt-1">Gratis</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-blue-500">
              <div className="text-sm font-semibold text-blue-700 mb-1">Pro</div>
              <div className="text-2xl font-bold text-blue-700">1,000/hora</div>
              <div className="text-xs text-blue-600 mt-1">$49/mes</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-purple-500">
              <div className="text-sm font-semibold text-purple-700 mb-1">
                Enterprise
              </div>
              <div className="text-2xl font-bold text-purple-700">10,000/hora</div>
              <div className="text-xs text-purple-600 mt-1">Contactar</div>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Autenticación
          </h2>
          <p className="text-gray-700 mb-4">
            Incluye tu API key en el header <code className="bg-gray-100 px-2 py-1 rounded">X-API-Key</code> o
            como query parameter <code className="bg-gray-100 px-2 py-1 rounded">?api_key=</code>
          </p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{`# Método 1: Header (recomendado)
curl -H "X-API-Key: tu_api_key" https://qhawarina.pe/api/nowcast/gdp

# Método 2: Query parameter
curl https://qhawarina.pe/api/nowcast/gdp?api_key=tu_api_key`}</code>
            </pre>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Importante:</strong> Nunca expongas tu API key en código
              cliente (frontend). Usa un proxy backend o variables de entorno.
            </p>
          </div>
        </div>

        {/* Error Responses */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Responses
          </h2>
          <div className="space-y-4">
            <ErrorExample
              code="401 Unauthorized"
              errorCode="INVALID_API_KEY"
              message="Invalid API key"
            />
            <ErrorExample
              code="403 Forbidden"
              errorCode="TIER_UPGRADE_REQUIRED"
              message="Scenarios API requires Pro or Enterprise tier"
            />
            <ErrorExample
              code="429 Too Many Requests"
              errorCode="RATE_LIMIT_EXCEEDED"
              message="Rate limit exceeded"
              extra={{
                limit: 100,
                resetAt: "2026-02-16T15:00:00Z",
              }}
            />
            <ErrorExample
              code="404 Not Found"
              errorCode="DATA_NOT_FOUND"
              message="Scenario 'invalid_id' not found"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white text-center mt-8">
          <h2 className="text-2xl font-bold mb-3">¿Listo para empezar?</h2>
          <p className="text-blue-100 mb-6">
            Solicita tu API key y accede a nowcasts en tiempo real
          </p>
          <a
            href="mailto:info@qhawarina.pe?subject=API Key Request"
            className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Solicitar API Key →
          </a>
        </div>
      </div>
    </div>
  );
}

function EndpointSection({
  title,
  description,
  endpoints,
}: {
  title: string;
  description: string;
  endpoints: Array<{
    method: string;
    path: string;
    description: string;
    tier: string;
    response: string;
  }>;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="space-y-6">
        {endpoints.map((endpoint, idx) => (
          <div key={idx} className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">
                {endpoint.method}
              </span>
              <code className="text-blue-700 font-mono text-sm">
                {endpoint.path}
              </code>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {endpoint.tier}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
            <details className="group">
              <summary className="cursor-pointer text-sm text-blue-700 hover:text-blue-900 font-medium mb-2">
                Ver ejemplo de respuesta ▼
              </summary>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-xs">
                  <code>{endpoint.response}</code>
                </pre>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorExample({
  code,
  errorCode,
  message,
  extra,
}: {
  code: string;
  errorCode: string;
  message: string;
  extra?: any;
}) {
  return (
    <div className="border-l-4 border-red-500 pl-4">
      <div className="font-semibold text-gray-900 mb-1">{code}</div>
      <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
        <pre className="text-red-400 text-xs">
          <code>
            {JSON.stringify(
              {
                error: message,
                code: errorCode,
                timestamp: "2026-02-16T14:30:00Z",
                ...extra,
              },
              null,
              2
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}
