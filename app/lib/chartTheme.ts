// Shared chart theme for all recharts components across the site.
// Import from here instead of hardcoding colors in chart files.

export const CHART_COLORS = {
  terra:   '#C65D3E',
  teal:    '#2A9D8F',
  amber:   '#E0A458',
  red:     '#9B2226',
  ink:     '#2D3142',
  ink3:    '#8D99AE',
  bg:      '#FAF8F4',
  border:  '#E8E4DF',
  surface: '#EDEAE5',
} as const;

export const CHART_DEFAULTS = {
  // Grid
  gridStroke:      '#E8E4DF',
  gridStrokeWidth: 0.5,
  // Axes
  axisStroke:      '#8D99AE',
  axisFontSize:    10,
  axisFontFamily:  "'Outfit', sans-serif",
  // Tooltip
  tooltipBg:       '#FAF8F4',
  tooltipBorder:   '#E8E4DF',
} as const;

// Standard color assignments per indicator:
//   BPP inflation   → terra  (#C65D3E)
//   INEI CPI comp.  → ink3   (#8D99AE)
//   Political risk  → terra  with teal/amber/red zones
//   GDP             → teal   (#2A9D8F)
//   Poverty         → amber  (#E0A458)
//   FX              → ink    (#2D3142)
//   Positive change → teal   (#2A9D8F)
//   Negative change → red    (#9B2226)

/** Pre-built contentStyle object for recharts <Tooltip>. */
export const tooltipContentStyle = {
  backgroundColor: CHART_DEFAULTS.tooltipBg,
  border:          `1px solid ${CHART_DEFAULTS.tooltipBorder}`,
  borderRadius:    '4px',
  fontSize:        CHART_DEFAULTS.axisFontSize,
  fontFamily:      CHART_DEFAULTS.axisFontFamily,
  color:           CHART_COLORS.ink,
} as const;

/** Pre-built tick style object for XAxis / YAxis tick props. */
export const axisTickStyle = {
  fontSize:   CHART_DEFAULTS.axisFontSize,
  fontFamily: CHART_DEFAULTS.axisFontFamily,
  fill:       CHART_DEFAULTS.axisStroke,
} as const;

/** Standard watermark background for all chart/data pages. Import instead of copy-pasting. */
export const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

/** Category colors for inflation/precios-diarios — keyed by category label. */
export const CAT_COLORS: Record<string, string> = {
  'Alimentos y bebidas': '#C65D3E',
  'Food & beverages':    '#C65D3E',
  'Alquiler de vivienda': '#2A9D8F',
  'Housing':             '#2A9D8F',
  'Transporte':          '#8B7355',
  'Transport':           '#8B7355',
  'Educación':           '#4A7C8C',
  'Education':           '#4A7C8C',
  'Salud':               '#6B5B95',
  'Health':              '#6B5B95',
  'Vestido y calzado':   '#E0A458',
  'Clothing & footwear': '#E0A458',
  'Cuidado personal':    '#2D3142',
  'Personal care':       '#2D3142',
  'Muebles y enseres':   '#9B2226',
  'Furniture':           '#9B2226',
};
