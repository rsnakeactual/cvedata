# Analysis for FIRE as of 20260107

## Total FIRE CVEs: 426
### Total High and Critical: 62,491 (out of 326,449 total scored CVEs)

Method 1: Random coin flips (62,491 times - the number of High+Critical CVEs)
  - Finds 74 out of 426 (17.4%)
  - Misses 82.6% of FIRE
  - Requires 99.9% wasted work to achieve 17.4% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.70x more effective than random selection.
