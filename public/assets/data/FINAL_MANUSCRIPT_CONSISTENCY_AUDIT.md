# Final manuscript consistency audit

**Compiles clean: 0 LaTeX errors, 0 undefined references, 0 undefined citations, 64 pages.**
Search-and-destroy sweep: **CLEAR** on every term.

## All eight outstanding items closed

| # | Item | Resolution |
|---|---|---|
| 1 | tab:bunching rebuilt | now reports signed dE and dA by event and baseline with 95% CIs from the locked pkg1b object; gross masses and R moved to an appendix |
| 2 | Wage compression | moved to Appendix, relabelled descriptive, with an explicit statement that the "genuine" component is assumption-driven and not a measured causal quantity |
| 3 | Ratio heterogeneity | moved to Appendix, relabelled descriptive, with the enforcement, pay-scale, migration and firm-selection interpretations withdrawn |
| 4 | tab:sensitivity, fig:cumulative | moved to a new "Descriptive Ratio Statistics" appendix with a note that the gross masses are non-negative by construction |
| 5 | Appendix B | rewritten as "Non-Identified Employment Designs"; the rolling-adjustment rationale is gone and both failed designs are recorded as limitations of the available variation |
| 6 | Appendix C figures | all nine swapped to the canonical continuous-exposure bootstrap versions |
| 7 | Reference audit | 0 undefined citations; 28 typeset, 10 orphaned bib entries identified; Lee-Saez and Stock-Yogo were named without citation and are now cited |
| 8 | Page inspection | rendered and inspected; one real defect found and fixed (below) |

## Defects found by the inspection itself

1. **Bootstrap centering was referenced by two tables but discussed nowhere.** Both the ENAHO and EPE tables pointed to a discussion that did not exist. A disclosure paragraph is now in Section 5.4 stating that the static and factor baselines are well centered within 0.08pp, that the CLR-trend baseline is off by 0.6 to 1.0pp because of the softmax over extrapolated trends, that its sign survives both interval constructions, and that no headline magnitude is quoted from it.
2. **A monopsony passage attributed a "null aggregate employment effect" to this paper.** Rewritten to describe the channel as one theoretical account that this paper does not test.
3. **Lee-Saez and Stock-Yogo were named as methods without citing their sources.** Both now cite.

## Verified survivors of the term sweep

Three deliberate, each checked in context:

1. "This is **not** a formality rate among employed workers" - corrective language enforcing the locked terminology rule.
2. The candidate-mechanism list in Section 5.5, explicitly disclaimed as inseparable in these data.
3. Descriptions of other authors' findings, softened to "small and not statistically distinguishable from zero" rather than asserting those papers recovered a null.

## Remaining known gaps

- Ten orphaned entries remain in the .bib (autor2016, bcrp2023, clemens2021, dube2010, dube2024, inei2023, nataraj2012, saez2010 partly, and others). They are harmless, since uncited entries do not typeset, but the literature review could be broadened using them.
- The title page still reads March 2026.
- Section 5.4's placebo discussion still describes the older two-threshold exercise alongside the new centering paragraph; the full locked threshold falsification is summarised in Section 5.6 rather than consolidated in one place.
