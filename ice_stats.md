# Analysis for FIRE as of 20260109

## Total FIRE CVEs: 426
### Total High and Critical: 62,675 (out of 326,870 total scored CVEs)

Method 1: Random coin flips (62,675 times - the number of High+Critical CVEs)
  - Finds 61 out of 426 (14.3%)
  - Misses 85.7% of FIRE
  - Requires 99.9% wasted work to achieve 14.3% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 5.70x more effective than random selection.
