---
title: gOuroboros
description: Introduction to gOuroboros.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros is a powerful and versatile framework for building Go apps that interact with the Cardano blockchain. Quickly and easily write Go apps that communicate with Cardano nodes or manage blocks/transactions. Sync the blockchain from a local or remote node, query a local node for protocol parameters or UTxOs by address, and much more.

## New capabilities in the v0.181.0 development window

- **Leios testnet network definition**: gOuroboros now includes a built in `NetworkCardanoLeios` entry in its network registry. It uses the `leios` network name, network magic `164`, the Cardano testnet address network id, and the bootstrap peer `leios-node.play.dev.cardano.org:3001`. This lets applications resolve the Leios network through the library's normal network lookup helpers instead of maintaining separate network settings.
- **Voting procedure helpers**: gOuroboros now adds `VotingProcedures` convenience methods for `AddOrReplace`, `Lookup`, `LookupVoter`, `LookupGovActionId`, and `Clone`, along with value equality for `Voter` and `GovActionId`. This lets applications manage governance votes by voter and action value, avoid duplicate entries created from separate object instances that represent the same vote, and copy voting data without sharing mutable anchor state.
- **Metadata JSON helpers**: gOuroboros now provides `ParseCardanoCLIMetadataJSONNoSchema`, `ParseCardanoCLIMetadataJSONDetailedSchema`, deterministic metadata CBOR marshaling for metadata types, and `NewShelleyAuxiliaryData` for metadata only auxiliary data. These helpers accept cardano cli compatible metadata JSON, enforce strict validation, preserve canonical CBOR map ordering, and simplify conversion from metadata JSON to auxiliary data.
- **Leios endorser block type**: gOuroboros now provides the dedicated `LeiosEndorserBlock` and `LeiosTransactionReference` types for CIP-0164 endorser blocks, along with CBOR encode and decode helpers including `NewLeiosEndorserBlockFromCbor`. The decoder checks transaction reference ordering, rejects duplicate references, rejects zero sized references, and rejects trailing bytes. Documentation uses the corrected `LeiosEndorserBlock` name.

***

Learn more about the code documentation of gOuroboros here: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.  
