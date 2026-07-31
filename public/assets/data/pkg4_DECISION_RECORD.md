# Package 4 decision record

Canonical inference: Stata `boottest` wild cluster bootstrap-t, Rademacher, null imposed, 9,999 replications, clustered by department (25 clusters). The custom numpy bootstrap is a reproducibility cross-check. Asymptotic CR1 chi-square values are diagnostic only and are not reported.

## Locked paper sentence

> Employment-composition responses vary across episodes. Event B provides suggestive evidence that more exposed departments experienced a larger increase in informal self-employment, but the relationship is imprecisely estimated and is not replicated in the other events.

## Canonical estimates, informal self-employment rate (employed-worker denominator)

| Event | Continuous beta | p (canonical) | Binary beta | p (canonical) | Joint leads p (binary) |
|---|---|---|---|---|---|
| A | -0.0210 | 0.8740 | +0.0162 | 0.0898 | 0.4311 |
| B | +0.2142 | 0.2413 | +0.0236 | 0.0204 | 0.7671 |
| C | -0.0373 | -- | -0.0096 | 0.4639 | 0.6301 |

## Claim classification

| # | Claim as it stood | Decision | Basis |
|---|---|---|---|
| 1 | Headline: MW increases caused a shift toward **informal** self-employment | **REMOVE** | Outcome estimated was total SE (p507==2, no ocupinf restriction). Under the explicit informal-SE outcome the continuous-dose estimate is null in all three events (canonical p 0.874 / 0.241 / 0.749) and Events A and B carry opposite signs. |
| 2 | A general self-employment response across the three increases | **REMOVE** | Continuous-dose total SE also null in all events (p 0.780 / 0.156 / 0.428). Event C informal SE is negative and null (p 0.4639). |
| 3 | 1.9 to 2.3 pp shift toward informal self-employment (abstract, intro, conclusion) | **REMOVE as stated** | Those magnitudes came from the binary split on total SE. Replace with the locked sentence; no cross-event pp range is defensible. |
| 4 | Event B increase in informal self-employment | **DOWNGRADE to suggestive** | Binary canonical p = 0.0204, beta +0.0236, externally validated; continuous-dose counterpart null (p 0.2413). Joint leads do not reject on either dose (0.7671 binary, 0.6058 continuous). |
| 5 | Event A composition shift | **REMOVE** | Continuous-dose informal SE negative and null; binary marginal (p 0.0898); joint leads REJECT under continuous exposure (p 0.0317). |
| 6 | Event C treated as descriptive only | **RETAIN** | Employment response large and significant under continuous dose, pre-trends fail; informal SE null (p 0.4639). |
| 7 | Formality reported as 'formality rate among employed' from the archived series | **RETAIN, relabelled** | The archived series is the working-age-denominator estimand and reproduces exactly. Relabel 'Formal employment rate, working-age population denominator'. The employed-denominator outcome is reported separately as an employment-composition estimand. |
| 8 | Asymptotic joint pre-trend tests | **REMOVE from paper** | With 25 clusters these mislead: Event A informal SE moves from 0.0927 asymptotic (no rejection) to 0.0317 bootstrap (rejection). Retain as diagnostics only. |
| 9 | Equation (3) with the dose level term alongside department FE | **REMOVE the level term** | Time-invariant department regressor is absorbed by department FE and not separately identified. |
| 10 | Treatment described as a continuous dose | **RETAIN, now accurate** | Continuous exposure is the primary specification; the binary split is secondary. |

## Validation ledger

| Check | Result |
|---|---|
| Reproduce archived binary pooled estimates (A, B, C) | PASS, exact to 4 dp |
| Event-study port, cell by cell incl. SE, N, clusters | PASS, 68 cells |
| Stata boottest external validation | PASS, 9 specs, beta/SE identical |
| Self-employment accounting identity | PASS, zero unknown-formality |
| Dose fixed, pre-period only, sample-invariant | PASS, all events |
| Joint leads via boottest, tested years recorded | PASS, 12 tests |
