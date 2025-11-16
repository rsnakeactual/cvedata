# Analysis for FIRE as of 20251116

## Total FIRE CVEs: 426
### Total High and Critical: 59,673 (out of 318,329 total scored CVEs)

Method 1: Random coin flips (59,673 times - the number of High+Critical CVEs)
  - Finds 68 out of 426 (16.0%)
  - Misses 84.0% of FIRE
  - Requires 99.9% wasted work to achieve 16.0% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 5.12x more effective than random selection.
