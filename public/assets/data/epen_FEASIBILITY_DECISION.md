# EPE / EPEN high-frequency timing package — Stage 0 feasibility decision

Status: **Stage 0 closed.** No treatment effects estimated. ENAHO Packages 1A, 1B, 3, 4 remain
locked and untouched. No manuscript edits made.

Archive: `D:\ENAHO_ANALYSIS\raw\epen_inei` (447 directories, 2002–2026).
Primary documentation: `401_trim_ene_feb_mar14/Ficha_Tecnica.pdf` and `Diccionario.pdf`.

---

## 1. Survey design, confirmed from the Ficha Tecnica

The design is documented, not inferred.

**Sampling (§3.7).** Probabilistic, area-based, two-stage. Stage 1 selects conglomerados with PPT
within province. Stage 2 selects a compact group of dwellings inside each conglomerado. The sample
is stratified *implicitly* by socioeconomic strata. From January 2011 the sample is 1,600 dwellings
per month across **400 conglomerados**, 4 dwellings per conglomerado, giving 4,800 dwellings per
moving quarter.

The data match this exactly: **median 1,200 distinct `conglome` per release** = 3 months x 400.

**Rotation (§3.7).** Explicitly "una muestra del tipo panel con sustitucion (rotacion) parcial de las
unidades de muestreo". The purposes are stated as reliable employment estimates *from three
consecutive months aggregated*, and estimates of change over time.

The measured recurrence structure is consistent with that design:

| Gap | Person | Household | PSU |
|---|---|---|---|
| within a release (months 1/2/3) | 0.0% | 0.0% | 0.0% |
| +1, +2 releases | 0.0% | 0.0% | 0.0% |
| **+3 releases** | **44.5%** | **45.6%** | **50.0%** |
| +6 releases | 0.0% | 0.0% | 0.0% |
| **+12 releases** | **46.2%** | **48.2%** | **99.8%** |

Half the sample returns one quarter later, and the PSUs return almost completely at a twelve-month
lag. Zero measured overlap at other gaps means **disjoint observed samples, not statistical
independence**: common strata, the rotation frame, and shared shocks induce dependence regardless.

**Weights (§3.16).** `fa_<mmm><yy>` is the inverse selection probability `1/(P1*P2)` times a
nonresponse adjustment `(m_i / m'_i)` computed **at conglomerado level**. No calibration to
independent monthly population projections is documented.

**Inference level (§3.8) — the binding constraint.** INEI states two and only two inference levels:

> Temporal: **Trimestral (promedios moviles)**.
> Geografico: Area de Lima Metropolitana.

and states that "se unieron 3 sub-muestras" precisely in order to obtain reliable results. The month
is a designed *sub-sample*, not a publication domain.

---

## 2. The four Stage 0 checks

### Check 1 — PSU key and time stability

**Superseded during Stage 1 construction. The original finding was an artifact.**

Stage 0 reported that 29.6% of `conglome` codes appear with more than one `estrato` across era 17
and read that as possible code recycling. That figure does not survive inspection of `estrato`
itself. The dictionary defines **`ESTRATO` = "Estrato Geografico", a single value, `1 = Ciudades
Capitales (Urbano)`, range 1**, and `DOMINIO` likewise constant at `8 = Lima Metropolitana`. Both are
degenerate by design, because EPE covers only urban Lima. In the data `estrato` reads 0 in the 2014
releases and 1 in the 2022 releases, with a handful of undocumented codes 2 to 5 in 20 waves. Two
separate defects produced the 29.6%: the era recoding from 0 to 1, and a type mismatch in which CSV
releases store the value as int and `.sav` releases as float, so a raw string cast split one value
into `'0'` and `'0.0'`.

There is therefore **no evidence of `conglome` recycling**, and the 99.8% PSU match at exactly twelve
months with 0% at one, two and six now stands unopposed as evidence that `conglome` is a time-stable
geographic key.

**Decision: cluster on `conglome` alone.** `conglome x estrato` is not a meaningful sensitivity,
since `estrato` is a documented constant. See §4 for what replaces it.

### Check 2 — P222 category 6

The dictionary specifies **range 1..5** in both the 2014 and the 2016 editions
(1 ESSALUD, 2 seguro privado, 3 ambos, 4 otro, 5 no afiliado). **No dictionary exists after wave 501
(April 2016)**, which is before Events B and C.

Category 6 appears for the first time in wave `689_trim_feb_mar_abr20` (**April 2020**) and is present
in 30 of 103 era-17 waves, with a share between 12% and 44% (median 36%).

Share accounting identifies its origin unambiguously:

| wave | 1 ESSALUD | 3 AMBOS | 4 OTRO | 6 ??? | **4 ∪ 6** |
|---|---|---|---|---|---|
| Feb 2020 | 35.75% | 3.49% | 33.11% | 0.00% | 33.11% |
| Apr 2020 | 33.95% | 2.74% | 3.07% | 32.41% | 35.48% |
| Jul 2020 | 30.78% | 2.08% | 13.18% | 20.88% | 34.06% |
| Sep 2020 | 30.27% | 2.39% | 2.86% | 31.86% | 34.72% |

Category 6 is carved out of category 4. The union 4∪6 is flat at 33–35% across the break, while the
split *between* 4 and 6 is erratic wave to wave (3% vs 32%, then 13% vs 21%, then 23% vs 12%).

**Decision.** The erratic 4/6 boundary makes any disaggregated use of P222 categories 4 and 6
unusable. But the formality-relevant categories are untouched: **1 (ESSALUD) and 3 (AMBOS) evolve
smoothly through April 2020** with no jump. The EsSalud contributory marker
`P222 in {1,3}` is therefore **stable across all of era 17** and is the correct formality proxy,
since EsSalud registration is the contribution an employer makes for a formal dependent worker.

Note this is *better* than an insured/uninsured binary would be. "Insured" would fold in category 4,
which plausibly contains SIS, the means-tested subsidised public scheme whose 2020 expansion targeted
exactly the informal and poor. SIS coverage is not a marker of formal employment. Do not use an
insured/uninsured binary as the formality variable.

### Check 3 — P209T, the supposed 40 → 48 shift

**There is no break. The earlier flag was my artifact and was also directionally backwards.**

`P209T` is documented as "Total de horas trabajadas en todas sus ocupaciones en la semana pasada",
constructed as the sum of daily hours `P209A`..`P209G`. The full 103-wave series shows:

- a smooth secular decline in the median from **48 (2014–2016)** to **45–46 (2017–2019)**, with p75
  falling 60 to 54 over the same span,
- a sharp COVID trough to **40 in May–September 2020**, alongside a collapse in respondents
  (7,835 in Feb 2020 to 2,837 in May 2020) from fieldwork disruption,
- recovery to 45–46 through 2021–2022.

Heaping is stable throughout, including across 2020: the share at exactly 40 hours stays in
9–12% and the share at 48 stays in 11–19%, with no discontinuity. Stable heaping plus a smooth
trajectory rules out a questionnaire or coding change. The earlier "40 to 48" reading came from
comparing two sampled waves at opposite ends of the era, one of which sat in the COVID trough.

**Decision.** `P209T` is usable and comparable across era 17. Treat March 2020 to roughly
September 2020 as a fieldwork-disrupted window, not as a coding break.

### Check 4 — monthly estimates and vintage revisions

**Monthly estimates.** Not officially supported. §3.8 names the moving quarter as the only temporal
inference level, and §3.7 states the three-month aggregation is what makes estimates reliable. The
weight is quarterly (per-month share of the file weight total is 0.3333), so monthly weighted
*levels* are invalid on arithmetic grounds alone. Monthly *shares* are not rescued by the ratio
argument: nothing in the methodology permits a monthly domain, and the 400-conglomerado monthly
sub-sample is below the design's stated basis for reliability. Monthly shares are therefore **not
supported as a primary estimand.**

**Vintage revisions.** 268 months compared across vintages, **97 revised (36.2%)**, and the revised
columns include `ingtot`, the wage variable itself. The Ficha Tecnica documents imputation (§3.17)
but contains **no revision, correction, or preliminary/definitive versioning policy**. A targeted
search for such language returns nothing.

**Decision.** Since revisions are undocumented, they cannot be asserted to be official corrections.
Use the **final vintage as primary and the first vintage as sensitivity, reported symmetrically**,
with the revision incidence stated in the text.

---

## 3. Feasibility verdict

| Estimand | Verdict |
|---|---|
| Rolling three-month **dependent-worker wage distributions** | **Feasible.** This is the primary EPE product. |
| Monthly **population levels** | **Not supported.** Quarterly weight, quarterly inference level. |
| Monthly **shares** | **Not supported.** Methodology does not permit a monthly domain. |
| **Formal** dependent workers via `P222 in {1,3}` | **Approximately harmonizable, not equivalent** to ENAHO `ocupinf`. |
| Dependent-worker definition `P206 in {3,4,6}` | Maps exactly onto ENAHO `p507`. Stable across era 17. |

Scope: **era 17, 2014-01 to 2022-07, 103 waves**, which contains all three minimum-wage events under
one stable variable set. Geography is **Lima Metropolitana only**, since national EPEN begins
2022-01 and cannot reach Events A or B. Every EPE result must be labelled Lima, not national.

The package answers **when** the Lima wage distribution moves. It is not a validation of the ENAHO
estimator and must not be presented as one.

---

## 4. Inference design

Resample **PSU trajectories once for the entire event window**, never month by month:

1. The resampling unit is the full time trajectory of a `conglome`, that is, every record that PSU
   contributes across every rolling window in the span.
2. Draw with replacement, `m_h = n_h - 1` Rao-Wu-Yue rescaled, to match the with-replacement
   approximation at stage 1.
3. Carry all records of a drawn PSU together. This preserves the recurring households and persons and
   the rotation-group composition without modelling the rotation scheme explicitly, and it also
   preserves the moving-average overlap, since consecutive windows share two of three interview
   months by construction.
4. Recompute the full estimator inside every replicate, including window construction.

**Stratum.** No design stratum exists in the microdata. Ficha §3.7 states stratification is
*implicit*, the frame sorted by socioeconomic strata with systematic PPT selection, and that stratum
variable is not released. `estrato` as published is degenerate (Check 1). So:

- **Primary: a single stratum, that is, unstratified PSU-trajectory resampling.** Ignoring implicit
  stratification is conservative, overstating variance rather than understating it.
- **Sensitivity: stratified on the fixed modal `estrato`**, with the stratum fixed once per
  trajectory so that a PSU never changes stratum across the span. Ties broken by first appearance.
  Baseline and modal fixings agree for 96.9% of trajectories. Reported, but not relied on, because
  the variable tracks era rather than design.

### Validation (all passed, `epe_bootstrap_VALIDATION.json`, B = 999, seed 20260730)

1. **Against Taylor linearization.** Ultimate-cluster analytic SEs versus bootstrap SEs, per window,
   over 101 windows: mean ratio 0.991 and 0.997 for the two test zones, correlation 0.997 and 0.984,
   worst-case bootstrap centering 0.09pp. The rescaling reproduces the linearization variance.
2. **Trajectory preservation.** Against a benchmark that resamples each window independently and so
   destroys the trajectory: adjacent windows show replicate correlation **+0.70** and an SE of
   difference **0.55x** the independent benchmark, which is the moving-average overlap being
   captured. At +3 and +12 releases, where there is no month overlap but persons and PSUs recur,
   correlation is +0.135 and +0.150 with SE ratios 0.93 and 0.92. Rotation dependence is real but
   much weaker than the window overlap, as expected.
3. **Stratification.** 6 fixed-modal strata, no singletons, mean SE ratio 0.997 versus unstratified.
   Stratifying changes nothing, confirming `estrato` carries no design information.

Do not draw person-months independently. Roughly 45% of any month's respondents reappear one quarter
later and the same PSUs return almost completely at twelve months, so independent person-month draws
would understate variance substantially. Within Event B in particular, March and June 2018 sit in the
same pre/post window and share about half their respondents.

---

---

## 4a. Rolling-window panel, built

`epe_stage1_panel.py` builds the panel at **(rolling window x wage bin)**, stored at PSU-cell level
`(window, conglome, bin)` so the trajectory bootstrap re-aggregates exactly. Weighted shares are
linear in PSU contributions, so cell storage is exact rather than an approximation.

- **103 windows, every one exactly three interview months, every month-set distinct.** No window is
  published in more than one release, so **at window level there is no vintage choice to make**. The
  final/first vintage rule is moot for the primary panel and binds only if a month is ever extracted
  on its own. This is a cleaner outcome than Stage 0 anticipated.
- Post-policy months per window are recorded as 0, 1, 2 or 3 for each event. Exactly **two windows
  straddle each event** (one with 1 post month, one with 2), which is the arithmetic consequence of a
  three-month window crossing a step. **No sharp monthly break may be claimed.**
- Grid and definitions inherited from the locked ENAHO packages: S/25 bins over S/0–6,000, zone
  membership at bin centres, dependent workers `P206 in {3,4,6}`, formality `P222 in {1,3}`, wage
  `INGPRIN` ("Total ingreso mensual, Ingreso Principal por Trabajo"), the EPE analogue of ENAHO
  `p524a1`, with `INGTOT` retained as a sensitivity column.
- 9,417 PSU trajectories, median 12 windows each.

### Event C is severely limited

Windows containing 2022-08 or later cross the August 2022 redesign and are excluded. Of the five
windows with any post-policy month:

| window | months | post months | crosses redesign |
|---|---|---|---|
| 764 | 2022-03/04/05 | 1 | no |
| 766 | 2022-04/05/06 | 2 | no |
| **768** | **2022-05/06/07** | **3** | **no** |
| 771 | 2022-06/07/08 | 3 | **yes** |
| 773 | 2022-07/08/09 | 3 | **yes** |

**Event C has exactly one clean fully-post rolling window.** Persistence cannot be estimated for
Event C in EPE at all, and even a contemporaneous estimate rests on a single window plus two
partially-treated ones. Events A and B are unaffected, with 75 and 52 fully-post windows.

## 5. Open items for Stage 1

1. No dictionary exists after April 2016. Value-code stability for era 17 after that date is
   established empirically from the data, not from documentation. Category 6 is the one confirmed
   undocumented change, and it is contained.
2. Category 6 arrives April 2020, between Events B and C. Event C formality analysis must use
   `P222 in {1,3}` and must not use categories 4 or 6 separately.
3. The May–September 2020 fieldwork disruption overlaps no event window but does sit inside any long
   pre-period constructed for Event C. Handle explicitly.

The `conglome` recycling question is **closed**, not open: it was an `estrato` artifact (Check 1).

## 6. Artifacts

`epen_STAGE0_CLOSE.json`, `epen_STAGE0_CLOSE_BYWAVE.csv`, `epen_DEPENDENCE.json`,
`epen_ERAS.json`, `epen_PRODUCTS_AND_VINTAGES.json`, `epen_WAVE_INDEX_RECORDLEVEL.json`,
`epen_STAGE0_RESOLUTION.json`, `epen_ROLLING_WINDOW_GATE.json`, `epen_CROSSRELEASE_CHECK.json`.

Scripts: `epen_stage0_close.py`, `epen_stage0_dependence.py`, `epen_stage0_eras.py`,
`epen_stage0_products.py`, `epen_stage0_final.py`.

**Known defect in `epen_stage0_close.py` display only:** the `ym_last` label takes max(year) and
max(month) independently, so the two or three year-crossing windows per year (Nov-Dec-Jan,
Dec-Jan-Feb) are mislabelled in the printed table. Per-wave statistics are unaffected. Fix before any
Stage 1 use of that label.
