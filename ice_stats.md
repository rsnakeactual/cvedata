# Analysis for FIRE as of 20260208

## Total FIRE CVEs: 545
### Total High and Critical: 64,867 (out of 331,613 total scored CVEs)

Method 1: Random coin flips (64,867 times - the number of High+Critical CVEs)
  - Finds 94 out of 545 (17.2%)
  - Misses 82.8% of FIRE
  - Requires 99.9% wasted work to achieve 17.2% results

Method 2: Only check High+Critical CVEs
  - Finds 416 out of 545 (76.3%)
  - Misses 23.7% of FIRE
  - Requires 99.4% wasted work to achieve 76.3% results

## Targeting High+Critical CVEs is 4.43x more effective than random selection.
