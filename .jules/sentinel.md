
## 2024-05-18 - Cron Secret Authorization Bypass
**Vulnerability:** API endpoints comparing `Authorization` headers to template strings containing environment variables (e.g., `` Bearer ${process.env.SECRET} ``) can be bypassed if the environment variable is undefined. An attacker could send `Authorization: Bearer undefined` and successfully authenticate.
**Learning:** `process.env.VAR` evaluates to `undefined` (not an empty string or null), and template strings coerce this into the string `"undefined"`. If not explicitly checked, this stringifies into the expected token value.
**Prevention:** Always ensure the required environment variables are defined (`if (!secret) return error;`) before making authentication comparisons, especially for cron jobs or service-to-service endpoints.
