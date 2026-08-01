# EPE Lima high-frequency timing package — results record (Stages 2 to 4)

Not locked. ENAHO Packages 1A, 1B, 3, 4 remain immutable. No manuscript edits.

Sample: employed dependent workers, `P206 in {3,4,6}`. Wage `INGPRIN` primary, `INGTOT` sensitivity.
Unit: **rolling three-month window**, never monthly. Geography: **Lima Metropolitana**, never national.
Inference: unstratified PSU-trajectory bootstrap, one draw set per run so window contrasts keep their
covariance. **95% intervals primary, 90% sensitivity.** Grid, zones and mass convention inherited
verbatim from the locked `pkg1a_close.py` / `pkg1b_bootstrap_final.py`.

## Statistic

Signed net zone changes `dA` (missing zone, `[0.85*mw_old, mw_new)`) and `dE` (excess zone,
`[mw_new, mw_new+250)`), which with `dO` satisfy `dA + dE + dO = 0`.

**The gross masses `M-` and `M+` are never tested against zero.** They take only the negative and
positive parts within a zone, so both are non-negative by construction and strictly positive under
pure noise. An early run testing `M+` rejected in 12 of 12 fully-pre windows, which is mechanical.
Gross masses are reported as accounting quantities only.

## Baselines (predeclared, three)

| | |
|---|---|
| `matched_calendar` | observed shares of the most recent pre-event window with the same calendar month triple; controls the seasonality a rolling series carries |
| `A1_clr_trend_l100` | CLR + ridge-shrunk bin-specific linear trends, `LAM = 100` |
| `B1_clr_factor_1` | CLR + one clean-bin factor, clean bins `> 2 x mw_new` |

Counterfactuals are fitted **rolling-origin**, so pre-event targets are genuine out-of-sample
placebos rather than in-sample fits.

## Main results, post minus pre, percentage points (95% CI), `INGPRIN`

**Event A, MW 750 → 850, effective 2016-05**

| baseline | dE | dA | pre-placebo (of 12) | first sig |
|---|---|---|---|---|
| matched_calendar | **+3.44** [+1.59, +5.30] | −4.76 [−6.17, −3.35] | 0 pos, 0 neg | t=5 |
| A1_clr_trend_l100 | **+5.50** [+3.82, +8.44] | −3.04 [−4.27, −1.16] | 0 pos, 1 neg | t=3 |
| B1_clr_factor_1 | **+2.95** [+1.47, +4.31] | −5.43 [−6.43, −4.36] | 0 pos, 2 neg | t=3 |

**Event B, MW 850 → 930, effective 2018-04**

| baseline | dE | dA | pre-placebo (of 12) | first sig |
|---|---|---|---|---|
| matched_calendar | **+3.98** [+2.37, +5.32] | −5.44 [−6.78, −4.12] | 1 pos, 0 neg | t=2 |
| A1_clr_trend_l100 | **+5.34** [+4.15, +8.20] | −5.43 [−6.46, −2.92] | 0 pos, 1 neg | t=2 |
| B1_clr_factor_1 | **+4.41** [+3.23, +5.42] | −6.43 [−7.44, −5.40] | 0 pos, 3 neg | t=2 |

Every `dE` is positive with a 95% interval excluding zero, and every `dA` is negative with a 95%
interval excluding zero, under all three baselines. Pre-band placebo rejections are at or near the
0.6-of-12 expected rate, and the few that occur are **negative**, the opposite sign to the effect.

`INGTOT` reproduces this closely. Event A `dE` +3.36 / +5.36 / +2.77 against +3.44 / +5.50 / +2.95.
Event B `dE` +3.75 / +4.71 / +4.11 against +3.98 / +5.34 / +4.41. Same sign, same significance
throughout, differences of 0.1 to 0.6pp.

### Timing

Event B moves at **t = +2**, the first fully-post window, under all three baselines. Event A is
slower: `dA` depletes early but `dE` does not reach significance until **t = +3 to +5**, and Event A's
estimate keeps growing with the post horizon, which is why its shorter-horizon Stage 4 value (+1.89 to
+2.90 over t = +2 to +6) sits below its Stage 3 value (+2.95 to +5.50 over t = +2 to +12). Event B is
stable across horizons, +4.32 to +4.75 short and +3.98 to +5.34 long.

Because exactly two windows straddle each event by construction, **no sharp monthly break may be
claimed**; the earliest detectable movement is bounded by the three-month window width.

## Placebo dates

Pseudo-events at eight windows with no MW change in the estimation span, excluding the March to
October 2020 fieldwork disruption: 2015-01, 2015-03, 2015-05, 2015-07, 2017-04, 2017-06, 2019-03,
2019-05.

**0 of 8 significant at 95%, for both events, under all three baselines.** Placebo point estimates
are small and mostly negative, `|dE| < 2` throughout, against real values of +1.89 to +2.90 (A) and
+4.32 to +4.75 (B) at the same horizon.

## Placebo thresholds

Real event date, threshold moved to `k x` the statutory pair, `k in {0.60, 0.75, 0.90, 1.15, 1.30, 1.50}`.

- **Event A: statutory ranks 1 of 7 under all three baselines, 0 of 6 placebo thresholds significant.**
- **Event B: statutory ranks 1 of 7 under all three baselines**, but `k = 1.15` (threshold S/1,070)
  is significant under `matched_calendar` (+1.96) and `A1` (+1.61), not under `B1` (+1.00).

The `k = 1.15` hit should be reported, not buried. It is roughly a third to a half of the statutory
effect (+4.3 to +4.8) and is most naturally read as **wage spillover above the minimum**, which is a
documented feature of minimum-wage responses rather than a failure of specificity. The statutory
threshold still dominates on magnitude and rank under every baseline.

## Event C — appendix only, descriptive

MW 930 → 1025, effective 2022-05. **`dE` is not significant at 95% under any baseline**:
matched_calendar +0.74 [−1.45, +3.07], A1 +1.50 [−0.55, +3.76], B1 +1.06 [−0.82, +2.93]. `dA` is
significantly negative under all three. Its pre-band fails the placebo badly, 7, 3 and 5 positive
rejections of 12 against ~0.6 expected, driven by large unexplained swings in late 2021.

Two of its three fully-post windows cross the **August 2022 redesign**, leaving exactly one clean
fully-post window. No persistence and no timing claim. Appendix, descriptive, heavily caveated.

## What this contributes

ENAHO establishes national breadth. EPE establishes **timing**, in Lima, at rolling three-month
resolution: the wage distribution's move is concentrated in the first fully-post window for Event B
and builds over roughly a further quarter for Event A. Events A and B independently reproduce the
ENAHO directional result under three baselines, two wage definitions, eight placebo dates and six
placebo thresholds.

## Artifacts

`epe_panel_cells.parquet`, `epe_panel_cells_ingtot.parquet`, `epe_panel_windows.json`,
`epe_psu_strata.csv`, `epe_panel_META.json`, `epe_bootstrap_VALIDATION.json`,
`epe_stage2_timing.json/.csv`, `epe_stage3_baselines.json`, `epe_stage4_placebos.json`.

Scripts: `epe_stage1_panel.py`, `epe_stage1_bootstrap.py`, `epe_stage2_timing.py`,
`epe_stage3_baselines.py`, `epe_stage4_placebos.py`.

Stage 3 uses B = 999; the Stage 4 placebo sweep uses **B = 499**, stated rather than hidden, which is
ample for a null check.
