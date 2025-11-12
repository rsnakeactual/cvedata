# Analysis for FIRE as of 20251112

## Total FIRE CVEs: 415
### Total High and Critical: 59,499 (out of 317,819 total scored CVEs)

Method 1: Random coin flips (59,499 times - the number of High+Critical CVEs)
  - Finds 79 out of 415 (19.0%)
  - Misses 81.0% of FIRE
  - Requires 99.9% wasted work to achieve 19.0% results

Method 2: Only check High+Critical CVEs
  - Finds 338 out of 415 (81.4%)
  - Misses 18.6% of FIRE
  - Requires 99.4% wasted work to achieve 81.4% results

## Targeting High+Critical CVEs is 4.28x more effective than random selection.
