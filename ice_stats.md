# Analysis for FIRE as of 20251207

## Total FIRE CVEs: 426
### Total High and Critical: 60,560 (out of 320,400 total scored CVEs)

Method 1: Random coin flips (60,560 times - the number of High+Critical CVEs)
  - Finds 90 out of 426 (21.1%)
  - Misses 78.9% of FIRE
  - Requires 99.9% wasted work to achieve 21.1% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 3.87x more effective than random selection.
