# Analysis for FIRE as of 20251109

## Total FIRE CVEs: 415
### Total High and Critical: 59,295 (out of 317,359 total scored CVEs)

Method 1: Random coin flips (59,295 times - the number of High+Critical CVEs)
  - Finds 84 out of 415 (20.2%)
  - Misses 79.8% of FIRE
  - Requires 99.9% wasted work to achieve 20.2% results

Method 2: Only check High+Critical CVEs
  - Finds 338 out of 415 (81.4%)
  - Misses 18.6% of FIRE
  - Requires 99.4% wasted work to achieve 81.4% results

## Targeting High+Critical CVEs is 4.02x more effective than random selection.
