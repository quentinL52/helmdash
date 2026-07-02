# Security Policy

## Supported Versions

Only the latest stable release of Helmdash receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ Active support  |
| Older   | ❌ Not supported   |

## Reporting a Vulnerability

We take the security of Helmdash seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Contact:** security@helmdash.app

**PGP Key:** Our PGP public key is available for encrypted communication. Please request it via email if needed.

**Response Commitment:** We acknowledge receipt of your report within **48 hours** and will provide an initial assessment of the severity and scope.

**Disclosure Timeline:**
- We aim to triage and confirm the vulnerability within 7 days.
- A fix will typically be developed within 30 days, depending on complexity.
- We coordinate public disclosure with you after the fix is released.

Please refrain from publicly disclosing the vulnerability until we have had a reasonable opportunity to address it.

## Security Measures

Helmdash employs the following security measures to protect user data:

- **HTTPS/TLS:** All communications are encrypted in transit using TLS 1.2+.
- **Dependency Scanning:** Third-party dependencies are continuously monitored for known vulnerabilities using automated scanning tools.
- **Supabase Row-Level Security (RLS):** Database access is restricted at the row level, ensuring users can only access data they are authorized to see.
- **Encrypted API Keys at Rest:** All sensitive credentials and API keys are encrypted at rest using industry-standard encryption algorithms.
