---
title: Deploy Block Producers with SOPS and Bursa
description: Run Dingo block producers on Kubernetes with dingo-operator, keep every key in git as SOPS-encrypted files, issue operational certificates offline with Bursa, and sign through a highly available Bursa KES agent.
---

This guide builds a complete block-producer deployment on Kubernetes:

- dingo-operator runs Dingo nodes from `DingoNode` resources.
- The dingonodes Helm chart defines those resources from one values file per
  network.
- Every private key lives in git as a SOPS-encrypted file and reaches the
  cluster as a Secret.
- Cold keys never reach the cluster. Operational certificates are issued from
  them on an offline machine, and the operator validates each new key bundle
  before it rolls a producer onto it.
- A Bursa KES agent with two replicas holds KES keys and signs block headers,
  so a producer never holds its KES key.

This page covers dingo-operator v0.6.0 (chart 0.10.0), the dingonodes chart
0.1.0, Bursa v0.26.0 (chart 0.0.16), and Dingo v0.94.2.

## How the parts connect

| Part | Role | Namespace in this guide |
| --- | --- | --- |
| dingo-operator | Turns each `DingoNode` into a StatefulSet, Services and NetworkPolicies, validates key Secrets, and reports when a KES key is due for renewal | `dingo-operator` |
| DingoNodes | Relays and block producers, one Helm release of the dingonodes chart per network | `dingo` |
| Bursa KES agent | Holds KES keys and signs headers for producers that connect to it | `bursa-kes-agent` |
| PostgreSQL | Keeps the KES agent's sealed keys and slot guard | your database |

A producer gets its KES key in one of two ways. Choose one per pool:

| | KES key in the keys Secret | KES key in the KES agent |
| --- | --- | --- |
| Where the KES key lives | The producer's keys Secret and the node's memory | The KES agent only |
| `rotation.mode` | `Assisted` | `Assisted` |
| Who rotates | You: a new KES key and certificate, issued offline, delivered in the keys Secret. See [Renew a KES key in the keys Secret](#renew-a-kes-key-in-the-keys-secret) | You, with the agent's control commands. See [Rotate the KES key](/guides/dingo-operator/001-sign-through-a-kes-agent/#rotate-the-kes-key) |
| Needs | The cold key, on an offline machine | The KES agent, and the cold key on an offline machine |

In `Assisted` mode the operator validates and rolls a certificate that you
deliver. It never issues one itself.

dingo-operator v0.6.0 also accepts `signingAgent` with `rotation.mode: Auto`,
when `controlClientCertSecretRef`, `serverSpkiSha256` and
`rotation.reloadInPlace` are set. The operator then rotates the key through
the agent's control role.

This guide does not use `Auto` rotation, with or without an agent. `Auto`
issues each new certificate through a cold signer. The Bursa signer issues an
operational certificate only for a KES verification key that its caller
configuration grants explicitly, in `opcerts[].kes_vkeys` (see the
[Bursa configuration reference](/guides/bursa/009-configuration-reference/#operational-certificate-signer-policy)).
dingo-operator v0.6.0 asks for a certificate for a newly generated KES key on
every issue, so no renewal can be granted. Use dingo-operator v0.7.0 or later
for `Auto` with the Bursa signer. When the grant refuses a key, the
`OpCertIssued` condition message names its verification key in hex, and each
retry offers that same key. List it in the caller's `opcerts[].kes_vkeys` and
the next retry issues the certificate. Until then, a local KES key waits as
`kes.pending.skey` in the keys Secret and does not trigger a rollout.

## Requirements

- A Kubernetes 1.30 or later cluster and Helm 3. The dingo-operator chart
  0.10.0 refuses to install on an older cluster: its `DingoNode` CRD relies on
  CRD validation ratcheting, which Kubernetes enables by default from 1.30.
- `sops` and `age` on the machine that deploys, and `openssl` for certificates.
- An offline machine with `sops` and `bursa`, for issuing operational
  certificates.
- A PostgreSQL server that the KES agent can reach over TLS. Bursa requires
  `sslmode=verify-full` for any database that is not on loopback, so you also
  need the CA that issued the server's certificate.
- Each pool's cold signing key, VRF signing key, and current operational
  certificate, as `cardano-cli` text envelopes.

## Set up SOPS

Use two age identities:

- A **deploy identity** decrypts the Secret manifests at deploy time. Keep it on
  the machine that deploys.
- An **offline identity** decrypts the cold keys and nothing else. Keep it only
  on the offline machine that issues operational certificates.

A deploy never decrypts a cold key, and no cold key reaches the cluster.

```sh
age-keygen -o deploy.txt
age-keygen -o offline.txt
age-keygen -y deploy.txt    # the deploy recipient
age-keygen -y offline.txt   # the offline recipient
```

Add a `.sops.yaml` at the root of the repository. SOPS uses the first rule that
matches, so keep the cold-key rule first:

```yaml
creation_rules:
  # Cold keys: whole file encrypted, readable only offline.
  - path_regex: cold-keys/.*\.enc\.json$
    age: age1<offline recipient>
  # Secret manifests: only the data is encrypted, so names stay readable.
  - path_regex: .*\.enc\.yaml$
    encrypted_regex: ^(data|stringData)$
    age: age1<deploy recipient>
```

Encrypt each pool's cold signing key into the cold-key folder, on the offline
machine:

```sh
sops encrypt --filename-override cold-keys/pool-a.skey.enc.json \
  pool-a-cold.skey > cold-keys/pool-a.skey.enc.json
```

Write each Secret as a manifest, then encrypt it in place. For example, the KES
agent's age identity, created in
[Deploy the Bursa KES agent](#deploy-the-bursa-kes-agent):

```sh
kubectl -n bursa-kes-agent create secret generic bursa-kes-agent-age \
  --from-file=identity.txt=kes-agent-age.txt \
  --dry-run=client -o yaml > bursa-kes-agent/bursa-kes-agent-age.enc.yaml
sops encrypt -i bursa-kes-agent/bursa-kes-agent-age.enc.yaml
```

Writing the manifest does not need the namespace. Applying it does, so apply
each Secret only after the section that creates its namespace. Apply a Secret
by decrypting it into `kubectl`:

```sh
sops decrypt bursa-kes-agent/bursa-kes-agent-age.enc.yaml \
  | kubectl apply --server-side --force-conflicts -f -
```

Use server-side apply. A client-side `kubectl apply` stores a copy of the
decrypted manifest in the `kubectl.kubernetes.io/last-applied-configuration`
annotation, where anyone who can read the object's metadata can see it.

The rest of this guide shows each Secret as a plain `kubectl` command. Encrypt
the output the same way, and apply it on every deploy, for example from a
Helmfile `presync` hook. Keep the producers' keys Secrets in `dingo/keys/`.

## Create the certificates

The link from producers to the KES agent is mutual TLS. The agent refuses a
producer without a client certificate that is pinned for its profile, and a
plain TCP link cannot admit a signing session. The producers also pin the
agent's server key. The commands below use ECDSA P-256 keys; any key type Go's
TLS 1.3 accepts works.

Create the CA, the agent's server certificate for its Service names, and the
producers' client certificate:

```sh
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes \
  -keyout kes-agent-ca.key -out kes-agent-ca.crt -days 3650 \
  -subj "/CN=bursa kes agent CA"

openssl req -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes \
  -keyout kes-agent.key -out kes-agent.csr -subj "/CN=bursa-kes-agent"
printf 'subjectAltName=DNS:bursa-kes-agent.bursa-kes-agent.svc,DNS:bursa-kes-agent.bursa-kes-agent.svc.cluster.local\nextendedKeyUsage=serverAuth\n' > server.ext
openssl x509 -req -in kes-agent.csr -CA kes-agent-ca.crt -CAkey kes-agent-ca.key \
  -CAcreateserial -days 825 -extfile server.ext -out kes-agent.crt

openssl req -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes \
  -keyout producer.key -out producer.csr -subj "/CN=dingo-producer"
printf 'extendedKeyUsage=clientAuth\n' > client.ext
openssl x509 -req -in producer.csr -CA kes-agent-ca.crt -CAkey kes-agent-ca.key \
  -CAcreateserial -days 825 -extfile client.ext -out producer.crt
```

This guide secures the link with TLS, a pinned server key, and a client
certificate:

- **Server certificate.** It names the agent's Service
  (`bursa-kes-agent.bursa-kes-agent.svc` and
  `bursa-kes-agent.bursa-kes-agent.svc.cluster.local`).
- **Client certificate.** The agent requires it, and admits a producer only
  when the certificate's key is in the profile's `sign_client_spki_sha256`.
- **Pin.** Required in this setup. With a pin, the node checks the agent's
  server key instead of a CA chain. Without one, Dingo verifies the agent's
  certificate against the system roots in its image, which do not include
  this guide's private CA, and dingo-operator v0.6.0 has no setting that adds
  one.

Compute the pin from the agent's server certificate, and each
`sign_client_spki_sha256` entry the same way from the producers' client
certificate:

```sh
openssl x509 -in kes-agent.crt -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | sha256sum
```

Keep the CA key offline. It does not belong in the cluster.

## Prepare PostgreSQL

Create the agent's namespace before creating its Secrets or installing its
chart:

```sh
kubectl create namespace bursa-kes-agent
```

Create a role and a database for the agent:

```sql
CREATE ROLE bursa_kes_agent LOGIN PASSWORD '<password>';
CREATE DATABASE bursa_kes_agent OWNER bursa_kes_agent;
```

The agent creates its own tables on first use. It reads its connection string
from a Secret and the database's CA from a mounted file, so the connection
string names that file:

```sh
kubectl -n bursa-kes-agent create secret generic bursa-kes-agent-store \
  --from-literal=dsn='postgres://bursa_kes_agent:<password>@<db host>:5432/bursa_kes_agent?sslmode=verify-full&sslrootcert=/etc/bursa/kes-agent/pg-ca/ca.crt' \
  --dry-run=client -o yaml
kubectl -n bursa-kes-agent create secret generic bursa-kes-agent-pg-ca \
  --from-file=ca.crt=db-ca.crt --dry-run=client -o yaml
```

The database CA is public, so its Secret does not need encrypting.

## Deploy the Bursa KES agent

The agent holds one KES key per pool profile. Its replicas share the keys and
one slot guard through PostgreSQL: each KES key is stored sealed to the
release's age identity, and the guard keeps two replicas from signing two
headers for one slot.

Create an age identity for the agent, and the Secrets it reads:

```sh
age-keygen -o kes-agent-age.txt
age-keygen -y kes-agent-age.txt   # goes into store.age_recipients below
kubectl -n bursa-kes-agent create secret tls bursa-kes-agent-tls \
  --cert=kes-agent.crt --key=kes-agent.key --dry-run=client -o yaml
kubectl -n bursa-kes-agent create secret generic bursa-kes-agent-client-ca \
  --from-file=ca.crt=kes-agent-ca.crt --dry-run=client -o yaml
kubectl -n bursa-kes-agent create secret generic bursa-kes-agent-age \
  --from-file=identity.txt=kes-agent-age.txt --dry-run=client -o yaml
```

Then install the chart in KES agent mode. Each profile carries the pool's cold
verification key in hex, such as the `cborHex` of its `cold.vkey`.

```yaml
# bursa-kes-agent.yaml
mode: kes-agent
replicaCount: 2
image:
  tag: "0.26.0"
podDisruptionBudget:
  enabled: true
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app.kubernetes.io/name: bursa
            app.kubernetes.io/instance: bursa-kes-agent
        topologyKey: kubernetes.io/hostname
# Send each producer to a ready replica near it.
service:
  trafficDistribution: PreferClose
kesAgent:
  config:
    kes_agent:
      attestation_provider: none
      store:
        type: postgres
        dsn_env: KESAGENT_PG_DSN
        age_recipients: ["age1<kes agent recipient>"]
      profiles:
        - name: pool-b
          cold_vkey_hex: "<pool-b cold verification key, hex>"
          system_start: "2022-10-25T00:00:00Z"
          slots_per_kes_period: 129600
          sign_client_spki_sha256:
            - "<pool-b producer client certificate pin>"
  tls:
    secretName: bursa-kes-agent-tls
    clientCASecretName: bursa-kes-agent-client-ca
  ageIdentity:
    secretName: bursa-kes-agent-age
    key: identity.txt
  extraEnv:
    - name: KESAGENT_PG_DSN
      valueFrom:
        secretKeyRef:
          name: bursa-kes-agent-store
          key: dsn
  extraVolumes:
    - name: pg-ca
      secret:
        secretName: bursa-kes-agent-pg-ca
  extraVolumeMounts:
    - {name: pg-ca, mountPath: /etc/bursa/kes-agent/pg-ca, readOnly: true}
```

```sh
helm install bursa-kes-agent oci://ghcr.io/blinklabs-io/helm-charts/charts/bursa \
  --version 0.0.16 -n bursa-kes-agent -f bursa-kes-agent.yaml
```

The `system_start` and `slots_per_kes_period` above are Preview's. Take both
from the network's Shelley genesis.

When a node can host only one agent replica, the rolling update has no room for
a surge pod. Set `updateStrategy.rollingUpdate` to `maxSurge: 0` and
`maxUnavailable: 1` to replace one replica at a time.

The agent copies its TLS key and age identity into memory when the pod starts,
so a changed Secret takes effect only after a restart:

```sh
kubectl -n bursa-kes-agent rollout restart deployment/bursa-kes-agent
```

## Install dingo-operator

The operator reads the keys Secret of every producer, and the client Secret
those producers name. Grant it read access only to those Secrets, by name.
With `Assisted` rotation it never writes a keys Secret, so leave
`rbac.keySecretsUpdate` at its default, `false`:

```yaml
# dingo-operator.yaml
rbac:
  keySecretsNamespaces: [dingo]
  # Every Secret the operator reads.
  readSecretNames:
    - pool-a-keys
    - pool-b-keys
    - kes-agent-client
```

```sh
kubectl create namespace dingo
helm install dingo-operator oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo-operator \
  --version 0.10.0 -n dingo-operator --create-namespace -f dingo-operator.yaml
kubectl label namespace dingo-operator \
  dingo.blinklabs.io/metrics=allowed dingo.blinklabs.io/node-to-client=allowed
```

The `dingo` namespace must exist first, because the chart creates the operator's
Role there. The NetworkPolicies the operator renders for a producer admit
metrics scrapes and node-to-client queries only from pods that carry those two
labels, in a namespace that carries them too. The operator reads each pool's
on-chain operational certificate counter over node-to-client.

## Create the producer Secrets

All of these live in the `dingo` namespace.

The producers' client certificate for the KES agent:

```sh
kubectl -n dingo create secret tls kes-agent-client \
  --cert=producer.crt --key=producer.key --dry-run=client -o yaml
```

One keys Secret per pool. Its contents depend on where the KES key lives:

- **KES key in the Secret:** `kes.skey`, `vrf.skey`, and the operational
  certificate for that KES key as `node.cert`.
- **KES key in the agent:** `vrf.skey` and the operational certificate the
  agent serves, as `node.cert`. Leave `kes.skey` out.

Apply both kinds on every deploy. After each renewal, commit the new files to
git. The operator validates the bundle and restarts the producer when it
changes.

For a new pool with its KES key in the Secret, either write the pool's current
KES key and certificate into the bundle, or issue a new pair as in steps 2 and
3 of [Renew a KES key in the keys Secret](#renew-a-kes-key-in-the-keys-secret).
Before the producer runs, the operator reports no KES period, so take the
current KES period from the current slot divided by the slots per KES period.
On the offline machine, write the bundle with all three files:

```sh
kubectl -n dingo create secret generic pool-a-keys \
  --from-file=kes.skey --from-file=vrf.skey --from-file=node.cert \
  --dry-run=client -o yaml > dingo/keys/pool-a-keys.enc.yaml
sops encrypt -i dingo/keys/pool-a-keys.enc.yaml
```

On the deploy machine, after committing it:

```sh
sops decrypt dingo/keys/pool-a-keys.enc.yaml \
  | kubectl apply --server-side --force-conflicts -f -
```

For a new pool with its KES key in the agent, complete
[Install the first KES key in the agent](#install-the-first-kes-key-in-the-agent)
before creating its keys Secret. That procedure produces the `node.cert` the
Secret requires. Then write the bundle without `kes.skey`:

```sh
kubectl -n dingo create secret generic pool-b-keys \
  --from-file=vrf.skey --from-file=node.cert \
  --dry-run=client -o yaml > dingo/keys/pool-b-keys.enc.yaml
sops encrypt -i dingo/keys/pool-b-keys.enc.yaml
sops decrypt dingo/keys/pool-b-keys.enc.yaml \
  | kubectl apply --server-side --force-conflicts -f -
```

## Define the DingoNodes

Use one release of the dingonodes chart per network, and keep shared settings
in a common values file:

```yaml
# dingo/defaults.yaml
defaults:
  spec:
    image:
      tag: "0.94.2"
    storageMode: core

# One PodMonitor per node, with the pod name as the instance label.
podMonitor:
  instanceFromPodName: true
  fallbackScrapeProtocol: PrometheusText0.0.4

# Admit Prometheus and the operator to each node's metrics port.
metricsNetworkPolicy:
  from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: monitoring
      podSelector:
        matchLabels:
          app.kubernetes.io/name: prometheus
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: dingo-operator
      podSelector:
        matchLabels:
          app.kubernetes.io/name: dingo-operator
```

The network file holds that network's defaults and its nodes. Each node's
`spec` is a `DingoNode` spec, merged over `defaults.spec`:

```yaml
# dingo/preview/values.yaml
defaults:
  spec:
    network: preview
    mithril:
      enabled: true
    persistence:
      size: 60Gi

nodes:
  preview-relay:
    spec:
      role: relay

  # KES key in the keys Secret, renewed offline.
  pool-a-producer:
    spec:
      role: blockProducer
      topology:
        relayRefs: [preview-relay]
      blockProducer:
        poolId: <pool-a pool id>
        keys:
          secretRef: pool-a-keys
        nodeToClient:
          enabled: true
        rotation:
          mode: Assisted
          renewBeforePeriods: 8

  # KES key in the agent.
  pool-b-producer:
    spec:
      role: blockProducer
      environment:
        # The agent profile this pool signs under.
        CARDANO_SHELLEY_KES_AGENT_PROFILE: pool-b
      topology:
        relayRefs: [preview-relay]
      blockProducer:
        poolId: <pool-b pool id>
        keys:
          secretRef: pool-b-keys
        nodeToClient:
          enabled: true
        rotation:
          mode: Assisted
        signingAgent:
          address: bursa-kes-agent.bursa-kes-agent.svc:9443
          serverSpkiSha256: <agent pin>
          clientCertSecretRef: kes-agent-client
```

```sh
helm install dingo-preview oci://ghcr.io/blinklabs-io/helm-charts/charts/dingonodes \
  --version 0.1.0 -n dingo -f dingo/defaults.yaml -f dingo/preview/values.yaml
```

`renewBeforePeriods: 8` sets the producer's `RotationDue` condition to `True`,
with reason `KESExpiringSoon`, when eight KES periods remain. With `Assisted`
rotation the operator renews nothing itself: that condition is the signal to
renew the key. Eight is also the default, so pool B reports the same
condition.

The operator runs only one producer per pool on a network, and scales any
other `DingoNode` for that pool to zero.

## Install the first KES key in the agent

The agent creates its KES keys; it cannot import one. For each agent pool,
generate a staged key in an agent pod, issue its operational certificate, and
install it, as described in
[Rotate the KES key](/guides/dingo-operator/001-sign-through-a-kes-agent/#rotate-the-kes-key).
Then put that certificate into the pool's keys Secret.

Issue each certificate for an agent pool with the cold key itself, decrypted
on the offline machine. Repeat these steps for every rotation.

Run the control commands in either replica. The key is sealed into PostgreSQL,
so the other replica loads it too, and both load it again after a restart:

```sh
kubectl -n bursa-kes-agent exec deploy/bursa-kes-agent -- \
  bursa kes-agent control --config /etc/bursa/kes-agent/config.yaml \
  --profile pool-b info
```

`info` reports `has_active_key: true` once the key is installed.

## Check the deployment

```sh
kubectl -n dingo get dingonodes
```

A producer shows phase `Forging` once it reaches the tip with valid
credentials, with its remaining KES periods and its certificate counter:

```
NAME              ROLE            NETWORK   PHASE     REMAINING-KES   OPCERT   KEYS
pool-a-producer   blockProducer   preview   Forging   61              1        True
preview-relay     relay           preview   Ready
```

`kubectl -n dingo describe dingonode pool-a-producer` lists the conditions
behind the phase. A producer whose keys Secret is wrong, or whose KES key is
due for renewal, reports it there.

## Renew a KES key in the keys Secret

Renew a pool whose KES key is in its keys Secret once its `RotationDue`
condition is `True`, and before `REMAINING-KES` reaches zero: the producer
stops forging when its certificate's KES periods run out. Steps 2 and 3 run on
the offline machine, in a new, empty directory, and need the pool's `vrf.skey`
there. Do the whole renewal in one sitting.

1. On the deploy machine, read the node's current KES period, the pool's
   on-chain certificate counter, and the `OnChainCounterAvailable` condition
   that records the operator's last read of that counter:

   ```sh
   kubectl -n dingo get dingonode pool-a-producer \
     -o jsonpath='{.status.kes.currentPeriod} {.status.opcert.onChainCounter} {.status.opcert.onChainCounterAt}{"\n"}'
   kubectl -n dingo get dingonode pool-a-producer \
     -o jsonpath='{range .status.conditions[?(@.type=="OnChainCounterAvailable")]}{.status} {.reason}: {.message}{"\n"}{end}'
   ```

   The status omits a counter of zero, so an empty counter does not say
   whether the read succeeded. The condition does:

   - `True` with reason `Observed`: the read at `onChainCounterAt` succeeded.
     The message states the counter, and an empty counter is 0: the pool has
     forged under a certificate with counter 0.
   - `False` with reason `PoolNotOnChain`: the read succeeded, and the chain
     has no counter for the pool, because it has not forged a block under any
     certificate yet.
   - `False` with any other reason, such as `QueryFailed`, `NodeNotReady` or
     `Disabled`: the operator could not read the counter. A counter and
     `onChainCounterAt` still shown are from an earlier read and can be behind
     the chain. Fix the cause the message names, and wait for `Observed` or
     `PoolNotOnChain` before you issue the certificate. The operator retries
     the read every few minutes. If the read cannot be restored before the
     KES periods run out, use the counter in the current `node.cert`, plus
     one when the pool has forged a block under that certificate.

2. On the offline machine, generate a new KES key pair as `kes.skey` and
   `kes.vkey`, and issue an operational certificate for `kes.vkey` with the
   decrypted cold key. Start it at the current KES period. The ledger accepts
   a counter equal to the pool's on-chain counter or one above it. Use one
   above, so 1 when the read recorded 0. When the pool has not forged a block
   since its current certificate was issued, that is the current
   certificate's counter again. When the condition reason is
   `PoolNotOnChain`, use the counter of the pool's current certificate:

   ```sh
   sops decrypt cold-keys/pool-a.skey.enc.json > cold.skey
   bursa cert op-cert --kes-vkey kes.vkey --cold-skey cold.skey \
     --counter <on-chain counter + 1> --kes-period <current period> \
     --out node.cert
   ```

3. Still on the offline machine, write the new `kes.skey` and `node.cert`,
   with the pool's `vrf.skey`, into the keys Secret manifest and encrypt it.
   Neither step needs the cluster, and SOPS encrypts to the deploy recipient
   in `.sops.yaml`:

   ```sh
   kubectl -n dingo create secret generic pool-a-keys \
     --from-file=kes.skey --from-file=vrf.skey --from-file=node.cert \
     --dry-run=client -o yaml > dingo/keys/pool-a-keys.enc.yaml
   sops encrypt -i dingo/keys/pool-a-keys.enc.yaml
   ```

   Then delete `cold.skey`, `kes.skey` and `vrf.skey`, so no key leaves the
   offline machine unencrypted, and commit the encrypted file.

4. On the deploy machine, apply the committed file:

   ```sh
   sops decrypt dingo/keys/pool-a-keys.enc.yaml \
     | kubectl apply --server-side --force-conflicts -f -
   ```

   The operator validates the new bundle, including the certificate's
   signature, pool, counter and KES period, and rolls the producer onto it. It
   refuses to roll onto a bundle that fails, and reports why in the `KeysValid`
   condition. Once the producer has restarted,
   `kubectl -n dingo get dingonodes` shows the new counter under `OPCERT` and
   the renewed periods under `REMAINING-KES`.

## Rotate a Secret

Renew the TLS certificates before they expire. Re-encrypt the new material
into the same file, apply it, and restart what reads it:

- **KES agent:** renew the certificate with the existing server private key so
  its SPKI pin does not change, then restart the Deployment. If the private key
  must change, compute the new pin first, update `serverSpkiSha256` in every
  affected `DingoNode`, and restart the agent only after its replacement TLS
  Secret and all new pins are in place. Producers may be unavailable during
  this coordinated rotation; never remove the pin to make them reconnect.
- **Producers:** the operator restarts a producer when its client certificate
  Secret changes.

A KES key stays sealed to the recipients listed when it was generated, and is
never sealed again. The stored copy can sign for every period the key covers,
so protect the database and its backups like the age identity itself. To
replace the age identity, add its recipient to `age_recipients`, rotate the KES
key so the new key is sealed to it, and only then give the agent the new
identity.
