# Analysis for FIRE as of 20251127

## Total FIRE CVEs: 426
### Total High and Critical: 60,108 (out of 319,465 total scored CVEs)

Method 1: Random coin flips (60,108 times - the number of High+Critical CVEs)
  - Finds 76 out of 426 (17.8%)
  - Misses 82.2% of FIRE
  - Requires 99.9% wasted work to achieve 17.8% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.58x more effective than random selection.
