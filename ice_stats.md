# Analysis for FIRE as of 20251115

## Total FIRE CVEs: 426
### Total High and Critical: 59,669 (out of 318,298 total scored CVEs)

Method 1: Random coin flips (59,669 times - the number of High+Critical CVEs)
  - Finds 70 out of 426 (16.4%)
  - Misses 83.6% of FIRE
  - Requires 99.9% wasted work to achieve 16.4% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.97x more effective than random selection.
