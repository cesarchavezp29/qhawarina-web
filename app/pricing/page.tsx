'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

// ── Design tokens ────────────────────────────────────────────────────────────
const TERRA  = '#C65D3E';
const TEAL   = '#2A9D8F';
const CARD_BG = '#FFFCF7';
const BORDER  = 'rgba(120,113,108,0.18)';
const INK     = '#2D3142';
const INK3    = '#78716c';

// ── Types ────────────────────────────────────────────────────────────────────
type Tier = 'pro' | 'enterprise';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  role: string;
  interests: string[];
  message: string;
}

// ── Interest options ─────────────────────────────────────────────────────────
const INTEREST_OPTIONS = [
  { value: 'nowcasting_regional', labelEs: 'Nowcasting regional', labelEn: 'Regional nowcasting' },
  { value: 'precios_supermercado', labelEs: 'Precios de supermercado', labelEn: 'Supermarket prices' },
  { value: 'simuladores',         labelEs: 'Simuladores',             labelEn: 'Simulators'          },
  { value: 'api',                 labelEs: 'API',                     labelEn: 'API'                 },
  { value: 'reportes',            labelEs: 'Reportes',                labelEn: 'Reports'             },
  { value: 'otro',                labelEs: 'Otro',                    labelEn: 'Other'               },
];

// ── Feature lists ─────────────────────────────────────────────────────────────
const OPEN_FEATURES_ES = [
  'Nowcast nacional de PBI e inflación',
  'Índices de Riesgo Político y Económico (IRP/IRE)',
  'Índice agregado de precios de supermercados',
  'Simuladores básicos',
  '100 llamadas API/día',
];
const OPEN_FEATURES_EN = [
  'National GDP & Inflation nowcast',
  'Political & Economic Risk indices (IRP/IRE)',
  'Aggregated supermarket price indices',
  'Basic simulators',
  '100 API calls/day',
];

const PRO_FEATURES_ES = [
  'Nowcasts regionales (24 departamentos)',
  'Búsqueda de precios por producto (hasta 5,000)',
  'Simuladores completos (pobreza, monetario, tipo de cambio, escenarios)',
  'Datos de pobreza distrital (1,891 distritos)',
  '10,000 llamadas API/mes (todos los datos)',
  'Descarga de datos en CSV/JSON',
  'Reporte Semanal Qhawarina',
  'Soporte por correo',
];
const PRO_FEATURES_EN = [
  'Regional nowcasts (24 departments)',
  'Individual product price search (up to 5,000)',
  'Full simulators (poverty, monetary, FX, scenarios)',
  'District poverty data (1,891 districts)',
  '10,000 API calls/month (all data)',
  'CSV/JSON data download',
  'Qhawarina Weekly report',
  'Email support',
];

const ENT_FEATURES_ES = [
  'Acceso API ilimitado',
  'Todos los 42,000+ productos individuales',
  'Parámetros de simulador personalizados',
  'Informe Macro Mensual',
  'Llamada mensual con analista',
  'Soporte prioritario',
];
const ENT_FEATURES_EN = [
  'Unlimited API access',
  'All 42,000+ individual products',
  'Custom simulator parameters',
  'Monthly Macro Report',
  'Monthly call with analyst',
  'Priority support',
];

// ── Check icon ────────────────────────────────────────────────────────────────
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="7.5" cy="7.5" r="7.5" fill={color} fillOpacity="0.12" />
      <path d="M4 7.5l2.5 2.5 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Contact Modal ─────────────────────────────────────────────────────────────
function ContactModal({
  tier,
  isEn,
  onClose,
}: {
  tier: Tier;
  isEn: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ContactFormData>({
    name: '', email: '', company: '', role: '', interests: [], message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const tierLabel = tier === 'pro'
    ? (isEn ? 'Pro' : 'Pro')
    : (isEn ? 'Enterprise' : 'Enterprise');

  function toggleInterest(val: string) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(val)
        ? f.interests.filter(i => i !== val)
        : [...f.interests, val],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tier }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(json.error ?? (isEn ? 'Unknown error' : 'Error desconocido'));
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(isEn ? 'Network error. Please try again.' : 'Error de red. Por favor intente de nuevo.');
    }
  }

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? `Request ${tierLabel} access` : `Solicitar acceso ${tierLabel}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(45,49,66,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(2px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 14,
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(45,49,66,0.18)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: TERRA, marginBottom: 4,
            }}>
              {isEn ? `Request ${tierLabel} access` : `Solicitar acceso ${tierLabel}`}
            </div>
            <p style={{ fontSize: 13, color: INK3, lineHeight: 1.5 }}>
              {isEn
                ? 'Tell us about your use case and we\'ll get back to you within 24 hours.'
                : 'Cuéntenos sobre su caso de uso y le responderemos en menos de 24 horas.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Cerrar'}
            style={{
              marginLeft: 12, flexShrink: 0, width: 28, height: 28,
              borderRadius: '50%', border: `1px solid ${BORDER}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: INK3, fontSize: 16, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Success state */}
        {status === 'success' ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `${TEAL}18`, border: `1.5px solid ${TEAL}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 20, color: INK, marginBottom: 8 }}>
              {isEn ? 'Request received' : 'Solicitud recibida'}
            </div>
            <p style={{ fontSize: 14, color: INK3, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {isEn
                ? 'We\'ll review your request and reach out within 24 hours.'
                : 'Revisaremos su solicitud y le contactaremos en menos de 24 horas.'}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: 6, border: `1px solid ${BORDER}`,
                background: 'transparent', cursor: 'pointer',
                fontSize: 13, color: INK3,
              }}
            >
              {isEn ? 'Close' : 'Cerrar'}
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <div>
                <label style={labelStyle}>
                  {isEn ? 'Full name' : 'Nombre completo'} <span style={{ color: TERRA }}>*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={isEn ? 'Jane Smith' : 'Ana García'}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {isEn ? 'Work email' : 'Correo profesional'} <span style={{ color: TERRA }}>*</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@org.pe"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <div>
                <label style={labelStyle}>{isEn ? 'Organization' : 'Organización'}</label>
                <input
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder={isEn ? 'Ministry / NGO / Firm' : 'Ministerio / ONG / Empresa'}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{isEn ? 'Role / Position' : 'Cargo / Posición'}</label>
                <input
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder={isEn ? 'Economist, Journalist...' : 'Economista, Periodista...'}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Interests multi-select */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={labelStyle}>
                {isEn ? 'What data are you interested in?' : '¿Qué datos le interesan?'}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 6 }}>
                {INTEREST_OPTIONS.map(opt => {
                  const active = form.interests.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleInterest(opt.value)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: 99,
                        border: `1.5px solid ${active ? TERRA : BORDER}`,
                        background: active ? `${TERRA}12` : 'transparent',
                        color: active ? TERRA : INK3,
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isEn ? opt.labelEn : opt.labelEs}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>
                {isEn ? 'Message (optional)' : 'Mensaje (opcional)'}
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={3}
                placeholder={isEn
                  ? 'Describe your use case or any specific requirements...'
                  : 'Describa su caso de uso o requisitos específicos...'}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              />
            </div>

            {/* Error */}
            {status === 'error' && (
              <div style={{
                marginBottom: '0.875rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 6,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                fontSize: 13,
                color: '#991B1B',
              }}>
                {errorMsg || (isEn ? 'Something went wrong. Please try again.' : 'Algo falló. Por favor intente de nuevo.')}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.5rem 1.125rem',
                  borderRadius: 6,
                  border: `1px solid ${BORDER}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: INK3,
                }}
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '0.5rem 1.375rem',
                  borderRadius: 6,
                  border: 'none',
                  background: status === 'sending' ? `${TERRA}80` : TERRA,
                  color: '#fff',
                  cursor: status === 'sending' ? 'wait' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'background 0.15s',
                }}
              >
                {status === 'sending'
                  ? (isEn ? 'Sending…' : 'Enviando…')
                  : (isEn ? 'Send request' : 'Enviar solicitud')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Shared input styles ───────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: INK3,
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 6,
  border: `1px solid ${BORDER}`,
  background: '#FAF8F4',
  color: INK,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};

// ── Tier card ─────────────────────────────────────────────────────────────────
function TierCard({
  isHighlighted,
  badge,
  name,
  tagline,
  features,
  inheritLabel,
  accentColor,
  cta,
}: {
  isHighlighted?: boolean;
  badge?: string;
  name: string;
  tagline: string;
  features: string[];
  inheritLabel?: string;
  accentColor: string;
  cta: React.ReactNode;
}) {
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${isHighlighted ? accentColor + '50' : BORDER}`,
      borderTop: `3px solid ${accentColor}`,
      borderRadius: 12,
      padding: '1.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      position: 'relative',
      boxShadow: isHighlighted ? `0 4px 24px ${accentColor}14` : '0 1px 4px rgba(45,49,66,0.06)',
    }}>
      {/* Badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: -1, right: 20,
          background: accentColor,
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0.25rem 0.65rem',
          borderRadius: '0 0 6px 6px',
        }}>
          {badge}
        </div>
      )}

      {/* Tier name */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: accentColor, marginBottom: 6,
      }}>
        {name}
      </div>

      {/* Tagline */}
      <p style={{
        fontSize: 13, color: INK3, lineHeight: 1.55, marginBottom: '1.5rem',
        minHeight: 40,
      }}>
        {tagline}
      </p>

      {/* CTA */}
      <div style={{ marginBottom: '1.5rem' }}>{cta}</div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${BORDER}`, marginBottom: '1.25rem' }} />

      {/* Inherit note */}
      {inheritLabel && (
        <div style={{
          fontSize: 11, fontWeight: 600, color: INK3,
          marginBottom: '0.875rem',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{ width: 18, height: 1, background: BORDER }} />
          {inheritLabel}
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>
      )}

      {/* Features */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <CheckIcon color={accentColor} />
            <span style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const isEn = useLocale() === 'en';
  const [modal, setModal] = useState<Tier | null>(null);

  return (
    <div style={{ background: '#FAF8F4', minHeight: '100vh' }}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: TERRA,
            padding: '0.3rem 0.875rem',
            borderRadius: 99,
            background: `${TERRA}12`,
            border: `1px solid ${TERRA}30`,
            marginBottom: '1rem',
          }}>
            {isEn ? 'Access tiers' : 'Niveles de acceso'}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
            fontWeight: 400,
            color: INK,
            lineHeight: 1.2,
            marginBottom: '0.875rem',
          }}>
            {isEn ? 'Data for every need' : 'Datos para cada necesidad'}
          </h1>
          <p style={{ fontSize: 15, color: INK3, maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            {isEn
              ? 'From open public data to full API access and custom analytics — Qhawarina scales with your research.'
              : 'Desde datos públicos abiertos hasta acceso API completo y análisis personalizados — Qhawarina crece con su investigación.'}
          </p>
        </div>

        {/* ── Three-column grid ────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}>

          {/* ── Open (free) ─────────────────────────────────────────────── */}
          <TierCard
            name={isEn ? 'Open' : 'Abierto'}
            accentColor={INK3}
            tagline={isEn
              ? 'Core national indicators, free forever. No account required for browsing; register for API access.'
              : 'Indicadores nacionales esenciales, gratis para siempre. Sin cuenta para navegar; regístrese para acceder a la API.'}
            features={isEn ? OPEN_FEATURES_EN : OPEN_FEATURES_ES}
            cta={
              <a
                href="/estadisticas/pbi"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.6rem 1rem',
                  borderRadius: 7,
                  border: `1.5px solid ${BORDER}`,
                  background: 'transparent',
                  color: INK,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F5F3EE')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {isEn ? 'Explore data' : 'Explorar datos'}
              </a>
            }
          />

          {/* ── Pro ─────────────────────────────────────────────────────── */}
          <TierCard
            isHighlighted
            badge={isEn ? 'Most popular' : 'Más popular'}
            name="Pro"
            accentColor={TERRA}
            tagline={isEn
              ? 'Regional depth, granular product data, full simulators and weekly reports for analysts and journalists.'
              : 'Profundidad regional, datos de productos granulares, simuladores completos y reportes semanales para analistas y periodistas.'}
            inheritLabel={isEn ? 'Everything in Open, plus:' : 'Todo lo del plan Abierto, más:'}
            features={isEn ? PRO_FEATURES_EN : PRO_FEATURES_ES}
            cta={
              <button
                onClick={() => setModal('pro')}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 7,
                  border: 'none',
                  background: TERRA,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {isEn ? 'Request access' : 'Solicitar acceso'}
              </button>
            }
          />

          {/* ── Enterprise ──────────────────────────────────────────────── */}
          <TierCard
            name="Enterprise"
            accentColor={TEAL}
            tagline={isEn
              ? 'Unlimited access, all products, custom models, dedicated analyst time and priority support.'
              : 'Acceso ilimitado, todos los productos, modelos personalizados, tiempo de analista dedicado y soporte prioritario.'}
            inheritLabel={isEn ? 'Everything in Pro, plus:' : 'Todo lo del plan Pro, más:'}
            features={isEn ? ENT_FEATURES_EN : ENT_FEATURES_ES}
            cta={
              <button
                onClick={() => setModal('enterprise')}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 7,
                  border: `1.5px solid ${TEAL}`,
                  background: 'transparent',
                  color: TEAL,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = TEAL;
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = TEAL;
                }}
              >
                {isEn ? 'Request access' : 'Solicitar acceso'}
              </button>
            }
          />
        </div>

        {/* ── FAQ / notes row ─────────────────────────────────────────────── */}
        <div style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {[
            {
              q: isEn ? 'Is the open data really free?' : '¿Los datos abiertos son realmente gratuitos?',
              a: isEn
                ? 'Yes. National-level indicators, methodology and charts are permanently free under CC BY 4.0. No credit card, no sign-up required to browse.'
                : 'Sí. Los indicadores nacionales, la metodología y los gráficos son permanentemente gratuitos bajo licencia CC BY 4.0. No se requiere tarjeta ni registro para navegar.',
            },
            {
              q: isEn ? 'What counts as an API call?' : '¿Qué cuenta como llamada API?',
              a: isEn
                ? 'Each HTTP request to a data endpoint counts as one call. Cached responses served from CDN do not count against your quota.'
                : 'Cada solicitud HTTP a un endpoint de datos cuenta como una llamada. Las respuestas en caché servidas desde CDN no se descuentan de su cuota.',
            },
            {
              q: isEn ? 'Can I upgrade or cancel?' : '¿Puedo cambiar de plan o cancelar?',
              a: isEn
                ? 'Plans are flexible. Contact us at any time to adjust your tier. There are no long-term contracts.'
                : 'Los planes son flexibles. Contáctenos en cualquier momento para ajustar su nivel. No hay contratos de largo plazo.',
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              padding: '1.125rem 1.25rem',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>
                {item.q}
              </div>
              <p style={{ fontSize: 12.5, color: INK3, lineHeight: 1.6, margin: 0 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          padding: '2rem 1.5rem',
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
        }}>
          <p style={{ fontSize: 14, color: INK3, marginBottom: '0.625rem' }}>
            {isEn
              ? 'Not sure which plan fits? Write to us directly.'
              : '¿No sabe qué plan le conviene? Escríbanos directamente.'}
          </p>
          <a
            href="mailto:cesarchavezpadilla@gmail.com"
            style={{ fontSize: 14, fontWeight: 600, color: TERRA, textDecoration: 'none' }}
          >
            cesarchavezpadilla@gmail.com
          </a>
        </div>

      </main>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {modal && (
        <ContactModal
          tier={modal}
          isEn={isEn}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
