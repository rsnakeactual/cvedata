# Analysis for FIRE as of 20260215

## Total FIRE CVEs: 546
### Total High and Critical: 65,325 (out of 332,900 total scored CVEs)

Method 1: Random coin flips (65,325 times - the number of High+Critical CVEs)
  - Finds 118 out of 546 (21.6%)
  - Misses 78.4% of FIRE
  - Requires 99.8% wasted work to achieve 21.6% results

Method 2: Only check High+Critical CVEs
  - Finds 417 out of 546 (76.4%)
  - Misses 23.6% of FIRE
  - Requires 99.4% wasted work to achieve 76.4% results

## Targeting High+Critical CVEs is 3.53x more effective than random selection.
