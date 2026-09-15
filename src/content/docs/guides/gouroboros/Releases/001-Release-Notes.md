---
title: Latest Releases
description: gOuroboros Release Notes
---

## Keep your gOuroboros releases current to ensure you're always running the latest performance boosts💪, new features✨, and critical fixes🔧. 

<br>

☑️ Select a version below to view the full release notes.

- Version: v0.205.0 - *[View Release Notes](https://github.com/blinklabs-io/gouroboros/releases/tag/v0.205.0)*
  * Strengthened message authentication by requiring a `StakeAuthority`, deriving the correct 28-byte Blake2b-224 pool key hash, verifying KES signatures in process, rejecting zero stake, preventing KES period overflow, and failing closed when DMQ authentication is not configured. Integrations that construct `MessageAuthenticator` must now provide the required stake authority.
  * Improved shutdown reliability by allowing message delivery to observe a context and making `BlockFetch` and `ChainSync` `Stop` wait up to 250 ms for the shutdown message. Delivery failures, including `context.DeadlineExceeded`, now return to the caller.
  * Preserved duplicate keys in nested metadata maps while continuing to reject duplicate labels in outer auxiliary data maps.
  * Aligned Byron dropped field decoding and SSC structural validation with cardano-ledger behavior. The decoder accepts compatible variable-length byte strings and wider values and rejects invalid wire shapes.
  * Hardened UTxO RPC rational validation across Shelley, Mary, Alonzo, and Babbage by rejecting nil embedded rationals and values outside the permitted range.
  * Enforced protocol-aware pool metadata URL limits of 64 bytes before Conway and 128 bytes from Conway onward. UTxO-RPC now handles absent metadata safely, and JSON keys use lowercase spelling.
  * Propagated the enclosing era through nested UTXO and UTXOW failures, including Conway and Dijkstra cases, while preserving unknown raw CBOR context for diagnosis.
  * Corrected certificate UTxO-RPC responses to preserve deposit amounts as `Coin` values and to use the correct pool hash for stake-vote delegation certificates.
  * Added explicit `Start` and `Stop` lifecycle controls for KeepAlive, Client, and Server, along with simpler notification callbacks that preserve legacy callback precedence.
- Version: v0.204.6 - *[View Release Notes](../v0-204-6)*
- Version: v0.204.5 - *[View Release Notes](../v0-204-5)*
- Version: v0.204.4 - *[View Release Notes](../v0-204-4)*
- Version: v0.204.3 - *[View Release Notes](../v0-204-3)*
- Version: v0.204.2 - *[View Release Notes](../v0-204-2)*
- Version: v0.204.1 - *[View Release Notes](../v0-204-1)*
- Version: v0.204.0 - *[View Release Notes](../v0-204-0)*
- Version: v0.203.0 - *[View Release Notes](../v0-203-0)*
- Version: v0.202.10 - *[View Release Notes](../v0-202-10)*
- Version: v0.202.9 - *[View Release Notes](../v0-202-9)*
- Version: v0.202.8 - *[View Release Notes](../v0-202-8)*
- Version: v0.202.7 - *[View Release Notes](../v0-202-7)*
- Version: v0.202.6 - *[View Release Notes](../v0-202-6)*
- Version: v0.202.5 - *[View Release Notes](../v0-202-5)*
- Version: v0.202.4 - *[View Release Notes](../v0-202-4)*
- Version: v0.202.3 - *[View Release Notes](../v0-202-3)*
- Version: v0.202.2 - *[View Release Notes](../v0-202-2)*
- Version: v0.202.1 - *[View Release Notes](../v0-202-1)*
- Version: v0.202.0 - *[View Release Notes](../v0-202-0)*
- Version: v0.201.1 - *[View Release Notes](../v0-201-1)*
- Version: v0.201.0 - *[View Release Notes](../v0-201-0)*
- Version: v0.200.0 - *[View Release Notes](../v0-200-0)*
- Version: v0.199.0 - *[View Release Notes](../v0-199-0)*
- Version: v0.198.0 - *[View Release Notes](../v0-198-0)*
- Version: v0.197.0 - *[View Release Notes](../v0-197-0)*
- Version: v0.196.0 - *[View Release Notes](../v0-196-0)*
- Version: v0.195.0 - *[View Release Notes](../v0-195-0)*
- Version: v0.194.0 - *[View Release Notes](../v0-194-0)*
- Version: v0.193.3 - *[View Release Notes](../v0-193-3)*
- Version: v0.193.2 - *[View Release Notes](../v0-193-2)*
- Version: v0.193.1 - *[View Release Notes](../v0-193-1)*
- Version: v0.193.0 - *[View Release Notes](../v0-193-0)*
- Version: v0.192.1 - *[View Release Notes](../v0-192-1)*
- Version: v0.192.0 - *[View Release Notes](../v0-192-0)*
- Version: v0.191.3 - *[View Release Notes](../v0-191-3)*
- Version: v0.191.2 - *[View Release Notes](../v0-191-2)*
- Version: v0.191.1 - *[View Release Notes](../v0-191-1)*
- Version: v0.191.0 - *[View Release Notes](../v0-191-0)*
- Version: v0.190.0 - *[View Release Notes](../v0-190-0)*
- Version: v0.189.5 - *[View Release Notes](../v0-189-5)*
- Version: v0.189.4 - *[View Release Notes](../v0-189-4)*
- Version: v0.189.3 - *[View Release Notes](../v0-189-3)*
- Version: v0.189.2 - *[View Release Notes](../v0-189-2)*
- Version: v0.189.1 - *[View Release Notes](../v0-189-1)*
- Version: v0.189.0 - *[View Release Notes](../v0-189-0)*
- Version: v0.188.1 - *[View Release Notes](../v0-188-1)*
- Version: v0.188.0 - *[View Release Notes](../v0-188-0)*
- Version: v0.187.4 - *[View Release Notes](../v0-187-4)*
- Version: v0.187.3 - *[View Release Notes](../v0-187-3)*
- Version: v0.187.1 - *[View Release Notes](../v0-187-1)*
- Version: v0.187.0 - *[View Release Notes](../v0-187-0)*
- Version: v0.186.3 - *[View Release Notes](../v0-186-3)*
- Version: v0.186.2 - *[View Release Notes](../v0-186-2)*
- Version: v0.183.0 - *[View Release Notes](../v0-183-0)*
- Version: v0.182.0 - *[View Release Notes](../v0-182-0)*
- Version: v0.181.0 - *[View Release Notes](../v0-181-0)*
- Version: v0.180.1 - *[View Release Notes](../v0-180-1)*
- Version: v0.180.0 - *[View Release Notes](../v0-180-0)*
- Version: v0.179.0 - *[View Release Notes](../v0-179-0)*
- Version: v0.178.0 - *[View Release Notes](../v0-178-0)*
- Version: v0.171.0 - *[View Release Notes](../v0-171-0)*
- Version: v0.170.1 - *[View Release Notes](../v0-170-1)*


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
