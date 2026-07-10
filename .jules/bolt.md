## 2024-05-24 - Avoid redundant array manipulation on `getMonthlyEntries`
**Learning:** `getMonthlyEntries` in `src/lib/finance-utils.ts` already returns an array sorted in descending order by month. Spreading it and re-sorting it creates unnecessary intermediate arrays and wastes CPU cycles, especially since it was often done multiple times inside rendering functions or loops.
**Action:** Always cache the result of `getMonthlyEntries` if used multiple times. Never spread or re-sort it to match its native descending order. Ensure it's used optimally within `useMemo` hooks where appropriate.
