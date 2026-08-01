# MW manuscript — revision map

Verdict for every section, table, figure and appendix in `mw_paper.tex` as it currently stands.
Written **before** any edit. Page numbers from the compiled PDF; line numbers from the .tex.

Legend: **KEEP** unchanged · **REWRITE** substantially · **REPLACE** with locked output ·
**MOVE** to appendix · **DELETE**.

---

## Main text

| p | § | Item | Verdict | Reason |
|---|---|---|---|---|
| 1 | — | Abstract | **REWRITE** | ratio headline, causal employment null, universal SE mechanism all retired |
| 2 | 1 | Introduction (L56–68) | **REWRITE** | same three, plus "first paper" language to audit |
| 4 | 2 | Institutional Context | **KEEP**, audit cites | institutional facts verified; literature claims need checking |
| 6 | T1 | `tab:events` MW events | **KEEP** | dates and levels verified against the schedule |
| 7 | 3 | Data | **REWRITE** | add EPE design and measurement subsection (rolling windows, quarterly weight, rotation, P206, P222) |
| 8 | T2 | `tab:summary` | **KEEP** | ENAHO summary statistics, unaffected |
| 9 | 4.1 | `sec:bunching` estimator | **REWRITE** | signed `dA`/`dE` become the estimands; R demoted to descriptive; gross masses declared untestable |
| — | 4.2 | Bootstrap Inference (L194) | **REPLACE** | individual bootstrap replaced by ENAHO survey-design inference and EPE PSU-trajectory inference |
| — | 4.3 | Hours DiD (L198) | **MOVE** | descriptive only |
| 12 | 4.4 | `sec:share_treated` | **REWRITE** | continuous exposure primary, dose level term removed, boottest canonical |
| 13 | T3 | `tab:bunching` ratios | **REPLACE** | signed `dA`/`dE` by event and baseline from `pkg1b_BOOTSTRAP_FINAL.json` |
| 14 | F1 | `fig:bunching_A/B/C` | **KEEP** if regenerated | distributions are fine; drop counterfactual/ratio interpretation from the note |
| 15 | T4 | `tab:effective_n` | **KEEP** | sample counts |
| 17 | 5.2 | `sec:composition` | **REWRITE** | remove "stable SE counts plus falling dependent counts identify destinations" |
| 19 | 5.3 | `sec:share_treated_results` | **REWRITE** | see claims table below |
| 21 | F2 | `fig:event_emp` | **REPLACE + MOVE** | → `figA_es_employed_{A,B,C}`, appendix, descriptive |
| 22 | F3 | `fig:event_formal` | **REPLACE + MOVE** | → `figA_es_formal_{A,B,C}`, appendix, descriptive |
| 23 | F4 | `fig:event_selfemp` | **REPLACE** | → `fig_es_informalse_B`, main text, Event B only, 10pp scale |
| 24 | T6 | `tab:share_treated_did` | **REPLACE** | continuous primary, boottest p, per-10pp and per-IQR scaling |
| 26 | 5.4 | `sec:placebo` | **REWRITE** | replace two-threshold placebo with the full locked threshold falsification |
| 27 | F5 | `fig:placebo_dist` | **KEEP** | placebo distribution at the true threshold |
| 28 | F6 | `fig:cumulative` R(W) | **MOVE** | R is secondary; belongs with the descriptive ratio material |
| 30 | T7 | `tab:sensitivity` | **REPLACE** | counterfactual sensitivity restated on signed estimands |
| 31 | T8 | `tab:binwidth` | **KEEP**, requalify | bin alignment retained only at Package 1A/1B strength; drop "75% bias in an identified causal ratio" |
| 33 | 5.5 | `sec:dynamics` | **REWRITE** | delete contract renewal, rapid compliance, inflation erosion, universal 24-month adjustment, pretrends-explained-by-earlier-policy |
| 35 | 5.6 | `sec:epe` | **DELETE and REPLACE** | entire section superseded; new rolling-window design and results |
| 37 | F7 | `fig:lima_decomposition` | **DELETE** | argument rests on the superseded estimator, false quarter interpretation and retired R |
| — | — | Wage Compression (L537) | **MOVE** | no independent decision record; "genuine" component is assumption-driven, not measured |
| 38 | T9 | `tab:compression` | **MOVE** | with the above |
| 40 | T10 | `tab:comp_robust` | **MOVE** | with the above |
| 40 | 6 | `sec:heterogeneity` | **MOVE** | ratio-based subgroup stories with unsupported enforcement, rigidity, migration and selection explanations |
| 41 | T11 | `tab:hetero_summary` | **MOVE** | with the above |
| 42 | 7 | `sec:hours` | **REWRITE**, descriptive | remove "higher hourly wages" and "refutes hours adjustment" |
| 42 | T12 | `tab:hours` | **KEEP**, requalify | descriptive |
| 43 | 8 | `sec:conclusion` | **REWRITE** | repeats retired ratio, causal null, destination interpretation, 2025 extrapolation |
| 47–49 | — | References | **AUDIT** | verify every cited estimate before any "confirms" language |

### New main-text figures to insert

| File | Placement |
|---|---|
| `fig_synth_enaho_epe_dE` | new EPE section, ENAHO vs EPE signed excess-zone change |
| `fig_synth_timing_eventA`, `fig_synth_timing_eventB` | new EPE section, rolling-window timing |
| `fig_es_informalse_B` | §5.3, Event B composition, per 10pp exposure |

---

## Appendices

| p | App | Item | Verdict | Reason |
|---|---|---|---|---|
| 50 | A | `app:panel` ENAHO Panel 978 | **KEEP** | already supplementary, attrition caveat stands |
| 51 | B | `app:eventstudy` | **REWRITE** | rolling-adjustment rationale is one of the deleted mechanisms |
| 51 | C | `app:eventC` Event C event studies | **REPLACE** | inherits every defect of Figs 2–4; use `figA_es_*` with C panels |
| 53 | D | `app:iv` Kaitz IV | **KEEP** | correctly presented as a failed design; belongs in the non-identified section |
| 54 | **E** | **`app:epen`** EPEN CIU Annual Lee-Saez | **DELETE** | see verdict below |
| 54 | F | `app:epe` EPE Lima Quarterly | **DELETE** | superseded design and estimator |
| 55 | T15 | `tab:epe` | **DELETE** | ratios 1.031 / 0.733 / 0.885 from the Q1-vs-Q3 design |
| 55 | G | `app:hetero` full tables | **KEEP** in appendix | destination for the demoted heterogeneity material |
| 57 | H | `app:dynamics` spike migration | **REWRITE** | tied to the deleted 24-month narrative |
| 58 | I | `app:variables` | **KEEP**, extend | add EPE variable provenance |
| 59 | J | `app:kaitzmap` | **KEEP** | descriptive geography |

### Verdict on `app:epen`, given its own assessment

**DELETE.** It is genuinely a distinct exercise, a single-period Lee-Saez estimate on EPEN CIU annual
2023 (INEI code 873, N = 53,316), not the superseded rolling-window analysis, and it already labels
itself non-comparable. It fails the retention test on two of the three criteria:

1. Its only reported quantity is a **ratio of 1.622**, and the paper is demoting R from headline to
   descriptive. Reporting an unlocked ratio in an appendix while the main text explains that ratios
   are secondary is incoherent.
2. **No locked source object exists.** `mw_epen_ciu_annual_bunching.py` produced it, but there is no
   decision record, no inference, and no validation ledger. Every other retained number in the paper
   traces to a locked package.
3. Two sentences reporting one unlocked descriptive number add no value once the distributional
   evidence rests on signed estimands with survey-design inference.

If it is ever to return, it needs its own lock: an estimand statement, inference, and a decision
record. That is new specification work, which the current instruction excludes.

### New appendix structure

1. Event C limitations, ENAHO and EPE, including the recorded divergence
2. Full ENAHO baseline results, all three baselines
3. Full EPE baseline paths and per-window series
4. Placebo dates and placebo thresholds
5. Inference validation (bootstrap vs Taylor, trajectory preservation, stratification)
6. Composition packages 3 and 4, including Lima leave-one-out
7. Non-identified employment exercises (Kaitz IV, employment and formal-employment diagnostics)
8. Descriptive hours, compression and heterogeneity, if retained after audit
9. Variable definitions and provenance, ENAHO and EPE

---

## §5.3 claim-by-claim

| Current claim | Verdict | Replacement basis |
|---|---|---|
| "Both placebos pass cleanly, confirming parallel trends" | **DELETE** | pkg3: non-rejection at 25 clusters is not evidence of parallel trends |
| "Pre-trends are flat for Events A and B" | **DELETE as general** | Event A informal SE joint lead rejects, bootstrap p = 0.0317 |
| "The null aggregate employment response…" | **DELETE as causal** | no locked gate establishes a null; descriptive boundary only |
| "…did not destroy formal jobs at the aggregate level" | **DELETE** | forbidden inference, mislabelled denominator |
| "+2.2 / +2.3 pp Event A; +1.9 / +2.1 pp Event B … headline finding" | **DELETE** | pkg4 #3 and #5; asymptotic p-values; binary total SE |
| Event B informal self-employment | **RETAIN, suggestive** | +3.98pp per 10pp exposure [+0.06, +7.16] unconditional; +4.30pp [+0.24, +7.98] conditional; only 2018 |

Mandatory accompanying caveats: Lima is the minimum-endpoint department in every leave-one-out
specification (conditional continuous falls ~59% when dropped); conditioning **increases** the
estimate and the data do not identify why, so no mechanism may be claimed.

---

## Search-and-destroy terms

`quarterly frequency`, `first quarter`, `third quarter`, `six months`, `six quarters`, `1.03`,
`0.73`, `0.89`, `0.38 gap`, `0.7 to 1.0`, `24-month`, `two-year-window cumulative`,
`rapid compliance`, `contract renewal`, `spike build-up`, `policy-attributable`,
`null aggregate employment`, `parallel trends confirmed`, `without aggregate destruction`,
`higher hourly wages`, `fig:lima_decomposition`, `sec:epe`, `app:epe`, `formality rate among
employed`, `1.9`, `2.3`.

Every survivor must trace to a locked result and be correctly qualified.
