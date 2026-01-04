# Analysis for FIRE as of 20260104

## Total FIRE CVEs: 426
### Total High and Critical: 60,855 (out of 321,586 total scored CVEs)

Method 1: Random coin flips (60,855 times - the number of High+Critical CVEs)
  - Finds 77 out of 426 (18.1%)
  - Misses 81.9% of FIRE
  - Requires 99.9% wasted work to achieve 18.1% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.52x more effective than random selection.
