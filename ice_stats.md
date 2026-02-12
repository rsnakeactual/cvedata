# Analysis for FIRE as of 20260212

## Total FIRE CVEs: 546
### Total High and Critical: 65,176 (out of 332,479 total scored CVEs)

Method 1: Random coin flips (65,176 times - the number of High+Critical CVEs)
  - Finds 97 out of 546 (17.8%)
  - Misses 82.2% of FIRE
  - Requires 99.9% wasted work to achieve 17.8% results

Method 2: Only check High+Critical CVEs
  - Finds 417 out of 546 (76.4%)
  - Misses 23.6% of FIRE
  - Requires 99.4% wasted work to achieve 76.4% results

## Targeting High+Critical CVEs is 4.30x more effective than random selection.
