---
title: Deploy Block Producers with SOPS and Bursa
description: Run Dingo block producers on Kubernetes with dingo-operator, keep every key in git as SOPS-encrypted files, and sign through a Bursa signer and a highly available Bursa KES agent.
---

This guide builds a complete block-producer deployment on Kubernetes:

- dingo-operator runs Dingo nodes from `DingoNode` resources.
- The dingonodes Helm chart defines those resources from one values file per
  network.
- Every private key lives in git as a SOPS-encrypted file and reaches the
  cluster as a Secret.
- A Bursa signer issues operational certificates from SOPS-encrypted cold keys,
  so the operator can rotate KES keys on its own.
- A Bursa KES agent with two replicas holds KES keys and signs block headers,
  so a producer never holds its KES key.

This page covers dingo-operator v0.2.0 (chart 0.8.0), the dingonodes chart
0.1.0, Bursa v0.25.0 (chart 0.0.15), and Dingo v0.94.0.

## How the parts connect

| Part | Role | Namespace in this guide |
| --- | --- | --- |
| dingo-operator | Turns each `DingoNode` into a StatefulSet, Services and NetworkPolicies, validates key Secrets, and rotates KES keys | `dingo-operator` |
| DingoNodes | Relays and block producers, one Helm release of the dingonodes chart per network | `dingo` |
| Bursa signer | Holds pool cold keys and issues operational certificates for the operator over mTLS | `bursa-signer` |
| Bursa KES agent | Holds KES keys and signs headers for producers that connect to it over TLS | `bursa-kes-agent` |
| PostgreSQL | Keeps the signer's counter records, and the KES agent's sealed keys and slot guard | your database |

A producer gets its KES key in one of two ways. Choose one per pool:

| | KES key in the keys Secret | KES key in the KES agent |
| --- | --- | --- |
| Where the KES key lives | The producer's keys Secret and the node's memory | The KES agent only |
| `rotation.mode` | `Auto` | `Assisted` |
| Who rotates | The operator generates a KES key and asks the signer for its certificate | You, with the agent's control commands. See [Rotate the KES key](/guides/dingo-operator/001-sign-through-a-kes-agent/#rotate-the-kes-key) |
| Needs | The signer | The KES agent |

dingo-operator v0.2.0 refuses `signingAgent` together with `rotation.mode:
Auto`, because Auto writes the new KES key into the keys Secret, and a node
that signs through an agent never reads it.

## Requirements

- A Kubernetes cluster and Helm 3.
- `sops` and `age` on the machine that deploys, and `openssl` for certificates.
- A PostgreSQL server that the signer and the KES agent can reach over TLS.
  Bursa requires `sslmode=verify-full` for any database that is not on
  loopback, so you also need the CA that issued the server's certificate.
- Each pool's cold signing key, VRF signing key, and current operational
  certificate, as `cardano-cli` text envelopes.

## Set up SOPS

Use two age identities:

- A **deploy identity** decrypts the Secret manifests at deploy time. Keep it on
  the machine that deploys.
- A **signer identity** decrypts the cold keys and nothing else. It is given
  only to the Bursa signer, which decrypts the cold keys in memory.

A deploy never decrypts a cold key: the cold keys reach the cluster encrypted.
The cold-key files are also encrypted to the deploy identity, for the steps
that issue a certificate outside the signer. Run those on an offline machine.

```sh
age-keygen -o deploy.txt
age-keygen -o signer-age.txt
age-keygen -y deploy.txt       # the deploy recipient
age-keygen -y signer-age.txt   # the signer recipient
```

Add a `.sops.yaml` at the root of the repository. SOPS uses the first rule that
matches, so keep the cold-key rule first:

```yaml
creation_rules:
  # Cold keys: whole file encrypted, readable by the signer.
  - path_regex: bursa-signer/cold-keys/.*\.enc\.json$
    age: >-
      age1<deploy recipient>,
      age1<signer recipient>
  # Secret manifests: only the data is encrypted, so names stay readable.
  - path_regex: .*\.enc\.yaml$
    encrypted_regex: ^(data|stringData)$
    age: age1<deploy recipient>
```

Write each Secret as a manifest, then encrypt it in place:

```sh
kubectl -n dingo create secret generic pool-a-keys \
  --from-file=vrf.skey --from-file=node.cert \
  --dry-run=client -o yaml > dingo/keys/pool-a-keys.enc.yaml
sops encrypt -i dingo/keys/pool-a-keys.enc.yaml
```

Apply a Secret by decrypting it into `kubectl`:

```sh
sops decrypt dingo/keys/pool-a-keys.enc.yaml \
  | kubectl apply --server-side --force-conflicts -f -
```

Use server-side apply. A client-side `kubectl apply` stores a copy of the
decrypted manifest in the `kubectl.kubernetes.io/last-applied-configuration`
annotation, where anyone who can read the object's metadata can see it.

The rest of this guide shows each Secret as a plain `kubectl` command. Encrypt
the output the same way, and apply it on every deploy, for example from a
Helmfile `presync` hook.

## Create the certificates

The operator talks to the signer over mutual TLS, and producers talk to the
KES agent over TLS with a client certificate. Create one CA for each link. The
commands below use ECDSA P-256 keys; any key type Go's TLS 1.3 accepts works.

### The signer link

Create the CA, the signer's server certificate for its Service name, and the
operator's client certificate:

```sh
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes \
  -keyout signer-ca.key -out signer-ca.crt -days 3650 -subj "/CN=bursa signer CA"

openssl req -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes \
  -keyout signer.key -out signer.csr -subj "/CN=bursa-signer"
printf 'subjectAltName=DNS:bursa-signer.bursa-signer.svc,DNS:bursa-signer.bursa-signer.svc.cluster.local\nextendedKeyUsage=serverAuth\n' > server.ext
openssl x509 -req -in signer.csr -CA signer-ca.crt -CAkey signer-ca.key \
  -CAcreateserial -days 825 -extfile server.ext -out signer.crt

openssl req -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes \
  -keyout operator.key -out operator.csr -subj "/CN=dingo-operator"
printf 'extendedKeyUsage=clientAuth\n' > client.ext
openssl x509 -req -in operator.csr -CA signer-ca.crt -CAkey signer-ca.key \
  -CAcreateserial -days 825 -extfile client.ext -out operator.crt
```

The signer identifies a caller by its client certificate's first URI SAN, then
its first DNS SAN, then its CN. The operator certificate above has no SAN, so
its identity is `dingo-operator`.

### The KES agent link

Repeat the same steps with a second CA. Give the agent's server certificate
the agent's Service names (`bursa-kes-agent.bursa-kes-agent.svc` and
`bursa-kes-agent.bursa-kes-agent.svc.cluster.local`), and issue one client
certificate for the producers.

Producers pin the agent's server key instead of trusting a CA. Compute the pin
from the agent's server certificate:

```sh
openssl x509 -in kes-agent.crt -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | sha256sum
```

Keep both CA keys offline. Neither belongs in the cluster.

## Prepare PostgreSQL

Create a role and a database for each component:

```sql
CREATE ROLE bursa_signer LOGIN PASSWORD '<password>';
CREATE DATABASE bursa_signer OWNER bursa_signer;
CREATE ROLE bursa_kes_agent LOGIN PASSWORD '<password>';
CREATE DATABASE bursa_kes_agent OWNER bursa_kes_agent;
```

Each component creates its own tables on first use. Each one reads its
connection string from a Secret and the database's CA from a mounted file, so
the connection string names that file:

```sh
kubectl -n bursa-signer create secret generic bursa-signer-watermark \
  --from-literal=dsn='postgres://bursa_signer:<password>@<db host>:5432/bursa_signer?sslmode=verify-full&sslrootcert=/etc/bursa/signer/pg-ca/ca.crt' \
  --dry-run=client -o yaml
kubectl -n bursa-signer create secret generic bursa-signer-pg-ca \
  --from-file=ca.crt=db-ca.crt --dry-run=client -o yaml
```

Create `bursa-kes-agent-store` and `bursa-kes-agent-pg-ca` the same way in the
`bursa-kes-agent` namespace, with the path `/etc/bursa/kes-agent/pg-ca/ca.crt`.
The database CA is public, so its Secret does not need encrypting.

## Deploy the Bursa signer

The signer loads every cold key at startup and issues an operational
certificate only for a key and caller that its policy allows.

Encrypt each pool's cold signing key into the cold-key folder. The signer reads
SOPS-encrypted `cardano-cli` envelopes in JSON format:

```sh
sops encrypt --filename-override bursa-signer/cold-keys/pool-a.skey.enc.json \
  pool-a-cold.skey > bursa-signer/cold-keys/pool-a.skey.enc.json
```

Deliver the cold keys to the cluster still encrypted. Do not run `sops
decrypt` on them: the Secret holds the files exactly as committed. Each file
name in the Secret must end in `.json` and must not contain `@`:

```sh
kubectl -n bursa-signer create secret generic bursa-signer-cold-keys \
  --from-file=pool-a.json=bursa-signer/cold-keys/pool-a.skey.enc.json \
  --dry-run=client -o yaml | kubectl apply --server-side --force-conflicts -f -
```

The signer also needs these Secrets, encrypted as described above:

```sh
kubectl -n bursa-signer create secret tls bursa-signer-tls \
  --cert=signer.crt --key=signer.key --dry-run=client -o yaml
kubectl -n bursa-signer create secret generic bursa-signer-client-ca \
  --from-file=ca.crt=signer-ca.crt --dry-run=client -o yaml
kubectl -n bursa-signer create secret generic bursa-signer-age \
  --from-file=keys.txt=signer-age.txt --dry-run=client -o yaml
```

Then install the `bursa` chart in signer mode. Get each pool's cold key hash,
the pool ID in hex, from `cardano-cli stake-pool id --output-format hex`:

```yaml
# bursa-signer.yaml
mode: signer
replicaCount: 2
image:
  tag: "0.25.0"
podDisruptionBudget:
  enabled: true
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app.kubernetes.io/name: bursa
            app.kubernetes.io/instance: bursa-signer
        topologyKey: kubernetes.io/hostname
signer:
  config:
    signer:
      # Client certificates are verified when presented. true would also
      # fail the kubelet's HTTPS probes, which send none.
      require_client_cert: false
      watermark:
        type: postgres
        dsn_env: SIGNER_WATERMARK_DSN
        mode: enforce
      backends:
        - name: cold
          type: sops
          path: /etc/bursa/signer/sops-keys
      keys:
        - hash: "<pool-a cold key hash>"
          backend: cold
          allowed_requests: ["opcert"]
      callers:
        - subject: dingo-operator
          keys: ["<pool-a cold key hash>"]
  tls:
    secretName: bursa-signer-tls
    clientCASecretName: bursa-signer-client-ca
  sopsKeys:
    secretName: bursa-signer-cold-keys
  ageKey:
    secretName: bursa-signer-age
    key: keys.txt
  extraEnv:
    - name: SIGNER_WATERMARK_DSN
      valueFrom:
        secretKeyRef:
          name: bursa-signer-watermark
          key: dsn
  extraVolumes:
    - name: pg-ca
      secret:
        secretName: bursa-signer-pg-ca
  extraVolumeMounts:
    - {name: pg-ca, mountPath: /etc/bursa/signer/pg-ca, readOnly: true}
  networkPolicy:
    enabled: true
    from:
      - namespaceSelector:
          matchLabels:
            kubernetes.io/metadata.name: dingo-operator
```

```sh
helm install bursa-signer oci://ghcr.io/blinklabs-io/helm-charts/charts/bursa \
  --version 0.0.15 -n bursa-signer -f bursa-signer.yaml
```

Two replicas share the counter records in PostgreSQL, so either one can serve
a request. The operator sends the pool's on-chain counter with every request,
so a new signer issues the next counter without earlier records of its own.

The same cold key can serve a pool on several networks. Give it one backend
per network, each with its own `profile`, and keep that key in a folder of its
own: every backend loads every `*.json` file in its `path`. The operator
selects the network's backend with `coldSigner.profile`. See the
[signer runbook](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/runbook.md#sops)
for the details.

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
  tag: "0.25.0"
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
        - name: pool-a
          cold_vkey_hex: "<pool-a cold verification key, hex>"
          system_start: "2022-10-25T00:00:00Z"
          slots_per_kes_period: 129600
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
  --version 0.0.15 -n bursa-kes-agent -f bursa-kes-agent.yaml
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

The operator reads the keys Secret of every producer, and the client Secrets
those producers name. Grant it access only to those Secrets, by name:

```yaml
# dingo-operator.yaml
rbac:
  keySecretsNamespaces: [dingo]
  # Auto rotation writes the new KES key and certificate into the keys Secret.
  keySecretsUpdate: true
  keySecretNames:
    - pool-a-keys
    - pool-b-keys
  # Every other Secret the operator reads.
  readSecretNames:
    - bursa-signer-mtls
    - kes-agent-client
```

```sh
kubectl create namespace dingo
helm install dingo-operator oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo-operator \
  --version 0.8.0 -n dingo-operator --create-namespace -f dingo-operator.yaml
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

The operator's client certificate for the signer, with the CA that verifies
the signer:

```sh
kubectl -n dingo create secret generic bursa-signer-mtls \
  --from-file=tls.crt=operator.crt --from-file=tls.key=operator.key \
  --from-file=ca.crt=signer-ca.crt --dry-run=client -o yaml
```

The producers' client certificate for the KES agent:

```sh
kubectl -n dingo create secret tls kes-agent-client \
  --cert=producer.crt --key=producer.key --dry-run=client -o yaml
```

One keys Secret per pool. Its contents depend on where the KES key lives:

- **KES key in the Secret (`Auto`):** `kes.skey`, `vrf.skey`, and the
  operational certificate for that KES key as `node.cert`.
- **KES key in the agent (`Assisted`):** `vrf.skey` and the operational
  certificate the agent serves, as `node.cert`. Leave `kes.skey` out.

Apply these two kinds differently:

- Create an `Auto` keys Secret **once**, and never apply it again. Auto
  rotation writes each new `kes.skey` and `node.cert` into it, and applying the
  file from git would roll the producer back to an old KES key.
- Apply an `Assisted` keys Secret on every deploy. After each rotation, commit
  the new certificate to the file in git. The operator validates the bundle and
  restarts the producer when it changes.

For a new `Auto` pool, issue the first KES key and certificate yourself, on an
offline machine with the decrypted cold key; the operator rotates from there.
`kubectl create` refuses to replace an existing Secret, which keeps a later
deploy from rolling it back:

```sh
sops decrypt dingo/keys/pool-a-keys.enc.yaml | kubectl create -f -
```

## Define the DingoNodes

Use one release of the dingonodes chart per network, and keep shared settings
in a common values file:

```yaml
# dingo/defaults.yaml
defaults:
  spec:
    image:
      tag: "0.94.0"
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

  # KES key in the keys Secret, rotated by the operator.
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
          mode: Auto
          renewBeforePeriods: 8
          coldSigner:
            type: bursa
            endpoint: https://bursa-signer.bursa-signer.svc:8090
            mtlsSecretRef: bursa-signer-mtls
            coldKeyHash: <pool-a cold key hash>

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

`renewBeforePeriods: 8` starts a rotation when eight KES periods remain. Auto
requires `coldKeyHash` to equal the pool ID in hex. When the signer holds this
cold key under a profile, also set `coldSigner.profile`.

The operator runs only one producer per pool on a network, and scales any
other `DingoNode` for that pool to zero.

## Install the first KES key in the agent

The agent creates its KES keys; it cannot import one. For each agent pool,
generate a staged key in an agent pod, issue its operational certificate, and
install it, as described in
[Rotate the KES key](/guides/dingo-operator/001-sign-through-a-kes-agent/#rotate-the-kes-key).
Then put that certificate into the pool's keys Secret.

dingo-operator v0.2.0 calls the signer only for `Auto` rotation, so issue each
certificate for an agent pool with the cold key itself, decrypted on an
offline machine. Repeat these steps for every rotation.

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
behind the phase. A producer that cannot reach the signer, or whose keys
Secret is wrong, reports it there.

## Rotate a Secret

Renew the TLS certificates before they expire. Re-encrypt the new material
into the same file, apply it, and restart what reads it:

- **Signer and KES agent:** restart the Deployment. A rollout through Helm
  does not notice a changed Secret on its own. One way is a variable in
  `extraEnv` whose value you raise with every rotation.
- **Producers:** the operator restarts a producer when its client certificate
  Secret changes.

A KES key stays sealed to the recipients listed when it was generated, and is
never sealed again. The stored copy can sign for every period the key covers,
so protect the database and its backups like the age identity itself. To
replace the age identity, add its recipient to `age_recipients`, rotate the KES
key so the new key is sealed to it, and only then give the agent the new
identity.
