## 2026-07-11 - [Finance Utils Optimization]
**Learning:** Redundant array spreads and sort operations on already-sorted helper functions (like `getMonthlyEntries`) cause unnecessary O(N log N) overhead, particularly when placed directly inside React's `useMemo` block or render logic.
**Action:** Remove redundant spreads and `.sort()` on data that is already sorted by the utility function. Store the utility call result in a component-level `useMemo` or local variable to prevent duplicate calls.
