# Analysis for FIRE as of 20251208

## Total FIRE CVEs: 426
### Total High and Critical: 60,564 (out of 320,512 total scored CVEs)

Method 1: Random coin flips (60,564 times - the number of High+Critical CVEs)
  - Finds 72 out of 426 (16.9%)
  - Misses 83.1% of FIRE
  - Requires 99.9% wasted work to achieve 16.9% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.83x more effective than random selection.
