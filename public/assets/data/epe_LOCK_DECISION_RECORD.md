# EPE Lima high-frequency timing package — LOCK DECISION RECORD

**Status: LOCKED, with one diagnostic failure recorded and carried forward, not resolved away.**

Grid: 3 events x 2 wage measures x 2 PSU designs x 3 baselines = 36 cells. B = 999, seed 20260730.
Objects: `epe_LOCK_VERIFICATION.json`, `epe_stage3_baselines.json`, `epe_stage4_placebos.json`,
`epe_bootstrap_VALIDATION.json`. Supporting records: `epen_FEASIBILITY_DECISION.md` (Stage 0),
`epe_RESULTS_RECORD.md` (Stages 2–4).

---

## 1. Gate outcomes, stated honestly

| Gate | Outcome |
|---|---|
| Zero replication failures | **PASS** — 0 failed replicates across 36 cells |
| Centering, `matched_calendar` and `B1_clr_factor_1` | **PASS** — worst 0.0745pp |
| **Centering, `A1_clr_trend_l100`** | **FAIL** — mean 0.628pp, max **1.031pp**, against a 0.25pp threshold |
| A/B intervals exclude zero, percentile | PASS — 24/24 |
| A/B intervals exclude zero, bias-corrected basic | PASS — 24/24 |
| Event C not significant, either construction | PASS — 0 of 12 |
| Both PSU designs give identical point estimates | PASS — identical by construction |
| Unstratified conservative | **PASS ON AVERAGE ONLY** — see §3 |

**The centering gate failed and that failure is not erased.** Applying bias-corrected basic
intervals demonstrates that the *sign* and *significance* survive. It does not repair the estimator's
bootstrap bias.

## 2. The CLR-trend estimator: status and permitted use

`A1_clr_trend_l100` extrapolates ridge-shrunk bin-specific trends in CLR space and passes them
through a softmax. That composition is nonlinear, so the bootstrap mean sits systematically above the
point estimate. The estimator also produces the **largest** point estimates of the three.

Locked status:

- **Materially bootstrap-centered.** Mean 0.628pp, max 1.031pp.
- **Its sign survives both interval constructions.** Percentile and basic intervals both exclude zero
  for every Event A and Event B cell.
- **Retain as directional robustness, not as a preferred magnitude estimate.**
- **Report it in every table alongside the other two.** It must not be silently omitted from the
  reported evidence.
- **It must never drive a headline magnitude.**

`matched_calendar` and `B1_clr_factor_1` are well centered (max 0.053pp and 0.075pp) and are the
baselines from which any numerical range may be quoted.

## 3. PSU design

Point estimates are identical across designs by construction. On interval width, mean
width(unstratified) − width(fixed modal `estrato`) = **+0.0709pp**, but the difference is **negative
in 6 of 18 cells**, ranging −0.2927 to +0.3692pp. That is Monte Carlo noise between two resampling
schemes at B = 999.

**Locked statement: unstratified resampling is wider on average, not uniformly conservative in every
cell.** The earlier claim of cell-by-cell conservatism was wrong and is withdrawn. It arose from a
gate that tested the maximum width difference where it should have tested the minimum.

## 4. Permitted headline language

The headline may state **robust positive excess-zone accumulation for Events A and B.**

Any numerical magnitude range must be attributed explicitly:

> Across the two well-centered baselines, the estimated excess-zone increase ranges from **+2.77 to
> +4.41 percentage points**; the CLR-trend estimator is larger but materially bootstrap-centered.

That range spans matched-calendar and clean-bin-factor, Events A and B, both wage measures and both
PSU designs. It may not be widened by folding in CLR-trend values.

## 5. Locked results (INGPRIN, unstratified primary, post minus pre, pp)

| | | dE point | percentile 95% | basic 95% | centering |
|---|---|---|---|---|---|
| **A** | matched_calendar | +3.443 | [+1.586, +5.299] | [+1.587, +5.300] | +0.024 |
| | B1_clr_factor_1 | +2.947 | [+1.469, +4.313] | [+1.581, +4.425] | −0.035 |
| | *A1_clr_trend_l100* | *+5.498* | *[+3.816, +8.443]* | *[+2.552, +7.180]* | *+0.634* |
| **B** | matched_calendar | +3.982 | [+2.370, +5.317] | [+2.647, +5.594] | −0.029 |
| | B1_clr_factor_1 | +4.406 | [+3.234, +5.416] | [+3.395, +5.577] | −0.070 |
| | *A1_clr_trend_l100* | *+5.343* | *[+4.154, +8.199]* | *[+2.486, +6.531]* | *+0.818* |
| **C** | matched_calendar | +0.736 | [−1.448, +3.073] | [−1.601, +2.920] | +0.053 |
| | B1_clr_factor_1 | +1.060 | [−0.823, +2.926] | [−0.806, +2.943] | +0.075 |
| | *A1_clr_trend_l100* | *+1.502* | *[−0.546, +3.756]* | *[−0.752, +3.550]* | *+0.180* |

Italics mark the materially centered estimator. `dA` is negative and excludes zero in all 24 Event A
and B cells. `INGTOT` reproduces within 0.1 to 0.6pp with identical signs and significance.

Placebo dates: 0 of 8 significant, both events, all three baselines.
Placebo thresholds: statutory ranks 1 of 7, both events, all three baselines. Event B `k = 1.15`
(S/1,070) is significant under matched-calendar and CLR-trend but not the factor baseline, at roughly
a third to a half of the statutory effect. **Compatible with wage spillover above the floor, but
spillover is not demonstrated by this package and must not be presented as proven.**

## 6. Event C

`dE` is not significant under any baseline or construction. `dA` is significantly negative under all
three. The pre-band fails the placebo badly (7, 3 and 5 positive rejections of 12 against ~0.6
expected). Only one clean fully-post window exists before the August 2022 redesign.

**Permitted conclusion:** Event C is not comparable to Events A and B. Its national annual
distributional movement is descriptive, while the high-frequency Lima evidence does not detect robust
excess-zone accumulation. Event C must never be described as replicating, confirming or validating
the pre-pandemic results.

**ENAHO–EPE divergence on Event C is recorded, not reconciled.** ENAHO national gives dE of +7.33 /
+6.84 / +6.27; EPE Lima gives +0.74 / +1.50 / +1.06 with intervals spanning zero. No geographic,
timing or formality story is asserted.

## 7. Frozen specification

Sample dependent workers `P206 in {3,4,6}`; wage `INGPRIN` primary, `INGTOT` sensitivity; unit the
rolling three-month window with treatment intensity 0/1/2/3; span era 17 excluding the two windows
containing 2022-08 or later; grid S/25 over S/0–6,000; zones `[0.85·mw_old, mw_new)` and
`[mw_new, mw_new+250)`; rolling-origin counterfactual fit; signed `dA`/`dE` as estimands; unstratified
PSU-trajectory bootstrap, Rao-Wu-Yue `m = n−1`; 95% primary, 90% sensitivity; seed 20260730;
B = 999 (Stage 3, lock grid), 499 (Stage 4 placebo sweep).

**Locked prohibition:** gross masses `M−` and `M+` are non-negative by construction and are never
tested against zero. They are accounting quantities only.

## 8. Scripts frozen at this commit

`epe_stage1_panel.py`, `epe_stage1_bootstrap.py`, `epe_stage2_timing.py`, `epe_stage3_baselines.py`,
`epe_stage4_placebos.py`, `epe_lock_verification.py`, `epe_lock_gates_final.py`,
`epe_synthesis_figures.py`.

Changes require an explicit unlock decision, not a patch.
