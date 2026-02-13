# Analysis for FIRE as of 20260213

## Total FIRE CVEs: 546
### Total High and Critical: 65,275 (out of 332,614 total scored CVEs)

Method 1: Random coin flips (65,275 times - the number of High+Critical CVEs)
  - Finds 105 out of 546 (19.2%)
  - Misses 80.8% of FIRE
  - Requires 99.8% wasted work to achieve 19.2% results

Method 2: Only check High+Critical CVEs
  - Finds 417 out of 546 (76.4%)
  - Misses 23.6% of FIRE
  - Requires 99.4% wasted work to achieve 76.4% results

## Targeting High+Critical CVEs is 3.97x more effective than random selection.
