# Analysis for FIRE as of 20251111

## Total FIRE CVEs: 415
### Total High and Critical: 59,385 (out of 317,566 total scored CVEs)

Method 1: Random coin flips (59,385 times - the number of High+Critical CVEs)
  - Finds 87 out of 415 (21.0%)
  - Misses 79.0% of FIRE
  - Requires 99.9% wasted work to achieve 21.0% results

Method 2: Only check High+Critical CVEs
  - Finds 338 out of 415 (81.4%)
  - Misses 18.6% of FIRE
  - Requires 99.4% wasted work to achieve 81.4% results

## Targeting High+Critical CVEs is 3.89x more effective than random selection.
