# Analysis for ICE as of 20250606

## Total ICE CVEs: 318
## Total High and Critical CVEs: 51,243 (out of 296,596 total CVEs)

Method 1: Random coin flips (51,243 times - the number of High+Critical CVEs)
  - Finds 51 out of 318 (16.0%)
  - Misses 84.0% of ICE
  - Requires 99.9% wasted work to achieve 16.0% results

Method 2: Only check High+Critical CVEs
  - Finds 248 out of 318 (78.0%)
  - Misses 22.0% of ICE
  - Requires 99.5% wasted work to achieve 78.0% results

## Targeting High+Critical CVEs is 4.86x more effective than random selection.
