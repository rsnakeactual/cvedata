# Analysis for ICE as of 20251006

## Total ICE CVEs: 318
### Total High and Critical: 57,529 (out of 312,853 total scored CVEs)

Method 1: Random coin flips (57,529 times - the number of High+Critical CVEs)
  - Finds 49 out of 318 (15.4%)
  - Misses 84.6% of ICE
  - Requires 99.9% wasted work to achieve 15.4% results

Method 2: Only check High+Critical CVEs
  - Finds 248 out of 318 (78.0%)
  - Misses 22.0% of ICE
  - Requires 99.6% wasted work to achieve 78.0% results

## Targeting High+Critical CVEs is 5.06x more effective than random selection.
