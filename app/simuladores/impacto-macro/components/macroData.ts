// ── Design tokens (mirrors MW mini-site) ──────────────────────────────────────
export const TERRACOTTA  = '#C65D3E';
export const TEAL        = '#2A9D8F';
export const AMBER       = '#E0A458';
export const BG          = '#FAF8F4';
export const CARD_BG     = '#FFFCF7';
export const CARD_BORDER = 'rgba(120,113,108,0.18)';

// ── Audited elasticities — full_audit_output.txt, 2026-03-19 ──────────────────
// GDP→Poverty: OLS ENAHO 2005-2024 excl 2020-2021, N=18, R²=0.669, t=-5.69
// Rate→GDP:    Cholesky VAR(1) T=85 FWL, CI includes zero at all h=0..8
// FX→CPI:      LP OLS h=1 HAC, significant

export const BETA_POV    = -0.656;   // pp poverty per 1pp GDP growth
export const ALPHA_POV   =  0.888;   // intercept (regression line rendering only)
export const BETA_RATE   = -0.195;   // pp GDP per 100bp rate hike (Cholesky VAR)
export const CI_RATE_LO  = -0.698;   // 90% bootstrap CI low (includes zero)
export const CI_RATE_HI  =  0.271;   // 90% bootstrap CI high (includes zero)
export const BETA_FX     =  0.237;   // pp CPI per 10% FX depreciation (LP h=1)
export const CI_FX_LO   =  0.030;   // 90% CI low  (LP OLS h=1 HAC, lp_elasticities.json)
export const CI_FX_HI   =  0.443;   // 90% CI high (excludes zero — significant)

// ── Prediction interval constants (poverty OLS) ────────────────────────────────
export const RMSE     = 1.2958;   // regression RMSE (pp poverty)
export const N_OBS    = 18;       // number of observations
export const X_MEAN   = 4.645;    // mean GDP growth in sample (%)
export const SXX      = 126.18;   // Σ(x−x̄)²
export const X_MIN_OBS = -1.0;    // in-sample range lower bound
export const X_MAX_OBS = 10.5;    // in-sample range upper bound

// ── Scatter data (18 ENAHO years used in OLS) ─────────────────────────────────
export const SCATTER_DATA = [
  { year: 2005, gdp:  6.282, dpov: -2.700 },
  { year: 2006, gdp:  7.555, dpov: -5.000 },
  { year: 2007, gdp:  8.470, dpov: -6.300 },
  { year: 2008, gdp:  9.185, dpov: -5.000 },
  { year: 2009, gdp:  1.123, dpov: -3.400 },
  { year: 2010, gdp:  8.283, dpov: -4.500 },
  { year: 2011, gdp:  6.380, dpov: -3.500 },
  { year: 2012, gdp:  6.145, dpov: -2.300 },
  { year: 2013, gdp:  5.827, dpov: -1.700 },
  { year: 2014, gdp:  2.453, dpov: -0.400 },
  { year: 2015, gdp:  3.223, dpov: -1.700 },
  { year: 2016, gdp:  3.975, dpov: -1.100 },
  { year: 2017, gdp:  2.515, dpov:  0.000 },
  { year: 2018, gdp:  3.957, dpov: -1.600 },
  { year: 2019, gdp:  2.250, dpov: -0.600 },
  { year: 2022, gdp:  2.857, dpov:  1.500 },
  { year: 2023, gdp: -0.345, dpov:  1.500 },
  { year: 2024, gdp:  3.473, dpov: -2.100 },
];

// ── Regression line + prediction interval (x from −1.5 to 10.5) ───────────────
const X_RANGE = Array.from({ length: 49 }, (_, i) => -1.5 + i * 0.25);

export const REG_LINE = X_RANGE.map(x => ({
  x,
  central: ALPHA_POV + BETA_POV * x,
}));

export const PI_UPPER = X_RANGE.map(x => ({
  x,
  upper: ALPHA_POV + BETA_POV * x + 1.645 * RMSE * Math.sqrt(1 / N_OBS + Math.pow(x - X_MEAN, 2) / SXX),
}));

export const PI_LOWER = X_RANGE.map(x => ({
  x,
  lower: ALPHA_POV + BETA_POV * x - 1.645 * RMSE * Math.sqrt(1 / N_OBS + Math.pow(x - X_MEAN, 2) / SXX),
}));
