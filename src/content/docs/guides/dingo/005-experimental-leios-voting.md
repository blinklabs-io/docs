---
title: Experimental Leios Voting
description: Configure experimental Leios voting in Dingo.
---

# Dingo

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

***

This guide covers experimental Leios voting in Dingo. It explains when operators use this mode, which settings activate it, how the voting keys work, and which limits still apply.

<br>

> ⚠️ Treat this feature as early access functionality for test networks and controlled evaluation. It does not describe normal Praos operation.

***

<br>

## Step 1 - Decide When to Use Leios Mode

Use Leios mode when an operator needs to evaluate Dijkstra and Leios behavior on a test network, including committee voting and vote handling.

This mode supports experimentation, validation, and devnet style testing. It does not represent the normal mainline Praos path.

***

<br>

## Step 2 - Enable the Experimental Startup Settings

Dingo keeps Dijkstra era behavior behind experimental startup settings. Operators must enable both the Leios run mode and the Dijkstra start era before the node can participate in Leios voting.

If the configuration omits Leios mode, Leios voting settings alone do not activate voting.

```yaml
runMode: "leios"
startEra: "dijkstra"
blockProducer: true
leiosVoteSigningKeyFile: "/etc/dingo/leios-vote.skey"
leiosVoterPublicKeys:
  "pool_key_hash_hex": "compressed_bls12_381_public_key_hex"
```

> 📝 Configure `runMode: "leios"` together with `startEra: "dijkstra"`. Dingo does not enable Dijkstra and Leios behavior without both experimental settings.

***

<br>

## Step 3 - Configure `leiosVoteSigningKeyFile`

Set `leiosVoteSigningKeyFile` to the path of the local hex encoded BLS12 381 vote signing key. Dingo uses this key only for local vote emission.

Dingo emits votes only when all of the following conditions apply:

- `runMode` is set to `"leios"`
- `blockProducer` is set to `true`
- `leiosVoteSigningKeyFile` is present
- the pool belongs to the current committee

If the configuration includes a signing key but does not enable block producer mode, Dingo logs a warning and leaves voting disabled.

> ⚠️ Store the vote signing key file with strict permissions. The example configuration comments note that the file should not be group or other readable.

***

<br>

## Step 4 - Configure `leiosVoterPublicKeys`

Set `leiosVoterPublicKeys` as a static mapping from pool key hash hex strings to compressed BLS12 381 public key hex strings.

Dingo validates this registry during startup and stops immediately if an entry is invalid.

This registry currently fills the role of the not yet finalized key registration flow. Operators define which voter signatures Dingo can verify by maintaining this mapping directly.

Use placeholder labels such as the following example values, then replace them with the real pool key hash and compressed public key hex strings for the target environment.

```yaml
leiosVoterPublicKeys:
  "<pool-key-hash-hex-1>": "<compressed-bls12-381-public-key-hex-1>"
  "<pool-key-hash-hex-2>": "<compressed-bls12-381-public-key-hex-2>"
```

> 📝 Keep this mapping accurate across the committee members that matter for testing. Dingo can only verify signatures for voters that appear in the configured registry.

***

<br>

## Step 5 - Understand When Dingo Emits Votes

Dingo signs and emits exactly one uniform vote for each observed endorser block when the pool belongs to the committee for that epoch.

Configuration alone does not produce votes. Dingo must run in Leios mode, start as a block producer, load a signing key, and observe an endorser block at a time when the pool belongs to the committee.

***

<br>

## Step 6 - Understand Quorum and Certificates

Dingo computes the committee as a deterministic set of pools chosen from stake for the epoch.

Quorum means enough verified committee stake reaches the configured threshold. Dingo does not treat quorum as a simple count of how many voters replied.

A certificate proves that enough verified committee stake voted for an endorser block. It contains the set of signers together with one combined signature for the verified votes.

> 💡 Operators can treat the certificate as proof that the required committee stake backed a specific endorser block, not as proof from every committee member.

***

<br>

## Step 7 - Review the Current Limits and Caveats

- This feature is experimental.
- The current implementation targets test networks and devnets.
- The voter public key registry is static and manual today.
- Dingo can observe votes from unknown voters, but those votes cannot contribute to certificates because Dingo cannot verify their signatures against the configured registry.
- Certificate validation and integration remain incomplete at the broader protocol level because the upstream Dijkstra certificate wiring still uses placeholders.
- Operators should expect change as the Leios and Dijkstra ecosystem continues to evolve.

> ⚠️ Plan for change in both configuration and behavior while the surrounding ecosystem matures.

***

<br>

## Step 8 - Use This Guide for Controlled Evaluation

Use this guide for controlled experimentation, test execution, and validation work. It does not provide a basis for production assumptions.