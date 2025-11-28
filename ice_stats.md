# Analysis for FIRE as of 20251128

## Total FIRE CVEs: 426
### Total High and Critical: 60,122 (out of 319,519 total scored CVEs)

Method 1: Random coin flips (60,122 times - the number of High+Critical CVEs)
  - Finds 83 out of 426 (19.5%)
  - Misses 80.5% of FIRE
  - Requires 99.9% wasted work to achieve 19.5% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.19x more effective than random selection.
