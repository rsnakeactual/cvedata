# Analysis for FIRE as of 20260209

## Total FIRE CVEs: 546
### Total High and Critical: 64,894 (out of 331,701 total scored CVEs)

Method 1: Random coin flips (64,894 times - the number of High+Critical CVEs)
  - Finds 121 out of 546 (22.2%)
  - Misses 77.8% of FIRE
  - Requires 99.8% wasted work to achieve 22.2% results

Method 2: Only check High+Critical CVEs
  - Finds 417 out of 546 (76.4%)
  - Misses 23.6% of FIRE
  - Requires 99.4% wasted work to achieve 76.4% results

## Targeting High+Critical CVEs is 3.45x more effective than random selection.
