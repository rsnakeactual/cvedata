# Analysis for FIRE as of 20260117

## Total FIRE CVEs: 426
### Total High and Critical: 63,418 (out of 328,195 total scored CVEs)

Method 1: Random coin flips (63,418 times - the number of High+Critical CVEs)
  - Finds 93 out of 426 (21.8%)
  - Misses 78.2% of FIRE
  - Requires 99.9% wasted work to achieve 21.8% results

Method 2: Only check High+Critical CVEs
  - Finds 349 out of 426 (81.9%)
  - Misses 18.1% of FIRE
  - Requires 99.4% wasted work to achieve 81.9% results

## Targeting High+Critical CVEs is 3.75x more effective than random selection.
