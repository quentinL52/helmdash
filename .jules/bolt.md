## 2025-02-18 - [Optimize `getMonthlyEntries` calls]
**Learning:** `getMonthlyEntries` is called multiple times inside React components, sorting the entire array and doing computations every time, causing redundant calculations.
**Action:** Use `useMemo` to memoize the results of `getMonthlyEntries` at the component level to prevent redundant sorting and object creation during re-renders. Also, remove spreading `...` from `[...getMonthlyEntries(finance.entries)]` since it returns a new array anyway and doesn't mutate `finance.entries`.
