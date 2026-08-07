# Deliverable 1 — Weighting and data-validity memo

**Verdict: quarterly departmental inference is defensible for RATES, not for LEVELS.**
Proceed with the department x quarter design on rates per working-age population. Three
caveats are carried forward, none of them fatal, all of them documented below.

Nothing has been estimated. This memo is the gate the brief requires before estimation.

---

## 1. What `fac300_anual` actually is

Its name says annual. Its scaling is **monthly**. Each month's weight sum in the annual
department files expands to about one twelfth of the working-age population:

| Year | Monthly weight sum (millions) | Records per month |
|---|---|---|
| 2023 | 2.06 – 2.23 | 35,909 – 37,970 |
| 2024 | 2.12 – 2.23 | 36,929 – 39,710 |
| 2025 | 2.14 – 2.25 | 36,252 – 40,493 |

All 36 months are present with no gaps. Consequences:

- Summing within a **quarter** gives about one quarter of the population (6.27–6.68M).
- Summing over the **year** gives the population.
- **Any ratio of two weighted sums inside the same department-quarter is unaffected**, because
  the scale factor is common to numerator and denominator.

Every outcome in this design is such a ratio. Levels are therefore never reported without
rescaling, and the analysis works in rates per working-age resident throughout.

## 2. Consistency with official totals

Summing the four quarters of each year reproduces the national working-age population
computed independently from the national quarterly files on a different weight (`fac_t300`):

| Year | Annual sum, this panel | National quarterly series |
|---|---|---|
| 2023 | 25.47M | 25.75 – 26.07M |
| 2024 | 26.28M | 26.16 – 26.39M |
| 2025 | 26.60M | 26.47 – 26.74M |

Against **published INEI figures**, not internal comparisons:

| Statistic | This panel | INEI published |
|---|---|---|
| Informal share of employment, 2023 | **71.4%** | **71.1%** |
| Unemployment rate, 2023 | **5.3%** | **5.4%** |

Both within 0.3 percentage points. Gate items 1 and 3 pass.

## 3. Rotation and artificial quarterly movement

Two tests, gate item 4.

**Volatility against sampling noise.** The median absolute quarter-to-quarter change in a
department's employment rate is 0.0161. The sampling standard error of such a rate at the
median cell size is about 0.0094, so the standard error of a difference is about 0.0133. The
observed movement is **1.21 times** what pure sampling noise would produce. The quarterly
series is therefore not dominated by artefacts, but it is noisy, and the effective information
per department-quarter cell is modest.

**Sawtooth test.** Differencing an iid series produces a lag-one autocorrelation of −0.5. The
median across departments is **−0.303**, between pure noise and persistence. There is no
periodic rotation signature, but a substantial share of quarter-to-quarter movement is
sampling variation rather than signal.

Implication for estimation, not a blocker: event-study coefficients at department-quarter
resolution will be imprecise, wild cluster bootstrap inference is mandatory rather than
optional, and any reading of a single quarter's coefficient is unwarranted.

## 4. Caveats carried forward

**Weight-share instability in two departments.** The ratio of a department's share of national
weight to its share of the national sample should be stable if representation is constant. Its
cross-quarter standard deviation is 0.0195 at the median, but **Puno 0.239 and Lima 0.133**.
This does not bias within-department rates, since the scale cancels in the ratio, and
department fixed effects absorb any time-invariant part. It would matter for national
aggregation and for any national-level weighting of department estimates. Both departments
must appear in the leave-one-department-out diagnostics with this flagged.

**Levels are not usable without rescaling.** Stated above. Recorded because a future reader
summing `fac300_anual` inside a quarter would understate the population fourfold.

**Sample expansion mid-2023.** Records per month rise in the second half of 2023 while the
weight sum falls slightly, which is a design expansion absorbed by the weights. It is national
rather than department-specific in the aggregate, so quarter fixed effects absorb it, but the
2023 quarters carry a different sample structure from 2024 and 2025 and the pre-trend
diagnostics should be read with that in mind.

## 5. What this licenses

A department by quarter panel, 24 departments and 12 quarters (2023Q1–2025Q4), of outcomes
expressed as rates per working-age resident, with department and quarter fixed effects and
wild cluster bootstrap inference over 24 clusters.

It does not license quarterly population levels, national aggregates built by summing
department weights without checking the two unstable departments, or any reading of a single
department-quarter coefficient.

Callao is absent from `ccdd`. EPEN reports it inside Lima, which is how the panel treats it,
so the 24 units are Peru's 25 departments with Callao and Lima combined.

## 6. Within-department monthly balance — gate item 2

Fieldwork is evenly spread across months inside each department-year. The coefficient of
variation of monthly record counts has median **0.041** and ninetieth percentile 0.061. **No
department-year is missing a month**, and only **one of seventy-two** exceeds a coefficient of
variation of 0.25.

The exception is **Puno**, at 0.325, with Amazonas second at 0.224. Puno is therefore flagged by
two independent tests: the least balanced fieldwork calendar and the least stable weight share.
Its quarterly series may carry seasonal composition rather than seasonal economics, and it must
be dropped in the leave-one-department-out diagnostics with that stated as the reason rather
than as a generic robustness exercise.

All four gate items pass. The remaining risk is concentrated, named, and testable.
