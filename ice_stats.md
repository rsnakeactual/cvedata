# Analysis for FIRE as of 20260111

## Total FIRE CVEs: 426
### Total High and Critical: 62,751 (out of 327,068 total scored CVEs)

Method 1: Random coin flips (62,751 times - the number of High+Critical CVEs)
  - Finds 95 out of 426 (22.3%)
  - Misses 77.7% of FIRE
  - Requires 99.8% wasted work to achieve 22.3% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 3.66x more effective than random selection.
