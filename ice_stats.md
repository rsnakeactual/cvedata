# Analysis for FIRE as of 20251204

## Total FIRE CVEs: 426
### Total High and Critical: 60,375 (out of 320,009 total scored CVEs)

Method 1: Random coin flips (60,375 times - the number of High+Critical CVEs)
  - Finds 88 out of 426 (20.7%)
  - Misses 79.3% of FIRE
  - Requires 99.9% wasted work to achieve 20.7% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 3.95x more effective than random selection.
