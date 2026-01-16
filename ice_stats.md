# Analysis for FIRE as of 20260116

## Total FIRE CVEs: 426
### Total High and Critical: 63,356 (out of 328,055 total scored CVEs)

Method 1: Random coin flips (63,356 times - the number of High+Critical CVEs)
  - Finds 92 out of 426 (21.6%)
  - Misses 78.4% of FIRE
  - Requires 99.9% wasted work to achieve 21.6% results

Method 2: Only check High+Critical CVEs
  - Finds 349 out of 426 (81.9%)
  - Misses 18.1% of FIRE
  - Requires 99.4% wasted work to achieve 81.9% results

## Targeting High+Critical CVEs is 3.79x more effective than random selection.
