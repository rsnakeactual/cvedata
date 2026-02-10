# Analysis for FIRE as of 20260210

## Total FIRE CVEs: 546
### Total High and Critical: 64,965 (out of 331,878 total scored CVEs)

Method 1: Random coin flips (64,965 times - the number of High+Critical CVEs)
  - Finds 109 out of 546 (20.0%)
  - Misses 80.0% of FIRE
  - Requires 99.8% wasted work to achieve 20.0% results

Method 2: Only check High+Critical CVEs
  - Finds 417 out of 546 (76.4%)
  - Misses 23.6% of FIRE
  - Requires 99.4% wasted work to achieve 76.4% results

## Targeting High+Critical CVEs is 3.83x more effective than random selection.
