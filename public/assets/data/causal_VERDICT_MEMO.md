# Causal design verdict — Peru 2025 minimum-wage increase

**Verdict: the regional exposure wage-bin design does not support a causal
interpretation.**

Exposure predicts substantial and unstable movements in wage regions far above the
statutory threshold, including differential movements before the reform. The comparison
therefore appears to capture broader changes in departmental wage distributions rather
than variation isolated to the minimum-wage increase.

Accordingly, we find no robust evidence of differential regional causal effects of the
2025 reform. This does not imply that the policy had no effect or that no labor-market
response occurred.

---

## 1. Scope of what was estimated

The specification behind this verdict is a department by quarter by wage-bin panel with
continuous pre-policy exposure, department fixed effects, quarter fixed effects and
exposure interacted with event time. **The full Giupponi construction, in which
counterfactual trends are estimated at the level of premium-adjusted job types and
subtracted before the bin regression, was not estimated.** Regional wage premia were
estimated and job types were constructed, but the job-type trend stage was not run.

The verdict therefore applies to the regional exposure wage-bin design as implemented
here. It cannot be attributed to the full Giupponi adaptation, which remains untested on
these data.

## 2. Design and data

Department by quarter panel, 24 departments, 2023Q1–2025Q4, from the EPEN annual
department files. Eight constant-floor pre-policy quarters, four post-policy quarters.
Exposure frozen on 2024Q1–Q3, strictly before the 28 December 2024 decree. Outcomes are
rates per working-age resident. Wage bins are relative to S/1,130 with S/50 edges, so
the floor is exactly a bin boundary.

The covered population is **full-time dependent workers**. Among dependent workers
earning below the floor, 45.8 percent work under 35 hours a week and 20.4 percent under
20, for whom a sub-floor monthly wage is lawful.

**Adding-up audit passes.** The sum of bin coefficients reproduces the direct
covered-employment estimate to 3 x 10^-17 under all four population definitions.

## 3. Zone estimates with the design's own inference

Per 10 percentage points of exposure, employment as a share of the working-age
population. Intervals are simultaneous across all sixteen zone-by-horizon cells, from a
wild cluster bootstrap-t over 24 departments with a common cluster sign draw per
replication. The simultaneous critical value is **3.78**, against roughly 2.0 pointwise.

| Zone | Horizon | Estimate | Bootstrap p | Simultaneous 95% interval |
|---|---|---|---|---|
| Depletion (k-6..-1) | e=0 | +0.00434 | 0.126 | [-0.00448, +0.01316] |
| | e=+1 | +0.00768 | 0.008 | [-0.00178, +0.01714] |
| | e=+2 | +0.00691 | 0.104 | [-0.00434, +0.01817] |
| | e=+3 | +0.00813 | 0.003 | [-0.00274, +0.01900] |
| Floor bin (k0) | e=0 | -0.00167 | 0.077 | [-0.00488, +0.00155] |
| | e=+1 | **-0.00560** | **0.000** | **[-0.01085, -0.00035]** |
| | e=+2 | -0.00415 | 0.036 | [-0.01048, +0.00219] |
| | e=+3 | -0.00541 | 0.066 | [-0.01306, +0.00225] |
| Accumulation (k0..4) | e=0 | -0.00353 | 0.287 | [-0.01361, +0.00655] |
| | e=+1 | -0.00092 | 0.704 | [-0.00883, +0.00700] |
| | e=+2 | -0.00151 | 0.729 | [-0.01528, +0.01226] |
| | e=+3 | -0.00372 | 0.297 | [-0.01463, +0.00718] |
| High placebo (k>=8) | e=0 | -0.01040 | 0.000 | [-0.02248, +0.00168] |
| | e=+1 | -0.00460 | 0.210 | [-0.01656, +0.00736] |
| | e=+2 | -0.00930 | 0.016 | [-0.02341, +0.00481] |
| | e=+3 | -0.00603 | 0.024 | [-0.01761, +0.00555] |

**One of sixteen cells survives the simultaneous adjustment**: the floor bin at e=+1.
Several coefficients are significant with pointwise inference, including in the high
placebo region, but do not survive the joint adjustment across bins and horizons.

Post averages and the joint test of the pre-treatment coefficients, same procedure:

| Zone | Post average | Bootstrap p | Pre-treatment Wald | Bootstrap p |
|---|---|---|---|---|
| Depletion (k-6..-1) | +0.00677 | 0.032 | 3.91 | 0.794 |
| Floor bin (k0) | -0.00420 | 0.054 | 3.45 | 0.848 |
| Accumulation (k0..4) | -0.00242 | 0.407 | 4.50 | 0.595 |
| **High placebo (k>=8)** | -0.00758 | 0.064 | **27.16** | **0.028** |

## 4. Why the design does not support a causal reading

The high placebo region is wages at or above S/1,530, more than 35 percent above the new
floor. Movements there are not impossible in principle: spillovers and recomposition can
reach well above a binding threshold.

The problem is their size, their instability and their timing. **The large and unstable
movements far above the statutory threshold are inconsistent with a response localized
around the minimum wage. Together with the pre-policy movements in the same region of
the distribution, they indicate that exposure is capturing broader differential
wage-distribution changes across departments.** The pre-treatment coefficients in that
region reject jointly at p = 0.028, while the three policy-relevant zones do not reject,
at p = 0.79, 0.85 and 0.60. This is consistent with the pre-policy dispersion trend of
+0.0044 per quarter per 10 points of exposure estimated on the pre-period alone.

## 5. Two hypotheses tested and rejected

**Part-time contamination is not the explanation.** Restricting to full-time dependents
leaves the pattern essentially unchanged: depletion post-average +0.0068 against +0.0073
for all dependents, floor bin -0.0042 against -0.0040.

**It is not a single-horizon artefact.** The pattern is stable across e=0, +1, +2 and +3,
and in the post average.

## 6. Precision, separately from identification

Minimum detectable effects at 80 percent power, as a share of the covered employment rate:

| Quantity | Estimate | se | MDE | MDE as % of employment rate |
|---|---|---|---|---|
| Depletion zone | +0.0077 | 0.0025 | 0.0071 | 3.18% |
| Floor bin | -0.0056 | 0.0014 | 0.0039 | 1.75% |
| Accumulation | -0.0009 | 0.0023 | 0.0066 | 2.94% |
| Covered employment / WA pop | +0.0033 | 0.0045 | 0.0127 | 5.70% |

Even setting identification aside, accumulation effects below about 3 percent of the
employment rate and aggregate employment effects below about 5.7 percent are outside the
design's resolution. These are not tight nulls.

## 7. What survives

The national distributional evidence does not rest on regional comparisons and is
unaffected. The spike migrates from S/1,025 to S/1,130. **The two well-centered
counterfactual baselines produce similar estimates; the additional clean baseline is
reported as a sensitivity exercise.** **None of the fifteen placebo-date estimates shows
statistically significant positive excess mass, although several placebo intervals lie
entirely below zero.** The statutory threshold is the largest positive estimate among the
seven thresholds tested.

The regional component stays in the internal record. It does not enter the manuscript
body, because it delivers neither an interpretable causal estimate nor a sufficiently
precise null.

## 8. Claim ledger

| Result | Classification |
|---|---|
| Signed depletion and accumulation, national quarterly, Event D | DESCRIPTIVE |
| Spike migration from the old floor to the new one | DESCRIPTIVE |
| Two well-centered baselines agree, third as sensitivity | DESCRIPTIVE |
| Placebo dates and placebo thresholds | DESCRIPTIVE |
| Timing: adjustment builds over two to three quarters | DESCRIPTIVE |
| Bin-alignment sensitivity | DESCRIPTIVE, methodological |
| Depletion depth tracks the sample definition, not geography | DESCRIPTIVE |
| Regional exposure event study, aggregate rates | ASSOCIATIVE |
| Regional exposure by wage bin | ASSOCIATIVE, does not support a causal reading |
| Formal dependent employment by exposure | Leads reject at p = 0.010, not interpretable causally |
| Full Giupponi job-type specification | NOT ESTIMATED |
| Any absolute national effect | NOT IDENTIFIED, never claimed |

## 9. Language

Permitted: *we find no robust evidence of differential regional causal effects of the
2025 reform*; *departments with lower pre-policy conditional wages were more exposed*;
*the wage distribution changed around the new statutory floor*.

Not permitted: *the policy had no effect*; *the design shows there was no response*;
*the opposite signs invalidate causality*.
