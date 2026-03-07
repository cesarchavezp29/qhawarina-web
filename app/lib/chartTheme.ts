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
