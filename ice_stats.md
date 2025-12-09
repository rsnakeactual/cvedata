# Analysis for FIRE as of 20251209

## Total FIRE CVEs: 426
### Total High and Critical: 60,642 (out of 320,854 total scored CVEs)

Method 1: Random coin flips (60,642 times - the number of High+Critical CVEs)
  - Finds 86 out of 426 (20.2%)
  - Misses 79.8% of FIRE
  - Requires 99.9% wasted work to achieve 20.2% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.05x more effective than random selection.
