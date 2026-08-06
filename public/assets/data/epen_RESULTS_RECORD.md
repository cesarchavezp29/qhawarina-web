# EPEN national — Event D results record

**Status: Stage 3 complete. Not locked.** ENAHO packages 1A/1B/3/4 and the EPE package
untouched. No manuscript edits made.

## The event

**DS 006-2024-TR**, published in El Peruano 28 December 2024. RMV **S/1,025 → S/1,130**,
+S/105, **+10.2%**, effective **1 January 2025**. Comparable in size to Event A (+13.3%),
Event B (+9.4%) and Event C (+10.2%).

The effective date falls exactly on an EPEN quarter boundary, so there are **no partially
treated windows**. Every EPE Lima event had two.

## Design

| | |
|---|---|
| Source | EPEN national quarterly, `D:\ENAHO_ANALYSIS\raw\epen_inei`, 17 waves 2022Q1–2026Q1 |
| Sample | dependent workers, `ocup300`==1 and `c310 ∈ {3,6}` (EPEN merges empleado/obrero into 3) |
| Wage | `ingtotp` primary, `ingtot` sensitivity |
| Weight | `fac_t300` |
| Grid | **S/10** canonical. 1130 mod 25 = 5, so S/25 is misaligned. Panel stored at S/5 |
| Pre | **2022Q3–2024Q4, 10 quarters.** Not 2022Q1: Event C's May 2022 increase sits in Q1–Q2 |
| Post | 2025Q1–2026Q1, 5 quarters |
| Inference | stratified PSU-trajectory bootstrap, Rao-Wu-Yue m=n−1, B=999, seed 20260730 |
| Panel | 380,501 cells, ~6,300 PSU/quarter, 106,333 PSU-quarters |

PSU recurrence justifies trajectory resampling: **70.7%** at the annual lag, 55.5% at +1
quarter, 18.6% at +2.

## Headline, span average over the five post quarters

| Baseline | ΔE | 95% CI | ΔA | 95% CI |
|---|---|---|---|---|
| Matched calendar | +2.46 | [+1.94, +2.97] | −5.17 | [−5.67, −4.69] |
| CLR trend | +2.73 | [+2.10, +3.14] | −5.04 | [−5.65, −4.69] |
| Clean-bin factor | +2.06 | [+1.47, +2.40] | −6.10 | [−6.63, −5.89] |

Three baselines agree on sign, no interval contains zero, depletion exceeds accumulation
in every cell. Same qualitative pattern as Events A and B.

## Timing — the adjustment builds

Matched calendar, by post quarter: ΔE **+1.04** [−0.10, +2.09] → +2.44 → +3.08 → +3.55 →
+2.17. ΔA −3.47 → −5.35 → −5.70 → −4.60 → −6.73.

The first fully post-policy quarter's ΔE interval **touches zero** under matched calendar
and clears it under the other two. Accumulation then builds for two to three quarters.
That is Event A's slow profile, not Event B's immediate one — and here it cannot be blamed
on window contamination, because there is none.

## Centering diagnostic (statutory span, ΔE)

| Baseline | bias (pp) | bias/sd | percentile 95 | bias-corrected 95 |
|---|---|---|---|---|
| Matched calendar | +0.00 | 0.01 | [+1.94, +2.97] | [+1.94, +2.97] |
| CLR trend | −0.11 | −0.40 | [+2.10, +3.14] | [+2.31, +3.36] |
| Clean-bin factor | −0.13 | −0.54 | [+1.47, +2.40] | [+1.71, +2.64] |

Matched calendar is clean. **Clean-bin factor at 0.54 SD exceeds the 0.25 SD that flagged
ENAHO Event B as materially centred**, so by the paper's own standard it must be read for
direction rather than magnitude. Sign survives both constructions for all three. Quote
ranges from matched calendar and CLR trend.

## Falsification

**Placebo dates — 0 of 15 cells reject.** Five pseudo-events inside the constant-floor
window on S/1,025 (2023Q3, 2023Q4, 2024Q1, 2024Q2, 2024Q3), fixed 2-quarter post span,
three baselines. No significant accumulation anywhere. Several are significantly negative,
which is the erosion of the share near a frozen floor, not a policy response.

**Placebo thresholds — statutory is the largest positive estimate among the seven under
every baseline.** One exception to record rather than bury: k=1.50 under the clean-bin
factor rejects at +0.47 [+0.09, +0.81], about a fifth of the statutory effect. k=0.75
produces a large negative (−4.72 to −5.77) because that fake floor sits inside the real
depletion zone.

## Sensitivities — both immaterial

Unstratified bootstrap widens ΔE intervals by 0–5% (matched calendar 1.05×, others
1.00–1.01×). INGTOT moves ΔE by ≤0.02pp with near-identical intervals.

## Bin alignment — the paper's prediction, tested out of sample

| Grid | Aligned | ΔE | ΔA |
|---|---|---|---|
| S/5 | yes | +2.46 | −5.17 |
| S/10 | yes | +2.46 | −5.17 |
| S/25 | no, by 5 | +2.47 | −5.18 |
| S/50 | no, by 30 | **−0.35** | **−2.26** |

Marginal misalignment (S/5 out of S/25) does not distort, consistent with what the paper
already reports for Event B. Severe misalignment destroys the estimate: at S/50 the floor
falls in bin [1100,1150) with centre 1125 < 1130, workers at the new floor are classified
missing rather than excess, and ΔE flips sign. Independent confirmation of the paper's
third contribution on a new event and a different survey, and it refines the claim — the
distortion scales with the size of the misalignment.

## Weight nonresponse — characterised and cleared

`fac_t300` goes missing for a growing share of dependent workers, 0% (2022) → 8.8%
(2026Q1), confined to urban, concentrated in estrato 1, and the dropped earn less
(median S/1,516 vs S/1,668). `ingtotp` itself has zero missing. No alternative weight
column exists.

Cleared: expanded PET rises smoothly 25.32M → 26.83M with no break where nonresponse
jumps, employed holds 17.0–17.8M, dependent workers 8.00M → 8.99M, and the share-below-MW
series shows no break at 2024Q1. Weights are calibrated on retained records. Caveat to
carry: calibration fixes marginal totals, not distribution shape.

## Not done

Synthesis against the ENAHO/EPE estimates. Department-level exposure design (the national
quarterlies carry `area`/`codciudad` but not `ccdd`, so that route needs the annual
department files). Formality split (`informal_p` ships only in annual/department files).
Composition accounting. Hours.

## Scripts

`epen_stage1_panel.py` → `epen_panel_cells.parquet`, `epen_panel_META.json`
`epen_stage2_signed.py` → `epen_stage2_signed.json`
`epen_stage3_falsification.py` → `epen_stage3_falsification.json`
