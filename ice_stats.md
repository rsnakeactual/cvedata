# Analysis for FIRE as of 20260115

## Total FIRE CVEs: 426
### Total High and Critical: 63,228 (out of 327,813 total scored CVEs)

Method 1: Random coin flips (63,228 times - the number of High+Critical CVEs)
  - Finds 77 out of 426 (18.1%)
  - Misses 81.9% of FIRE
  - Requires 99.9% wasted work to achieve 18.1% results

Method 2: Only check High+Critical CVEs
  - Finds 349 out of 426 (81.9%)
  - Misses 18.1% of FIRE
  - Requires 99.4% wasted work to achieve 81.9% results

## Targeting High+Critical CVEs is 4.53x more effective than random selection.
