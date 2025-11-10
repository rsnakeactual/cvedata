# Analysis for FIRE as of 20251110

## Total FIRE CVEs: 415
### Total High and Critical: 59,303 (out of 317,384 total scored CVEs)

Method 1: Random coin flips (59,303 times - the number of High+Critical CVEs)
  - Finds 86 out of 415 (20.7%)
  - Misses 79.3% of FIRE
  - Requires 99.9% wasted work to achieve 20.7% results

Method 2: Only check High+Critical CVEs
  - Finds 338 out of 415 (81.4%)
  - Misses 18.6% of FIRE
  - Requires 99.4% wasted work to achieve 81.4% results

## Targeting High+Critical CVEs is 3.93x more effective than random selection.
