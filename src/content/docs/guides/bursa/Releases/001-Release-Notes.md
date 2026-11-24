---
title: Latest Releases
description: Bursa Release Notes
---

## Keep your Bursa Wallet current to ensure you're always running the latest performance boosts💪, new features✨, critical fixes🔧, and security enhancements🔐. 

<br>

☑️ Select a version below to view the full release notes.

- Version: v0.28.0 - *[View Release Notes](../v0-28-0)* - [Release](https://github.com/blinklabs-io/bursa/releases/tag/v0.28.0)
  * Enabled `gen-staged-key --attestation-out` to produce a signed staged-key attestation from an attested TLS KES agent.
  * Authorized operational certificate issuance through trusted `opcerts[].kes_agents` pins, avoiding `opcerts[].kes_vkeys` edits and restarts for each staged key.
  * Configured trusted agents with `spki_sha256` pins and optional `profile` values.
  * Validated trusted-agent configuration at startup and refused invalid attestations.
  * Retained the existing `kes_vkeys` authorization path for requests without attestations.
- Version: v0.27.0 - *[View Release Notes](../v0-27-0)* - [Release](https://github.com/blinklabs-io/bursa/releases/tag/v0.27.0)
  * Added the `bursa key pool-id` command to derive a pool ID from a cold verification key or mnemonic, emit bech32 or hexadecimal output, write files with secure `0600` permissions, and validate input before writing.
  * Improved iOS contact protection by excluding each existing contact file from backups. Startup now stops when the system cannot exclude a file, preventing operation without the intended protection.
  * Strengthened firmware reset security by requiring host authentication after host-key registration, while preserving reset access during bootstrap.
  * Protected signing-log integrity by validating the full durable chain and refusing subsequent appends when earlier durable records have changed.
  * Accelerated PostgreSQL connection recovery by limiting watermark liveness checks to `300ms`; dead idle connections now fail fast so replacement connections can connect within the caller's timeout.
  * Standardized pool relay networking on network-order IPv6 bytes and updated the underlying Cardano networking library to `v0.220.1` with refreshed cryptography support.
  * Refined JWT validation with `keyfunc/v3` `v3.9.2`; it enforces whitelist checks for tokens without a `kid` header and fails faster for unknown key IDs when no remote resources exist.
  * Modernized system compatibility with `golang.org/x/sys` `v0.50.0` for current platform behavior and compatibility.
  * Refreshed Google Cloud integrations with KMS `v1.37.0` and long-running operation support `v1.5.0`.
  * Enhanced AWS credential support with `v1.21.1` and its related modules.
- Version: v0.26.0 - *[View Release Notes](../v0-26-0)* - [Release](https://github.com/blinklabs-io/bursa/releases/tag/v0.26.0)
- Version: v0.25.0 - *[View Release Notes](../v0-25-0)* - [Release](https://github.com/blinklabs-io/bursa/releases/tag/v0.25.0)
- Version: v0.24.0 - *[View Release Notes](../v0-24-0)* - [Release](https://github.com/blinklabs-io/bursa/releases/tag/v0.24.0)
- Version: v0.23.0 - *[View Release Notes](../v0-23-0)* - [Release](https://github.com/blinklabs-io/bursa/releases/tag/v0.23.0)
- Version: v0.22.0 - *[View Release Notes](../v0-22-0)* - [Release](https://github.com/blinklabs-io/bursa/releases/tag/v0.22.0)
- Version: v0.21.1 - *[View Release Notes](../v0-21-1)*
- Version: v0.21.0 - *[View Release Notes](../v0-21-0)*
- Version: v0.20.0 - *[View Release Notes](../v0-20-0)*
- Version: v0.19.0 - *[View Release Notes](../v0-19-0)*
- Version: v0.18.0 - *[View Release Notes](../v0-18-0)*
- Version: v0.17.1 - *[View Release Notes](../v0-17-1)*
- Version: v0.17.0 - *[View Release Notes](../v0-17-0)*
- Version: v0.16.0 - *[View Release Notes](../v0-16-0)*


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
