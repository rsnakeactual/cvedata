# Analysis for FIRE as of 20251113

## Total FIRE CVEs: 415
### Total High and Critical: 59,579 (out of 318,044 total scored CVEs)

Method 1: Random coin flips (59,579 times - the number of High+Critical CVEs)
  - Finds 78 out of 415 (18.8%)
  - Misses 81.2% of FIRE
  - Requires 99.9% wasted work to achieve 18.8% results

Method 2: Only check High+Critical CVEs
  - Finds 338 out of 415 (81.4%)
  - Misses 18.6% of FIRE
  - Requires 99.4% wasted work to achieve 81.4% results

## Targeting High+Critical CVEs is 4.33x more effective than random selection.
