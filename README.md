# Qhawarina - Economic Nowcasting for Peru

**Real-time economic intelligence platform for Peru**

Qhawarina (Quechua: "tomorrow's view") provides daily-updated predictions for:
- 📊 **GDP Growth** (quarterly, Dynamic Factor Model)
- 💰 **Inflation** (monthly, DFM with AR)
- 🏘️ **Poverty** (departmental + district, GBR)
- ⚠️ **Political Instability** (daily, GPT-4o classification)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14 (React framework)
- Plotly.js (interactive charts)
- SWR (data fetching)
- Framer Motion (animations)
- Tailwind CSS (styling)
- Heroicons (icons)
- Mapbox GL (maps - for future map feature)

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard!

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
qhawarina/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Homepage (dashboard)
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── gdp/page.tsx         # GDP nowcast page
│   ├── inflation/page.tsx   # Inflation nowcast page
│   ├── poverty/page.tsx     # Poverty nowcast page
│   ├── political/page.tsx   # Political index page
│   └── data/page.tsx        # Data downloads
├── public/
│   └── assets/
│       └── data/            # JSON/CSV data files (updated daily)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🎨 Features

### ✅ Implemented
- **Homepage Dashboard**: 4 interactive cards showing latest nowcasts
- **GDP Page**: Interactive Plotly chart with zoom/pan/hover
- **Inflation Page**: Monthly variation chart
- **Poverty Page**: Departmental ranking table with CSV download
- **Political Page**: Daily timeline with major events
- **Data Downloads**: All JSON/CSV files available for download
- **Mobile Responsive**: Works on phones, tablets, desktop
- **Fast Loading**: Static site generation, < 3 seconds to interactive

### 🚧 TODO (Future Enhancements)
- **Poverty Map**: Mapbox GL choropleth with click-to-drill-down
- **Auto-refresh**: SWR polling every 5 minutes for new data
- **English Translation**: i18n support (ES/EN toggle)
- **API Endpoint**: REST API for programmatic access
- **Email Alerts**: Subscribe to political crisis notifications

---

## 📊 Data Updates

Data is updated daily at **08:00 AM PET** via automated pipeline:

1. `python scripts/update_nexus.py` (3 hours) - Download latest indicators
2. `python scripts/generate_nowcast.py` (2 min) - Generate predictions
3. `python scripts/export_web_data.py` (1 min) - Export to JSON/CSV
4. Copy files to `public/assets/data/`
5. Rebuild Next.js site (`npm run build`)

---

## 🚢 Deployment

### Deploy to Vercel (Recommended - Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Login (creates free account)
vercel login

# Deploy to production
vercel --prod
```

Your site will be live at: `https://qhawarina-xxx.vercel.app`

### Custom Domain

1. Buy `qhawarina.pe` from Namecheap or Cloudflare (~$15/year)
2. In Vercel dashboard: Project → Settings → Domains
3. Add `qhawarina.pe`
4. Update DNS records (Vercel provides exact values)
5. Wait 24-48 hours for DNS propagation

---

## 💰 Cost Breakdown

| Item | Cost |
|------|------|
| Domain (qhawarina.pe) | $15/year |
| Hosting (Vercel) | $0 (free tier) |
| CDN (Cloudflare) | $0 (free tier) |
| SSL Certificate | $0 (Let's Encrypt) |
| **Total** | **$15/year** |

---

## 📖 Documentation

- **Website Design**: `../Nexus/nexus/docs/QHAWARINA_WEBSITE_DESIGN.md`
- **Interactive Features**: `../Nexus/nexus/docs/QHAWARINA_INTERACTIVE_FEATURES.md`
- **Implementation Roadmap**: `../Nexus/nexus/docs/QHAWARINA_IMPLEMENTATION_ROADMAP.md`

---

## 📜 License

Data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

**Citation**:
```
Qhawarina (2026). "Economic Nowcasting for Peru."
Retrieved from https://qhawarina.pe
```

---

## 🤝 Contributing

This is a research project. For questions or collaborations, contact [your email].

---

**Built with ❤️ for Peru**
