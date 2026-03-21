import type { CSSProperties } from 'react';

export const CHART_COLORS = {
  primary:   '#C65D3E',
  secondary: '#4A9B8E',
  tertiary:  '#6366f1',
  neutral:   '#78716c',
  grid:      '#e7e5e4',
};

export const CHART_DEFAULTS = {
  gridStroke:      '#e7e5e4',
  gridStrokeWidth: 1,
  axisStroke:      '#a8a29e',
  axisFontSize:    11,
  axisFontFamily:  'Inter, system-ui, sans-serif',
};

export const tooltipContentStyle: CSSProperties = {
  background:   '#fafaf9',
  border:       '1px solid #e7e5e4',
  borderRadius: 12,
  fontSize:     12,
  fontFamily:   'Inter, system-ui, sans-serif',
  boxShadow:    '0 4px 12px rgba(0,0,0,0.08)',
};

export const axisTickStyle = {
  fontSize:   CHART_DEFAULTS.axisFontSize,
  fontFamily: CHART_DEFAULTS.axisFontFamily,
  fill:       CHART_DEFAULTS.axisStroke,
};
