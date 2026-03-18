'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Cell, LabelList,
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// ── Design tokens ──────────────────────────────────────────────────────────────
const TERRACOTTA = '#C65D3E';
const TEAL       = '#2A9D8F';
const BG         = '#FAF8F4';
const CARD_BG    = '#FFFCF7';
const CARD_BORDER = 'rgba(120,113,108,0.18)';
const GEO_URL    = '/assets/geo/peru_departamental.geojson';

// ── Bin data ───────────────────────────────────────────────────────────────────
const BINS_A = [{"bc":638,"delta":0.005},{"bc":662,"delta":0.143},{"bc":688,"delta":-0.026},{"bc":712,"delta":0.015},{"bc":738,"delta":-0.051},{"bc":762,"delta":-4.641},{"bc":788,"delta":-0.13},{"bc":812,"delta":-1.727},{"bc":838,"delta":-0.204},{"bc":862,"delta":4.24},{"bc":888,"delta":-0.005},{"bc":912,"delta":-1.063},{"bc":938,"delta":0.131},{"bc":962,"delta":0.19},{"bc":988,"delta":0.134},{"bc":1012,"delta":0.026},{"bc":1038,"delta":-0.067},{"bc":1062,"delta":-0.124},{"bc":1088,"delta":-0.022},{"bc":1112,"delta":0.061},{"bc":1138,"delta":-0.2},{"bc":1162,"delta":0.022},{"bc":1188,"delta":-0.01},{"bc":1212,"delta":-0.728},{"bc":1238,"delta":-0.036},{"bc":1262,"delta":-0.12},{"bc":1288,"delta":0.095},{"bc":1312,"delta":-0.994},{"bc":1338,"delta":-0.021},{"bc":1362,"delta":-0.202},{"bc":1388,"delta":-0.292},{"bc":1412,"delta":-0.103},{"bc":1438,"delta":0.059},{"bc":1462,"delta":-0.021},{"bc":1488,"delta":-0.051}];
const BINS_B = [{"bc":738,"delta":0.046},{"bc":762,"delta":-0.197},{"bc":788,"delta":0.129},{"bc":812,"delta":-0.158},{"bc":838,"delta":-0.071},{"bc":862,"delta":-6.516},{"bc":888,"delta":-0.062},{"bc":912,"delta":-1.028},{"bc":938,"delta":5.064},{"bc":962,"delta":1.277},{"bc":988,"delta":-0.168},{"bc":1012,"delta":-0.823},{"bc":1038,"delta":-0.035},{"bc":1062,"delta":0.199},{"bc":1088,"delta":0.025},{"bc":1112,"delta":0.027},{"bc":1138,"delta":0.063},{"bc":1162,"delta":-0.08},{"bc":1188,"delta":-0.111},{"bc":1212,"delta":-0.624},{"bc":1238,"delta":0.042},{"bc":1262,"delta":-0.229},{"bc":1288,"delta":-0.173},{"bc":1312,"delta":-0.572},{"bc":1338,"delta":-0.003},{"bc":1362,"delta":0.014},{"bc":1388,"delta":0.042},{"bc":1412,"delta":-0.373},{"bc":1438,"delta":0.042},{"bc":1462,"delta":-0.02},{"bc":1488,"delta":0.001}];
const BINS_C = [{"bc":838,"delta":-0.055},{"bc":862,"delta":-0.095},{"bc":888,"delta":-0.009},{"bc":912,"delta":-0.231},{"bc":938,"delta":-8.477},{"bc":962,"delta":-2.045},{"bc":988,"delta":-0.144},{"bc":1012,"delta":-1.964},{"bc":1038,"delta":6.916},{"bc":1062,"delta":1.197},{"bc":1088,"delta":0.067},{"bc":1112,"delta":-1.201},{"bc":1138,"delta":0.615},{"bc":1162,"delta":0.878},{"bc":1188,"delta":0.195},{"bc":1212,"delta":-2.137},{"bc":1238,"delta":0.245},{"bc":1262,"delta":0.687},{"bc":1288,"delta":-0.012},{"bc":1312,"delta":-0.63},{"bc":1338,"delta":0.477},{"bc":1362,"delta":0.44},{"bc":1388,"delta":0.111},{"bc":1412,"delta":-0.503},{"bc":1438,"delta":0.059},{"bc":1462,"delta":0.315},{"bc":1488,"delta":0.055}];

// ── Event metadata ─────────────────────────────────────────────────────────────
const EVENTS = [
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
// GeoJSON property: FIRST_IDDP (zero-padded, e.g. '01'='Amazonas')
const DEPTS_KAITZ: { code:string; name:string; kaitz:number; note?:string }[] = [
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

const kaitzMap: Record<string, typeof DEPTS_KAITZ[0]> = {};
DEPTS_KAITZ.forEach(d => { kaitzMap[d.code] = d; });

// Kaitz → color (green=safe → red=risky)
function kaitzColor(k: number): string {
  if (k <= 0.45) return '#52c288';
  if (k <= 0.52) return '#86efac';
  if (k <= 0.58) return '#fbbf24';
  if (k <= 0.65) return '#f97316';
  if (k <= 0.75) return '#ef4444';
  return '#b91c1c';
}

// ── Simulator helpers ──────────────────────────────────────────────────────────
const LIMA_FORMAL_POP = 1_700_000;
const MW_2022 = 1025;
const LIMA_PERC: [number,number][] = [
  [0,0],[158,1],[480,5],[800,10],[930,15],[1016,20],[1100,25],
  [1200,30],[1500,40],[1700,50],[2000,60],[2500,70],[2800,75],
  [3000,80],[3712,85],[4519,90],[6000,95],[11256,99],[999999,100],
];
function pctAtOrBelow(w: number) {
  for (let i=1;i<LIMA_PERC.length;i++) {
    if (w<=LIMA_PERC[i][0]) {
      const f=(w-LIMA_PERC[i-1][0])/(LIMA_PERC[i][0]-LIMA_PERC[i-1][0]);
      return LIMA_PERC[i-1][1]+f*(LIMA_PERC[i][1]-LIMA_PERC[i-1][1]);
    }
  }
  return 100;
}
function workersAffected(v: number) {
  return Math.max(0,(pctAtOrBelow(v)-pctAtOrBelow(MW_2022))/100*LIMA_FORMAL_POP);
}
function sliderKaitz(v: number) { return v/1863; }
function kaitzRisk(k: number): {label:string;color:string;bg:string;pulse:boolean} {
  if (k<0.57) return {label:'Rango estudiado',color:'#16a34a',bg:'#f0fdf4',pulse:false};
  if (k<0.62) return {label:'Fuera del rango estudiado',color:'#d97706',bg:'#fffbeb',pulse:false};
  if (k<0.70) return {label:'Sin evidencia directa',color:'#dc2626',bg:'#fef2f2',pulse:true};
  return {label:'Territorio desconocido',color:'#7f1d1d',bg:'#fef2f2',pulse:true};
}
function deptsAbove(k: number) {
  return DEPTS_KAITZ.filter(d=>d.kaitz*(k/0.57)>0.60).length;
}
const SCENARIOS = [
  {label:'2016',sm:850,kaitz:0.567},{label:'2018',sm:930,kaitz:0.556},
  {label:'2022',sm:1025,kaitz:0.569},{label:'Actual 2025',sm:1130,kaitz:0.607},
  {label:'S/1,200',sm:1200,kaitz:0.644},{label:'S/1,300',sm:1300,kaitz:0.698},
];
const thermPos = (k:number) => Math.min(Math.max((k-0.30)/(0.95-0.30)*100,0),100);

const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');

// ── Animated number ────────────────────────────────────────────────────────────
function useAnimatedNumber(target: number, ms=350) {
  const [val,setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const s=prev.current, d=target-s;
    if(!d) return;
    const t0=performance.now(); let raf:number;
    const tick=(now:number)=>{
      const p=Math.min((now-t0)/ms,1), e=1-Math.pow(1-p,3);
      setVal(Math.round(s+d*e));
      if(p<1) raf=requestAnimationFrame(tick); else prev.current=target;
    };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[target,ms]);
  return val;
}

// ── useInView hook for fade-in ─────────────────────────────────────────────────
function useInView(threshold=0.12) {
  const ref = useRef<HTMLElement>(null);
  const [visible,setVisible] = useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVisible(true); },{threshold});
    obs.observe(el);
    return ()=>obs.disconnect();
  },[threshold]);
  return {ref,visible};
}

// ── FadeSection wrapper ────────────────────────────────────────────────────────
function FadeSection({children,className=''}:{children:React.ReactNode;className?:string}) {
  const {ref,visible}=useInView();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
      style={{
        opacity: visible?1:0,
        transform: visible?'translateY(0)':'translateY(24px)',
        transition:'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {children}
    </section>
  );
}

// ── EventTabs ─────────────────────────────────────────────────────────────────
function EventTabs({active,onChange,color=TERRACOTTA}:{active:number;onChange:(i:number)=>void;color?:string}) {
  return (
    <div className="flex gap-2">
      {EVENTS.map((e,i)=>(
        <button key={e.id} onClick={()=>onChange(i)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
          style={{
            background: active===i ? color : 'transparent',
            color: active===i ? 'white' : '#6b7280',
            border:`2px solid ${active===i ? color : '#d6d3d1'}`,
          }}>
          {e.label}
        </button>
      ))}
    </div>
  );
}

// ── BunchingChart ──────────────────────────────────────────────────────────────
function BunchingChart({ev}:{ev:typeof EVENTS[0]}) {
  const affLo = Math.round(0.85*ev.mw_old);
  const exHi  = ev.mw_new+220;
  const data = ev.bins.map(b=>({
    bc:b.bc,
    neg:b.delta<0?b.delta:0,
    pos:b.delta>=0?b.delta:0,
    inAff:b.bc>=affLo&&b.bc<ev.mw_new,
    inExc:b.bc>=ev.mw_new&&b.bc<exHi,
  }));

  // Build MW-aligned x ticks
  const domain:[number,number] = [affLo-75, ev.mw_new+320];
  const ticks = [affLo, ev.mw_old, ev.mw_new, ev.mw_new+100, ev.mw_new+200, ev.mw_new+300]
    .filter(t=>t>=domain[0]&&t<=domain[1]);

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={data} margin={{top:28,right:12,bottom:32,left:8}} barCategoryGap="8%">
        <ReferenceArea x1={affLo} x2={ev.mw_new} fill={TERRACOTTA} fillOpacity={0.07} />
        <ReferenceArea x1={ev.mw_new} x2={exHi} fill={TEAL} fillOpacity={0.06} />
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e4e0" vertical={false} />
        <XAxis dataKey="bc" type="number" domain={domain} ticks={ticks}
          tickFormatter={v=>`S/${v}`} tick={{fontSize:10,fill:'#78716c'}} tickLine={false}
          label={{value:'Salario mensual (S/.)',position:'insideBottom',offset:-18,fontSize:11,fill:'#a8a29e'}} />
        <YAxis tickFormatter={v=>`${v>0?'+':''}${v.toFixed(1)}pp`}
          tick={{fontSize:10,fill:'#a8a29e'}} tickLine={false} axisLine={false} width={50} />
        <Tooltip
          formatter={(val:unknown)=>{
            const v=typeof val==='number'?val:0;
            return [`${v>0?'+':''}${v.toFixed(2)} pp`, v<0?'Desaparecen':'Reaparecen'] as [string,string];
          }}
          labelFormatter={(v:unknown)=>`S/${v}–${Number(v)+25}`}
          contentStyle={{fontSize:12,borderRadius:10,border:`1px solid ${CARD_BORDER}`,background:CARD_BG,boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}
        />
        <ReferenceLine y={0} stroke="#d6d3d1" strokeWidth={1.5} />
        <ReferenceLine x={ev.mw_new} stroke={TERRACOTTA} strokeWidth={3} strokeDasharray="5 3"
          label={{value:`SM nuevo: S/${ev.mw_new}`,position:'top',fill:TERRACOTTA,fontSize:12,fontWeight:700}} />
        {ev.mw_old!==ev.mw_new && (
          <ReferenceLine x={ev.mw_old} stroke="#c4b5a0" strokeWidth={1.5} strokeDasharray="3 2"
            label={{value:`S/${ev.mw_old}`,position:'insideTopRight',fill:'#c4b5a0',fontSize:10}} />
        )}
        <Bar dataKey="neg" isAnimationActive={false}>
          {data.map(b=><Cell key={b.bc} fill={TERRACOTTA} fillOpacity={b.inAff?0.88:0.18} />)}
        </Bar>
        <Bar dataKey="pos" isAnimationActive={false}>
          {data.map(b=><Cell key={b.bc} fill={TEAL} fillOpacity={b.inExc?0.88:0.18} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── HorizontalStackedBar (custom SVG) ─────────────────────────────────────────
function HStackBar({formal,informal,selfemp,label}:{formal:number;informal:number;selfemp:number;label:string}) {
  const total=formal+informal+selfemp;
  const fw=formal/total*100, iw=informal/total*100, sw=selfemp/total*100;
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-stone-600">{label}</div>
      <div className="relative h-10 rounded-lg overflow-hidden flex">
        <div style={{width:`${fw}%`,background:TERRACOTTA,opacity:0.88}}
          className="flex items-center justify-center transition-all duration-500">
          {fw>8&&<span className="text-white text-[10px] font-bold">{fw.toFixed(0)}%</span>}
        </div>
        <div style={{width:`${iw}%`,background:'#94a3b8',opacity:0.80}}
          className="flex items-center justify-center transition-all duration-500">
          {iw>8&&<span className="text-white text-[10px] font-bold">{iw.toFixed(0)}%</span>}
        </div>
        <div style={{width:`${sw}%`,background:TEAL,opacity:0.88}}
          className="flex items-center justify-center transition-all duration-500">
          {sw>8&&<span className="text-white text-[10px] font-bold">{sw.toFixed(0)}%</span>}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function MWSalarioPage() {
  const [activeEvent, setActiveEvent] = useState(1);
  const [sliderValue, setSliderValue] = useState(1130);
  const [hoveredDept, setHoveredDept] = useState<typeof DEPTS_KAITZ[0]|null>(null);
  const [openAccordion, setOpenAccordion] = useState<string|null>(null);
  const [heroBars, setHeroBars] = useState([0,0,0]);

  const ev        = EVENTS[activeEvent];
  const affected  = useMemo(()=>workersAffected(sliderValue),[sliderValue]);
  const sliderK   = useMemo(()=>sliderKaitz(sliderValue),[sliderValue]);
  const risk      = useMemo(()=>kaitzRisk(sliderK),[sliderK]);
  const animAff   = useAnimatedNumber(Math.round(affected));
  const animK     = useAnimatedNumber(Math.round(sliderK*100));
  const animDepts = useAnimatedNumber(deptsAbove(sliderK));

  // Hero bars grow in sequence
  useEffect(()=>{
    const ratios=[0.696,0.829,0.830];
    const timers=ratios.map((r,i)=>setTimeout(()=>setHeroBars(prev=>{
      const n=[...prev]; n[i]=r; return n;
    }),(i+1)*400));
    return ()=>timers.forEach(clearTimeout);
  },[]);

  return (
    <div style={{backgroundColor:BG,minHeight:'100vh',fontFamily:"'Inter',system-ui,sans-serif",position:'relative'}}>

      {/* ── WATERMARK ─────────────────────────────────────────────────────────── */}
      <div style={{
        position:'fixed',top:0,left:0,width:'100vw',height:'100vh',
        pointerEvents:'none',zIndex:0,overflow:'hidden',
      }}>
        <div style={{
          position:'absolute',top:'-50%',left:'-50%',width:'200%',height:'200%',
          transform:'rotate(-30deg)',display:'flex',flexWrap:'wrap',
          gap:'80px',opacity:0.018,fontSize:'24px',fontWeight:700,
          color:'#1a1a1a',letterSpacing:'8px',userSelect:'none',
          alignContent:'flex-start',
        }}>
          {Array.from({length:200},(_,i)=>(
            <span key={i} style={{whiteSpace:'nowrap'}}>QHAWARINA</span>
          ))}
        </div>
      </div>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-28" style={{zIndex:1}}>

        {/* ══ S1: HERO ══════════════════════════════════════════════════════════ */}
        <section className="text-center space-y-8 pt-4">
          <div className="inline-block rounded-full px-4 py-1.5 text-xs font-medium text-stone-500 tracking-wide"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`}}>
            Análisis distribucional · ENAHO 2015–2023 · INEI Perú
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 leading-tight tracking-tight">
              ¿Qué pasa cuando sube<br className="hidden sm:block"/> el salario mínimo?
            </h1>
            <p className="text-xl sm:text-2xl text-stone-500 font-light max-w-2xl mx-auto">
              Tres aumentos en Perú. La respuesta: redistribución, no destrucción.
            </p>
          </div>

          {/* Animated bars */}
          <div className="inline-flex flex-col items-center gap-5 rounded-3xl px-8 py-7 max-w-sm mx-auto"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
            <div className="text-sm font-semibold text-stone-500 tracking-wide">de empleos desplazados que reaparecen</div>
            <div className="w-full space-y-2">
              {EVENTS.map((e,i)=>(
                <div key={e.id} className="flex items-center gap-3">
                  <div className="text-xs font-bold text-stone-400 w-8 text-right">{e.label}</div>
                  <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{background:'#f0ece6'}}>
                    <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                      style={{
                        width:`${heroBars[i]*100}%`,
                        background:`linear-gradient(90deg,${TERRACOTTA}cc,${TERRACOTTA})`,
                      }}>
                      {heroBars[i]>0.1&&(
                        <span className="text-white text-sm font-black">{Math.round(heroBars[i]*100)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-stone-400">70–83% reaparecen · Verificado con test de falsificación</div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-stone-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full" style={{background:TEAL}}/>
            Basado en ~10,000 trabajadores formales por año · ENAHO Módulo 500 2015–2023
          </div>
        </section>

        {/* ── DIVIDER ─────────────────────────────────────────────────────────── */}
        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S2: THE FINDING ═══════════════════════════════════════════════════ */}
        <FadeSection className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl p-8 space-y-4"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
            <div className="text-xs font-bold tracking-widest uppercase text-stone-400">Redistribución salarial</div>
            <div className="text-7xl font-black leading-none" style={{color:TERRACOTTA}}>70–83%</div>
            <p className="text-base font-medium text-stone-700 leading-snug">
              de los empleos formales desplazados reaparecen por encima del nuevo piso salarial
            </p>
            <div className="h-24 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ev:'2016',r:0.696},{ev:'2018',r:0.829},{ev:'2022',r:0.830}]}
                  margin={{top:4,right:4,bottom:4,left:4}} barCategoryGap="28%"
                  style={{background:'transparent'}}>
                  <XAxis dataKey="ev" tick={{fontSize:11,fill:'#a8a29e'}} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v:unknown)=>[`${(Number(v)*100).toFixed(1)}%`,'Ratio']}
                    contentStyle={{fontSize:11,borderRadius:8,border:`1px solid ${CARD_BORDER}`,background:CARD_BG}}/>
                  <Bar dataKey="r" radius={[5,5,0,0]} isAnimationActive={false}>
                    <Cell fill={TERRACOTTA} fillOpacity={0.6}/>
                    <Cell fill={TERRACOTTA} fillOpacity={0.75}/>
                    <Cell fill={TERRACOTTA} fillOpacity={0.9}/>
                  </Bar>
                  <ReferenceLine y={1} stroke="#e7e4e0" strokeDasharray="3 2"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Test de falsificación: ratios 7× menores en umbrales ficticios · Replicado en EPE Lima (ratios 0.73–1.03)
            </p>
          </div>

          <div className="rounded-3xl p-8 space-y-4"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
            <div className="text-xs font-bold tracking-widest uppercase text-stone-400">Autoempleo informal</div>
            <div className="text-7xl font-black leading-none" style={{color:TEAL}}>+15–21pp</div>
            <p className="text-base font-medium text-stone-700 leading-snug">
              de autoempleo en la zona salarial afectada — los trabajadores cambian de modalidad, no desaparecen
            </p>
            <div className="h-24 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[{ev:'2016',pre:38.0,post:57.1},{ev:'2018',pre:35.5,post:55.5},{ev:'2022',pre:33.1,post:47.8}]}
                  margin={{top:4,right:4,bottom:4,left:4}} barCategoryGap="20%"
                  style={{background:'transparent'}}>
                  <XAxis dataKey="ev" tick={{fontSize:11,fill:'#a8a29e'}} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v:unknown)=>[`${v}%`,'']}
                    contentStyle={{fontSize:11,borderRadius:8,border:`1px solid ${CARD_BORDER}`,background:CARD_BG}}/>
                  <Bar dataKey="pre" name="Antes" fill="#d6d3d1" radius={[4,4,0,0]} isAnimationActive={false}/>
                  <Bar dataKey="post" name="Después" fill={TEAL} fillOpacity={0.85} radius={[4,4,0,0]} isAnimationActive={false}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Gris: % autoempleados antes · Teal: después · Zona afectada [0.85×SM_ant, SM_nuevo)
            </p>
          </div>
        </FadeSection>

        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S3: BUNCHING CHART ════════════════════════════════════════════════ */}
        <FadeSection className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Distribución salarial por evento</h2>
              <p className="text-sm text-stone-500 mt-1">Cambio en participación de trabajadores por tramo salarial (pp) · Bins S/25</p>
            </div>
            <EventTabs active={activeEvent} onChange={setActiveEvent}/>
          </div>

          <div className="rounded-3xl p-6 sm:p-8 space-y-6"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
            {/* Legend */}
            <div className="flex flex-wrap gap-5 text-xs text-stone-500">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded" style={{background:TERRACOTTA,opacity:0.85}}/>
                Empleos que desaparecen bajo S/{ev.mw_new}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded" style={{background:TEAL,opacity:0.85}}/>
                Empleos que reaparecen por encima
              </span>
              <span className="flex items-center gap-2 text-stone-400">
                <span className="inline-block w-6" style={{borderTop:`2.5px dashed ${TERRACOTTA}`}}/>
                Nuevo SM: S/{ev.mw_new}
              </span>
            </div>

            <BunchingChart ev={ev}/>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{borderColor:'rgba(0,0,0,0.06)'}}>
              <div className="text-center">
                <div className="text-2xl font-black tabular-nums" style={{color:TERRACOTTA}}>−{ev.missing_pp.toFixed(1)}pp</div>
                <div className="text-xs text-stone-500 mt-0.5">Masa desaparecida</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black tabular-nums" style={{color:TEAL}}>+{ev.excess_pp.toFixed(1)}pp</div>
                <div className="text-xs text-stone-500 mt-0.5">Masa en exceso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black tabular-nums text-stone-800">
                  <span style={{color:TERRACOTTA}}>{Math.round(ev.ratio*100)}</span>
                  <span className="text-stone-300 font-normal text-lg">/100</span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">Regresan al mercado formal</div>
              </div>
            </div>
            <p className="text-xs text-stone-400">
              IC bootstrap 95%: [{ev.ci_lo.toFixed(3)}, {ev.ci_hi.toFixed(3)}] ·{' '}
              {ev.ci_hi>=1?'No rechaza R=1 (compatible con redistribución perfecta)':'Rechaza R=1'} ·
              Zona roja: masa desaparecida · Zona verde: ventana de exceso [SM, SM+S/220)
            </p>
          </div>
        </FadeSection>

        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S4: EVIDENCE TABLE ════════════════════════════════════════════════ */}
        <FadeSection className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">La evidencia completa</h2>
            <p className="text-sm text-stone-500 mt-1">Tres eventos · Clic en una fila para ver el gráfico</p>
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{borderBottom:`1px solid ${CARD_BORDER}`,background:'rgba(0,0,0,0.02)'}}>
                    <th className="text-left px-5 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Evento</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Desaparecen</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Reaparecen</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Regresan</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">IC 95%</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Autoempleo</th>
                  </tr>
                </thead>
                <tbody>
                  {EVENTS.map((e,i)=>(
                    <tr key={e.id} onClick={()=>setActiveEvent(i)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom:`1px solid ${CARD_BORDER}`,
                        background: activeEvent===i?`${TERRACOTTA}08`:undefined,
                      }}>
                      <td className="px-5 py-4">
                        <div className="font-bold text-stone-800">{e.label}</div>
                        <div className="text-xs text-stone-400 mt-0.5">{e.sublabel}</div>
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums font-semibold" style={{color:TERRACOTTA}}>
                        −{e.missing_pp.toFixed(1)}<span className="text-xs font-normal">pp</span>
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums font-semibold" style={{color:TEAL}}>
                        +{e.excess_pp.toFixed(1)}<span className="text-xs font-normal">pp</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-xl font-black tabular-nums" style={{color:TERRACOTTA}}>{Math.round(e.ratio*100)}</span>
                        <span className="text-stone-300 text-sm">/100</span>
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-stone-400" style={{fontSize:11}}>
                        [{e.ci_lo.toFixed(2)}, {e.ci_hi.toFixed(2)}]
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold tabular-nums" style={{color:TEAL}}>
                          ↑{e.selfemp_delta_pp.toFixed(0)}pp
                        </span>
                        <div className="text-xs text-stone-400">{e.selfemp_abs_chg} abs.</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl px-5 py-3.5 text-xs text-stone-500 space-y-1"
            style={{background:'rgba(0,0,0,0.025)',border:`1px solid ${CARD_BORDER}`}}>
            <p><strong>Test de falsificación:</strong> Ratios en umbrales ficticios S/1,100→1,200 y S/1,400→1,500 son 0.114 y 0.013 — 7× menores que el umbral real.</p>
            <p><strong>Replicación EPE Lima:</strong> Dataset independiente, ventanas de 6 meses, produce ratios 0.73–1.03 — consistentes con ENAHO 0.70–0.83.</p>
          </div>
        </FadeSection>

        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S5: ¿A DÓNDE VAN? ════════════════════════════════════════════════ */}
        <FadeSection className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">¿A dónde van los trabajadores que desaparecen?</h2>
            <p className="text-sm text-stone-500 mt-1 max-w-2xl">
              Composición del empleo en la zona afectada [0.85×SM<sub>ant</sub>, SM<sub>nuevo</sub>), antes y después
            </p>
          </div>

          <EventTabs active={activeEvent} onChange={setActiveEvent} color={TEAL}/>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Horizontal stacked bars */}
            <div className="rounded-2xl p-6 space-y-5"
              style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              <div className="flex gap-4 text-xs flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{background:TERRACOTTA}}/>Formal dep.
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{background:'#94a3b8'}}/>Informal dep.
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{background:TEAL}}/>Autoempleado
                </span>
              </div>
              <HStackBar
                formal={ev.formal_pre} informal={ev.informal_pre} selfemp={ev.selfemp_pre}
                label={`Antes (${ev.pre_year})`}/>
              <HStackBar
                formal={ev.formal_post} informal={ev.informal_post} selfemp={ev.selfemp_post}
                label={`Después (${ev.post_year})`}/>

              {/* Arrow annotation */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-black" style={{color:TERRACOTTA}}>{ev.formal_pre.toFixed(0)}%→{ev.formal_post.toFixed(0)}%</div>
                  <div className="text-xs text-stone-400">Formal dep.</div>
                </div>
                <div className="text-stone-200 text-2xl">·</div>
                <div className="text-center">
                  <div className="text-2xl font-black" style={{color:TEAL}}>{ev.selfemp_pre.toFixed(0)}%→{ev.selfemp_post.toFixed(0)}%</div>
                  <div className="text-xs text-stone-400">Autoempleado</div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-4">
              <div className="rounded-2xl p-6 space-y-3"
                style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
                <div className="text-3xl font-black tabular-nums" style={{color:TEAL}}>
                  ↑{ev.selfemp_delta_pp.toFixed(0)}pp
                </div>
                <p className="text-sm font-semibold text-stone-800">
                  de autoempleo en la zona afectada ({ev.pre_year} → {ev.post_year})
                </p>
                <div className="space-y-2 text-sm text-stone-600 border-t pt-3" style={{borderColor:'rgba(0,0,0,0.06)'}}>
                  {[
                    {label:'Formal dep.',pre:ev.formal_pre,post:ev.formal_post,color:TERRACOTTA},
                    {label:'Informal dep.',pre:ev.informal_pre,post:ev.informal_post,color:'#94a3b8'},
                    {label:'Autoempleado',pre:ev.selfemp_pre,post:ev.selfemp_post,color:TEAL},
                  ].map(row=>(
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-stone-500">{row.label}</span>
                      <span>
                        <span className="font-bold tabular-nums" style={{color:row.color}}>{row.pre.toFixed(1)}%</span>
                        <span className="text-stone-300 mx-1">→</span>
                        <span className="font-bold tabular-nums" style={{color:row.color}}>{row.post.toFixed(1)}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 space-y-2" style={{background:'#fffbeb',border:'1px solid #fde68a'}}>
                <div className="font-bold text-amber-900 text-sm">El empleo total se mantiene. La MODALIDAD cambia.</div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  El aumento en autoempleo no implica bienestar equivalente — los autoempleados informales
                  pierden acceso a seguridad social. Pero tampoco implica destrucción de empleo.
                </p>
                {ev.id==='C'&&(
                  <p className="text-xs text-amber-700 leading-relaxed border-t border-amber-200 pt-2">
                    <strong>Evento C:</strong> Recuento absoluto de autoempleados cae (−3.5%), consistente
                    con re-formalización post-COVID (fuerza laboral formal creció 12.5% en 2021–2023).
                  </p>
                )}
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                Fuente: ENAHO Módulo 500. Ingresos de autoempleados: p530a (ingreso neto mensual de negocio).
                Diseño transversal — no se rastrean individuos.
              </p>
            </div>
          </div>
        </FadeSection>

        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S6: MAP ═══════════════════════════════════════════════════════════ */}
        <FadeSection className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">¿Dónde muerde más el salario mínimo?</h2>
            <p className="text-sm text-stone-500 mt-1">
              Índice de Kaitz por departamento (SM / mediana salarial formal) · Verde = bajo riesgo · Rojo = alto riesgo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Map — desktop only */}
            <div className="lg:col-span-2 hidden sm:block rounded-2xl overflow-hidden relative"
              style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              {/* Hover tooltip */}
              {hoveredDept&&(
                <div className="absolute top-4 left-4 z-20 rounded-xl px-4 py-3 pointer-events-none"
                  style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 4px 16px rgba(0,0,0,0.12)',maxWidth:220}}>
                  <div className="font-bold text-stone-800 text-sm">{hoveredDept.name}</div>
                  <div className="text-3xl font-black mt-0.5 tabular-nums" style={{color:kaitzColor(hoveredDept.kaitz)}}>
                    {hoveredDept.kaitz.toFixed(2)}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    SM = {(hoveredDept.kaitz*100).toFixed(0)}% del salario mediano
                  </div>
                  {hoveredDept.note&&(
                    <div className="text-xs text-amber-700 rounded-lg px-2 py-1.5 mt-2" style={{background:'#fffbeb'}}>
                      {hoveredDept.note}
                    </div>
                  )}
                </div>
              )}

              <ComposableMap
                projection="geoMercator"
                projectionConfig={{center:[-75.5,-10],scale:1600}}
                style={{width:'100%',height:'auto'}}
              >
                <Geographies geography={GEO_URL}>
                  {({geographies}:{geographies:any[]})=>
                    geographies.map((geo:any)=>{
                      // ✅ Correct property: FIRST_IDDP (not IDDPTO / COD_DEPT / id)
                      const rawCode = geo.properties?.FIRST_IDDP;
                      const code = rawCode ? String(rawCode).padStart(2,'0') : null;
                      const dept = code ? kaitzMap[code] : null;
                      const fill = dept ? kaitzColor(dept.kaitz) : '#e7e4e0';
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="white"
                          strokeWidth={0.7}
                          style={{
                            default:{fill,outline:'none',cursor:'pointer'},
                            hover:{fill,opacity:0.72,outline:'none',cursor:'pointer'},
                            pressed:{fill,outline:'none'},
                          }}
                          onMouseEnter={()=>dept&&setHoveredDept(dept)}
                          onMouseLeave={()=>setHoveredDept(null)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {/* Gradient legend */}
              <div className="px-5 pb-4 pt-1">
                <div className="h-3 rounded-full" style={{
                  background:'linear-gradient(to right,#52c288,#86efac,#fbbf24,#f97316,#ef4444,#b91c1c)'
                }}/>
                <div className="flex justify-between text-xs text-stone-300 mt-1.5">
                  <span>0.45 — Bajo</span><span>0.55</span><span>0.65</span><span>0.75+ — Alto</span>
                </div>
              </div>
            </div>

            {/* Ranked list (always visible, including mobile) */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-stone-500 mb-3">Más expuestos al SM</div>
              {[...DEPTS_KAITZ].sort((a,b)=>b.kaitz-a.kaitz).slice(0,8).map(d=>(
                <div key={d.code} className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`}}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{background:kaitzColor(d.kaitz)}}>
                    {(d.kaitz*100).toFixed(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-stone-700 text-sm truncate">{d.name}</div>
                    {d.note&&<div className="text-xs text-amber-600 leading-tight mt-0.5 truncate">{d.note.split(':')[0]}</div>}
                  </div>
                </div>
              ))}
              <p className="text-xs text-stone-400 leading-relaxed pt-2">
                Ica: agro-exportadores con salarios mensuales bajos pese a jornada completa —
                el sector más expuesto al SM en Perú.
              </p>
            </div>
          </div>
        </FadeSection>

        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S7: SIMULATOR ════════════════════════════════════════════════════ */}
        <FadeSection className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Simulador de impacto</h2>
            <p className="text-sm text-stone-500 mt-1">¿Qué pasa si el SM sube más? Exposición mecánica basada en distribución Lima 2023</p>
          </div>

          <div className="rounded-3xl p-6 sm:p-8 space-y-8"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>

            {/* Slider with tick marks */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-stone-400">S/1,025 (SM 2022)</span>
                <span className="text-2xl font-black text-stone-800 tabular-nums">
                  S/{sliderValue.toLocaleString('es-PE')}
                </span>
                <span className="text-xs text-stone-400">S/1,500</span>
              </div>
              <div className="relative">
                <input type="range" min={1025} max={1500} step={5} value={sliderValue}
                  onChange={e=>setSliderValue(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{
                    accentColor:TERRACOTTA,
                    height:'6px',
                    appearance:'none',
                    WebkitAppearance:'none',
                    borderRadius:'999px',
                    background:`linear-gradient(to right,${TERRACOTTA} ${(sliderValue-1025)/(1500-1025)*100}%,#e7e4e0 ${(sliderValue-1025)/(1500-1025)*100}%)`,
                  }}/>
                {/* Tick marks */}
                <div className="flex justify-between mt-1.5 px-0">
                  {[{v:1025,l:'2022'},{v:1130,l:'Vigente'},{v:1200,l:'S/1,200'},{v:1300,l:'S/1,300'},{v:1500,l:'S/1,500'}].map(t=>(
                    <button key={t.v} onClick={()=>setSliderValue(t.v)}
                      className="flex flex-col items-center gap-0.5 cursor-pointer"
                      style={{left:`${(t.v-1025)/(1500-1025)*100}%`}}>
                      <span className="w-px h-2 block" style={{background:sliderValue===t.v?TERRACOTTA:'#d6d3d1'}}/>
                      <span className="text-[10px] font-medium" style={{color:sliderValue===t.v?TERRACOTTA:'#a8a29e'}}>{t.l}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Workers */}
              <div className="rounded-2xl p-5 text-center space-y-1" style={{background:risk.bg,border:`1px solid ${risk.color}22`}}>
                <div className="text-4xl font-black tabular-nums" style={{color:TERRACOTTA}}>
                  {fmt(animAff)}
                </div>
                <div className="text-sm font-medium text-stone-600">trabajadores adicionales</div>
                <div className="text-xs text-stone-400">vs. SM 2022 · Lima Metro</div>
              </div>

              {/* Kaitz gauge — bigger */}
              <div className="rounded-2xl p-5 text-center space-y-2"
                style={{
                  background:risk.bg,
                  border:`1px solid ${risk.color}22`,
                  boxShadow: risk.pulse?`0 0 0 4px ${risk.color}22,0 0 0 8px ${risk.color}11`:undefined,
                  transition:'box-shadow 0.4s ease',
                }}>
                <div className="text-sm font-medium text-stone-600">Índice de Kaitz</div>
                <div className="flex justify-center">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e4e0" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={risk.color} strokeWidth="10"
                      strokeDasharray={`${Math.min(sliderK/0.95,1)*251.3} 251.3`}
                      strokeDashoffset="62.8" strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{transition:'stroke-dasharray 0.35s ease'}}/>
                    <text x="50" y="45" textAnchor="middle" fontSize="20" fontWeight="900" fill={risk.color}
                      style={{fontVariantNumeric:'tabular-nums'}}>
                      {animK}%
                    </text>
                    <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#a8a29e">Kaitz</text>
                  </svg>
                </div>
                <div className="text-xs font-bold" style={{color:risk.color}}>{risk.label}</div>
              </div>

              {/* Depts */}
              <div className="rounded-2xl p-5 text-center space-y-1" style={{background:risk.bg,border:`1px solid ${risk.color}22`}}>
                <div className="text-4xl font-black tabular-nums" style={{color:risk.color}}>
                  {animDepts}
                </div>
                <div className="text-sm font-medium text-stone-600">de 25 departamentos en zona de riesgo (Kaitz &gt;0.60)</div>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed rounded-xl px-4 py-3"
              style={{background:'rgba(0,0,0,0.025)'}}>
              Los trabajadores afectados son quienes ganan entre S/{MW_2022.toLocaleString()} y S/{sliderValue.toLocaleString()}.
              Distribución: EPE Lima 2023. El simulador mide exposición mecánica, no predice el efecto causal del SM.
            </p>
          </div>
        </FadeSection>

        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S8: THERMOMETER ═══════════════════════════════════════════════════ */}
        <FadeSection className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">¿Hasta dónde llegan nuestros datos?</h2>
            <p className="text-sm text-stone-500 mt-1">El índice de Kaitz como termómetro de riesgo — sincronizado con el simulador</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thermometer */}
            <div className="rounded-3xl p-7 space-y-6"
              style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              {/* Bar + triangle marker */}
              <div className="space-y-1">
                {/* Marker row */}
                <div className="relative h-6">
                  <div className="absolute transition-all duration-200"
                    style={{left:`calc(${thermPos(sliderK)}% - 8px)`}}>
                    {/* Triangle pointing down */}
                    <div className="w-0 h-0" style={{
                      borderLeft:'8px solid transparent',
                      borderRight:'8px solid transparent',
                      borderTop:`12px solid ${risk.color}`,
                    }}/>
                  </div>
                  <div className="absolute transition-all duration-200 whitespace-nowrap text-xs font-black"
                    style={{
                      left:`calc(${thermPos(sliderK)}% - 8px)`,
                      top:'-16px',
                      color:risk.color,
                      transform: thermPos(sliderK)>80?'translateX(-80%)':thermPos(sliderK)<20?'none':'translateX(-40%)',
                    }}>
                    S/{sliderValue.toLocaleString()}
                  </div>
                </div>
                {/* Gradient bar */}
                <div className="h-10 rounded-2xl overflow-hidden relative" style={{
                  background:'linear-gradient(to right,#52c288,#86efac,#fbbf24,#f97316,#ef4444,#b91c1c)',
                  boxShadow:'inset 0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {/* Studied zone overlay */}
                  <div className="absolute top-0 h-full"
                    style={{
                      left:0,width:`${thermPos(0.57)}%`,
                      background:'rgba(255,255,255,0.15)',
                      borderRight:'2px dashed rgba(255,255,255,0.6)',
                    }}/>
                </div>
                {/* Scale labels under bar */}
                <div className="flex justify-between text-xs text-stone-300 px-0.5">
                  <span>0.30</span><span>0.45</span><span>0.57</span><span>0.70</span><span>0.95</span>
                </div>
              </div>

              {/* Zone labels aligned to bar */}
              <div className="relative h-12">
                <div className="absolute text-center" style={{left:0,width:`${thermPos(0.57)}%`,fontSize:11}}>
                  <div className="font-semibold text-green-700">Evidencia directa</div>
                  <div className="text-green-500 text-[10px]">Kaitz &lt; 0.57</div>
                </div>
                <div className="absolute text-center" style={{left:`${thermPos(0.57)}%`,width:`${thermPos(0.65)-thermPos(0.57)}%`,fontSize:11}}>
                  <div className="font-semibold text-amber-700">Sin datos propios</div>
                  <div className="text-amber-500 text-[10px]">0.57–0.65</div>
                </div>
                <div className="absolute text-center" style={{left:`${thermPos(0.65)}%`,right:0,fontSize:11}}>
                  <div className="font-semibold text-red-700">Territorio inexplorado</div>
                  <div className="text-red-400 text-[10px]">Kaitz &gt; 0.65</div>
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                El marcador se mueve con el simulador. Arrastra el slider para ver cómo el SM propuesto
                se aleja de la zona de evidencia estudida (2016–2022).
              </p>
            </div>

            {/* Scenarios table */}
            <div className="rounded-3xl overflow-hidden"
              style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{borderBottom:`1px solid ${CARD_BORDER}`,background:'rgba(0,0,0,0.025)'}}>
                    <th className="text-left px-5 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Escenario</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">SM</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Kaitz</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Zona</th>
                  </tr>
                </thead>
                <tbody>
                  {SCENARIOS.map(s=>{
                    const r=kaitzRisk(s.kaitz);
                    return (
                      <tr key={s.label} style={{borderBottom:`1px solid ${CARD_BORDER}`}}>
                        <td className="px-5 py-3.5 font-medium text-stone-700">{s.label}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-stone-500">S/{s.sm.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-black tabular-nums" style={{color:r.color}}>
                            {(s.kaitz*100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{background:r.bg,color:r.color}}>
                            {r.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3.5 text-xs text-stone-400" style={{borderTop:`1px solid ${CARD_BORDER}`}}>
                Kaitz = SM / mediana salarial formal (S/1,863 en 2023).
                Evidencia internacional: Kaitz &gt;0.65 asociado con mayor riesgo de desempleo.
              </div>
            </div>
          </div>
        </FadeSection>

        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S9: SECONDARY FINDINGS ════════════════════════════════════════════ */}
        <FadeSection className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl p-7 space-y-4"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
            <div className="text-xs font-bold tracking-widest uppercase text-stone-400">Hallazgo secundario A</div>
            <h3 className="text-lg font-bold text-stone-900">Compresión salarial</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              El aumento del SM comprime el p10–p50 en 3–7 puntos porcentuales (DiD en log-salario).
            </p>
            <div className="rounded-xl px-4 py-3 space-y-2 text-xs text-stone-600"
              style={{background:'rgba(0,0,0,0.025)',border:`1px solid ${CARD_BORDER}`}}>
              <div className="font-semibold text-stone-700">Mecánica vs. genuina (Evento B)</div>
              <div className="flex justify-between">
                <span>Composición (mecánica)</span>
                <span className="font-bold">41–92%</span>
              </div>
              <div className="flex justify-between">
                <span>Reordenamiento real (genuina)</span>
                <span className="font-bold" style={{color:TEAL}}>8–59%</span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              La mayor parte de la compresión refleja cambios en quién ocupa la zona del SM, no alzas reales para los mismos trabajadores.
            </p>
          </div>

          <div className="rounded-3xl p-7 space-y-4"
            style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`,boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
            <div className="text-xs font-bold tracking-widest uppercase text-stone-400">Hallazgo secundario B</div>
            <h3 className="text-lg font-bold text-stone-900">¿A quién afecta más?</h3>
            <div className="space-y-3 text-sm">
              {[
                {dot:TEAL,title:'Sector privado absorbe mejor (0.83 vs. 0.75)',
                  sub:'Consistente con ajuste de mercado, no cumplimiento por inspección.'},
                {dot:TERRACOTTA,title:'Sin gradiente por edad, sexo ni etnicidad dentro del empleo formal',
                  sub:'Ratios similares entre hombres/mujeres y grupos de edad.'},
                {dot:'#f59e0b',title:'La brecha étnica opera por ACCESO, no por salarios',
                  sub:'Trabajadores indígenas: 5.7% de formalidad vs. 20.7% para hablantes de castellano. Dentro del empleo formal, la exposición al SM es similar.'},
              ].map(row=>(
                <div key={row.title} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:row.dot}}/>
                  <div>
                    <span className="font-semibold text-stone-800">{row.title}</span>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{row.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        <div style={{height:1,background:'rgba(0,0,0,0.06)'}}/>

        {/* ══ S10: METHODOLOGY ══════════════════════════════════════════════════ */}
        <FadeSection className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">Metodología y verificaciones</h2>
          {[
            {id:'metodo',title:'A. Estimador distribucional pre-post',body:`Estimador pre-post adaptado de Harasztosi & Lindner (2016, Hungría) para SM nacional único. Comparamos la distribución salarial formal antes y después en bins de S/25, corrigiendo la tendencia de fondo por la cola superior (> 2×SM_nuevo).\n\nMasa desaparecida = suma de deltas negativos en [0.85×SM_ant, SM_nuevo). Exceso = suma de deltas positivos en [SM_nuevo, SM_nuevo+S/250). Ratio R = exceso/desaparecido. A diferencia de Cengiz et al. (2019, EE.UU.), no requiere grupo de control — Perú tiene SM nacional único.`},
            {id:'empleo',title:'B. ¿Por qué no podemos medir el efecto sobre el empleo?',body:`Tres métodos, todos fallaron:\n\n1. DiD departamental: pre-tendencias violadas (p=0.007 para 2018, p=0.017 para 2022).\n2. IV Kaitz departamental: instrumento débil (F=1.5/2.6/0.1 en los tres eventos, umbral mínimo F>10).\n3. Panel ENAHO 978: 76% de desgaste con desgaste diferencial entre tratamiento y control.\n\nEsto no es falla de datos — es una restricción institucional: con SM nacional único y 25 departamentos, no existe variación exógena válida para identificar efectos sobre el empleo.`},
            {id:'autoempleo',title:'C. Evidencia de autoempleo',body:`Composición del empleo en la zona afectada [0.85×SM_ant, SM_nuevo), combinando dependientes (p524a1) y autoempleados (p530a = ingreso neto mensual de negocio).\n\nEvento A (2015→2017): autoempleo 38.0%→57.1% (+19.1pp). Absoluto: +8.7%.\nEvento B (2017→2019): autoempleo 35.5%→55.5% (+20.0pp). Absoluto: +5.1%.\nEvento C (2021→2023): autoempleo 33.1%→47.8% (+14.7pp). Absoluto: −3.5% (re-formalización post-COVID).\n\nEl diseño transversal no rastrea individuos — es evidencia indirecta, no prueba directa de transición.`},
            {id:'robustez',title:'D. Verificaciones y robustez',body:`Test de falsificación: ratios en umbrales ficticios S/1,100→1,200 y S/1,400→1,500 son 0.114 y 0.013 — 7× menores que el umbral real (0.829 en Evento B).\n\nBootstrap 1,000 repeticiones: IC 95% son [0.567, 0.896] (A), [0.716, 1.016] (B), [0.716, 0.960] (C).\n\nReplicación EPE Lima: datos trimestrales, definición de formalidad por EsSalud, ventanas de 6 meses → ratios 1.031/0.733/0.885, todos dentro de los IC bootstrap ENAHO.\n\nAlineación de bins: bins de S/50 no están alineados con S/930 → bias a la baja de 75% en el ratio (R=0.206 en lugar de 0.829). Se usan bins de S/25 (alineados con los tres SM).`},
            {id:'datos',title:'E. Datos y muestra',body:`ENAHO 2015–2023 (sin 2020), Módulo 500, INEI. Muestra: trabajadores formales dependientes (ocu500=1, p507∈{3,4,6} o cat07p500a1=2, ocupinf=2) con salario p524a1>0. Peso: fac500a. N = 8,946–11,090 por año.\n\nEPE Lima Metropolitana 2016–2022: panel trimestral, ~2,600 obs. por trimestre. Formalidad: p222==1 (EsSalud).\n\nAutoempleo: p530a (ingreso neto mensual de negocio, Módulo 500).\n\nKaitz departamental: SM / mediana salarial formal ponderada por fac500a, por departamento.`},
          ].map(sec=>(
            <div key={sec.id} className="rounded-2xl overflow-hidden"
              style={{background:CARD_BG,border:`1px solid ${CARD_BORDER}`}}>
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-black/[0.02]"
                onClick={()=>setOpenAccordion(openAccordion===sec.id?null:sec.id)}>
                <span className="font-semibold text-stone-700 text-sm">{sec.title}</span>
                <span className="text-stone-400 text-xl font-light ml-4 flex-shrink-0 w-5 text-center">
                  {openAccordion===sec.id?'−':'+'}
                </span>
              </button>
              {openAccordion===sec.id&&(
                <div className="px-6 pb-5" style={{borderTop:`1px solid ${CARD_BORDER}`}}>
                  <pre className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap font-sans mt-4">
                    {sec.body}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </FadeSection>

        {/* Footer */}
        <footer className="text-center space-y-2 pt-8" style={{borderTop:`1px solid ${CARD_BORDER}`}}>
          <p className="text-xs text-stone-400">
            «Missing Mass and Minimum Wages: Distributional Effects of Three Minimum Wage Increases in Peru»
            · Carlos César Chávez Padilla, University of Chicago, 2026
          </p>
          <p className="text-xs text-stone-300">
            ENAHO 2015–2023 · EPE Lima · Estimador distribucional pre-post (Harasztosi &amp; Lindner 2016)
          </p>
        </footer>

      </main>
    </div>
  );
}
