# Analysis for FIRE as of 20260114

## Total FIRE CVEs: 426
### Total High and Critical: 63,094 (out of 327,669 total scored CVEs)

Method 1: Random coin flips (63,094 times - the number of High+Critical CVEs)
  - Finds 86 out of 426 (20.2%)
  - Misses 79.8% of FIRE
  - Requires 99.9% wasted work to achieve 20.2% results

Method 2: Only check High+Critical CVEs
  - Finds 349 out of 426 (81.9%)
  - Misses 18.1% of FIRE
  - Requires 99.4% wasted work to achieve 81.9% results

## Targeting High+Critical CVEs is 4.06x more effective than random selection.
