# Analysis for FIRE as of 20251121

## Total FIRE CVEs: 426
### Total High and Critical: 59,893 (out of 318,902 total scored CVEs)

Method 1: Random coin flips (59,893 times - the number of High+Critical CVEs)
  - Finds 71 out of 426 (16.7%)
  - Misses 83.3% of FIRE
  - Requires 99.9% wasted work to achieve 16.7% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.90x more effective than random selection.
