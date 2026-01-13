# Analysis for FIRE as of 20260113

## Total FIRE CVEs: 426
### Total High and Critical: 62,853 (out of 327,194 total scored CVEs)

Method 1: Random coin flips (62,853 times - the number of High+Critical CVEs)
  - Finds 85 out of 426 (20.0%)
  - Misses 80.0% of FIRE
  - Requires 99.9% wasted work to achieve 20.0% results

Method 2: Only check High+Critical CVEs
  - Finds 349 out of 426 (81.9%)
  - Misses 18.1% of FIRE
  - Requires 99.4% wasted work to achieve 81.9% results

## Targeting High+Critical CVEs is 4.11x more effective than random selection.
