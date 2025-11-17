# Analysis for FIRE as of 20251117

## Total FIRE CVEs: 426
### Total High and Critical: 59,678 (out of 318,361 total scored CVEs)

Method 1: Random coin flips (59,678 times - the number of High+Critical CVEs)
  - Finds 89 out of 426 (20.9%)
  - Misses 79.1% of FIRE
  - Requires 99.9% wasted work to achieve 20.9% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 3.91x more effective than random selection.
