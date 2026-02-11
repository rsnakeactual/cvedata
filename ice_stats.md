# Analysis for FIRE as of 20260211

## Total FIRE CVEs: 546
### Total High and Critical: 65,094 (out of 332,144 total scored CVEs)

Method 1: Random coin flips (65,094 times - the number of High+Critical CVEs)
  - Finds 104 out of 546 (19.0%)
  - Misses 81.0% of FIRE
  - Requires 99.8% wasted work to achieve 19.0% results

Method 2: Only check High+Critical CVEs
  - Finds 417 out of 546 (76.4%)
  - Misses 23.6% of FIRE
  - Requires 99.4% wasted work to achieve 76.4% results

## Targeting High+Critical CVEs is 4.01x more effective than random selection.
