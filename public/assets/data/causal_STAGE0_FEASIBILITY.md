# Stage 0 — Data feasibility decision for the causal redesign

**Verdict: PROCEED, but not on the data route the brief assumes.** The regional design must
be built on the EPEN **annual department files**, not on the national quarterly files that
the descriptive Event D analysis uses. Reason below, and it is decisive.

Nothing has been estimated. No manuscript edits made. The existing signed-mass estimator is
untouched and remains the descriptive anatomy.

---

## 1. The national quarterly files cannot support a regional design

The brief's preferred architecture puts the Giupponi regional-frequency design on the
2022Q1–2026Q1 national quarterly series. That series has no usable geography in the
pre-policy period.

| Quarters | Geographic identifiers present |
|---|---|
| 2022Q1 – 2024Q1 | `area` (urban/rural), `estrato`, `conglomerado` only |
| 2024Q2 | `nomciudad` appears |
| 2024Q3 – 2025Q4 | `codciudad`, `nomciudad` |
| 2026Q1 | `ccdd` appears |

Event D's ten constant-floor pre-policy quarters run 2022Q3–2024Q4. **Eight of those ten
carry no geography beyond urban/rural.** Exposure cannot be frozen in a pre-policy reference
period that has no regions, and differential pre-trends cannot be tested on regions that are
not identified.

### The PSU crosswalk route was tested and rejected

`conglomerado` is present in every quarter and is nested within department in 99.9 percent of
cases, so a crosswalk from the labelled quarters is conceptually possible. No digit-prefix
rule recovers the department (94.4 percent purity at three digits, with heavily overlapping
ranges), so the crosswalk must go through observed PSU recurrence. Coverage of the ten
pre-policy quarters, built from the 2026Q1 `ccdd` labels:

| Quarter | Coverage | | Quarter | Coverage |
|---|---|---|---|---|
| 2022Q3 | 22.4% | | 2023Q4 | 34.5% |
| 2022Q4 | 36.4% | | 2024Q1 | 52.3% |
| 2023Q1 | 52.8% | | 2024Q2 | 33.1% |
| 2023Q2 | 34.1% | | 2024Q3 | 18.7% |
| 2023Q3 | 19.2% | | 2024Q4 | 45.5% |

Mean coverage is about 35 percent, and it oscillates on a four-quarter cycle because the
rotation returns primary sampling units at the annual lag. **The matched third is therefore
selected by rotation position, not at random.** Constructing regional exposure on it would
introduce exactly the exposure measurement error Haanwinckel warns about, with a selection
mechanism correlated with the survey design. Rejected.

---

## 2. The annual department files do support it

The 75 annual EPEN files are departmental and, critically, carry `anio` and `mes`, so they are
pooled monthly microdata rather than annual aggregates. A department by quarter panel can be
built directly from them.

| | |
|---|---|
| Coverage | 2023, 2024, 2025 — 25 files per year, 24 with usable `ccdd` |
| Panel | **24 departments x 12 quarters, 2023Q1–2025Q4** |
| Pre-policy | **8 quarters, 2023Q1–2024Q4**, entirely under the constant S/1,025 floor |
| Post-policy | **4 quarters, 2025Q1–2025Q4** |
| Key variables | `ccdd`, `ocup300`, `c310`, `ingtotp`, `whorat`, `area`, `estrato`, `conglomerado`, `fac300_anual`, and **`informal_p`**, the official formality marker absent from the quarterlies |

Relative to the brief's target this loses two pre-quarters and one post-quarter, and gains a
department identifier and an official formality measure. The 2026 annual file does not exist
yet, so the fifth post-policy quarter is available only in the national quarterly series and
only without geography.

### Cell sizes — no sparse-cell problem

Dependent workers with positive earnings per department-quarter cell, 288 cells:

| min | p5 | p25 | median | p75 | max |
|---|---|---|---|---|---|
| 409 | 576 | 680 | 775 | 1,073 | 4,063 |

**Zero cells below 100 observations.** Smallest department averages 577 per quarter, Lima
3,737. The department is therefore the finest geographic unit that clears the sample-size
requirement, and no department needs to be dropped for sparseness.

---

## 3. Treatment-intensity variation and common support

Exposure frozen in the single pre-policy reference year 2024, dependent workers, weighted:

| Measure | min | p25 | median | p75 | max | sd |
|---|---|---|---|---|---|---|
| Fraction affected, share below S/1,130 (%) | 19.3 | 28.2 | 33.6 | 40.5 | 47.9 | 8.60 |
| Wage-bill gap, normalised by the wage bill (%) | 3.08 | — | 8.16 | — | 15.94 | 4.01 |

A 2.5-fold spread in fraction affected and a 5-fold spread in the gap, continuous and without
holes in the support. `corr(FA, GAP) = 0.964`.

Two things follow. The design has usable intensity variation, and the two measures will very
likely agree — which under Haanwinckel's framing is reassuring but **does not prove
identification**, and must be reported as such rather than as corroboration.

Lima sits at fraction affected 26.4, in the lower middle of the distribution rather than at an
extreme. The leave-Lima-out condition is therefore testable without gutting the support.

---

## 4. Carried forward as known risks

**Weight nonresponse.** In the national quarterly series the quarterly factor is missing for a
share of dependent workers rising from zero in 2022 to 8.8 percent by 2026Q1, concentrated in
urban areas and the lowest stratum, and the dropped earn less. Expanded population totals rise
smoothly through the ramp, so the weights are calibrated on retained records, but calibration
fixes marginal totals and not distribution shape. **The same diagnostic has not yet been run
by department on the annual files and must be, before Stage 1**, since the brief requires the
missing-weight problem diagnosed by region, quarter, wage, worker category and outcome.

**Twenty-four clusters.** Inference must be wild cluster bootstrap-t or randomisation, as the
existing department analysis already does. Asymptotic cluster-robust standard errors are not
usable.

**One department missing.** Twenty-four of twenty-five annual files carry `ccdd`. The missing
one must be identified and either recovered or documented.

---

## 5. What this licenses, and what it does not

With this design the paper can support a **relative** causal claim: greater pre-policy exposure
is associated with differential post-policy changes, under conditional parallel trends. It
cannot support an **absolute national** effect, because no Peruvian department is untreated by
a national floor. Every coefficient must be labelled with the comparison that identifies it.

The administrative route is not addressed here. PLAME availability for 2018, 2022 or 2025 has
not been established, and Corcuera's existing firm and worker designs for 2016 constrain what
would count as novel.

---

## 6. Next steps, in order

1. Diagnose missing weights by department, quarter, wage and worker category on the annual files.
2. Identify the department missing `ccdd`.
3. Read Giupponi et al. (2024) and Haanwinckel (2026) in the original before specifying Stage 4,
   so the wage-bin design reproduces theirs rather than an improvised region-level event study.
4. Build the department by quarter panel with working-age-population denominators.
5. Freeze the two exposure measures on 2024 and report their sampling error.
6. Only then estimate.
