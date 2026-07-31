# Package 1B lock decision record

**Status: LOCKED.**

## Lock summary

| Item | Decision |
|---|---|
| Primary benchmark | static Package 1A gross-parts accounting |
| Dynamic baselines | CLR trend, lambda = 100; clean-bin CLR factor, one factor |
| Uncertainty, primary | stratified PSU-with-replacement percentile intervals |
| Uncertainty, sensitivity | Rao-Wu-Yue n-1 rescaled |
| Basic intervals | diagnostic only, never substituted for percentile |
| Event A | clean to modestly centered, directionally stable |
| Event B | directionally robust; factor Delta_A materially centered |
| Event C | descriptive; factor model inferentially unstable |
| Ratio R | secondary, counterfactual-sensitive, not a causal share |

**Superseded outputs, never to be cited:** the coarse-stratum bootstrap, all
filtered-domain calculations, the v2 envelope, every inadmissible model, and the
two-replication smoke-test JSON.

**Audit trail:** raw diagnostic sha256 `289d01cc...`, relabelled canonical
sha256 `9a794dd8...`. The archive-and-relabel procedure verified that all
non-reproducibility content is byte-identical and that only metadata key names
and interpretation wording changed.

Package 1B was recast from counterfactual model selection into a falsification
and counterfactual-robustness package, because clean temporal model selection is
infeasible on this panel. Of 15 rolling-origin folds, three are clean and none
has enough training history to identify a bin-specific trend or the
unaffected-bin model. Two-year extrapolation is therefore **not empirically
validated**, and no counterfactual model is designated primary.

## Primary accounting estimator

Raw masses, **no background correction**. The inverse-absolute correction is
+0.000002 pp, numerically indistinguishable from zero, so calling it a
correction adds conceptual exposure without changing the estimates. The
inverse-absolute version is retained as the exact Package 1A legacy replication
and uniform weighting as sensitivity.

## Two mass definitions, never mixed in one column

**Gross** (positive/negative parts) reproduces Package 1A exactly and remains the
main missing and excess mass definitions. It does **not** satisfy the accounting
identity, because it omits counter-directional movement inside each zone.

**Net** (signed) satisfies the identity exactly:
`Delta_A + Delta_E + Delta_O = 0`, with `Delta_A < 0` denoting depletion below
the new floor and `Delta_E > 0` accumulation above it.

## Falsification evidence

**Artificial-threshold sweep**, 45 to 48 aligned thresholds per event: in every
event the statutory minimum generates the largest missing **and** excess masses
among the feasible aligned placebo thresholds, exceeding every placebo on both
coordinates simultaneously. The empirical threshold rank of the ratio R is 0.298,
0.396 and 0.422, i.e. below the placebo median: **R does not distinguish the
statutory floor**, and its threshold percentile is never used as validation
evidence. Placebo thresholds reuse the same years and wage distribution and are
therefore correlated; this is an empirical threshold rank, not a randomisation
p-value.

**Clean matched-horizon placebo, 2013 to 2015**: M- = 0.961 pp, M+ = 0.004 pp.
Against Event A's 6.707 and 4.750. One comparison, not a p-value.

**2019 to 2021 pandemic stress test**, explicitly not an untreated placebo:
M- = 0.490, M+ = 3.790, R = 7.73, demonstrating that R misbehaves when the
distribution shifts for non-policy reasons.

## Variance design

Full annual survey sample retained throughout; domain indicator marks the
analytic population and out-of-domain observations are never deleted. Filtering
would have discarded roughly a third of sampled PSUs (1,740 in 2019, 1,806 in
2022). Stratum = `dominio x estrato`; PSU = `year x dominio x estrato x
conglome`. No design stratum contains a single PSU in any of the ten annual
samples; the earlier singleton finding was an artifact of filtering and is
superseded.

Validated against Stata `svy: ratio` on the unfiltered file: Python and Stata
Taylor points and standard errors agree to displayed precision on both
predeclared statistics in 2015 and 2019. All bootstrap standard errors fall
within 3.5 percent of Taylor, the two replicate designs within 3.5 percent of
each other, bootstrap means within 0.022 Taylor SE, and there are no
zero-denominator draws.

Primary replicate design: stratified PSU-with-replacement. Declared sensitivity:
Rao-Wu-Yue n-1 rescaled. The primary was not chosen for narrower intervals; the
two are statistically indistinguishable here.

## Lock checks

| Check | Result |
|---|---|
| Deterministic point reproduction | Pass, deviation exactly 0.0 on all nine |
| Replication completeness | Pass, 1,999/1,999 usable in all 18 cells, zero failures |
| Distribution validity and identity | Pass, at numerical precision |
| Centering and asymmetry | Flags raised, diagnosed below |
| Directional intervals | Pass in all 18 cells |
| Replicate-design comparison | Pass, no sign or width flags |
| SE-validation reproduction | Pass, 5 of 5 to six decimals |

## Targeted diagnostic

Centering was re-measured against the **true replicate standard deviation**. The
percentile-width proxy proved well calibrated (`pct_scale / true SD` 0.978 to
1.020, mean 0.996), so the earlier flags were **genuine centering differences,
not proxy artifacts**.

The diagnostic reproduces the locked median and percentile endpoints in 36 of 36
cells. Given the identical seed, loop order and absence of failed branches this
is consistent with the same replicate stream, but exact draw-by-draw identity
cannot be established, because the locked run persisted neither its draws nor a
hash of them. Matching three summaries is strong evidence, not proof.

Bootstrap centering was assessed using the bootstrap median and mean from the
targeted diagnostic. The locked run itself did not persist replicate means.

## Final classification

**Event A.** CLR trend: clean. CLR factor: directionally stable with modest
bootstrap centering in Delta_A of about 0.28 to 0.30 SD. Both percentile and
basic intervals keep Delta_A < 0 and Delta_E > 0, with essentially no wrong-side
draws.

**Event B.** CLR trend: acceptable with disclosure, Delta_A displaced by about
0.25 to 0.26 SD. CLR factor: materially bootstrap-centered in Delta_A, about
0.49 to 0.52 SD, but still directionally stable. The factor-model percentile
interval remains entirely below -8.86 pp and the basic interval entirely below
-8.52 pp, so the centering does not create substantive ambiguity about depletion
below the floor.

> The Event B factor baseline exhibits material bootstrap centering in the
> estimated net depletion below the new floor. Nevertheless, both percentile and
> basic intervals remain far below zero, both replicate designs agree, and the
> corresponding excess-zone change remains positive. We therefore retain the
> model as directional robustness evidence while avoiding an interpretation that
> relies on its precise point estimate.

**Event C.** The CLR trend model is numerically well behaved (displacement 0.12
to 0.32), but Event C remains **descriptive** regardless, because its training
history includes prior minimum-wage increases and the pandemic.
The CLR factor model is **inferentially unstable**: displacement of 1.44 in
Delta_A, 1.47 in gross M-, 1.40 in Delta_O and 1.17 in R, consistently across
both replicate designs. Its point estimate is retained as a descriptive
sensitivity; its bootstrap interval is **not** used to support a precise Event C
magnitude. This does not retroactively exclude the one-factor model from Events
A and B. Event C remains descriptive regardless, because its training history
contains Events A and B and the pandemic.

The Event C problem is **bootstrap centering, not a heavy tail**. The large
asymmetry ratios recorded earlier (7.7 to 9.1) do not reappear as skewness,
which runs only -0.14 to +0.19. The bootstrap distributions are near-symmetric
but their centers are displaced by more than one replicate SD for several
quantities. No mechanism is claimed; the data do not isolate one.

**Ratio R.** The paper must no longer headline "71 to 84 percent of missing mass
reappears above the floor." R is retained as **secondary descriptive
accounting** only, subject to five rules: report it as secondary; state that it
is not unusual relative to placebo thresholds; show that it varies with the
counterfactual baseline; never describe it as the causal share of displaced
workers who move above the minimum; and avoid emphasising its third decimal. It
is not bias-corrected and not promoted to a headline.

## Substantive conclusion

> In Events A and B, both valid dynamic distributional baselines show net
> depletion below the new minimum wage and net accumulation immediately above
> it. These directional conclusions survive both percentile and basic bootstrap
> intervals and are nearly identical under the stratified PSU-with-replacement
> and Rao-Wu-Yue replicate designs. The estimated magnitudes depend on the
> baseline, and one Event B factor estimate is materially bootstrap-centered.

The threshold falsification adds:

> In all three episodes, the statutory minimum produces the largest gross missing
> and excess masses among the feasible aligned placebo thresholds.

**Do not convert that into the stronger claim that all distributional change
occurs around the minimum.** Delta_O is positive and sizable in every model, so
substantial movement also occurs outside the focal zones. The paper must not
imply that all missing mass moves immediately above the minimum.

## Presentation rules

Tables use the deterministic full-sample point estimate as the central value,
`theta [q2.5, q97.5]`. The bootstrap median is a diagnostic and stays in the
replication JSON. The basic interval is a diagnostic sensitivity and is never
substituted for the percentile interval on the grounds that it looks more
favourable. Sampling uncertainty is model-specific; differences across model
point estimates are counterfactual-model uncertainty; draws are never pooled
across models.

## Artifacts

Canonical: `pkg1b_BOOTSTRAP_FINAL.json`, `pkg1b_TARGETED_DIAGNOSTIC.json`
(sha256 9a794dd8...), `pkg1b_LOCK_CHECKS.json`, `pkg1b_SE_VALIDATION.json`,
`pkg1b_GATES.json`, `pkg1b_ENVELOPE_V3.json`, `pkg1b_GATES_V3.json`,
`pkg1b_FOLDS.json`, `pkg1b_SINGLETON_FULLSERIES.json`,
`pkg1b_DESIGN_LEDGER.json`, `pkg1b_DIAGNOSTIC_HASHES.json`.

Archival, never to be cited as results: `SUPERSEDED_dominio_area_bootstrap.json`
(coarse stratum key), `ARCHIVE_pkg1b_se_smoketest_B2.json` (a two-replication
smoke test, not a validation), `ARCHIVE_pkg1b_TARGETED_DIAGNOSTIC_raw.json`
(sha256 289d01cc..., pre-relabel).

Superseded: `pkg1b_ENVELOPE.json` and `pkg1b_ENVELOPE_V2.json`, both of which
included inadmissible specifications.

The original pre-fix B=1,999 SE-validation JSON was overwritten by a later
smoke-test export. Five statistics recovered from the execution log reproduce the
final frozen rerun to six displayed decimals; the unrecovered sixth was not
reconstructed. The final frozen rerun and the independent Stata results are
canonical.
