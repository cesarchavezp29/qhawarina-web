# Package 1A provenance ledger

Four calculations of the same headline object were reconciled by reading the
generating code and re-running every variant from the same frozen ENAHO inputs.
All four are now fully accounted for. No difference remains unexplained.

## Sources traced

| Output | Results object | Generating script |
|---|---|---|
| Table 3 (`tab:bunching`) | `mw_complete_margins.json / bunching_revised` | `mw_complete_margins.py::cengiz_revised` |
| Table 7 (`tab:sensitivity`), canonical row | `mw_reviewer_analyses.json / analysis1_cumulative_excess` at W=250 | `mw_reviewer_analyses.py` |
| Sensitivity file | `item6_background_sensitivity.json` | `item6_background_sensitivity.py` |
| Figure | `fig2_bunching_event*` | `mw_paper_figures.py` |

Table 7 is **traced, not orphaned**. Its row 0.697 / 0.829 / 0.829 is the
cumulative-excess analysis evaluated at the canonical S/250 window.

## Estimator core: identical across all four

S/25 bins on `arange(0, 6025, 25)`; zone membership evaluated at **bin centres**;
clean zone `BC > 2 x MW_new`; inverse-absolute weighted background with
eps = 1e-8; missing mass = negative-only bins in `[0.85 x MW_old, MW_new)`;
excess mass = positive-only bins in `[MW_new, MW_new + 250)`.

None of the discrepancies arise from the estimator formula.

## Component ledger, Event A formal dependent workers

| Component | Table 3 | Table 7 | Sensitivity file | Figure (before fix) | Canonical legacy |
|---|---|---|---|---|---|
| Wage rule | column priority | column priority | row fallback | row fallback | **row fallback** |
| Weight variable | `fac500a` | `factor07i500a` preferred | `fac500a` | `factor07i500a` preferred | **`fac500a`** |
| Wage upper bound | `< 6000` | **none** | `< 6000` | `< 6000` | **`< 6000`** |
| Normalisation range | S/0–6,000 | S/0–6,000 | S/0–6,000 | **S/300–2,500** | S/0–6,000 |
| n pre | 9,952 | not recorded | 10,059 | 10,059 | **10,059** |
| Clean bins | 172 | 172 | 172 | **32** | 172 |
| Raw missing (pp) | 6.7797 | n/a | 6.7069 | 7.9703 | **6.7069** |
| Background (pp) | +0.000002 | n/a | +0.000002 | **+0.010023** | +0.000002 |
| Adjusted missing (pp) | 6.7797 | n/a | 6.7069 | 8.0317 | **6.7069** |
| Adjusted excess (pp) | 4.7207 | n/a | 4.7499 | 6.0821 | **4.7499** |
| R unrounded | 0.696302 | 0.697 (stored rounded) | 0.708215 | 0.757265 | **0.708215** |

## Differences classified

| Pair | Difference | Classification |
|---|---|---|
| Table 3 vs sensitivity file | `get_monthly_wage` applies a COLUMN-level priority: if `p524a1` exists and passes a sanity check it is used exclusively, with no per-observation fallback. The sensitivity file applies a ROW-level fallback, `p524a1` where positive else `i524a1/12`. | **different sample via wage-variable rule** |
| Table 7 vs Table 3 | Three compounding differences: column-priority wage rule with a different sanity threshold; weight variable prefers `factor07i500a` over `fac500a`; and no S/6,000 wage upper bound. | **different sample: weights and trimming** |
| Figure vs all others | Shares normalised within S/300–2,500 rather than S/0–6,000. Every bin share, the clean-zone composition (32 bins vs 172) and the background all change. | **different estimand, not a units mismatch** |
| Any pair | — | not stale output, not rounding, not a coding error in any script |

## Units resolved

The apparent fourth background number was not a units error. `shares()` returns
proportions in every implementation; JSON fields ending `_pp` are stored as
`value * 100` and are correctly in percentage points. The figure's
+0.0100 / +0.0137 / +0.0178 pp were genuine percentage points **computed on a
different grid**. Recomputed on the headline S/0–6,000 grid the background is
+0.000002 / +0.000002 / +0.000012 pp, matching the estimator.

## Figure remediation

`mw_paper_figures.py` now computes shares and the background on the headline
S/0–6,000 grid (`HIST_LO/HIST_HI`) and uses S/300–2,500 as a **display window
only** (`PLOT_LO/PLOT_HI`). Regenerated background drift is +0.0000 pp for all
three events. The figure now visualises the distribution underlying the reported
masses.

## Caveat on the regenerated polynomial row

The `polynomial_deg4` row in the regenerated Table 7 applies the fitted
polynomial as a scalar mean background. The paper describes extrapolating a
bin-level counterfactual into the affected zone. These are not the same
procedure, so that row is **not** a faithful reconstruction of the legacy
polynomial specification and should not be quoted until reimplemented. All other
rows differ only in the background estimator and are faithful.

## Frozen inputs

SHA-256 hashes, sizes and modification times of every ENAHO Module 500 file used
are recorded in `pkg1a_LEGACY_LOCKED.json` under `inputs`.
