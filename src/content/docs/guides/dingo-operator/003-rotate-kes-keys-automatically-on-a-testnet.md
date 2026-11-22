---
title: Rotate KES Keys Automatically on a Testnet
description: Run a Dingo testnet block producer under dingo-operator that renews its own KES key and operational certificate, using the operator's in-cluster cold signer.
---

With rotation mode `Auto`, dingo-operator renews a block producer's KES key
without anyone touching a key. When the key is close to expiry, the operator
generates a new KES key, has a cold signer issue an operational certificate for
it, writes both into the keys Secret, and rolls the producer onto them.

This guide uses the operator's in-cluster cold signer, which reads the pool's
cold key from a Kubernetes Secret. That keeps the cold key in the cluster, so
the operator refuses it when `spec.network` is `mainnet` or `spec.networkMagic`
is `764824073`. Use this setup on a testnet only. On
mainnet, keep the cold key out of the cluster, as in
[Deploy Block Producers with SOPS and Bursa](/guides/dingo-operator/002-deploy-with-sops-and-bursa/).

This page covers dingo-operator v0.6.0 (chart 0.10.0).

## How the parts connect

| Part | Role | Configured with |
| --- | --- | --- |
| Keys Secret | Holds `kes.skey`, `vrf.skey` and the operational certificate. The operator rewrites `kes.skey` and the certificate at each rotation. | `spec.blockProducer.keys.secretRef` |
| Cold key Secret | Holds the pool's cold signing key as `cold.skey`. The operator only reads it. | `spec.blockProducer.rotation.coldSigner.secretRef` |
| Operator RBAC | Lets the operator update the keys Secret and read the cold key Secret. | `rbac` values of the dingo-operator chart |
| Node-to-client listener | Lets the operator read the pool's on-chain certificate counter, which each new certificate is issued from. | `spec.blockProducer.nodeToClient.enabled` |

## Requirements

- **A testnet.** The operator refuses the `secret` cold signer when
  `spec.network` is `mainnet` or `spec.networkMagic` is `764824073`.
- **A pool that forges a block before its first rotation is due.** Auto
  rotation issues each certificate from the pool's on-chain counter, and the
  chain has no counter for a pool that has not forged under an operational
  certificate. The first certificate, which you deliver in the keys Secret
  below, does not need one. A rotation that comes due before the pool has
  forged is refused with `OnChainCounterUnknown`.
- **The pool's keys as `cardano-cli` text envelopes:** the cold signing key, the
  VRF signing key, a KES signing key, and an operational certificate issued
  for that KES key by the cold key. The certificate must be current: the
  operator validates it as it does any delivered bundle, including its
  signature, pool, counter and KES period.
- **A node that can reach the chain.** The operator reads the on-chain counter
  from the node over node-to-client, so the node must be running and synced.
- A Kubernetes cluster and Helm 3.
- A single-pool node. The operator does not support `Auto` with
  `spec.blockProducer.pools`. This guide keeps the KES key in the keys Secret
  and sets no `signingAgent`.

## Create the Secrets

Create both Secrets in the namespace where the `DingoNode` will run. The
examples use `dingo-testnet`.

The keys Secret holds `kes.skey`, `vrf.skey`, and the certificate as
`opcert.cert`. The operator also accepts the name `node.cert`, which the Dingo
Helm chart uses. A Secret may hold both names only if their contents are
identical. The cold key Secret holds `cold.skey`, a `cardano-cli` text
envelope whose type begins with `StakePoolSigningKey`.

```sh
kubectl create namespace dingo-testnet
kubectl -n dingo-testnet create secret generic producer-pool-cold \
  --from-file=cold.skey
kubectl -n dingo-testnet get secret producer-pool-keys >/dev/null 2>&1 || \
  kubectl -n dingo-testnet create secret generic producer-pool-keys \
    --from-file=kes.skey --from-file=vrf.skey --from-file=opcert.cert
```

Once both Secrets exist, delete the key files from the machine you ran these
commands on. Keep an offline backup of `cold.skey`: without the cold key, no
new certificate can be issued for the pool.

**Create the keys Secret once, outside every Helm release and GitOps
repository, and only when it is absent, as the command above does.** From the
first rotation on, the Secret in the cluster holds a newer KES key and
certificate than any copy you made. A Helm upgrade, a GitOps sync, or a
`kubectl apply` of the original manifest writes the old bundle back over the
rotated one. The operator then refuses it, because its certificate counter is
below the last one it accepted. See
[Recover from a rejected bundle](#recover-from-a-rejected-bundle).

## Install dingo-operator with Secret access

Auto rotation needs two things from the operator's RBAC: `update` on the keys
Secret, and `get` on the cold key Secret. Set them in the chart values:

```yaml
# dingo-operator.yaml
rbac:
  keySecretsNamespaces: [dingo-testnet]
  # Grants update on the Secrets in keySecretNames. Without it the operator
  # cannot write a rotated bundle.
  keySecretsUpdate: true
  # The only Secrets the operator may update. The chart refuses to render
  # when this is empty and keySecretsUpdate is true.
  keySecretNames:
    - producer-pool-keys
  # Every other Secret the operator reads. The Secrets in keySecretNames are
  # always readable, so only the cold key Secret is listed.
  readSecretNames:
    - producer-pool-cold
```

```sh
helm upgrade --install dingo-operator \
  oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo-operator \
  --version 0.10.0 -n dingo-operator --create-namespace -f dingo-operator.yaml
kubectl label namespace dingo-operator \
  dingo.blinklabs.io/metrics=allowed dingo.blinklabs.io/node-to-client=allowed
```

The `dingo-testnet` namespace must exist first, because the chart creates the
operator's Role there. The operator reads the on-chain counter over
node-to-client, and the NetworkPolicy it renders for the producer admits that
port only from pods that carry the `dingo.blinklabs.io/node-to-client=allowed`
label, in a namespace that carries it too. The chart's default pod labels
already include it, so the namespace label above is what is left to set.

If you leave `rbac.readSecretNames` empty, the operator may read every Secret
in the listed namespaces, and the cold key Secret needs no entry. The update
permission stays limited to `keySecretNames`.

## Define the DingoNode

```yaml
apiVersion: dingo.blinklabs.io/v1alpha1
kind: DingoNode
metadata:
  name: producer
  namespace: dingo-testnet
spec:
  role: blockProducer
  network: preview
  # Needed only for a network name the operator does not know. See below.
  # networkMagic: 2
  topology:
    relayRefs: [relay]
  blockProducer:
    poolId: <pool id, bech32 or hex>
    keys:
      secretRef: producer-pool-keys
    nodeToClient:
      enabled: true
    rotation:
      mode: Auto
      # Rotate when this many KES periods or fewer remain.
      renewBeforePeriods: 8
      coldSigner:
        type: secret
        secretRef: producer-pool-cold
      # Optional: load the new key into the running node instead of
      # restarting the pod.
      # reloadInPlace: true
```

`relayRefs` names a relay `DingoNode` in the same namespace, which this guide
assumes already exists.

The operator refuses the node, and reports why, when any of these is missing:

- `spec.blockProducer.poolId`, which must parse as a pool ID.
- `spec.blockProducer.nodeToClient.enabled: true`. This binds Dingo's
  node-to-client listener to every interface of the pod, so the operator can
  read the on-chain counter. Anything the NetworkPolicy admits can then reach
  that listener. On a cluster whose network plugin does not enforce
  NetworkPolicy, that is every pod.
- `coldSigner.type: secret` with `coldSigner.secretRef`.

`renewBeforePeriods` defaults to 8. It must be below the number of KES periods
a certificate covers, which is `maxKESEvolutions`, 62 unless you set it
otherwise. If it is not, the operator never issues a certificate, because every
new one would be due at once. `slotsPerKESPeriod` and `maxKESEvolutions` default
to 129600 and 62. Set them to your network's values if they differ.

### Network magic

The operator finds the on-chain counter by connecting to the node, and needs the
network magic to do so. It takes the magic from `spec.networkMagic` when that is
set, and otherwise looks the network name up among the networks it knows, such
as `preprod` and `preview`. For a name it does not know, set `spec.networkMagic`.
Without it the counter is never read, and every rotation is refused with
`OnChainCounterUnknown`. A network named `custom` needs `spec.networkMagic`
and `spec.configRef` in any case.

### Reload in place

By default the producer restarts onto each new key. With
`spec.blockProducer.rotation.reloadInPlace: true`, the operator validates the
bundle, approves its KES key and certificate, and a container beside Dingo
stages them into the node's key directory. Dingo then reloads them on its own.
It needs a Dingo version that reloads its credential files. If the node does
not report the new certificate counter within 10 minutes, the operator rolls the
pod as it would without the setting. Enabling or disabling `reloadInPlace` rolls
the pod once.

## Watch a rotation

```sh
kubectl -n dingo-testnet get dingonode producer -w
```

`REMAINING-KES` counts down as the node advances through KES periods, and
`OPCERT` shows the certificate counter the operator last accepted. A rotation
runs in this order:

1. The `RotationDue` condition becomes `True` with reason `KESExpiringSoon`,
   once `REMAINING-KES` is `renewBeforePeriods` or less.
2. The operator issues a bundle and writes it into the keys Secret. It records
   a Normal event with reason `OpCertIssued`, and sets the `OpCertIssued`
   condition to `True` with the new counter and start period.
3. The next reconcile validates the bundle, and the `KeysValid` condition stays
   `True`.
4. The pod restarts onto the bundle, or reloads it in place. `OPCERT` shows the
   new counter, `REMAINING-KES` rises, and `RotationDue` returns to `False`.

Read the conditions and the events with:

```sh
kubectl -n dingo-testnet get dingonode producer \
  -o jsonpath='{range .status.conditions[*]}{.type} {.status} {.reason}: {.message}{"\n"}{end}'
kubectl -n dingo-testnet events --for dingonode/producer
```

The counters are in `status.opcert`. `onChainCounter` is the highest counter the
chain has accepted for the pool, read at `onChainCounterAt`. `onDiskCounter` is
the counter the operator last accepted from the keys Secret, and
`loadedCounter` is the one the node reports using. After a rotation completes,
`onDiskCounter` and `loadedCounter` are both the new counter. The status omits
`onChainCounter` and `onDiskCounter` when they are 0. `loadedCounter` is absent
only until the node reports it, and a reported 0 is shown. With
`reloadInPlace`, `status.opcert.inPlaceReload` tracks the approved bundle, and the operator records a `KeysReloadedInPlace` event when
the node picks it up, or a `KeysReloadTimedOut` event when the pod is rolled
instead.

### When the operator does not issue

A rotation the operator declines to start sets `OpCertIssued` to `False` with
a reason, and records a Warning event with the same reason. It does not set
`Degraded`: the node keeps forging on its current key.

| Reason | Meaning and what to do |
| --- | --- |
| `OnChainCounterUnknown` | No fresh on-chain counter for this pool. Check that `nodeToClient.enabled` is `true`, that the node is running, that `OnChainCounterAvailable` is `True`, and that the network magic is known to the operator. See [Network magic](#network-magic). A pool that has never forged has no counter. |
| `KESPeriodUnknown` | The operator has not yet read the node's KES period. It clears once the node is scraped. |
| `RenewWindowTooLong` | `renewBeforePeriods` is not below the KES window. Lower it. |
| `KeysSecretUnavailable` | The operator cannot read the keys Secret. Check that it exists and is listed in `rbac.keySecretNames`. |
| `KeysSecretInvalid` | The keys Secret has no readable certificate. Check `opcert.cert` or `node.cert`. |
| `SecretUpdateFailed` | The operator may not write the keys Secret, or the Secret changed while it was being written. Check `rbac.keySecretsUpdate` and `rbac.keySecretNames`. |
| `ColdSignerUnavailable` | The operator could not read the cold key Secret, or it holds no valid `cold.skey`. Check `rbac.readSecretNames` and the envelope type. |
| `IssueFailed` | Generating the key or signing the certificate failed. The message names the cause. |
| `IssuedBundleRejected` | The bundle the operator issued failed its own validation, so it was not written. The message names the check. |

After a failure in `SecretUpdateFailed`, `ColdSignerUnavailable`, `IssueFailed` or
`IssuedBundleRejected`, the operator waits 10 minutes before it tries again.
That delay is kept in the operator's memory, so restarting the operator ends it.
The other refusals are re-evaluated on every reconcile.

## Recover from a rejected bundle

When the operator refuses the bundle in the keys Secret, it sets `KeysValid` to
`False` with reason `OpCertRejected` and `Degraded` to `True`, and records a
Warning event with the same reason. The message names the failed check. Typical
causes are a certificate counter below the on-chain counter or below the last
counter the operator accepted, an expired or not yet started KES period, a
certificate signed by a different cold key, and a keys Secret that was
overwritten with an older bundle.

The running node is not affected. It keeps the keys it already loaded, and the
operator holds the pod template with the message `pod template update held
until the keys Secret validates`, so other changes to the `DingoNode` wait too.
The node still ages toward KES expiry, so act before `REMAINING-KES` reaches
zero.

With `Auto`, the next rotation replaces a staged bundle that fails validation
instead of waiting on it. Recovery depends on whether a rotation is due:

- **`RotationDue` is `True`.** The operator issues a new bundle within one
  reconcile, or after the 10 minute delay if an earlier attempt failed. Watch
  `OpCertIssued` and `KeysValid`. If issuing is refused, fix the cause in the
  table above.
- **`RotationDue` is `False`.** Set `renewBeforePeriods` to the value
  `REMAINING-KES` shows, or higher but below the KES window, to make a rotation
  due now. If `REMAINING-KES` equals the KES window, no such value exists and
  the operator reports `RenewWindowTooLong`; a rotation becomes possible after
  one more KES period. The setting does not change the pod template, so it does
  not restart the node. Set it back afterwards.

Recover an overwritten Secret the same way, and then stop whatever wrote it.
Do not restore an older copy of the bundle by hand: its counter is below the
operator's, and the operator refuses it. If you must deliver a bundle yourself,
issue its certificate with a counter equal to or above the on-chain counter, as
described in
[Renew a KES key in the keys Secret](/guides/dingo-operator/002-deploy-with-sops-and-bursa/#renew-a-kes-key-in-the-keys-secret).

## Mainnet

The `secret` cold signer is refused when `spec.network` is `mainnet` or
`spec.networkMagic` is `764824073`, and the operator reports the refusal when
it validates the `DingoNode`. An opt-in for the `secret` signer on mainnet is
proposed in
[dingo-operator PR 207](https://github.com/blinklabs-io/dingo-operator/pull/207)
and is not part of v0.6.0. Do not rely on it until a release includes it.
