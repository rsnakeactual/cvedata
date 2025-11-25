# Analysis for FIRE as of 20251125

## Total FIRE CVEs: 426
### Total High and Critical: 59,993 (out of 319,227 total scored CVEs)

Method 1: Random coin flips (59,993 times - the number of High+Critical CVEs)
  - Finds 85 out of 426 (20.0%)
  - Misses 80.0% of FIRE
  - Requires 99.9% wasted work to achieve 20.0% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.09x more effective than random selection.
