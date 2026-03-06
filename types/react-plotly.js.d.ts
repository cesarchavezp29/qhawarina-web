declare module 'react-plotly.js' {
  import { Component, CSSProperties } from 'react';

  interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    style?: CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: any, graphDiv: any) => void;
    onUpdate?: (figure: any, graphDiv: any) => void;
    onClick?: (data: any) => void;
    onHover?: (data: any) => void;
    onUnhover?: (data: any) => void;
    onSelected?: (data: any) => void;
    [key: string]: any;
  }

  export default class Plot extends Component<PlotParams> {}
}
