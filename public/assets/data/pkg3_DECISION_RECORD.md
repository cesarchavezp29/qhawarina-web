# Package 3 decision record: Event B conditional on Event A exposure

Canonical inference: Stata `boottest` wild cluster bootstrap-t (Rademacher, null imposed, 9,999 replications, clustered on department, 25 clusters). Event A exposure is always entered as flexible year interactions, never as a single level or one post indicator.

## Exposure diagnostics

- corr(Event A, Event B exposure) = **+0.5969**
- R-squared of A on B = 0.3563, VIF = **1.553** (moderate, not severe)
- Event B exposure: mean 0.0844, SD 0.0323, p25 0.0581, p75 0.1088, IQR 0.0507

## Gate 1: exact matched specification (pre 2017, post 2019)

Isolates conditioning from the change of estimation window.

| Outcome | Exposure | Package 4 spec | p | + Event A x Post | p |
|---|---|---|---|---|---|
| Informal SE | continuous | +0.21415 (0.14610) | 0.2413 | **+0.38094** (0.18055) | 0.1209 |
| Informal SE | binary | +0.02362 (0.00679) | 0.0204 | **+0.03163** (0.00758) | 0.0274 |
| Total SE | continuous | +0.23382 (0.12291) | 0.1556 | **+0.29911** (0.16324) | 0.165 |
| Total SE | binary | +0.02097 (0.00669) | 0.0365 | **+0.02892** (0.00822) | 0.0487 |

The Package 4 specification reproduces exactly: informal SE binary +0.02362045, N 71,423. The estimate increases after conditioning, with the window held fixed.

## Gate 2: what B_post denotes

`B_post = B x 1[year >= 2018]`, spanning **both 2018 and 2019**. It is not the 2017-to-2019 two-period estimand. Separate dynamic coefficients, informal SE:

| Exposure | Specification | 2018 | 2019 |
|---|---|---|---|
| continuous | unconditional | +0.39772 | +0.21340 |
| continuous | conditional | +0.42993 | +0.37967 |
| binary | unconditional | +0.02363 | +0.02349 |
| binary | conditional | +0.02739 | +0.03159 |

Both post years are positive in the conditional specification.

## Gate 3: leave-one-department-out, informal self-employment

| Exposure | Specification | Full sample | LOO range | Min at | Max at | Sign reversal |
|---|---|---|---|---|---|---|
| binary | unconditional | +0.02082 | [+0.00894, +0.02276] | Lima | Piura | no |
| binary | conditional | +0.02287 | [+0.01395, +0.02455] | Lima | Ucayali | no |
| continuous | unconditional | +0.21457 | [+0.06157, +0.30844] | Lima | Lambayeque | no |
| continuous | conditional | +0.40113 | [+0.16454, +0.45605] | Lima | Puno | no |

**Lima is the minimum-endpoint department in every specification.** Dropping it reduces the conditional binary estimate from +0.02287 to +0.01395 (about 39 percent) and the conditional continuous estimate from +0.40113 to +0.16454 (about 59 percent). No leave-one-out estimate reverses sign, but Lima carries a large share of the gradient.

## Joint lead restrictions (Event B leads 2014, 2015, 2016)

| Outcome | Exposure | Unconditional | Conditional |
|---|---|---|---|
| Informal SE | continuous | 0.6058 | 0.9911 |
| Informal SE | binary | 0.7671 | 0.7688 |
| Total SE | continuous | 0.206 | 0.3577 |
| Total SE | binary | 0.082 | 0.2312 |

The joint lead restrictions do not reject differential pre-policy trends. Non-rejection with 25 clusters is not evidence of parallel trends.

## Continuous conditional effect, scaled

- per 1 percentage point of exposure: +0.00401
- per 1 SD (0.0323): +0.01294
- per IQR (0.0507): **+0.02034**

The per-IQR continuous effect and the binary estimate (+0.02287) are economically similar.

## Interpretation limit

Conditioning on Event A exposure **increases** the Event B estimate rather than attenuating it. The data do not identify why. Statistical suppression, a change in the weighting of cross-department variation, and the joint dynamic specification cannot be distinguished here. No mechanism is claimed.

## Classification

| Item | Decision |
|---|---|
| Event B informal self-employment | **RETAIN AS SUGGESTIVE** |
| General informalization effect | **REMOVE** |
| Event A composition response | **REMOVE** |
| Event C | **DESCRIPTIVE ONLY** |
| Event B mechanism | **NOT IDENTIFIED** |

## Paper-facing wording

Results / conclusion:

> Employment-composition responses vary across episodes. Event B provides suggestive evidence that more exposed departments experienced larger increases in informal self-employment, a pattern that remains after accounting for exposure to the preceding minimum-wage increase but is not replicated in the other episodes.

Abstract:

> Employment-composition responses are event-specific: more exposed departments experienced larger increases in informal self-employment following Event B, but comparable patterns do not emerge in the other episodes.

