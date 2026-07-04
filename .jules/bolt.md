## 2024-07-04 - [Avoid Redundant Array Cloning and Sorting in Render Loops]
**Learning:** Found multiple instances where components were redundantly cloning and sorting arrays (e.g., `[...getMonthlyEntries(finance.entries)].sort(...)`) despite the underlying utility function (`getMonthlyEntries`) already sorting the returned array. Doing this inside `useMemo` hooks is bad, but even worse if done directly in the render function.
**Action:** Always check if utility functions already return sorted or cloned data before adding defensive clones/sorts in components.
