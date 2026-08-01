# MW paper — master claims ledger

Single reference for what the locked packages permit. Merges the EPE lock record and the
event-study audit. **The manuscript has not been reconstructed.** It is unmodified and still carries
the superseded claims listed under "must be removed" below.

Frozen at tag `epe-lock-v1`. Source records: `epe_LOCK_DECISION_RECORD.md`,
`es_regen_CLAIMS_LEDGER.md`, `epen_FEASIBILITY_DECISION.md`, `epe_RESULTS_RECORD.md`,
`pkg3_DECISION_RECORD.md`, `pkg4_DECISION_RECORD.md`, `pkg1a_PROVENANCE_LEDGER.md`,
`pkg1b_DESIGN_LEDGER.json`.

---

## 1. What may be claimed

### Distributional response, ENAHO national and EPE Lima

Robust positive excess-zone accumulation for Events A and B, with matching depletion below the floor.
Magnitudes must be attributed:

> Across the two well-centered baselines, the estimated excess-zone increase ranges from **+2.77 to
> +4.41 percentage points**; the CLR-trend estimator is larger but materially bootstrap-centered.

Survives three baselines, two wage definitions, 95% intervals, rolling-origin pre-placebos, eight
placebo dates (0 of 8 significant) and six placebo thresholds (statutory ranks 1 of 7).

### Timing, EPE Lima only

Event B moves in the first fully post-policy rolling window and holds. Event A depletes early but
accumulates gradually over roughly a further quarter. **No sharp monthly break may be claimed**,
because exactly two windows straddle each event by construction.

### Employment composition, locked sentence, verbatim

> Employment-composition responses vary across episodes. Event B provides suggestive evidence that
> more exposed departments experienced larger increases in informal self-employment, a pattern that
> remains after accounting for exposure to the preceding minimum-wage increase but is not replicated
> in the other episodes.

Per 10pp exposure, 2018: unconditional **+3.98pp** [+0.06, +7.16], conditional **+4.30pp**
[+0.24, +7.98]. Only 2018 clears zero. Must be accompanied by: **Lima is the minimum-endpoint
department in every leave-one-out specification**, and conditioning *increases* the estimate without
the data identifying why, so no mechanism may be claimed.

### Event C

Not comparable to A and B. National annual movement is descriptive; the Lima evidence detects no
robust accumulation. **ENAHO and EPE diverge on Event C and the divergence is recorded, not
reconciled.** Never "replicates", "confirms" or "validates".

---

## 2. What must be removed from the manuscript

| Location | Claim | Basis |
|---|---|---|
| Abstract, intro, conclusion | bunching ratio 0.70–0.94 as headline | R is secondary; signed `dA`/`dE` are the estimands |
| Abstract, intro, conclusion | "1.9 to 2.3 pp shift toward informal self-employment" | pkg4 #3, magnitudes came from binary total SE |
| §5.3 | "confirming parallel trends" | pkg3: non-rejection at 25 clusters is not evidence of parallel trends |
| §5.3 | "Pre-trends are flat for Events A and B" | Event A informal SE joint lead rejects at 0.0317 |
| §5.3 | "null aggregate employment response" | no locked gate establishes a causal null |
| §5.3 | "the policy did not destroy formal jobs" | forbidden inference on a mislabelled denominator |
| §5.3 | Event A composition shift as confirmatory | pkg4 #5 |
| §5.5 | "24-month cumulative-effect estimator", contract renewal, rapid compliance, inflation erosion, two-year adjustment, pretrends explained by earlier-policy adjustment | unsupported mechanisms |
| §5.6 entire | quarterly frequency, Q1 vs Q3, six-month window, six-quarter rotation, ratios 1.03/0.73/0.89, EPE Event C confirms ENAHO, common 0.7–1.0 range, 0.38 gap | superseded design and estimator |
| Fig 7 `fig:lima_decomposition` | whole figure | argument rests on the superseded estimator |
| App E `app:epen`, App F `app:epe` | superseded EPE/EPEN outputs | replaced by the locked rolling-window package |
| §7 Hours | "higher hourly wages", "refutes hours adjustment" | different pre/post workers, descriptive only |
| Figs 2–4 and App C Figs 8–10 | binary exposure, asymptotic intervals, wrong labels | replaced by `fig_es_*` / `figA_es_*` |

Terminology rule, absolute: **never call the working-age-denominator outcome a "formality rate";
never call the employed-denominator outcome "formal employment".**

Gross masses `M−` and `M+` are non-negative by construction and are **never** tested against zero.

---

## 3. Recorded diagnostic failures, carried forward

1. **`A1_clr_trend_l100` is materially bootstrap-centered** (mean 0.628pp, max 1.031pp, threshold
   0.25pp). Sign survives percentile and basic intervals. Retained as **directional robustness, not a
   preferred magnitude estimate**. Reported in every table, never omitted, never a headline magnitude.
2. **Unstratified resampling is wider on average (+0.0709pp), not uniformly conservative** — narrower
   in 6 of 18 cells.
3. **Event B placebo threshold at 1.15×MW (S/1,070) is significant** under matched-calendar and
   CLR-trend, not the factor baseline, at roughly a third to a half of the statutory effect.
   Compatible with wage spillover above the floor, but **spillover is not demonstrated**.
4. **Event A carries one marginal negative pre-band rejection** on `dMZ` at t = −1.
5. **Event C pre-band fails the placebo badly** (7, 3 and 5 positive rejections of 12).

---

## 4. Replacement figures, built and inspected

| File | Status |
|---|---|
| `fig_synth_enaho_epe_dE` | main text, ENAHO vs EPE signed excess-zone change, all three baselines |
| `fig_synth_timing_event{A,B}` | main text, EPE rolling-window timing with 95% bands |
| `fig_es_informalse_B` | main text, Event B composition, 10pp exposure scale, unconditional and conditional |
| `figA_es_informalse_{A,C}` | appendix, non-replication evidence |
| `figA_es_{employed,formal}_{A,B,C}` | appendix, descriptive boundary evidence |

---

## 5. Manuscript reconstruction, NOT STARTED

The manuscript at `D:\tmp\overleaf_mw\mw_overleaf\mw_paper.tex` is **unmodified**. A draft abstract
was written and then reverted, because a corrected abstract sitting above an uncorrected body is a
worse state than either. It is preserved here for reuse:

> Peru raised its minimum wage three times between 2016 and 2022, a 37 percent nominal increase.
> Using the national ENAHO household survey and Lima's rolling three-month EPE labor force survey, I
> measure how the formal wage distribution moves around each new floor. For the 2016 and 2018
> increases, mass leaves the region below the new minimum and accumulates just above it. Across two
> well-centered counterfactual baselines the excess-zone increase ranges from 2.8 to 4.4 percentage
> points, with depletion below the floor of comparable or larger magnitude. The Lima data date the
> adjustment. The 2018 response appears in the first fully post-policy window and persists, while the
> 2016 response builds over roughly a further quarter. The 2022 increase is not comparable to the
> earlier two, and the Lima evidence detects no robust accumulation. Employment-composition responses
> vary by episode, with only 2018 offering suggestive evidence of higher informal self-employment.

Remaining work, in order: abstract and introduction, empirical strategy (signed estimands, R demoted
to descriptive), main results table and prose, §5.3 event-study prose, §5.5 rewrite, §5.6 full
replacement, deletion of Fig 7 and Appendices E and F, heterogeneity and hours demotion, conclusion,
reference audit, appendix reorganization, compile and page-by-page inspection, final consistency
audit against the search-and-destroy term list.
