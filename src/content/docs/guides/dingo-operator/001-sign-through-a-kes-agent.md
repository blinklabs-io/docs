---
title: Sign Through a Bursa KES Agent
description: Run a Dingo block producer under dingo-operator with its KES key held by a Bursa KES agent, and rotate that key by hand.
---

A block producer normally keeps its KES signing key in its own keys Secret.
With a KES agent, the key stays in a Bursa KES agent instead. Dingo sends each
block header to the agent over TLS, and the agent signs it. The keys Secret
carries only the VRF key and the operational certificate.

This page covers dingo-operator v0.5.0, Dingo v0.94.2, and Bursa v0.26.0.

## How the parts connect

| Part | Role | Configured with |
| --- | --- | --- |
| Bursa KES agent | Holds the KES key for each pool and signs headers in `sign` mode. It serves remote producers on its attested listener, and runs one profile per pool. | The `kes_agent` YAML block. See the [Bursa configuration reference](/guides/bursa/009-configuration-reference/#kes_agent). |
| Dingo | Connects to the agent, admits it, and asks it to sign each header it forges. | The remote KES agent settings. See the [Dingo configuration reference](/guides/dingo/009-configuration-reference/#remote-shelley-kes-agents). |
| dingo-operator | Renders Dingo's agent settings from the `DingoNode`, mounts the client certificate, and validates the keys Secret. | `spec.blockProducer.signingAgent` |

## Requirements

- **Dingo v0.94.0 or later.** dingo-operator v0.5.0 refuses Dingo images older
  than v0.93.0 when `signingAgent` is set. Agent profiles, which let one agent
  serve several pools, need v0.94.0. Set `spec.image.tag` explicitly.
  Dingo v0.94.0 refuses a socket directory that group or other can write, so
  use dingo-operator v0.4.0 or later, which puts Dingo's socket in a directory
  of its own.
- **Rotation mode `Assisted` or `MonitorOnly`.** This guide rotates the key by
  hand, as described below. `MonitorOnly` is the default. dingo-operator v0.5.0
  also accepts `Auto` with `signingAgent`, when `controlClientCertSecretRef`,
  `serverSpkiSha256` and `rotation.reloadInPlace` are set. The operator then
  rotates the key through the agent's control role. With the Bursa v0.26.0
  signer as the cold signer, that rotation cannot issue until
  [dingo-operator#193](https://github.com/blinklabs-io/dingo-operator/issues/193)
  is resolved. This guide does not cover that setup.
- **A mutual TLS link to the agent.** Bursa v0.26.0 admits a producer only
  when its client certificate is verified and its key is pinned for the
  profile. Give the node a client certificate, and pin the agent's server key
  unless the agent's certificate chains to a root in the Dingo image:
  dingo-operator v0.5.0 has no setting that adds a private CA. A plain TCP
  link cannot admit a signing session, so the agent refuses it even where
  something else, such as a service mesh, secures the connection.

## Configure the agent

Add the remote listener and one profile per pool to the agent's `kes_agent`
configuration. The listener requires TLS 1.3. A profile admits a producer only
when `attested_client_ca_file` verifies its client certificate and the SHA-256
digest of the certificate's public key is in the profile's
`sign_client_spki_sha256`. An empty list admits no producer.

```yaml
kes_agent:
  mode: sign
  attested_listen_address: ":7000"
  attested_tls_cert_file: /etc/bursa/kes-agent/tls/tls.crt
  attested_tls_key_file: /etc/bursa/kes-agent/tls/tls.key
  attested_client_ca_file: /etc/bursa/kes-agent/client-ca/ca.crt
  attestation_provider: none
  profiles:
    - name: pool-a
      cold_vkey_hex: "<the pool's 32-byte cold verification key in hex>"
      system_start: "2022-10-25T00:00:00Z"
      slots_per_kes_period: 129600
      guard_file: /var/lib/bursa/pool-a.guard
      sign_client_spki_sha256:
        - "<64 hex characters, the producer client certificate's pin>"
```

With `profiles` set, leave the single-pool fields (`cold_vkey_file`,
`cold_vkey_hex`, `system_start`, `shelley_start_slot`, `shelley_start_time`,
`slots_per_kes_period`, `max_clock_skew`, `guard_file`,
`control_client_spki_sha256`, `sign_client_spki_sha256`) unset at the top
level, and leave `slot_length` and `max_kes_evolutions` at their defaults. Set them in
each profile instead. See [Profiles](/guides/bursa/009-configuration-reference/#profiles).

With guard files, the agent keeps each KES key in memory only. A guard file
keeps the profile's KES period floor across a restart, not its key. After the
agent restarts, no profile has an active key, and the node cannot sign until
you install a new key and certificate as described in
[Rotate the KES key](#rotate-the-kes-key). To keep keys across restarts,
replace the guard files with a PostgreSQL store under `kes_agent.store` and set
its `age_recipients` and `age_identity_file`. The agent then seals each
profile's key in the database and loads it again at startup. This works with
one replica, and it is also how several replicas share a key.

The agent logs its server key fingerprint at startup as `server_spki_sha256`.
That value is the pin the node uses. You can also compute it from the server
certificate:

```sh
openssl x509 -in tls.crt -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | sha256sum
```

Compute each `sign_client_spki_sha256` entry the same way, from the
producer's client certificate.

## Configure the DingoNode

Create two Secrets in the same namespace as the `DingoNode` resource. The
examples use the `cardano` namespace from the operator's quick start; use
whichever namespace your `DingoNode` runs in.

- The keys Secret holds `vrf.skey` and the operational certificate as
  `opcert.cert`. The operator also accepts the name `node.cert`, which the
  Dingo Helm chart uses. Leave `kes.skey` out: a node that signs through an
  agent does not use a local KES key, and the operator reports one as ignored.
- The client certificate Secret holds `tls.crt` and `tls.key`, issued by the
  CA in the agent's `attested_client_ca_file`. Its public key is the one in
  `sign_client_spki_sha256`.

```sh
kubectl -n cardano create secret generic producer-pool-keys \
  --from-file=vrf.skey --from-file=opcert.cert
kubectl -n cardano create secret tls kes-agent-client \
  --cert=client.crt --key=client.key
```

Then point the block producer at the agent:

```yaml
apiVersion: dingo.blinklabs.io/v1alpha1
kind: DingoNode
metadata:
  name: producer
  namespace: cardano
spec:
  role: blockProducer
  network: preview
  image:
    tag: "0.94.2"
  environment:
    # The agent profile this pool signs under.
    CARDANO_SHELLEY_KES_AGENT_PROFILE: pool-a
  topology:
    relayRefs: [relay]
  blockProducer:
    poolId: <pool id, bech32 or hex>
    keys:
      secretRef: producer-pool-keys
    rotation:
      mode: Assisted
    signingAgent:
      address: kes-agent.signing.svc:7000
      serverSpkiSha256: <64 hex characters>
      clientCertSecretRef: kes-agent-client
```

The operator sets Dingo's agent address, pin, and client certificate paths
from `signingAgent`, and refuses `spec.environment` overrides of those
settings. The profile is set through `spec.environment`, as above. Dingo reads
the client certificate at startup, so the operator restarts the pod when the
client certificate Secret changes.

## The operational certificate must match the agent

When Dingo connects to the agent, it compares the agent's operational
certificate with the one in its own key file, byte for byte. It admits the
agent when the two are identical. When they differ, Dingo takes the agent's
certificate only if it is for the same cold key with a higher counter, and
reloads its credentials with it once the certificate validates. Any other difference refuses the agent, and
Dingo logs `agent's operational certificate is not the local one`.

A running node keeps forging with the credentials it has loaded. A reload
also refuses a changed certificate that does not raise the counter. A wrong
certificate in the keys Secret can therefore go unnoticed until the pod
restarts, and the restarted node cannot sign. Always deliver the exact file
that was installed in the agent.

## Rotate the KES key

Rotate before the current key runs out of KES periods. Run the agent commands
inside the agent's container: the control socket is local to the agent. Pass
`--profile` to select the pool. Work in a new, empty directory for each
rotation: `--out` refuses to overwrite an existing file, and it does so only
after the agent has staged the key.

1. Generate a staged key in the agent and save its verification key:

   ```sh
   bursa kes-agent control --config /etc/bursa/kes-agent/config.yaml \
     --profile pool-a gen-staged-key --out kes.vkey
   ```

2. Issue an operational certificate for `kes.vkey` with the pool's cold key,
   offline. Start it at the current KES period, which is the current slot
   divided by the slots per KES period. The ledger accepts a counter equal to
   the pool's on-chain counter or one above it. Use one above. When the pool
   has not forged a block since its current certificate was issued, that is
   the current certificate's counter again:

   ```sh
   bursa cert op-cert --kes-vkey kes.vkey --cold-skey cold.skey \
     --counter <on-chain counter + 1> --kes-period <current period> \
     --out node.cert
   ```

3. Install the certificate in the agent, then check the result:

   ```sh
   bursa kes-agent control --config /etc/bursa/kes-agent/config.yaml \
     --profile pool-a install-key --opcert node.cert
   bursa kes-agent control --config /etc/bursa/kes-agent/config.yaml \
     --profile pool-a info
   ```

   `info` should report `has_active_key: true` and the new
   `active_issue_number`.

4. Confirm the agent serves exactly this file. The two values must be equal:

   ```sh
   bursa kes-agent control --config /etc/bursa/kes-agent/config.yaml \
     --profile pool-a info | jq -r .info.active_opcert
   jq -r .cborHex node.cert
   ```

5. Put the same `node.cert` into the keys Secret as `opcert.cert`. The
   operator validates the bundle and delivers it to the pod.

Install first, then update the Secret, and do both in one sitting. From
`install-key` on, the agent signs only headers that carry the new
certificate, so the node cannot sign until it has switched over:

- **The new counter is higher than the node's.** The running node picks up
  the agent's certificate at its next connection to the agent, and logs
  `block producer credentials reloaded` with `source` set to `kes agent`. The
  Secret update then makes a restart load the same certificate.
- **The counter is unchanged,** because the pool has not forged since the
  previous rotation. Dingo does not take a same-counter certificate from the
  agent, and does not reload one in place. The operator restarts the pod when
  the Secret changes, and the restarted node loads the new certificate.

In the reverse order, the Secret would hold a certificate the agent does not
serve yet, and a restart in between would leave the node unable to sign.
