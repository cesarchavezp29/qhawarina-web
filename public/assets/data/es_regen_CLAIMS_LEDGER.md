# Event-study claims ledger — audit and regeneration

Audit of the three main-text department-level event-study figures (and their Appendix C
duplicates) against locked Packages 3 and 4, followed by regeneration on the canonical footing.

Superseded figure family: `fig4_es_{employment,formal,selfemp}_{A,B,C}`.
Replacement family: `fig_es_{employed,formal,informalse}_{A,B,C}`, plus `fig_es_informalse_B`
carrying the conditional specification.

## What was wrong

| Element | Superseded figures | Locked requirement | Status |
|---|---|---|---|
| Exposure | binary above-median `F_d` | continuous is PRIMARY | fixed |
| Inference | `±1.96 × SE` asymptotic | wild cluster bootstrap-t, Rademacher, null imposed, 9,999 reps, CI by inversion | fixed |
| Dose level term | `share_treated` level **and** `F_d` level alongside dept FE | pkg4 #9: remove, absorbed by dept FE | fixed |
| `employed` label | "Employment-to-workforce ratio" | "Employment rate, working-age population denominator" | fixed |
| `formal` label | "Formality rate (formal / employed)" | "Formal employment rate, working-age population denominator" | fixed |
| Outcome plotted for composition | `is_self_emp` (total SE) | `is_informal_self_emp` | fixed |
| Coefficients / SEs | archived | verified 68 cells | were already correct |

The `formal` mislabelling violated **both halves** of the locked terminology rule: *"Never call the
working-age-denominator outcome a 'formality rate'; never call the employed-denominator outcome
'formal employment'."*

## Canonical results (continuous exposure, bootstrap-t CI by inversion, 25 clusters)

**Informal self-employment, Event B — the surviving claim**

| Year | Unconditional | 95% CI | Conditional on Event A | 95% CI |
|---|---|---|---|---|
| 2014 | +0.165 | [−0.109, +0.408] | +0.032 | [−0.336, +0.373] |
| 2015 | +0.024 | [−0.305, +0.343] | +0.016 | [−0.480, +0.452] |
| 2016 | +0.174 | [−0.294, +0.564] | −0.033 | [−0.662, +0.548] |
| 2017 | base | — | base | — |
| **2018** | **+0.398** | **[+0.006, +0.716]** | **+0.430** | **[+0.024, +0.798]** |
| 2019 | +0.213 | [−0.154, +0.544] | +0.380 | [−0.109, +0.754] |

Joint lead bootstrap p: **0.6058** unconditional, **0.9911** conditional. Both reproduce Package 3
exactly. Only 2018 clears zero, under either specification.

**Event A informal self-employment: joint lead bootstrap p = 0.0317, which REJECTS.** This
reproduces Package 4 exactly and is the reason Event A cannot be presented as confirmatory. The
asymptotic counterpart was 0.0927 and did not reject.

**Event C informal self-employment: joint lead bootstrap p = 0.0695.** Descriptive only.

**Employment and formal employment, joint lead bootstrap p**

| Outcome | A | B | C |
|---|---|---|---|
| `employed` | 0.6384 | 0.3401 | **0.0069** |
| `formal` | 0.8227 | 0.5749 | **0.0115** |

Events A and B do not reject; Event C rejects sharply for both, consistent with the pandemic
confound already recorded.

## Claim decisions

| Claim as it stood | Decision | Basis |
|---|---|---|
| "Both placebos pass cleanly, confirming parallel trends" | **DELETE** | pkg3: "Non-rejection with 25 clusters is not evidence of parallel trends"; the quoted F-tests are asymptotic, removed by pkg4 #8 |
| "Pre-trends are flat for Events A and B" (stated twice) | **DELETE as a general statement** | False for Event A informal SE under the locked primary: bootstrap joint lead p = 0.0317 |
| "The null aggregate employment response to the 2016 and 2018 increases" | **DELETE as causal** | No locked gate establishes a null; may survive only as descriptive boundary evidence |
| "This implies that the policy did not destroy formal jobs at the aggregate level" | **DELETE** | Forbidden inference, and rested on a mislabelled denominator |
| "+2.2pp (2016) and +2.3pp (2017) for Event A; +1.9pp (2018) and +2.1pp (2019) for Event B … headline finding" | **DELETE** | pkg4 #3: magnitudes came from the binary split on **total** SE; "no cross-event pp range is defensible". pkg4 #5 removes Event A outright. All four p-values asymptotic |
| Event A composition shift as confirmatory | **REMOVE** | pkg4 #5; joint leads reject under continuous exposure |
| Event B informal self-employment | **RETAIN AS SUGGESTIVE** | pkg3/pkg4; 2018 clears zero unconditionally and conditionally |
| Event C | **DESCRIPTIVE ONLY** | pkg4 #6 |

## Locked interpretation, to be used verbatim

> Employment-composition responses vary across episodes. Event B provides suggestive evidence that
> more exposed departments experienced larger increases in informal self-employment, a pattern that
> remains after accounting for exposure to the preceding minimum-wage increase but is not replicated
> in the other episodes.

## Required accompanying caveat

Package 3 Gate 3: **Lima is the minimum-endpoint department in every leave-one-out specification.**
Dropping it reduces the conditional binary estimate from +0.02287 to +0.01395 (about 39 percent) and
the conditional continuous estimate from +0.40113 to +0.16454 (about 59 percent). No leave-one-out
estimate reverses sign, but Lima carries a large share of the gradient. This must accompany any
retained Event B claim.

Package 3 also records that conditioning **increases** the Event B estimate rather than attenuating
it, and that the data do not identify why. No mechanism may be claimed.

## Scope note

Appendix C reproduces the same three outcomes with Events A, B and C and inherits every defect
above. All corrections apply there too.

## Provenance

Cells: `exports/stata/es_regen/` (built by `es_regen_export_cells.py` and
`es_regen_conditional_B.py`, mirroring the locked `pkg4_joint_leads_export.py` construction
verbatim). Inference: `es_regen_boottest.do`, `es_regen_cond_boottest.do`.
Figures: `es_regen_figures.py`, acceptance checks against Packages 3 and 4 run before any file is
written. Results object: `es_regen_canonical.json`.

Verified reproductions: `corr(A,B) = 0.5969`; Event A joint lead 0.0317; Event B joint lead 0.6058
unconditional and 0.9911 conditional; Gate 2 dynamic coefficients 2018 +0.39772 / 2019 +0.21340
unconditional and 2018 +0.42993 / 2019 +0.37967 conditional.
