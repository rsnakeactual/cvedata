# Analysis for FIRE as of 20251118

## Total FIRE CVEs: 426
### Total High and Critical: 59,738 (out of 318,478 total scored CVEs)

Method 1: Random coin flips (59,738 times - the number of High+Critical CVEs)
  - Finds 73 out of 426 (17.1%)
  - Misses 82.9% of FIRE
  - Requires 99.9% wasted work to achieve 17.1% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.77x more effective than random selection.
