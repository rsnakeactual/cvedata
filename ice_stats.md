# Analysis for FIRE as of 20260102

## Total FIRE CVEs: 426
### Total High and Critical: 60,855 (out of 321,586 total scored CVEs)

Method 1: Random coin flips (60,855 times - the number of High+Critical CVEs)
  - Finds 96 out of 426 (22.5%)
  - Misses 77.5% of FIRE
  - Requires 99.8% wasted work to achieve 22.5% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 3.62x more effective than random selection.
