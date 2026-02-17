# Qhawarina Setup Instructions

✅ **Template Created Successfully!**

All files are ready. Just follow these 3 simple steps to run your website locally.

---

## ⚡ Quick Start (5 minutes)

### Step 1: Install Node.js (if not installed)

**Download**: https://nodejs.org/ (choose LTS version 20.x)

**Verify installation**:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

---

### Step 2: Install Dependencies

Open terminal/PowerShell in this directory (`D:\qhawarina\`) and run:

```bash
npm install
```

This will take 2-3 minutes and install all required packages (~300MB).

---

### Step 3: Run Development Server

```bash
npm run dev
```

**✨ Your website is now running!**

Open your browser and go to: **http://localhost:3000**

You should see the Qhawarina dashboard with 4 cards (GDP, Inflation, Poverty, Political).

---

## 🎯 What's Included

### Pages Built (5 total)
- ✅ **Homepage** (`/`) - Dashboard with 4 nowcast cards
- ✅ **GDP Page** (`/gdp`) - Interactive Plotly chart
- ✅ **Inflation Page** (`/inflation`) - Monthly variation chart
- ✅ **Poverty Page** (`/poverty`) - Departmental ranking table
- ✅ **Political Page** (`/political`) - Daily instability timeline
- ✅ **Data Downloads** (`/data`) - All CSV/JSON files available

### Data Included (11 files)
All files are in `public/assets/data/`:
- `gdp_nowcast.json` (1.6 KB)
- `inflation_nowcast.json` (1.3 KB)
- `poverty_nowcast.json` (18 KB)
- `political_index_daily.json` (7.3 KB)
- + 7 CSV files (backtests, panel data)

### Features Working
- ✅ Interactive charts (zoom, pan, hover tooltips)
- ✅ Download buttons (CSV export)
- ✅ Mobile responsive
- ✅ Fast loading (static site generation)
- ✅ SEO optimized (meta tags)

---

## 🚀 Next Steps

### Option A: Deploy to Vercel Now (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login (creates free account - takes 2 min)
vercel login

# Deploy to production
vercel --prod
```

Your site will be **live on the internet** in 2 minutes at:
`https://qhawarina-xxx.vercel.app`

**Cost**: $0 (Vercel free tier)

---

### Option B: Keep Working Locally

Keep running `npm run dev` and open:
- Homepage: http://localhost:3000
- GDP: http://localhost:3000/gdp
- Inflation: http://localhost:3000/inflation
- Poverty: http://localhost:3000/poverty
- Political: http://localhost:3000/political
- Data: http://localhost:3000/data

---

### Option C: Buy Domain & Deploy

1. **Buy domain**: Go to Namecheap.com, search for `qhawarina.pe` (~$15/year)
2. **Deploy to Vercel**: Follow Option A above
3. **Add custom domain**:
   - In Vercel dashboard: Project → Settings → Domains
   - Add `qhawarina.pe`
   - Update DNS records (Vercel shows exact values to copy)
4. **Wait 24-48 hours** for DNS propagation

**Your site will then be live at**: https://qhawarina.pe 🎉

---

## 🔧 Daily Data Updates (Future)

To update the data daily, set up Windows Task Scheduler:

1. Create `D:\qhawarina\update_data.bat`:
```batch
cd D:\Nexus\nexus
python scripts/export_web_data.py
xcopy D:\Nexus\nexus\exports\data\*.* D:\qhawarina\public\assets\data\ /Y /I
cd D:\qhawarina
npm run build
vercel --prod
```

2. Schedule in Windows Task Scheduler:
   - Run daily at 8:00 AM
   - Trigger: `D:\qhawarina\update_data.bat`

---

## 🐛 Troubleshooting

### "Module not found" error
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### "Port 3000 already in use"
```bash
# Use a different port
npm run dev -- -p 3001
# Then open http://localhost:3001
```

### Charts not showing
- Make sure you ran `npm install` (includes plotly.js)
- Check browser console for errors (F12)
- Try refreshing the page (Ctrl+R)

### "Cannot find module 'plotly.js'"
```bash
npm install plotly.js react-plotly.js --force
```

---

## 📞 Need Help?

- **Documentation**: Check `README.md` in this folder
- **Design Specs**: See `D:\Nexus\nexus\docs\QHAWARINA_*.md` files
- **React Errors**: Google the error message + "Next.js 14"
- **Vercel Issues**: Check https://vercel.com/docs

---

## ✅ Success Checklist

- [ ] Node.js installed (v20.x)
- [ ] Ran `npm install` (no errors)
- [ ] Ran `npm run dev` (server started)
- [ ] Opened http://localhost:3000 (dashboard shows)
- [ ] All 4 cards show data (GDP, Inflation, Poverty, Political)
- [ ] Clicked on a card → detail page works
- [ ] Charts are interactive (can zoom/pan)
- [ ] (Optional) Deployed to Vercel
- [ ] (Optional) Bought domain qhawarina.pe

---

**🎉 Congratulations! Your website is ready!**

Now you just need to:
1. Run `npm run dev` to see it locally
2. Deploy with `vercel --prod` to make it live
3. (Later) Buy domain and connect it

**Total time**: ~5 minutes to run locally, ~10 minutes to deploy
**Total cost**: $0 (or $15/year with custom domain)
