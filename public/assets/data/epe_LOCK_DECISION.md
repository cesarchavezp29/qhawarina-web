# EPE Lima high-frequency timing package — LOCK DECISION

**Status: LOCKED.** From this point the specifications, scripts, results objects and decision records
listed here are immutable, on the same footing as ENAHO Packages 1A, 1B, 3 and 4
(`project_mw_paper_packages_locked`). Changes require an explicit unlock decision, not a patch.

Commits: `9bb72c6` (panel + bootstrap), `5ea91dc` (timing), `169ba04` (baselines + placebos).

---

## 1. What the package claims

**ENAHO establishes national breadth. EPE establishes Lima timing.** The EPE package is not a
validation of the ENAHO estimator and must never be presented as one. Its contribution is that the
distributional response can be dated at rolling three-month resolution.

Claimed:

- For **Events A and B**, the Lima wage distribution loses mass in `[0.85·mw_old, mw_new)` and gains
  mass in `[mw_new, mw_new+250)` after implementation, under three predeclared baselines, two wage
  definitions, at 95%.
- **Event B adjusts fast and stably**: significant at the first fully-post rolling window under all
  three baselines, with estimates stable across post horizons.
- **Event A adjusts gradually**: depletion below the floor appears early, accumulation above it takes
  roughly a further quarter, and the estimate keeps growing with the post horizon. Frame as **gradual
  adjustment, not an immediate break.**

Not claimed:

- **No sharp monthly break.** Exactly two windows straddle each event by construction, so the
  earliest detectable movement is bounded by the three-month window width.
- **No national inference.** EPE is Lima Metropolitana only.
- **No monthly estimates**, levels or shares. Ficha Tecnica §3.8 gives the moving quarter as the only
  temporal inference level.
- **No employment or formality effects.** This package estimates distributional shape only.
- **No Event C timing or persistence.**

## 2. Locked specifications

| | |
|---|---|
| Sample | employed dependent workers, `P206 in {3,4,6}` |
| Wage | `INGPRIN` primary, `INGTOT` sensitivity |
| Unit | rolling three-month window; treatment intensity 0/1/2/3 post-policy months |
| Span | era 17, releases 401 to 773, excluding the 2 windows containing 2022-08 or later |
| Grid | S/25 over S/0–6,000, zone membership at bin centres |
| Zones | missing `[0.85·mw_old, mw_new)`, excess `[mw_new, mw_new+250)` |
| Baselines | `matched_calendar`, `A1_clr_trend_l100` (LAM=100), `B1_clr_factor_1` (clean bins > 2×MW) |
| Counterfactual fit | rolling-origin |
| Test statistic | **signed** `dA`, `dE`, with `dA+dE+dO=0` |
| Inference | unstratified PSU-trajectory bootstrap, Rao-Wu-Yue `m=n-1`, one draw set per run |
| Intervals | **95% primary**, 90% sensitivity |
| Seed / B | 20260730 / 999 (Stage 3), 499 (Stage 4 placebo sweep) |
| Formality | `P222 in {1,3}` only, if ever used |

**Locked prohibition.** The gross masses `M-` and `M+` are non-negative by construction and are
**never** tested against zero. An early run testing `M+` rejected in 12 of 12 fully-pre windows,
which is mechanical. They are accounting quantities only.

## 3. Locked results (`INGPRIN`, post minus pre, pp, 95% CI)

| | matched_calendar | A1_clr_trend_l100 | B1_clr_factor_1 |
|---|---|---|---|
| **A** `dE` | +3.44 [+1.59, +5.30] | +5.50 [+3.82, +8.44] | +2.95 [+1.47, +4.31] |
| **A** `dA` | −4.76 [−6.17, −3.35] | −3.04 [−4.27, −1.16] | −5.43 [−6.43, −4.36] |
| **B** `dE` | +3.98 [+2.37, +5.32] | +5.34 [+4.15, +8.20] | +4.41 [+3.23, +5.42] |
| **B** `dA` | −5.44 [−6.78, −4.12] | −5.43 [−6.46, −2.92] | −6.43 [−7.44, −5.40] |

`INGTOT` reproduces within 0.1 to 0.6pp with identical signs and significance.

Placebo dates: **0 of 8 significant at 95%**, both events, all three baselines.
Placebo thresholds: **statutory ranks 1 of 7**, both events, all three baselines.

## 4. Known imperfections, locked as stated

1. **Event B placebo threshold at 1.15×MW (S/1,070) is significant** under `matched_calendar`
   (+1.96) and `A1` (+1.61), not under `B1` (+1.00), at roughly a third to a half of the statutory
   effect. This is a genuine imperfection in the specificity test. It is **compatible with wage
   spillover above the floor, but spillover is not demonstrated by this package** and must not be
   presented as proven. Report the hit; offer spillover only as one reading.
2. **Event A's pre-band carries one marginal negative `dMZ` rejection** at t = −1. Its early
   depletion onset should not be over-read.
3. **Event C is a negative result for accumulation above the floor.** `dE` is not significant under
   any baseline (+0.74, +1.50, +1.06, all intervals spanning zero), while `dA` is significantly
   negative under all three. Its pre-band fails the placebo badly (7, 3 and 5 positive rejections of
   12 against ~0.6 expected). Appendix only, descriptive, heavily caveated.
4. **ENAHO and EPE diverge on Event C.** Locked ENAHO gives `dE` of +7.33 / +6.84 / +6.27 nationally,
   while EPE gives +0.74 / +1.50 / +1.06 in Lima. Events A and B agree well (ENAHO A +3.46 / +2.32 /
   +2.12 against EPE +3.44 / +5.50 / +2.95; ENAHO B +5.42 / +4.90 / +4.63 against EPE +3.98 / +5.34 /
   +4.41). The Event C divergence is unexplained by this package. It may reflect a response
   concentrated outside Lima, or the fact that EPE's Event C rests on one clean fully-post window
   with an unstable baseline. **State the divergence; do not resolve it by assertion.**
5. **No design stratum is available.** Stratification is implicit and `estrato` is a documented
   constant, so the primary is unstratified, which is conservative.
6. **No dictionary exists after April 2016**, so value stability across the later span is empirical
   rather than documented.

## 5. Reproduction

```
epe_stage1_panel.py        -> epe_panel_cells{,_ingtot}.parquet, epe_panel_windows.json,
                              epe_psu_strata.csv, epe_panel_META.json
epe_stage1_bootstrap.py    -> epe_bootstrap_VALIDATION.json
epe_stage2_timing.py       -> epe_stage2_timing.json/.csv        (superseded by Stage 3)
epe_stage3_baselines.py    -> epe_stage3_baselines.json          (PRIMARY)
epe_stage4_placebos.py     -> epe_stage4_placebos.json
```

Stage 2 is retained for the per-window timing series and the placebo that exposed the gross-mass
defect. **Stage 3 is the primary results object**; any figure or table must draw from it, not Stage 2.

Supporting records: `epen_FEASIBILITY_DECISION.md` (Stage 0), `epe_RESULTS_RECORD.md` (Stages 2–4).

## 6. Manuscript status

**No manuscript edits have been made.** Integration into `mw_paper.tex` is a separate, subsequent
decision.
