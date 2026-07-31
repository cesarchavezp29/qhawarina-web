# Package 1A decision record

## Decision

The **row-level wage fallback** is the canonical legacy implementation.

This is not a choice between results. It follows from two independent pieces of
evidence, both internal to the paper:

1. The paper defines the wage variable as `p524a1`, with `i524a1/12` used
   "when `p524a1` missing" (Appendix variable mapping). That is a per-observation
   fallback.
2. The paper reports Event A sample size **N = 10,059** for Table 3. Row fallback
   reproduces 10,059 exactly. Column priority yields 9,952, which is the figure
   the paper reports for Table 2, not Table 3.

## Locked legacy results, formal dependent workers

| Event | Missing mass | Excess mass | Redistribution ratio |
|---|---|---|---|
| A | 6.7069 pp | 4.7499 pp | **0.708215** |
| B | 7.8888 pp | 6.6395 pp | **0.841627** |
| C | 12.9250 pp | 10.7645 pp | **0.832846** |

Other groups, the full sensitivity grid, cluster counts and input hashes are in
`pkg1a_LEGACY_LOCKED.json`.

These are the correct reconstruction of the estimator the paper currently claims
to use. They are **not** necessarily the eventual headline numbers; the
multi-year placebo-validated counterfactual in Package 1B may replace them.

## Status of existing outputs

**Table 3 — internally inconsistent, regenerate.** It combines masses and ratios
computed on the column-priority sample with a sample size and wage-variable
description belonging to the row-fallback sample. This is a genuine
inconsistency, not rounding. Individual cells must not be patched by hand;
`legacy_table3.tex` is regenerated wholesale from the locked object.

**Table 7 — traced, superseded, regenerate.** The row 0.697 / 0.829 / 0.829 comes
from `mw_reviewer_analyses.json / analysis1_cumulative_excess` at W = 250. It is
reproducible in principle but rests on a third sample definition that differs
from both other implementations in three ways at once: column-priority wage rule,
a preference for `factor07i500a` over `fac500a` as the weight, and no S/6,000
wage upper bound. It is therefore **superseded**, not orphaned.
`legacy_table7.tex` is regenerated from the locked object.

**Figure — was a different estimand, now fixed.** The restricted S/300–2,500
normalisation produced valid numbers for a different object. The generator now
normalises on the headline S/0–6,000 grid and uses the narrow range as a display
window only.

## Consequences for the outstanding referee items

Items #10, #13 and #14 concerned disagreement among these tables. The
disagreement is now explained and the canonical object designated, so those items
become mechanical once the regenerated tables are inserted. They remain
uninserted pending Package 1B, so that the paper is rewritten once.

## What is not yet decided

Whether the legacy estimator remains the headline. Package 1B builds the
multi-year, placebo-validated bin-level counterfactual; the legacy row survives
as a robustness comparison regardless of that outcome.
