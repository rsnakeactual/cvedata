# Analysis for FIRE as of 20251222

## Total FIRE CVEs: 426
### Total High and Critical: 60,855 (out of 321,586 total scored CVEs)

Method 1: Random coin flips (60,855 times - the number of High+Critical CVEs)
  - Finds 82 out of 426 (19.2%)
  - Misses 80.8% of FIRE
  - Requires 99.9% wasted work to achieve 19.2% results

Method 2: Only check High+Critical CVEs
  - Finds 348 out of 426 (81.7%)
  - Misses 18.3% of FIRE
  - Requires 99.4% wasted work to achieve 81.7% results

## Targeting High+Critical CVEs is 4.24x more effective than random selection.
