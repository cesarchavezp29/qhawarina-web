# Package 1B decision record: counterfactual robustness and falsification

Package 1B was recast from model selection into a falsification and
counterfactual-robustness package, because clean temporal model selection is
infeasible on this panel.

## Why no model was selected

Rolling-origin fold enumeration (`pkg1b_FOLDS.json`) over 2013-2023:

- clean folds with all zones evaluable: **3**
- clean folds with an identified bin-specific trend: **0**
- clean folds able to identify the unaffected-bin model: **0**

Every fold with three or more training years is contaminated by an MW
implementation year (2016, 2018, 2022), a post-increase adjustment window
(2017, 2019, 2023), or the pandemic and the missing 2020 survey. The only
policy-stable run in the panel is 2013-2015. Extending backward does not help:
the MW was S/750 from June 2012, and before that it changed in 2011, 2010, 2008,
2007 and 2006.

Consequence: **neither one-year nor two-year extrapolation is empirically
validated on clean data.** No model is designated primary. Models A, B and C are
reported as an envelope.

## Primary accounting estimator

Raw masses, **no background correction**. The inverse-absolute correction is
numerically indistinguishable from zero (+0.000002 pp), so describing it as a
correction adds conceptual exposure without changing the estimates. The
inverse-absolute version is retained as the exact legacy replication and uniform
weighting as sensitivity.

## Gate 1: aligned artificial-threshold sweep

Raw accounting, 45 to 48 feasible aligned thresholds per event:

| Event | Actual M- | Placebo median | Placebo max | Actual M+ | Placebo median | Placebo max |
|---|---|---|---|---|---|---|
| A | 6.707 | 1.099 | 2.719 | 4.750 | 1.445 | 2.446 |
| B | 7.889 | 1.821 | 4.265 | 6.639 | 1.431 | 3.173 |
| C | 12.925 | 1.119 | 3.332 | 10.765 | 1.181 | 1.841 |

In every event the statutory minimum generates the largest missing and excess
masses among the feasible aligned placebo thresholds, and exceeds every placebo
on **both** coordinates simultaneously.

The empirical threshold rank of **R**, by contrast, is 0.298, 0.396 and 0.422 —
the actual ratio sits *below* the placebo median in all three events. R does not
distinguish the statutory floor, because placebo thresholds with small
denominators produce large and unstable ratios. **The threshold percentile of R
is not validation evidence and is not reported as such.**

Placebo thresholds reuse the same years and wage distribution and are therefore
correlated. This is an empirical threshold rank, not a randomization p-value.

## Gate 2: clean matched-horizon placebo, 2013 to 2015

M- = 0.961 pp, M+ = 0.004 pp, R = 0.0036, against Event A's 6.707 and 4.750. In a
no-policy window the affected zone drains only slightly and essentially nothing
accumulates above the threshold. This is the strongest single piece of evidence
in the package. It is one comparison, not a p-value.

## Gate 3: pandemic stress test, 2019 to 2021

M- = 0.490 pp, M+ = 3.790 pp, **R = 7.73**. Explicitly **not** an untreated
placebo. It demonstrates that R misbehaves when the distribution shifts for
non-policy reasons: almost no depletion below, large accumulation above.

## Counterfactual envelope

Signed zone aggregation. Ten counterfactuals per event (legacy pre-period,
Model A over a fixed ridge grid, Model B with 1 to 3 clean-zone factors,
Model C independent trends):

| Event | M- range | M+ range | R range | R undefined |
|---|---|---|---|---|
| A | [2.812, 7.993] | [2.464, 6.605] | [0.308, 2.349] | 0 of 10 |
| B | [3.935, 10.359] | [5.252, 7.345] | [0.507, 1.866] | 0 of 10 |
| C | [10.958, 12.769] | [7.327, 9.319] | [0.574, 0.850] | 0 of 10 |

**Both masses are positive in every model, in every event.** M- was never
non-positive, so R was never undefined. But R varies by a factor of roughly seven
in Event A, four in Event B and 1.5 in Event C.

Model C reproduces Model A at ridge penalty zero, as it must, which is a check on
the implementation.

## Classification: MIXED result

Both masses remain positive across all credible counterfactuals, but their
magnitudes vary. Per the pre-declared rule, the defensible statement is:

> Across counterfactual constructions, the evidence consistently shows depletion
> below and accumulation above the new floor, although the magnitude of each
> component, and therefore their ratio, is sensitive to the counterfactual.

Together with Gate 1:

> In every event, the statutory minimum generates the largest missing and excess
> masses among the feasible aligned placebo thresholds.

## Rules attached to R

1. R is secondary and descriptive: how large is the excess mass above the floor
   relative to the missing mass below it.
2. R is undefined whenever M- <= 0; bootstrap replications must record the
   frequency of such draws rather than discarding them.
3. The artificial-threshold percentile of R is never validation evidence.
4. R is not a causal fraction of displaced workers.

The locked legacy R values (0.708215, 0.841627, 0.832846) are retained for
descriptive comparability. Their third decimals must not be headlined and they
must not be presented as sharply identified shares.

## Consequence for referee items #10, #13, #14

Not moot. Every displayed number must still be internally consistent, so these
remain table-correction issues. They are no longer disputes about the paper's
central estimand, since the central claim now rests on the joint size of the two
masses rather than on the third decimal of their ratio.

## Not done

Bootstrap of the full procedure, and the observed-versus-predicted and
bin-difference diagnostic figures. The placebo cloud figure is complete.
