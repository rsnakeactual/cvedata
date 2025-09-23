# Analysis for ICE as of 20250923

## Total ICE CVEs: 318
### Total High and Critical: 56,891 (out of 311,211 total scored CVEs)

Method 1: Random coin flips (56,891 times - the number of High+Critical CVEs)
  - Finds 68 out of 318 (21.4%)
  - Misses 78.6% of ICE
  - Requires 99.9% wasted work to achieve 21.4% results

Method 2: Only check High+Critical CVEs
  - Finds 248 out of 318 (78.0%)
  - Misses 22.0% of ICE
  - Requires 99.6% wasted work to achieve 78.0% results

## Targeting High+Critical CVEs is 3.65x more effective than random selection.
