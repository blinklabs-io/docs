---
title: Move a Dingo Chart Release to a DingoNode
description: Move a Dingo relay or block producer deployed with the dingo Helm chart to a dingo-operator DingoNode, keeping its chain database and its keys.
---

A node deployed with the `dingo` Helm chart can become a `DingoNode` without
syncing again. A `DingoNode` named after the chart's StatefulSet uses the same
StatefulSet name, the same `dingo-data` volume claim and the same Service names
as the chart, so it picks up the chain database the release already wrote.

This page covers dingo-operator v0.6.0 (chart 0.10.0), the dingo chart 0.5.0,
and Dingo v0.94.2. It moves one release at a time, relays first, then the block
producer. To build a new deployment instead, see
[Deploy Block Producers with SOPS and Bursa](/guides/dingo-operator/002-deploy-with-sops-and-bursa/).

## What carries over

For a release named `<release>` with no `fullnameOverride` and no
`nameOverride`, the chart names its StatefulSet `<release>` when the release
name contains `dingo`, and `<release>-dingo` otherwise. This page calls that
name `<name>`, and names the `DingoNode` `<name>` too.

| Chart object | Name | What happens to it |
| --- | --- | --- |
| StatefulSet | `<name>` | Replaced, or taken over. See [Choose a method](#choose-a-method). |
| Data volume claim | `dingo-data-<name>-0` | Kept. Helm does not own it, and the `DingoNode` named `<name>` mounts it. |
| Services | `<name>`, `<name>-relay`, `<name>-metrics`, `<name>-headless`, and `<name>-private` when `service.private.enabled` is set | Deleted by `helm uninstall`. The operator creates `<name>`, `<name>-relay`, `<name>-private`, `<name>-metrics` and `<name>-headless`. |
| NetworkPolicy | `<name>` | Deleted by `helm uninstall`. The operator creates its own. See [Network access changes](#network-access-changes). |
| Keys Secret | `<name>-keys`, when the release holds `blockProducer.keys` inline | Deleted by `helm uninstall`. Copy it first. |
| ServiceAccount, and the topology and readiness ConfigMaps when enabled | `<name>`, `<name>-topology`, `<name>-readiness` | Deleted by `helm uninstall`. The operator creates what it needs. |

Clients that use the chart's Service names keep resolving them, with two
exceptions:

- The operator's `<name>` Service is always `ClusterIP`. A release whose
  compatibility Service was a `NodePort` or `LoadBalancer`, through
  `service.compatibility.type` or `service.type`, loses that exposure. Publish
  the relay with `spec.relayService` instead.
- A `LoadBalancer` Service is deleted at uninstall and created again, so it
  gets a new load balancer. An address pinned with a provider annotation
  carries over through `spec.relayService.annotations`. One pinned with
  `service.relay.loadBalancerIP` has no counterpart.

A `DingoNode`'s `spec.role` cannot be edited after creation: the API server
refuses a change with `role is immutable`. Give a release with
`blockProducer.enabled: true` the role `blockProducer`, and any other release
the role `relay`, when you create the `DingoNode`.

## Requirements

- dingo-operator installed, with the `DingoNode` CRD. See
  [Install dingo-operator](/guides/dingo-operator/002-deploy-with-sops-and-bursa/#install-dingo-operator).
- `kubectl`, `helm`, and `jq`.
- A namespace that admits the `baseline` Pod Security Standard. The chart's
  pod runs entirely as a non-root user, but the operator's
  `data-volume-sticky-bit` init container runs as UID 0 with only
  `CAP_FOWNER`, and a namespace enforcing `restricted` refuses it. See
  [Data volume permissions](https://github.com/blinklabs-io/dingo-operator/blob/v0.6.0/README.md#data-volume-permissions).
- For a block producer, the pool ID, and access to the pool's keys from
  outside the release. See [Keep the keys](#keep-the-keys).
- To take over the StatefulSet rather than uninstall first, a release on dingo
  chart 0.4.32 or later, the first version with `statefulsetAnnotations`.

## Collect the release's settings

Read what the release was installed with, and what it created:

```sh
helm -n dingo get values <release> -a
helm -n dingo get manifest <release> | grep -E '^kind:|^  name:'
kubectl -n dingo get statefulset,pvc,svc -l app.kubernetes.io/instance=<release>
```

Carry these settings over to the `DingoNode` spec:

| Chart value | `DingoNode` field |
| --- | --- |
| `environment.CARDANO_NETWORK` (default `preview`) | `spec.network` |
| `image.repository`, `image.tag`, `image.digest`, `image.pullPolicy` | `spec.image.repository`, `tag`, `digest`, `pullPolicy`. With a digest, also set `spec.image.capabilityVersion` to the Dingo release the image contains, such as `0.94.2`: the CRD refuses a new digest without it |
| `replicaCount` (relays) | `spec.replicas` |
| `persistence.size`, `persistence.storageClass`, `persistence.accessMode` | `spec.persistence.size`, `storageClass`, `accessMode` |
| `resources`, `tolerations`, `affinity`, `podSecurityContext` | `spec.resources`, `spec.tolerations`, `spec.affinity`, `spec.podSecurityContext` |
| `mithril.resources` | No separate field. The operator's `mithril-sync` init container uses `spec.resources` |
| `extraPodLabels` | `spec.podLabels` |
| `mithril.enabled`, `aggregatorUrl`, `verifyCertificates` | `spec.mithril.enabled`, `aggregatorUrl`, `verifyCertificates` |
| `mithril.forceResync` | `spec.mithril.forceResync`. Leave it out: when `true` it deletes the database you are moving |
| `availability.drainDelaySeconds`, `availability.terminationGracePeriodSeconds` | `spec.drainDelaySeconds`, `spec.terminationGracePeriodSeconds`. The chart applies them only with `availability.enabled`. The operator's defaults are a 60-second grace period, and a 15-second drain for a relay and none for a producer |
| `availability.maxSlotLag` | `DINGO_HEALTH_READY_GAP_SLOTS` in `spec.environment`, which the operator passes through |
| `service.ports.relay`, when it is not `3001` | `spec.relayService.port` |
| `service.relay.type`, `annotations`, `externalTrafficPolicy`, `loadBalancerSourceRanges`, `nodePort`, `hostPort` | The fields of the same names under `spec.relayService`, with `type` one of `ClusterIP`, `NodePort` or `LoadBalancer` |
| `networkPolicy.relayIngressFrom` | `spec.relayService.ingressFrom` |
| `networkPolicy.privateIngressFrom` | `spec.apis.ingressFrom` for API ports. Node-to-client access uses a label; see [Network access changes](#network-access-changes) |
| `networkPolicy.metricsIngressFrom` | A label on each client; see [Network access changes](#network-access-changes) |
| `service.private.enabled`, on a block producer | `spec.blockProducer.nodeToClient.enabled`, which binds node-to-client to the pod network and opens it in the NetworkPolicy |
| `environment.DINGO_STORAGE_MODE` | `spec.storageMode` |
| `service.ports.utxorpc`, `blockfrost`, `mesh`, `kupo`, `bark`, `midnight`, or their `DINGO_*` port variables | `spec.apis.utxorpc`, `blockfrost`, `mesh`, `kupo`, `bark`, `midnight` |
| `apiTLS.existingSecret` | `spec.apis.utxorpcTLSSecretRef`, which needs `spec.apis.utxorpc`. The operator mounts the Secret at `/var/run/dingo-api-tls` instead of `/tls`, and sets `TLS_CERT_FILE_PATH` and `TLS_KEY_FILE_PATH` to the files there |
| `observability.tracing.*` | The fields of the same names under `spec.tracing` |
| `observability.otlp.endpoint`, `protocol`, `logs`, `metrics`, and `observability.resourceAttributes` | `spec.otlp.endpoint`, `protocol`, `logs`, `metrics`, `resourceAttributes` |
| `observability.otlp.headersSecret.name`, `key` | `spec.otlp.headersSecretRef.name`, `key` |
| `podMonitor.enabled`, and the `interval` of its endpoint | `spec.metrics.podMonitor.enabled`, `interval` |
| `blockProducer.existingSecret`, or the copy of `<name>-keys` | `spec.blockProducer.keys.secretRef` |
| `blockProducer.forgeSyncToleranceSlots`, `forgeStaleGapThresholdSlots`, `slotsPerKESPeriod`, `maxKESEvolutions` | The fields of the same names under `spec.blockProducer` |
| `topology.bootstrapPeers`, `useLedgerAfterSlot` | The fields of the same names under `spec.topology` |
| `topology.publicRoots` | `spec.topology.publicRoots`, flattened: list the `address` and `port` of each entry in each group's `accessPoints`. The operator renders them as one group with `advertise: false`, so a group's own `advertise` does not carry over |
| `topology.localRoots` | `spec.topology.relayRefs` for `DingoNode` relays in the namespace, and `externalRelays` for the rest, one entry per access point, each with its own `valency`, `trustable` and `advertise` |
| Other `environment` entries | `spec.environment`. Leave out `CARDANO_NETWORK`, which `spec.network` sets, and `CARDANO_DATABASE_PATH`, which the operator sets to `/data`: an entry here overrides the operator's value. Leave out `CARDANO_PRIVATE_BIND_ADDR` too, and use `nodeToClient.enabled`: the operator's NetworkPolicy opens port 3002 only from that field. `CARDANO_PORT`, `CARDANO_PRIVATE_PORT`, `CARDANO_METRICS_PORT` and `DINGO_HEALTH_PORT` are rejected unless they equal the operator's ports: 3001 (or `relayService.port`), 3002, 12798 and 12799. Leave out `TLS_CERT_FILE_PATH` and `TLS_KEY_FILE_PATH`: with `utxorpcTLSSecretRef` set, the operator rejects any value other than its own. Keep `DINGO_API_TLS_MODE`, and in every other entry that names a file under `/tls/`, such as `DINGO_API_TLS_CERT_FILE_PATH` and `DINGO_API_TLS_KEY_FILE_PATH`, change `/tls/` to `/var/run/dingo-api-tls/` |

These have no counterpart: node-to-client access over the pod network on a
relay, `apiTLS.existingSecret` without a UTxO RPC port, `minReadySeconds`,
`updateStrategy`, `automountServiceAccountToken`, `serviceAccount.annotations`,
`sidecars`, `blockProducer.podAnnotations`, `service.ports.private` and
`service.ports.metrics` other than 3002 and 12798, the session affinity and
annotations of the private, metrics and compatibility Services,
`podMonitor.extraLabels` and `podTargetLabels`, and the other `availability`
and `mithril` keys. A release that relies on one of them needs a different
plan.

Check three things before you go on:

- **The network matches.** The chart labels the claim with
  `cardano_network`. The operator mounts a retained claim only when that label
  equals `spec.network`, and refuses to create the StatefulSet otherwise. List
  the claim's label, and the volume behind it, and keep the volume name for the
  [checks afterwards](#check-the-move):

  ```sh
  kubectl -n dingo get pvc dingo-data-<name>-0 \
    -L cardano_network -o wide
  ```

- **The size matches.** A claim template is immutable, so the claim keeps its
  size. Set `spec.persistence.size` to the claim's current size or larger.
  Growing it later expands the claim. See
  [Storage operations](https://github.com/blinklabs-io/dingo-operator/blob/v0.6.0/README.md#storage-operations).
- **The data path is `/data`.** The operator mounts the volume at `/data`, the
  chart's default `environment.CARDANO_DATABASE_PATH`. A release that changed
  that path is not covered here.

With `spec.mithril.enabled` at its default, `true`, the operator's
`mithril-sync` init container finds the chart's `metadata.sqlite` without the
operator's own bootstrap markers, logs that it is adopting the pre-existing
database as complete, and starts the node without a Mithril bootstrap. It does
not check that the chart's own bootstrap finished: move only a node that is
serving at the tip. With `spec.mithril.enabled: false` the init container is
not rendered.

## Keep the keys

Skip this section for a relay.

A release that holds its keys inline in `blockProducer.keys` owns the Secret
`<name>-keys`, and `helm uninstall` deletes it. A release that uses
`blockProducer.existingSecret` does not own its Secret, so uninstalling it does
not delete that Secret.

The operator accepts `node.cert` as well as `opcert.cert`, and `bls.skey` as
well as `vote.skey`, so a chart keys Secret works unchanged. If the release set
`kesKey`, `opCertKey`, `vrfKey` or `blsKey` to other names, rename those
entries in the copy to `kes.skey`, `node.cert`, `vrf.skey` and `bls.skey`.

A release that uses `blockProducer.existingSecret` can point
`keys.secretRef` at that Secret directly when its entries have the names above,
and skip steps 1 and 2. To rename entries, copy it as in step 1, with its name
in place of `<name>-keys`, and rename the entries in the copy.

1. Copy the chart's Secret to a Secret that the release does not own, under a
   different name. The `jq` filter keeps the type and the data and drops the
   rest of the metadata, including Helm's labels and annotations, and
   `kubectl create` refuses to overwrite an existing Secret:

   ```sh
   kubectl -n dingo get secret <name>-keys -o json \
     | jq '{apiVersion, kind, type, metadata: {name: "pool-a-keys"}, data}' \
     | kubectl -n dingo create -f -
   ```

   If you keep the keys encrypted in git, create `pool-a-keys` from there
   instead. See [Set up SOPS](/guides/dingo-operator/002-deploy-with-sops-and-bursa/#set-up-sops).

2. Confirm the copy holds the same entries, and that it is not part of the
   release:

   ```sh
   kubectl -n dingo get secret pool-a-keys -o json | jq '.data | keys'
   helm -n dingo get manifest <release> | grep -c 'pool-a-keys'
   ```

   The keys list shows `kes.skey`, `node.cert` and `vrf.skey`, and `bls.skey`
   if the release had one. The count is `0`.

3. Let the operator read the Secret. If the operator release sets
   `rbac.readSecretNames`, add the Secret's name to it. An empty
   `rbac.keySecretsNamespaces` grants access only in the operator's own
   namespace. If the node's namespace is another one, list it there, along
   with every other namespace that holds block producers, the operator's own
   included when it holds one. Then upgrade the operator release. See
   [Install dingo-operator](/guides/dingo-operator/002-deploy-with-sops-and-bursa/#install-dingo-operator).

Run only one producer for a pool at a time. Within a namespace, the operator
runs one producer per pool and scales any other `DingoNode` for that pool to
zero. It does not know about a chart release, so two nodes forging for one pool
is possible while a chart pod and a `DingoNode` pod both run. Both methods below
leave a single pod at each step.

## Check the node before the move

Record the state to compare with afterwards. Check that the pod is ready, and
that the node is at the tip of the chain:

```sh
kubectl -n dingo get pod <name>-0
```

With `availability.enabled` set, the chart's readiness probe requests
`/readyz` on `availability.healthPort` (default `12799`) and then checks the
node's listener ports. Dingo's `/readyz` requires the configured tip gap and a
ready database, and for a block producer also a running forger with usable
credentials. See the [Dingo quick start](/guides/dingo/002-quick-start-overview/).
Without `availability.enabled`, a ready pod says only that the container is
running, so confirm the tip, and for a producer that it is forging, from your
own monitoring. Write down the tip slot you see, to compare with it afterwards.
Do not move a node that is not ready and at the tip: you could not tell
afterwards whether the move broke it.

## Move the relays first

`spec.topology.relayRefs` names `DingoNode` relays in the same namespace, and a
producer's NetworkPolicy admits node-to-node traffic only from the pods of those
`DingoNode`s and from `spec.relayService.ingressFrom`. Move every relay of a
producer before the producer itself, one release at a time, with either method
below.

While a relay has moved and its producer has not, the producer is still a chart
release. Its NetworkPolicy admits the sources in its
`networkPolicy.relayIngressFrom`. The operator's relay pod carries
`app.kubernetes.io/name: dingo`, `app.kubernetes.io/instance: <name>`,
`dingo.blinklabs.io/node: <name>`, `cardano_network` and
`cardano_service: dingo`, and not the chart's `helm.sh/chart`,
`app.kubernetes.io/version` or `app.kubernetes.io/managed-by: Helm` labels.
Check that those sources still select the new relay pod.

## Choose a method

Both methods keep the data volume, and both stop the pod once. They differ in
how long the node is unreachable.

| | Uninstall, then create | Take over the StatefulSet |
| --- | --- | --- |
| Works for | Any release name | A release whose name contains `dingo`, on chart 0.4.32 or later |
| The pod | Stops at uninstall, and starts again once the `DingoNode` exists | Keeps running until the operator rolls it once |
| Through Services | Unreachable from the uninstall until the `DingoNode`'s pod is ready | The same: uninstall deletes the chart's Services, and the operator's Services select only its own pods |
| NetworkPolicy | No pod runs between the uninstall and the `DingoNode`'s pod | No policy selects the running pod from the uninstall until it rolls |
| Needs | Nothing extra | A `helm upgrade` first, to keep the StatefulSet |

The takeover needs the StatefulSet's selector to match the pod labels the
operator renders. The chart's selector sets `app.kubernetes.io/instance` to the
release name, and the operator sets it to the `DingoNode` name, so the two match
only when the release name equals the StatefulSet name. A release whose
StatefulSet is `<release>-dingo` does not match, and the operator refuses it
with `StatefulSetSelectorMismatch`. Use the first method for it.

### Uninstall, then create

1. Uninstall the release, and wait for its pod to go. Helm does not own the data
   volume claim, so the claim stays:

   ```sh
   helm -n dingo uninstall <release>
   kubectl -n dingo wait --for=delete pod/<name>-0 --timeout=10m
   kubectl -n dingo get pvc dingo-data-<name>-0
   ```

   The node is down from here until the `DingoNode` has a ready pod. Waiting for
   the pod keeps a producer from running beside its replacement.

2. Create the `DingoNode`, named `<name>`, with the settings you collected.
   See [Write the DingoNode](#write-the-dingonode).

### Take over the StatefulSet

The order matters. The release must stop owning the StatefulSet before the
`DingoNode` exists, or `helm uninstall` deletes it.

1. Keep the StatefulSet through a `helm upgrade` of the release, not by
   annotating the live object. Helm reads the annotation from the stored
   release manifest when it uninstalls, so an annotation on the live object
   alone does not stop the deletion. The pod template carries the chart
   version, so set `updateStrategy` to `OnDelete` in the same upgrade, and the
   upgrade does not restart the pod:

   ```yaml
   # keep-statefulset.yaml
   statefulsetAnnotations:
     helm.sh/resource-policy: keep
   updateStrategy:
     type: OnDelete
   ```

   On a release already on chart 0.4.32 or later, keep its chart version:

   ```sh
   helm -n dingo upgrade <release> <chart> --version <the version you run> \
     --reuse-values -f keep-statefulset.yaml
   ```

   On an older release, the upgrade must move it to 0.4.32 or later. Use
   `--reset-then-reuse-values` in place of `--reuse-values`, so the values the
   newer chart added take its defaults.

2. Confirm the annotation is in the release manifest, on the StatefulSet:

   ```sh
   helm -n dingo get manifest <release> | grep -B8 'resource-policy'
   ```

3. Uninstall the release, and confirm the StatefulSet still exists:

   ```sh
   helm -n dingo uninstall <release>
   kubectl -n dingo get statefulset <name>
   ```

   Helm removes the chart's other objects: the Services, the NetworkPolicy, the
   ServiceAccount and the ConfigMaps the pod template mounts. The running pod
   keeps working, but a pod recreated from the kept template cannot start, so
   create the `DingoNode` straight away.

4. Create the `DingoNode`, named `<name>`. See
   [Write the DingoNode](#write-the-dingonode).

The operator takes over the StatefulSet: it becomes the `DingoNode`'s
StatefulSet, with its pod template replaced, its update strategy set back to
`RollingUpdate`, and its `dingo-data` claim template kept. Replacing the
template rolls the pod once. While a block producer's keys Secret is missing
or refused, the operator keeps the live pod template, so the chart's pod keeps
running until the keys validate.

Until the pod rolls, no NetworkPolicy selects it. Uninstall deletes the chart's
policy, and the operator's policy selects pods by the
`dingo.blinklabs.io/node` label, which the chart's pod does not carry. A
release with `service.private.enabled` serves node-to-client on the pod network
for that whole time. Grant the operator read access to the keys Secret before
the uninstall, and check that `KeysValid` is `True` right after you create the
`DingoNode`, so the window lasts only for the roll. The first method has no such
window, because no pod runs between the uninstall and the `DingoNode`'s pod.
Use the first method for a release with `service.private.enabled` or an API
port, whose private listeners would otherwise be reachable by any pod in the
cluster during the window.

If you create the `DingoNode` before the uninstall, and without `keep`, Helm
deletes the StatefulSet at uninstall. A chart-generated keys Secret is deleted
too, unless the same annotation is on it in the release manifest, so copy the
keys first.

See
[Storage operations](https://github.com/blinklabs-io/dingo-operator/blob/v0.6.0/README.md#storage-operations)
in the operator README, and `statefulsetAnnotations` in the
[dingo chart README](https://github.com/blinklabs-io/helm-charts/tree/main/charts/dingo).

## Network access changes

The operator renders an ingress NetworkPolicy for every node. The chart renders
one for a block producer, for a release with `service.private.enabled`, and for
one with `networkPolicy.enabled`. Prepare these before the move, so peers and
monitoring keep reaching the node. A CNI that enforces NetworkPolicy is needed
for them to take effect.

- **Peers.** A block producer admits node-to-node traffic only from the pods of
  the `DingoNode` relays in `spec.topology.relayRefs`, and from the sources in
  `spec.relayService.ingressFrom`. Admit a relay in another namespace, or an
  external source range, there. A relay admits node-to-node traffic from any
  source unless you set `spec.relayService.ingressFrom`.
- **Node-to-client.** Port 3002 is open only on a block producer with
  `spec.blockProducer.nodeToClient.enabled`, and only to clients labelled
  `dingo.blinklabs.io/node-to-client=allowed`, with their namespace labelled
  too when it is not the node's own. A relay's policy does not open it.
- **Metrics.** Label each scraping pod, Prometheus and the operator included,
  and its namespace when it is not the node's own,
  `dingo.blinklabs.io/metrics=allowed`. Without it, status and KES monitoring
  cannot scrape the node.
- **APIs.** With `spec.apis` ports set and `spec.apis.ingressFrom` empty,
  clients need `dingo.blinklabs.io/api=allowed`. Once `spec.apis.ingressFrom`
  lists peers, only clients matching one of them are admitted, and the label
  grants nothing.

## Write the DingoNode

Name it `<name>`, in the release's namespace.

A relay:

```yaml
# dingo-relay.yaml
apiVersion: dingo.blinklabs.io/v1alpha1
kind: DingoNode
metadata:
  name: preview-dingo
  namespace: dingo
spec:
  role: relay
  network: preview
  image:
    tag: "0.94.2"
  persistence:
    size: 60Gi
```

A block producer:

```yaml
# dingo-producer.yaml
apiVersion: dingo.blinklabs.io/v1alpha1
kind: DingoNode
metadata:
  name: pool-a-dingo
  namespace: dingo
spec:
  role: blockProducer
  network: preview
  image:
    tag: "0.94.2"
  persistence:
    size: 60Gi
  topology:
    relayRefs: [preview-dingo]
  blockProducer:
    poolId: <pool id>
    keys:
      secretRef: pool-a-keys
    nodeToClient:
      enabled: true
    rotation:
      mode: Assisted
```

`spec.blockProducer.poolId` and `keys.secretRef` are required for a producer.
`rotation.mode` defaults to `MonitorOnly`, which validates the keys Secret and
reports a valid replacement without staging it. `Assisted` delivers a
replacement that you put in the Secret. Neither mode issues a certificate.
`nodeToClient.enabled` lets the operator read the pool's on-chain certificate
counter. See
[Define the DingoNodes](/guides/dingo-operator/002-deploy-with-sops-and-bursa/#define-the-dingonodes)
for the producer's other settings, including a KES agent.

Apply the file:

```sh
kubectl apply -f dingo-producer.yaml
```

## Check the move

Wait for the node, then compare with the state you recorded:

```sh
kubectl -n dingo get dingonodes
kubectl -n dingo describe dingonode <name>
```

A relay shows phase `Ready` once its StatefulSet is ready. A producer shows
`Forging` once it is ready and reports remaining KES periods. Phase `Degraded`
covers a ready pod whose ledger pipeline is wedged or whose keys are refused,
and a node the operator refuses to reconcile, such as one with a StatefulSet
selector mismatch. Then check each of these:

- **The conditions.** `Ready`, `StorageReady` and `LedgerPipelineHealthy` are
  `True`, and `Degraded` is not. A producer's `KeysValid` is `True`. Read the
  condition message when one is not. `StatefulSetSelectorMismatch` means the
  selector did not match, and the chart's pod keeps running unchanged.
- **The tip advances.** Read it twice a minute apart. It is the slot the
  operator last observed:

  ```sh
  kubectl -n dingo get dingonode <name> -o jsonpath='{.status.tip.slot}{"\n"}'
  ```

  `LedgerPipelineHealthy` turns `False`, with reason `TipNotAdvancing`, when the
  slot stays unchanged for longer than the operator's `--tip-stall-threshold`,
  which defaults to `10m`.
- **The same volume.** The claim has the name and volume you recorded, so the
  node did not start from an empty database:

  ```sh
  kubectl -n dingo get pvc dingo-data-<name>-0 -o wide
  ```

- **The Services.** `kubectl -n dingo get svc` lists the Services under the
  chart's names, and each has endpoints.
- **A producer's keys.** The `KEYS` column is `True`, and `OPCERT` shows the
  counter of the certificate in the keys Secret. The pool's next block is the
  real test: confirm the producer forges it, through your usual monitoring.

Do not run the chart's pod and the `DingoNode`'s pod for one pool at once.
