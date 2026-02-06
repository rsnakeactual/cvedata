# Analysis for FIRE as of 20260206

## Total FIRE CVEs: 545
### Total High and Critical: 64,763 (out of 331,341 total scored CVEs)

Method 1: Random coin flips (64,763 times - the number of High+Critical CVEs)
  - Finds 114 out of 545 (20.9%)
  - Misses 79.1% of FIRE
  - Requires 99.8% wasted work to achieve 20.9% results

Method 2: Only check High+Critical CVEs
  - Finds 416 out of 545 (76.3%)
  - Misses 23.7% of FIRE
  - Requires 99.4% wasted work to achieve 76.3% results

## Targeting High+Critical CVEs is 3.65x more effective than random selection.
