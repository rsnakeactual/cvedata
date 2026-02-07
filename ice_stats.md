# Analysis for FIRE as of 20260207

## Total FIRE CVEs: 545
### Total High and Critical: 64,847 (out of 331,541 total scored CVEs)

Method 1: Random coin flips (64,847 times - the number of High+Critical CVEs)
  - Finds 109 out of 545 (20.0%)
  - Misses 80.0% of FIRE
  - Requires 99.8% wasted work to achieve 20.0% results

Method 2: Only check High+Critical CVEs
  - Finds 416 out of 545 (76.3%)
  - Misses 23.7% of FIRE
  - Requires 99.4% wasted work to achieve 76.3% results

## Targeting High+Critical CVEs is 3.82x more effective than random selection.
