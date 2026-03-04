'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

function ApiKeyForm({ isEn }: { isEn: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [use, setUse] = useState('research');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = isEn
      ? encodeURIComponent(`[Qhawarina API Key] Request from ${name}`)
      : encodeURIComponent(`[Qhawarina API Key] Solicitud de ${name}`);
    const body = isEn
      ? encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nOrganization: ${org}\nIntended use: ${use}\n\nPlease send me a Qhawarina API key.`
        )
      : encodeURIComponent(
          `Nombre: ${name}\nEmail: ${email}\nOrganización: ${org}\nUso previsto: ${use}\n\nPor favor envíame una API key de Qhawarina.`
        );
    window.location.href = `mailto:info@qhawarina.pe?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
        {isEn
          ? '✓ Your email client was opened. We will respond within 24–48 hours.'
          : '✓ Se abrió tu cliente de correo. Responderemos en 24–48 horas.'}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{isEn ? 'Name *' : 'Nombre *'}</label>
          <input required type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder={isEn ? 'Your name' : 'Tu nombre'}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{isEn ? 'Organization' : 'Organización'}</label>
          <input type="text" value={org} onChange={e => setOrg(e.target.value)}
            placeholder={isEn ? 'University, company, etc.' : 'Universidad, empresa, etc.'}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{isEn ? 'Intended use *' : 'Uso previsto *'}</label>
          <select required value={use} onChange={e => setUse(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="research">{isEn ? 'Academic research' : 'Investigación académica'}</option>
            <option value="journalism">{isEn ? 'Journalism / media' : 'Periodismo / medios'}</option>
            <option value="business">{isEn ? 'Business analysis' : 'Análisis empresarial'}</option>
            <option value="government">{isEn ? 'Public sector' : 'Sector público'}</option>
            <option value="personal">{isEn ? 'Personal project' : 'Proyecto personal'}</option>
            <option value="other">{isEn ? 'Other' : 'Otro'}</option>
          </select>
        </div>
      </div>
      <button type="submit"
        className="px-5 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
        {isEn ? 'Request API Key →' : 'Solicitar API Key →'}
      </button>
      <p className="text-xs text-gray-400">
        {isEn
          ? 'Free for research and non-commercial use. Response within 24–48 h.'
          : 'Gratuita para investigación y uso no comercial. Respuesta en 24–48 h.'}
      </p>
    </form>
  );
}

export default function ApiDocsPage() {
  const isEn = useLocale() === 'en';

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isEn ? 'Qhawarina API' : 'API de Qhawarina'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {isEn
              ? 'REST API for programmatic access to economic nowcasts and counterfactual analysis.'
              : 'API REST para acceso programático a nowcasts económicos y análisis contrafactual.'}
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{isEn
                ? `# Without API key (20 requests/hour)
curl https://qhawarina.pe/api/nowcast/gdp

# With API key (100-10,000 requests/hour by tier)
curl -H "X-API-Key: your_api_key" https://qhawarina.pe/api/nowcast/gdp`
                : `# Sin API key (20 requests/hora)
curl https://qhawarina.pe/api/nowcast/gdp

# Con API key (100-10,000 requests/hora según tier)
curl -H "X-API-Key: tu_api_key" https://qhawarina.pe/api/nowcast/gdp`}</code>
            </pre>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {isEn ? 'Request your API key' : 'Solicita tu API key'}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {isEn
                ? 'Free for research. Higher throughput for commercial use.'
                : 'Gratuita para investigación. Mayor throughput para uso comercial.'}
            </p>
            <ApiKeyForm isEn={isEn} />
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {/* Nowcast Endpoints */}
          <EndpointSection
            title={isEn ? 'Nowcast Endpoints' : 'Nowcast Endpoints'}
            description={isEn
              ? 'Get the latest nowcasts for economic indicators'
              : 'Obtén los últimos nowcasts de indicadores económicos'}
            isEn={isEn}
            endpoints={[
              {
                method: "GET",
                path: "/api/nowcast/gdp",
                description: isEn ? "GDP growth nowcast (YoY %)" : "Nowcast de crecimiento del PBI (YoY %)",
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
                description: isEn ? "Monthly inflation nowcast (%)" : "Nowcast de inflación mensual (%)",
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
                description: isEn ? "National poverty rate nowcast (%)" : "Nowcast de tasa de pobreza nacional (%)",
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
                description: isEn ? "Political instability index (z-score)" : "Índice de inestabilidad política (z-score)",
                tier: "Free",
                response: `{
  "success": true,
  "data": {
    "indicator": "political_risk",
    "current": {
      "index": 0.34,
      "z_score": 0.52,
      "date": "2026-02-16",
      "interpretation": "${isEn ? 'Moderate instability' : 'Inestabilidad moderada'}",
      "severity": "medium"
    }
  }
}`,
              },
            ]}
          />

          {/* Scenarios Endpoints */}
          <EndpointSection
            title={isEn ? 'Scenarios Endpoints (Premium)' : 'Scenarios Endpoints (Premium)'}
            description={isEn
              ? 'Counterfactual analysis — simulate economic scenarios'
              : 'Análisis contrafactual - simula escenarios económicos'}
            isEn={isEn}
            endpoints={[
              {
                method: "GET",
                path: "/api/scenarios",
                description: isEn ? "List available scenarios" : "Lista de escenarios disponibles",
                tier: "Pro",
                response: `{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "mild_recession",
        "name": "${isEn ? 'Mild Recession' : 'Recesión Leve'}",
        "description": "${isEn ? 'GDP falls to 0%, financial stress +1σ' : 'PBI cae a 0%, estrés financiero +1σ'}",
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
                description: isEn ? "Details of a specific scenario" : "Detalles de escenario específico",
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
      "interpretation": "${isEn ? 'GDP would fall 2.5pp...' : 'GDP caería 2.5pp...'}"
    }
  }
}`,
              },
            ]}
          />

          {/* Health Check */}
          <EndpointSection
            title={isEn ? 'Utility Endpoints' : 'Utility Endpoints'}
            description={isEn ? 'Utility and monitoring endpoints' : 'Endpoints de utilidad y monitoreo'}
            isEn={isEn}
            endpoints={[
              {
                method: "GET",
                path: "/api/health",
                description: isEn ? "API status and data freshness" : "Estado de la API y freshness de datos",
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
              <div className="text-sm font-semibold text-gray-600 mb-1">Anonymous</div>
              <div className="text-2xl font-bold text-gray-900">{isEn ? '20/hour' : '20/hora'}</div>
              <div className="text-xs text-gray-500 mt-1">{isEn ? 'No API key' : 'Sin API key'}</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-600 mb-1">Free</div>
              <div className="text-2xl font-bold text-gray-900">{isEn ? '100/hour' : '100/hora'}</div>
              <div className="text-xs text-gray-500 mt-1">{isEn ? 'Free' : 'Gratis'}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-blue-500">
              <div className="text-sm font-semibold text-blue-700 mb-1">Pro</div>
              <div className="text-2xl font-bold text-blue-700">{isEn ? '1,000/hour' : '1,000/hora'}</div>
              <div className="text-xs text-blue-600 mt-1">$49/{isEn ? 'mo' : 'mes'}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-purple-500">
              <div className="text-sm font-semibold text-purple-700 mb-1">Enterprise</div>
              <div className="text-2xl font-bold text-purple-700">{isEn ? '10,000/hour' : '10,000/hora'}</div>
              <div className="text-xs text-purple-600 mt-1">{isEn ? 'Contact us' : 'Contactar'}</div>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'Authentication' : 'Autenticación'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? <>Include your API key in the <code className="bg-gray-100 px-2 py-1 rounded">X-API-Key</code> header or as a query parameter <code className="bg-gray-100 px-2 py-1 rounded">?api_key=</code></>
              : <>Incluye tu API key en el header <code className="bg-gray-100 px-2 py-1 rounded">X-API-Key</code> o como query parameter <code className="bg-gray-100 px-2 py-1 rounded">?api_key=</code></>}
          </p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{isEn
                ? `# Method 1: Header (recommended)
curl -H "X-API-Key: your_api_key" https://qhawarina.pe/api/nowcast/gdp

# Method 2: Query parameter
curl https://qhawarina.pe/api/nowcast/gdp?api_key=your_api_key`
                : `# Método 1: Header (recomendado)
curl -H "X-API-Key: tu_api_key" https://qhawarina.pe/api/nowcast/gdp

# Método 2: Query parameter
curl https://qhawarina.pe/api/nowcast/gdp?api_key=tu_api_key`}</code>
            </pre>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ {isEn ? 'Important:' : 'Importante:'}</strong>{' '}
              {isEn
                ? 'Never expose your API key in client-side code (frontend). Use a backend proxy or environment variables.'
                : 'Nunca expongas tu API key en código cliente (frontend). Usa un proxy backend o variables de entorno.'}
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
          <h2 className="text-2xl font-bold mb-3">
            {isEn ? 'Ready to get started?' : '¿Listo para empezar?'}
          </h2>
          <p className="text-blue-100 mb-6">
            {isEn
              ? 'Request your API key and access real-time nowcasts'
              : 'Solicita tu API key y accede a nowcasts en tiempo real'}
          </p>
          <a
            href="mailto:info@qhawarina.pe?subject=API Key Request"
            className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {isEn ? 'Request API Key →' : 'Solicitar API Key →'}
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
  isEn,
}: {
  title: string;
  description: string;
  isEn: boolean;
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
                {isEn ? 'View example response ▼' : 'Ver ejemplo de respuesta ▼'}
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
  extra?: Record<string, unknown>;
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
