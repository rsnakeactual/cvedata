# Analysis for FIRE as of 20260214

## Total FIRE CVEs: 546
### Total High and Critical: 65,316 (out of 332,747 total scored CVEs)

Method 1: Random coin flips (65,316 times - the number of High+Critical CVEs)
  - Finds 87 out of 546 (15.9%)
  - Misses 84.1% of FIRE
  - Requires 99.9% wasted work to achieve 15.9% results

Method 2: Only check High+Critical CVEs
  - Finds 417 out of 546 (76.4%)
  - Misses 23.6% of FIRE
  - Requires 99.4% wasted work to achieve 76.4% results

## Targeting High+Critical CVEs is 4.79x more effective than random selection.
