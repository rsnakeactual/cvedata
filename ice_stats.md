# Analysis for FIRE as of 20251205

## Total FIRE CVEs: 426
### Total High and Critical: 60,490 (out of 320,225 total scored CVEs)

Method 1: Random coin flips (60,490 times - the number of High+Critical CVEs)
  - Finds 87 out of 426 (20.4%)
  - Misses 79.6% of FIRE
  - Requires 99.9% wasted work to achieve 20.4% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.00x more effective than random selection.
