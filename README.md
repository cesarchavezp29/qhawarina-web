# Qhawarina — Economic Nowcasting for Peru

**Real-time economic intelligence platform for Peru** · [qhawarina.pe](https://qhawarina.pe)

Qhawarina (Quechua: "mañana a la vista") publishes daily-updated nowcasts for:

- 📊 **PBI / GDP** — quarterly, Dynamic Factor Model (DFM) with Ridge bridge
- 💰 **Inflación** — monthly, DFM + 3M-MA target + high-frequency supermarket prices (BPP)
- 🏘️ **Pobreza** — departmental + district, Gradient Boosting + NTL satellite data
- ⚠️ **Inestabilidad Política** — daily EPU-style index, classified by Claude Haiku
- 🛒 **Precios diarios** — Jevons chain-linked index from Plaza Vea, Metro, Wong (~42,000 SKUs)
- 💱 **Mercado Cambiario** — BCRP FX interventions, tipo de cambio, tasa de referencia

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm start       # serve production build locally
```

---

## Project Structure

```
qhawarina/
├── app/
│   ├── page.tsx                        # Homepage — landing + 4 nowcast cards
│   ├── layout.tsx                      # Root layout (fonts, i18n, header/footer)
│   ├── estadisticas/
│   │   ├── pbi/page.tsx                # GDP nowcast + chart
│   │   ├── inflacion/page.tsx          # Inflation nowcast + chart
│   │   ├── pobreza/page.tsx            # Poverty map + dept ranking
│   │   ├── riesgo-politico/page.tsx    # Political instability timeline
│   │   └── intervenciones/page.tsx     # FX market & BCRP interventions
│   ├── simuladores/                    # Policy simulators (tariffs, rates, etc.)
│   ├── escenarios/                     # Scenario analysis
│   ├── datos/page.tsx                  # Data downloads (JSON/CSV)
│   ├── reportes/page.tsx               # Weekly reports
│   ├── metodologia/page.tsx            # Methodology documentation
│   └── sobre-nosotros/page.tsx         # About
├── public/
│   ├── assets/data/                    # JSON/CSV data files (updated daily by pipeline)
│   │   ├── gdp_nowcast.json
│   │   ├── inflation_nowcast.json
│   │   ├── poverty_nowcast.json
│   │   ├── political_index_daily.json
│   │   ├── daily_price_index.json
│   │   ├── fx_interventions.json
│   │   └── pipeline_status.json
│   ├── qhawarina_metodologia.pdf       # Full methodology document
│   └── og-*.png                        # Open Graph images (WhatsApp/Twitter previews)
├── messages/                           # i18n strings (es.json, en.json)
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Features

- **Bilingual (ES/EN)** via next-intl — toggle in header
- **Interactive charts** — Plotly.js with zoom/pan/hover
- **Choropleth maps** — Mapbox GL departmental poverty + GDP
- **Policy simulators** — tariff shock, interest rate, terms of trade
- **Mobile responsive** — Tailwind CSS
- **Vercel deployment** — auto-redeploy on every `git push`
- **Daily email alert** — pipeline status sent to maintainer at 08:00 PET

---

## Data Pipeline

Data is updated daily at **08:00 PET** by `D:\Nexus\nexus\scripts\daily_web_update.bat`:

| Block | Script | Description |
|-------|--------|-------------|
| A | `scrape_supermarket_prices.py` | Scrape Plaza Vea / Metro / Wong prices |
| B | `build_price_index.py` | Jevons chain-linked BPP index |
| B2 | `generate_nowcast.py` | GDP + inflation DFM nowcast (Sundays only) |
| C | `build_daily_index.py` | RSS fetch + Claude Haiku political classification |
| D | `export_web_data.py --daily` | Export all JSON files |
| E | `robocopy` | Sync exports → `public/assets/data/` |
| F | `git push` | Triggers Vercel redeploy automatically |
| G | `validate_pipeline.py --alert email` | Send Gmail status alert |

---

## Deployment

The site is live at **[qhawarina.pe](https://qhawarina.pe)** via Vercel + GitHub.

Every push to `master` triggers an automatic Vercel redeploy — no manual build needed.

---

## Cost

| Item | Cost |
|------|------|
| Domain (qhawarina.pe) | ~$15/year |
| Hosting (Vercel) | $0 (free tier) |
| Claude API (Haiku, ~2,000 articles/day) | ~$2–5/month |
| **Total** | **~$40–75/year** |

---

## Methodology

Full technical documentation (mathematical formulas, backtesting results, limitations):

- **PDF**: [qhawarina.pe/qhawarina_metodologia.pdf](https://qhawarina.pe/qhawarina_metodologia.pdf)
- **Web**: [qhawarina.pe/metodologia](https://qhawarina.pe/metodologia)
- **Pipeline code**: [github.com/cesarchavezp29/qhawarina](https://github.com/cesarchavezp29/qhawarina)

---

## License

Data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

**Citation**:
```
Qhawarina (2026). "Economic Nowcasting for Peru." https://qhawarina.pe
```

---

## Contact

For questions or collaborations: cesarchavezpadilla@gmail.com

---

**Built for Peru**
