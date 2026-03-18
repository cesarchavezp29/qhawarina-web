// ── Design tokens ──────────────────────────────────────────────────────────────
export const TERRACOTTA  = '#C65D3E';
export const TEAL        = '#2A9D8F';
export const BG          = '#FAF8F4';
export const CARD_BG     = '#FFFCF7';
export const CARD_BORDER = 'rgba(120,113,108,0.18)';
export const GEO_URL     = '/assets/geo/peru_departamental.geojson';

// ── Bin data ───────────────────────────────────────────────────────────────────
export const BINS_A = [{"bc":638,"delta":0.005},{"bc":662,"delta":0.143},{"bc":688,"delta":-0.026},{"bc":712,"delta":0.015},{"bc":738,"delta":-0.051},{"bc":762,"delta":-4.641},{"bc":788,"delta":-0.13},{"bc":812,"delta":-1.727},{"bc":838,"delta":-0.204},{"bc":862,"delta":4.24},{"bc":888,"delta":-0.005},{"bc":912,"delta":-1.063},{"bc":938,"delta":0.131},{"bc":962,"delta":0.19},{"bc":988,"delta":0.134},{"bc":1012,"delta":0.026},{"bc":1038,"delta":-0.067},{"bc":1062,"delta":-0.124},{"bc":1088,"delta":-0.022},{"bc":1112,"delta":0.061},{"bc":1138,"delta":-0.2},{"bc":1162,"delta":0.022},{"bc":1188,"delta":-0.01},{"bc":1212,"delta":-0.728},{"bc":1238,"delta":-0.036},{"bc":1262,"delta":-0.12},{"bc":1288,"delta":0.095},{"bc":1312,"delta":-0.994},{"bc":1338,"delta":-0.021},{"bc":1362,"delta":-0.202},{"bc":1388,"delta":-0.292},{"bc":1412,"delta":-0.103},{"bc":1438,"delta":0.059},{"bc":1462,"delta":-0.021},{"bc":1488,"delta":-0.051}];
export const BINS_B = [{"bc":738,"delta":0.046},{"bc":762,"delta":-0.197},{"bc":788,"delta":0.129},{"bc":812,"delta":-0.158},{"bc":838,"delta":-0.071},{"bc":862,"delta":-6.516},{"bc":888,"delta":-0.062},{"bc":912,"delta":-1.028},{"bc":938,"delta":5.064},{"bc":962,"delta":1.277},{"bc":988,"delta":-0.168},{"bc":1012,"delta":-0.823},{"bc":1038,"delta":-0.035},{"bc":1062,"delta":0.199},{"bc":1088,"delta":0.025},{"bc":1112,"delta":0.027},{"bc":1138,"delta":0.063},{"bc":1162,"delta":-0.08},{"bc":1188,"delta":-0.111},{"bc":1212,"delta":-0.624},{"bc":1238,"delta":0.042},{"bc":1262,"delta":-0.229},{"bc":1288,"delta":-0.173},{"bc":1312,"delta":-0.572},{"bc":1338,"delta":-0.003},{"bc":1362,"delta":0.014},{"bc":1388,"delta":0.042},{"bc":1412,"delta":-0.373},{"bc":1438,"delta":0.042},{"bc":1462,"delta":-0.02},{"bc":1488,"delta":0.001}];
export const BINS_C = [{"bc":838,"delta":-0.055},{"bc":862,"delta":-0.095},{"bc":888,"delta":-0.009},{"bc":912,"delta":-0.231},{"bc":938,"delta":-8.477},{"bc":962,"delta":-2.045},{"bc":988,"delta":-0.144},{"bc":1012,"delta":-1.964},{"bc":1038,"delta":6.916},{"bc":1062,"delta":1.197},{"bc":1088,"delta":0.067},{"bc":1112,"delta":-1.201},{"bc":1138,"delta":0.615},{"bc":1162,"delta":0.878},{"bc":1188,"delta":0.195},{"bc":1212,"delta":-2.137},{"bc":1238,"delta":0.245},{"bc":1262,"delta":0.687},{"bc":1288,"delta":-0.012},{"bc":1312,"delta":-0.63},{"bc":1338,"delta":0.477},{"bc":1362,"delta":0.44},{"bc":1388,"delta":0.111},{"bc":1412,"delta":-0.503},{"bc":1438,"delta":0.059},{"bc":1462,"delta":0.315},{"bc":1488,"delta":0.055}];

// ── Event type ─────────────────────────────────────────────────────────────────
export type MWEvent = {
  id: string; label: string; sublabel: string;
  mw_old: number; mw_new: number; pre_year: number; post_year: number;
  ratio: number; missing_pp: number; excess_pp: number;
  ci_lo: number; ci_hi: number;
  selfemp_pre: number; selfemp_post: number;
  formal_pre: number; formal_post: number;
  informal_pre: number; informal_post: number;
  selfemp_delta_pp: number; selfemp_abs_chg: string;
  bins: { bc: number; delta: number }[];
};

// ── Event metadata ─────────────────────────────────────────────────────────────
export const EVENTS: MWEvent[] = [
  { id:'A', label:'2016', sublabel:'S/750 → S/850', mw_old:750, mw_new:850,
    pre_year:2015, post_year:2017, ratio:0.696, missing_pp:6.78, excess_pp:4.72,
    ci_lo:0.567, ci_hi:0.896,
    selfemp_pre:38.0, selfemp_post:57.1, formal_pre:23.4, formal_post:9.4,
    informal_pre:38.6, informal_post:33.6, selfemp_delta_pp:19.1, selfemp_abs_chg:'+8.7%',
    bins:BINS_A },
  { id:'B', label:'2018', sublabel:'S/850 → S/930', mw_old:850, mw_new:930,
    pre_year:2017, post_year:2019, ratio:0.829, missing_pp:8.03, excess_pp:6.66,
    ci_lo:0.716, ci_hi:1.016,
    selfemp_pre:35.5, selfemp_post:55.5, formal_pre:25.4, formal_post:11.2,
    informal_pre:39.1, informal_post:33.3, selfemp_delta_pp:20.0, selfemp_abs_chg:'+5.1%',
    bins:BINS_B },
  { id:'C', label:'2022', sublabel:'S/930 → S/1,025', mw_old:930, mw_new:1025,
    pre_year:2021, post_year:2023, ratio:0.830, missing_pp:13.02, excess_pp:10.80,
    ci_lo:0.716, ci_hi:0.960,
    selfemp_pre:33.1, selfemp_post:47.8, formal_pre:28.5, formal_post:12.3,
    informal_pre:38.3, informal_post:39.8, selfemp_delta_pp:14.7, selfemp_abs_chg:'−3.5%',
    bins:BINS_C },
];

// ── Department Kaitz ───────────────────────────────────────────────────────────
export type DeptKaitz = { code: string; name: string; kaitz: number; note?: string };

export const DEPTS_KAITZ: DeptKaitz[] = [
  { code:'11', name:'Ica',           kaitz:0.933, note:'Sector agro-exportador: salarios mensuales bajos pese a jornada completa' },
  { code:'20', name:'Piura',         kaitz:0.680 },
  { code:'24', name:'Tumbes',        kaitz:0.670 },
  { code:'14', name:'Lambayeque',    kaitz:0.631 },
  { code:'07', name:'Callao',        kaitz:0.628 },
  { code:'13', name:'La Libertad',   kaitz:0.622 },
  { code:'15', name:'Lima',          kaitz:0.613 },
  { code:'22', name:'San Martín',    kaitz:0.602 },
  { code:'21', name:'Puno',          kaitz:0.601 },
  { code:'19', name:'Pasco',         kaitz:0.600 },
  { code:'23', name:'Tacna',         kaitz:0.597 },
  { code:'08', name:'Cusco',         kaitz:0.595 },
  { code:'05', name:'Ayacucho',      kaitz:0.593 },
  { code:'02', name:'Ancash',        kaitz:0.591 },
  { code:'25', name:'Ucayali',       kaitz:0.581 },
  { code:'12', name:'Junín',         kaitz:0.568 },
  { code:'04', name:'Arequipa',      kaitz:0.542 },
  { code:'10', name:'Huánuco',       kaitz:0.539 },
  { code:'16', name:'Loreto',        kaitz:0.511 },
  { code:'03', name:'Apurímac',      kaitz:0.494 },
  { code:'06', name:'Cajamarca',     kaitz:0.452 },
  { code:'01', name:'Amazonas',      kaitz:0.451 },
  { code:'17', name:'Madre de Dios', kaitz:0.462 },
  { code:'18', name:'Moquegua',      kaitz:0.468 },
  { code:'09', name:'Huancavelica',  kaitz:0.500, note:'85% trabajadores formales son sector público — exposición privada real es menor' },
];

export const kaitzMap: Record<string, DeptKaitz> = {};
DEPTS_KAITZ.forEach(d => { kaitzMap[d.code] = d; });

export function kaitzColor(k: number): string {
  if (k <= 0.45) return '#52c288';
  if (k <= 0.52) return '#86efac';
  if (k <= 0.58) return '#fbbf24';
  if (k <= 0.65) return '#f97316';
  if (k <= 0.75) return '#ef4444';
  return '#b91c1c';
}
