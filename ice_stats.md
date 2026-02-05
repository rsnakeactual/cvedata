# Analysis for FIRE as of 20260205

## Total FIRE CVEs: 545
### Total High and Critical: 64,728 (out of 331,209 total scored CVEs)

Method 1: Random coin flips (64,728 times - the number of High+Critical CVEs)
  - Finds 101 out of 545 (18.5%)
  - Misses 81.5% of FIRE
  - Requires 99.8% wasted work to achieve 18.5% results

Method 2: Only check High+Critical CVEs
  - Finds 416 out of 545 (76.3%)
  - Misses 23.7% of FIRE
  - Requires 99.4% wasted work to achieve 76.3% results

## Targeting High+Critical CVEs is 4.12x more effective than random selection.
