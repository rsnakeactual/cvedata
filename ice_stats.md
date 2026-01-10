# Analysis for FIRE as of 20260110

## Total FIRE CVEs: 426
### Total High and Critical: 62,746 (out of 327,039 total scored CVEs)

Method 1: Random coin flips (62,746 times - the number of High+Critical CVEs)
  - Finds 59 out of 426 (13.8%)
  - Misses 86.2% of FIRE
  - Requires 99.9% wasted work to achieve 13.8% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 5.90x more effective than random selection.
