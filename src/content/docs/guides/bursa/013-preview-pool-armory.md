---
title: Preview Pool with a USB armory
description: Set up a Preview stake pool from scratch with Bursa and a USB armory Mk II signing device, on a local install, Docker, or Kubernetes.
---

# Preview Pool with Bursa and a USB armory

This guide takes a Preview stake pool from nothing to forging blocks. Bursa builds and submits the transactions. A USB armory Mk II with an NXP SE050 secure element holds the pool's cold key and owner key. Dingo runs the block producer as a local install, a Docker container, or a Kubernetes workload.

:::caution[Draft]
This guide describes work in progress. These are in open pull requests: the Bursa signer backend for the armory ([bursa#1125](https://github.com/blinklabs-io/bursa/pull/1125)), opcerts issued by the armory from the on-chain counter through that signer ([bursa#1124](https://github.com/blinklabs-io/bursa/pull/1124)), host authentication ([bursa#1123](https://github.com/blinklabs-io/bursa/pull/1123)) and firmware builds fixed to one network ([bursa#1121](https://github.com/blinklabs-io/bursa/pull/1121)).

The armory firmware and signing service ([bursa#1085](https://github.com/blinklabs-io/bursa/pull/1085)), profiles and the response binding in Bursa's signer ([bursa#1086](https://github.com/blinklabs-io/bursa/pull/1086)), `bursa tx build`, `bursa tx submit`, `bursa query` ([bursa#1105](https://github.com/blinklabs-io/bursa/pull/1105)) and `bursa key pool-owner` ([bursa#1111](https://github.com/blinklabs-io/bursa/pull/1111)) are on Bursa's `main` branch but not yet in a release, so build Bursa from `main`. Automatic opcert rotation is in the operator ([dingo-operator#101](https://github.com/blinklabs-io/dingo-operator/pull/101)) and the `dingo-operator` chart 0.3.0 ([helm-charts#532](https://github.com/blinklabs-io/helm-charts/pull/532)).

Steps marked **Not built yet** describe the intended flow. The [gaps](#what-is-not-built-yet) section lists them. Use Preview and test funds only.
:::

## How the pieces fit

Three places hold keys, and each holds only what it needs.

![The pool mnemonic on an offline machine derives the cold and owner keys, which are imported once into the SE050 on the USB armory. The host builds transactions with Bursa, the armory signs them over USB, and the host submits them to the node. The armory issues the operational certificate for the block producer, which holds the VRF and KES keys.](/bursa-armory-pool-overview.svg)

Photos and the board layout are on the [USB armory Mk II wiki](https://github.com/usbarmory/usbarmory/wiki).

| Place | Holds | Signs |
|---|---|---|
| Hardware wallet (pledge) | Payment key for the pledge funds | Spending the pledge funds |
| USB armory (SE050) | Pool cold key, owner stake key, device identity key | Pool registration, retirement, owner stake certificates, SPO votes, operational certificates |
| Block producer (Dingo) | KES key, VRF key, operational certificate | Block headers |

Any wallet can pay fees and deposits. A pool certificate needs witnesses from the cold key and the owners; it does not need the payer to be the pool. The armory never holds funds and never signs a spend.

The armory checks every request against a policy before it signs:

- A pool registration must name this pool's cold key as operator, exactly the device owner key as owner, and the reward account pinned when the device was provisioned.
- A retirement or SPO vote must be for this pool.
- Owner certificates may only register the owner stake key and delegate it to this pool.
- An operational certificate gets the next counter after the one on chain (see [Rotating the KES key](#rotating-the-kes-key)).

Every signature comes back with a second signature, from the same key, over the complete request. Bursa checks it, so an untrusted host between Bursa and the device cannot replay a response or swap the profile.

### Terms

- **Profile:** one pool on one network, for example `mypool@preview`. It names the cold key, the owner key, the pinned reward account and the opcert floor. Every signing request names a profile.
- **Slot:** where a profile is stored on the device, 0 to 31. Each slot holds one profile and its owner key for good.
- **Cold key object:** the SE050 object holding a cold key, `0x20e50010` to `0x20e5001f`.
- **Identity key:** a device key that signs the key inventory, so the host can tell it is talking to the right device.
- **Opcert counter:** the issue number in an operational certificate. The chain keeps the last one it saw for each pool.
- **Floor:** the highest on-chain counter the device has been told. It refuses requests that report a lower one.

## Before you start

- A USB armory Mk II with an SE050, and a host with a free USB port
- Bursa from its `main` branch until the next release: `go install github.com/blinklabs-io/bursa/cmd/bursa@main` (Go 1.26.10 or later)
- `armory-pool` and `opcert-check`, the host tools that talk to the armory. Build them from the Bursa repository: `cd armory && go build ./cmd/armory-pool ./cmd/opcert-check`
- `armory-boot-usb`, to load the firmware: `go install github.com/usbarmory/armory-boot/cmd/armory-boot-usb@latest`. Without a udev rule for the board, run it with `sudo`.
- `jq` and `curl`
- A synced Preview node whose socket Bursa can reach, for Steps 4 and 5. Start it as a relay early ([Step 3](#step-3-run-the-node) shows the three setups) and set `SOCKET` to its socket path. `bursa query pool` uses the `GetPoolState` query, which cardano-node answers and Dingo answers from v0.90.0.
- A payer wallet Bursa can sign with. `bursa wallet create --output payer` writes `payer/payment.skey` and the address `payer/payment.addr`. Fund that address from the [Cardano testnet faucet](https://docs.cardano.org/cardano-testnets/tools/faucet): a new pool needs at least the 500 ada pool deposit, two 2 ada stake key deposits and fees.
- A hardware wallet for the pledge funds
- Paper, or a metal backup, for two mnemonics

Commands run in three places:

- **Offline machine:** the pool mnemonic, key derivation and armory provisioning (Steps 1 and 2). Plug the armory in here to provision it.
- **Host:** online, with the node socket and the payer wallet. It builds, signs with the armory and submits (Steps 4 and 5). Plug the armory in here to sign.
- **Block producer:** the node, `vrf.skey`, `kes.skey` and `node.cert` (Step 3).

Only verification keys, transaction files, witnesses and certificates move to the host. The cold and owner signing keys never leave the offline machine.

Set the network once for Bursa:

```sh
export CARDANO_NETWORK=preview
```

Bursa defaults to `mainnet` when `CARDANO_NETWORK` is unset.

## Step 1: Two mnemonics

Use two separate recovery phrases.

1. **Pledge mnemonic, on the hardware wallet.** It holds the payment key for the pledge funds. It never touches the armory or the block producer.
2. **Pool mnemonic, written down offline.** It derives the pool cold key and the owner key. Both are imported into the armory, and the paper copy is the recovery path.

![A paper slip holds the 24-word pool mnemonic. Bursa derives the pool cold key and the owner key, which are imported into the armory; the reward key, kept offline; and the VRF and KES keys, which go to the block producer.](/bursa-pool-mnemonic-slip.svg)

One slip restores every key the pool needs:

| Key | Path | Command | Goes to |
|---|---|---|---|
| Pool cold key | `m/1853'/1815'/0'/0'` ([CIP-1853](https://cips.cardano.org/cip/CIP-1853)) | [`bursa key pool-cold`](/guides/bursa/008-key-commands/#pool-cold-key) | Armory |
| Owner key | `m/1852'/1815'/0'/2/0` ([CIP-1852](https://cips.cardano.org/cip/CIP-1852)) | `bursa key pool-owner` ([bursa#1111](https://github.com/blinklabs-io/bursa/pull/1111)) | Armory |
| Reward key | `m/1852'/1815'/1'/2/0` | [`bursa key stake`](/guides/bursa/008-key-commands/#stake-key) | Offline |
| VRF key | Bursa seed rule | [`bursa key vrf`](/guides/bursa/008-key-commands/#vrf-verifiable-random-function-key-pair) | Block producer |
| KES keys | Bursa seed rule, one `--index` per rotation | [`bursa key kes`](/guides/bursa/008-key-commands/#kes-key-pair) | Block producer |

The words come from [`bursa wallet create`](/guides/bursa/003-commands/#use-command-line-to-create-a-wallet-and-output-wallet-files), a 24-word [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic. Bursa turns the words into a root key as [CIP-3](https://cips.cardano.org/cip/CIP-3) describes (Icarus), then derives each key along its path.

Losing the cold key loses the pool: a pool ID is the hash of its cold key. The pool mnemonic restores the cold key on a replacement device, or in any wallet that follows CIP-1853.

The owner can also be replaced without the old owner's signature. A pool registration needs witnesses from the cold key and from the owners named in that certificate, not from the owners already on chain. So the cold key and a new owner can re-register the pool without the old owner. Three things follow:

- The armory accepts only its own owner key as owner, so the new owner comes from a new profile on a device holding the cold key.
- Pledge counts only stake on the owners' stake keys. Move the pledge to an address with the new owner's stake key; the hardware wallet's payment key still controls the funds.
- The old owner's 2 ada stake deposit stays locked, because deregistering that key needs its signature.

Create the pool mnemonic on an offline machine:

```sh
bursa wallet create --output ./pool
```

This writes `seed.txt` (24 words) and a full wallet of derived keys, the extended cold key among them. Write the words down and delete everything in `pool/` except `seed.txt`.

Check the paper copy before you rely on it: type the words into a new `seed.txt` on the same machine, derive `pool-cold.vkey` from it as below, and compare. The armory cannot export the cold key, so the paper is its only backup.

Derive the cold key as a plain Ed25519 key the SE050 can import:

```sh
bursa key pool-cold --mnemonic-file pool/seed.txt \
  --signing-key-file pool-cold.skey \
  --verification-key-file pool-cold.vkey
```

Pass file paths. With `-` Bursa prints the extended `pool_xsk` key instead, which the SE050 cannot import.

The pool ID is the blake2b-224 hash of `pool-cold.vkey`.

Derive the owner key the same way, from the stake key path of the pool mnemonic:

```sh
bursa key pool-owner --mnemonic-file pool/seed.txt \
  --signing-key-file owner.skey \
  --verification-key-file owner.vkey
```

This is a plain Ed25519 key. Its key hash and reward address differ from those of `bursa key stake` for the same path, so a wallet restored from the pool mnemonic does not show them.

### VRF and KES keys

These live on the block producer. Generate them from the pool mnemonic:

```sh
bursa key vrf --mnemonic-file pool/seed.txt \
  --signing-key-file vrf.skey --verification-key-file vrf.vkey
bursa key kes --mnemonic-file pool/seed.txt --index 0 \
  --signing-key-file kes.skey --verification-key-file kes.vkey
```

Bursa derives VRF and KES seeds with its own rule, so only Bursa can re-derive them from the mnemonic. Use a new `--index` for each KES rotation.

### Reward account key

The reward account can be any stake key. This example derives it from the pool mnemonic, on account 1:

```sh
bursa key stake --mnemonic-file pool/seed.txt --account-index 1 \
  --signing-key-file reward.skey --verification-key-file reward.vkey
armory-pool address -stake-vkey reward.vkey -network preview -type reward
armory-pool reward-hex stake_test1...
```

`address` prints the reward address (`stake_test1...`), and `reward-hex` prints it in the hex form the device profile needs. The pool registration names the reward address, and the device pins the hex. `reward.skey` signs the reward account's registration in Step 4 and later withdrawals; it is not on the armory.

## Step 2: Prepare the armory

### Build the firmware

The firmware is a [TamaGo](https://github.com/usbarmory/tamago) image. It needs TamaGo Go 1.27.3.

The device runs one of two images:

- **Provisioning image** (`armory-provision.imx`): creates the identity key, imports keys, creates profiles, and changes the reward account or the opcert floor. It never signs transactions or opcerts.
- **Signing image** (`armory.imx`): reads the key inventory and signs. It serves no provisioning endpoint, so nothing on the host can change a profile, the floor or the key objects while the device signs.

```sh
cd armory/firmware
source ~/tamago/env.sh
make imx
make imx PROVISION=1
```

Never build with `TESTNET=1` for keys that matter: it adds bring-up key tests and an unfiltered signing endpoint. The provisioning image cannot be built with `TESTNET=1`.

A board with nothing on its eMMC boots into USB recovery mode. Load an image into RAM with [armory-boot](https://github.com/usbarmory/armory-boot), the provisioning image first:

```sh
armory-boot-usb -i armory-provision.imx
```

`curl http://10.0.0.1/` shows which image is running: the report starts with `provisioning build` or `signing build`.

The image runs until the board loses power, so load it again after every unplug. Keys and profiles live in the SE050 and survive the power cycle. After provisioning, you can write the signing image to the eMMC so the board boots it by itself: see [Flash the signing image to eMMC](#flash-the-signing-image-to-emmc).

### Connect

The armory is an Ethernet device over USB. The device is `10.0.0.1`, the host is `10.0.0.2`, and the service listens on port 80. Find the new USB network interface with `ip link`, give it the host address, then check the device answers:

```sh
sudo ip addr add 10.0.0.2/24 dev <usb interface>
sudo ip link set <usb interface> up
curl http://10.0.0.1/
```

The device answers with its bring-up report in plain text: the board model, the SE050 applet version, and the checks it ran at boot.

### Create the identity key

The identity key signs the device's key inventory, so Bursa can pin which device it talks to.

```sh
curl -s -X POST http://10.0.0.1/provision/identity -d '{}'
```

Record the returned `public_key`.

### Import the cold key

Cold keys live in SE050 objects 551878672 to 551878687 (`0x20e50010` to `0x20e5001f`). Pick a free one:

```sh
jq -n --argjson id 551878672 --arg key "$(jq -r .cborHex pool-cold.skey)" \
  '{cold_key_id: $id, signing_key: $key}' |
  curl -s -X POST http://10.0.0.1/provision/cold --data-binary @-
```

The device returns `public_key` and `pool_id` in hex. Compare the key with `pool-cold.vkey`: its `cborHex` is `5820` followed by the same hex. The device never overwrites a key: a second import into the same object is refused, and no endpoint deletes one. Each pool uses one cold key object and one profile slot for good.

Delete `pool-cold.skey` from the offline machine afterwards. The mnemonic is the backup.

### Create the profile

A profile ties the cold key to one network, one owner key and one reward account.

```sh
curl -s -X POST http://10.0.0.1/provision/profile -d '{
  "name": "mypool@preview",
  "network_id": 0,
  "slot": 0,
  "cold_key_id": 551878672,
  "reward_account": "e0<28-byte stake key hash in hex>",
  "owner_signing_key": "<cborHex of owner.skey>"
}'
```

- `network_id` is 0 for every testnet.
- `cold_key_id` is the object the import above used.
- `slot` is a free profile slot, 0 to 31.
- `reward_account` is the hex from `armory-pool reward-hex`. The device refuses pool registrations that name a different one. Change it later only through `/provision/reward`, with the provisioning image.
- `owner_signing_key` is `jq -r .cborHex owner.skey`. Like the cold key, it is never overwritten: a retry with the same key is confirmed and a different key is refused. Without it the device generates the owner key, which no backup can restore.
- Leave out `chain_counter` for a new pool. For a pool that has already forged, set it to the on-chain counter (see [Migrating an existing pool](#migrating-an-existing-pool)).

The response holds the owner key: `owner_public_key` (base64) and `owner_key_hash`. Check the key against `owner.vkey`, then delete `owner.skey` from the offline machine.

### Switch to the signing image

Provisioning is done. Reset the board into USB recovery mode and load the signing image:

```sh
curl -s -X POST http://10.0.0.1/reset
armory-boot-usb -i armory.imx
```

The signing image has no reset endpoint. To provision again later, unplug the board and load the provisioning image. If the signing image is on the eMMC, set the boot switch toward microSD first, as below.

### Flash the signing image to eMMC

Optional. A signing image loaded over USB is gone after every unplug. Written to the eMMC, it boots by itself.

[armory-ums](https://github.com/usbarmory/armory-ums) exposes the eMMC to the host as a USB disk. Put the board in USB recovery mode (`curl -s -X POST http://10.0.0.1/reset` from the provisioning image) and load it:

```sh
curl -LO https://github.com/usbarmory/armory-ums/releases/download/v20231018/armory-ums.imx
armory-boot-usb -i armory-ums.imx
```

The eMMC appears as a disk named after the board's serial number:

```sh
ls -l /dev/disk/by-id/ | grep USB_armory
```

Check with `lsblk` that it is about 16 GB and not mounted. Write the signing image 1 KiB into the disk, through the `by-id` path so the write cannot reach another disk:

```sh
sudo dd if=armory.imx of=/dev/disk/by-id/usb-F-Secure_USB_armory_Mk_II_<serial>-0:0 \
  bs=512 seek=2 conv=fsync
```

Unplug the board and plug it in again. The USB network interface appears without `armory-boot-usb`, and `curl http://10.0.0.1/` starts with `signing build`.

The board boots from the eMMC only when its boot switch points toward eMMC. With an image on the eMMC, it no longer falls back to USB recovery mode. To load the provisioning image again, slide the switch toward microSD with no card inserted; the board then goes to USB recovery mode ([boot modes](https://github.com/usbarmory/usbarmory/wiki/Boot-Modes-(Mk-II))).

![The boot switch on the underside of the USB armory Mk II, beside the eMMC chip: toward the plug boots the eMMC, toward the microSD slot goes to USB recovery mode](/bursa-armory-boot-switch.svg)

The switch is on the underside of the board, beside the eMMC chip, under a small orange film. In the official enclosure it shows through a window in the bottom half: slide it with a pin or paper clip, without opening the case. The film can stay on. The usbarmory wiki has a [photo of the switch](https://github.com/usbarmory/usbarmory/wiki/Boot-Modes-(Mk-II)).

### Provision from a microSD card

Optional. Instead of USB recovery mode, the board can boot the provisioning image from a microSD card, with no `armory-boot-usb` step. Write the image to the card the same way as to the eMMC:

```sh
sudo dd if=armory-provision.imx of=/dev/disk/by-id/<card> bs=512 seek=2 conv=fsync
```

Insert the card, slide the switch toward microSD and plug the board in. `curl http://10.0.0.1/` starts with `provisioning build`.

While the card is in and the switch points toward microSD, the board boots the provisioning image at every power-up, and the host can change profiles, the reward account and the floor. When provisioning is done, slide the switch back toward eMMC and take the card out. The board boots whatever image is on the card, so store the card offline with the pool mnemonic.

Some hosts reset the disk at its first read: the kernel logs `device descriptor read/64, error -110` and the board stops answering. Unplug it and flash from another host.

### Read the device keys

`armory-pool` checks the device's key list against the identity key you recorded, then writes the keys as files Bursa can use:

```sh
armory-pool -identity <identity public key> -profile mypool@preview keys -out-dir device
```

It writes `device/pool-cold.vkey` and `device/owner.vkey`, and prints the pool ID in hex and bech32 (`pool1...`), the owner key hash, and the owner key in bech32. `device/pool-cold.vkey` must match the `pool-cold.vkey` you derived. `witness` and `opcert` take the same `-identity` and `-profile` flags before the subcommand; `address` and `reward-hex` need neither.

## Step 3: Run the node

Start the node now without the block-producer settings, so it syncs and Bursa has a socket for Steps 4 and 5. Add the block-producer settings below after [Step 5](#step-5-the-first-operational-certificate) writes `node.cert`.

The block producer needs `vrf.skey`, `kes.skey` and `node.cert`. Dingo refuses key files readable by group or others:

```sh
chmod 400 vrf.skey kes.skey node.cert
```

### Local install

Follow [Dingo node setup](/guides/dingo/spo-guides/001-dingo-node-setup/) to install Dingo, write `/etc/dingo/dingo.yaml` with `network: "preview"`, and run it under systemd. `SOCKET` is the `socketPath` from `dingo.yaml`. Copy the key files to `/var/lib/dingo/keys/`, owned by the user Dingo runs as. Set up the relay and producer topology with [Topology setup](/guides/dingo/spo-guides/012-topology-setup-overview/).

Add the block-producer settings to `dingo.yaml`:

```yaml
blockProducer: true
shelleyVrfKey: "/var/lib/dingo/keys/vrf.skey"
shelleyKesKey: "/var/lib/dingo/keys/kes.skey"
shelleyOperationalCertificate: "/var/lib/dingo/keys/node.cert"
```

The same settings are available as flags (`--block-producer`, `--shelley-vrf-key`, `--shelley-kes-key`, `--shelley-opcert`) and environment variables (`CARDANO_BLOCK_PRODUCER`, `CARDANO_SHELLEY_VRF_KEY`, `CARDANO_SHELLEY_KES_KEY`, `CARDANO_SHELLEY_OPERATIONAL_CERTIFICATE`).

### Docker

Start from [Dingo with Docker](/guides/dingo/008-docker/), then mount the keys read-only and set the block-producer variables. The image runs as UID 1000.

```sh
sudo chown 1000:1000 keys/*
docker run -d --name dingo-bp \
  -p 3001:3001 \
  -v dingo-preview-data:/data/db \
  -v "$PWD/ipc":/ipc \
  -v "$PWD/keys":/keys:ro \
  -e CARDANO_NETWORK=preview \
  -e CARDANO_BLOCK_PRODUCER=true \
  -e CARDANO_SHELLEY_VRF_KEY=/keys/vrf.skey \
  -e CARDANO_SHELLEY_KES_KEY=/keys/kes.skey \
  -e CARDANO_SHELLEY_OPERATIONAL_CERTIFICATE=/keys/node.cert \
  ghcr.io/blinklabs-io/dingo:0.90.0
```

The node socket is `ipc/dingo.socket` in the current directory: `SOCKET=$PWD/ipc/dingo.socket`. Until `node.cert` exists, leave out the `CARDANO_BLOCK_PRODUCER` and key variables.

### Kubernetes

Install the operator, which also installs the `DingoNode` CRD. Grant it read access to Secrets in the namespace that holds the producer:

```sh
helm install dingo-operator oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo-operator \
  --namespace dingo-operator-system --create-namespace \
  --set 'rbac.keySecretsNamespaces={cardano}'
```

Bursa needs a node socket on the host, which a pod does not give it. Run a local or Docker relay for Bursa, or run Bursa in a pod that mounts the producer's socket.

After Step 5, store the producer keys in a Secret:

```sh
kubectl create namespace cardano
kubectl create secret generic producer-pool-keys -n cardano \
  --from-file=vrf.skey --from-file=kes.skey --from-file=opcert.cert=node.cert
```

Create the producer:

```yaml
apiVersion: dingo.blinklabs.io/v1alpha1
kind: DingoNode
metadata:
  name: producer
  namespace: cardano
spec:
  role: blockProducer
  network: preview
  storageMode: core
  persistence:
    size: 120Gi
  mithril:
    enabled: true
  topology:
    relayRefs: [relay]
  blockProducer:
    poolId: pool1...
    keys:
      secretRef: producer-pool-keys
    rotation:
      mode: Assisted
      renewBeforePeriods: 8
```

The operator checks every key bundle before it rolls it out: the opcert signature, pool and KES key binding, counter and KES period. Rotation modes:

- `MonitorOnly` (default) reports KES and opcert status and never changes keys.
- `Assisted` rolls the pod when you replace the Secret's contents with a new KES key and opcert.
- `Auto` generates the KES key, asks a cold signer for the opcert, updates the Secret and rolls the pod. This is in [dingo-operator#101](https://github.com/blinklabs-io/dingo-operator/pull/101). It needs `blockProducer.nodeToClient.enabled: true` so the operator can read the on-chain counter. It also needs write access to the keys Secret, through `rbac.keySecretsUpdate` and `rbac.keySecretNames` in [helm-charts#532](https://github.com/blinklabs-io/helm-charts/pull/532).

Auto mode cannot issue the first opcert of a new pool. See [A new pool](#a-new-pool).

:::note[Not built yet]
`Auto` with the armory. The operator asks the Bursa signer service for the opcert, and that service's armory backend is in an open pull request, [bursa#1125](https://github.com/blinklabs-io/bursa/pull/1125). Until it is merged, issue opcerts with `armory-pool opcert` and run in `Assisted` mode.
:::

## Step 4: Register the pool

### Register the reward account

The reward account must be registered before the pool registration names it, in a transaction of its own: the armory refuses to sign a body that carries a certificate for any stake key other than its owner key.

```sh
bursa cert stake-registration --stake-vkey reward.vkey --deposit 2000000 -o reward-reg.cert
bursa tx build --socket-path "$SOCKET" --network preview \
  --change-address "$(cat payer/payment.addr)" --certificate-file reward-reg.cert --out-file reward-reg.tx
bursa tx witness --tx-file reward-reg.tx --signing-key-file payer/payment.skey --out-file payer.wit
bursa tx witness --tx-file reward-reg.tx --signing-key-file reward.skey --out-file reward.wit
bursa tx assemble --tx-file reward-reg.tx --witness-file payer.wit --witness-file reward.wit \
  --out-file reward-reg.signed
bursa tx submit --socket-path "$SOCKET" --network preview --tx-file reward-reg.signed
```

`bursa tx witness` needs no network: make `reward.wit` on the offline machine from a copy of `reward-reg.tx`, and carry the witness back. `bursa query stake-address --socket-path "$SOCKET" --network preview --address stake_test1...` shows `registered: true` once it is on chain.

### One transaction for the pool

Registration takes one transaction: register the owner stake key, register the pool, and delegate the owner to the pool. The paying wallet covers the 500 ada pool deposit, the 2 ada stake deposit and the fee.

### The pledge address

Pledge counts the stake controlled by the pool's owners. Keep the pledge funds at a base address whose payment key is on the hardware wallet and whose stake key is the armory owner key:

```sh
armory-pool address -payment-vkey payment.vkey -stake-vkey device/owner.vkey -network preview
```

`payment.vkey` is the hardware wallet's payment verification key.

The payment key never leaves the hardware wallet, and the owner key only signs certificates. `bursa tx build` spends only from its change address, so send the pledge to this address from the hardware wallet.

### Certificates

`device/owner.vkey` from `armory-pool keys` is the owner's stake verification key:

```sh
bursa cert stake-registration --stake-vkey device/owner.vkey --deposit 2000000 -o owner-reg.cert
bursa cert pool-registration \
  --cold-vkey pool-cold.vkey --vrf-vkey vrf.vkey \
  --pledge 100000000 --cost 170000000 --margin 0.02 \
  --reward-account stake_test1... \
  --owner-stake-vkey device/owner.vkey \
  --relay-host relay.example.com:3001 \
  --metadata-url https://example.com/pool.json \
  --metadata-hash "$(bursa hash metadata pool.json)" \
  -o pool-reg.cert
bursa cert stake-delegation --stake-vkey device/owner.vkey --pool-id pool1... -o owner-deleg.cert
```

`--reward-account` is the `stake_test1...` address from Step 1, and `--pool-id` is the `pool1...` ID from `armory-pool keys`. Metadata URLs and relay DNS names must be 128 bytes or less.

### Build, sign, submit

```sh
bursa tx build --socket-path "$SOCKET" --network preview \
  --change-address "$(cat payer/payment.addr)" \
  --certificate-file owner-reg.cert \
  --certificate-file pool-reg.cert \
  --certificate-file owner-deleg.cert \
  --out-file pool-reg.tx
```

`tx build` prints each required witness to stderr with its role and key hash: `payment` for the paying wallet's inputs, `stake` for the owner (the owner key also signs its stake certificates, so it appears once), and `pool cold`.

The paying wallet signs, the armory signs once per role, and Bursa assembles and submits:

```sh
bursa tx witness --tx-file pool-reg.tx --signing-key-file payer/payment.skey --out-file payer.wit
armory-pool -identity <identity public key> -profile mypool@preview \
  witness -role pool -tx-file pool-reg.tx -out pool.wit
armory-pool -identity <identity public key> -profile mypool@preview \
  witness -role stake -tx-file pool-reg.tx -out owner.wit
bursa tx assemble --tx-file pool-reg.tx \
  --witness-file payer.wit --witness-file pool.wit --witness-file owner.wit \
  --out-file pool-reg.signed
bursa tx submit --socket-path "$SOCKET" --network preview --tx-file pool-reg.signed
```

`armory-pool witness` sends the exact body bytes to the device and checks the answer before it writes anything. The signature must verify over the body hash, and the binding signature must cover the request. If the policy refuses, it prints the device's reason and writes no witness:

```
armory-pool: device refused: policy: certificate 0: pool registration reward account is not the profile's reward account
```

Check the result:

```sh
bursa query pool --socket-path "$SOCKET" --network preview --pool-id pool1...
```

`registered` is `true` once the transaction is on chain, and `params` shows the pledge, cost, margin, owners and reward account.

## Step 5: The first operational certificate

An operational certificate (opcert) lets the KES key sign blocks for the pool. It holds the KES public key, a counter, and the KES period it starts from, and the cold key signs it.

The armory chooses the counter, not the host. The host sends the KES public key, the on-chain counter and the start period. The device returns the signature and `issue_counter`.

```sh
bursa query pool --socket-path "$SOCKET" --network preview --pool-id pool1...
```

The `opcert` field holds `on_chain_counter`, and `kes` holds `current_kes_period`. Pass them to `armory-pool opcert`. The device has no clock, so it signs whatever KES period the host sends: take it from the query, not from memory. Use `none` when the counter is `null`:

```sh
armory-pool -identity <identity public key> -profile mypool@preview \
  opcert -kes-vkey kes.vkey -kes-period <current_kes_period> -chain-counter <on_chain_counter|none> \
  -out node.cert
```

The device signs `kes_vkey || issue || period` with the cold key and returns the issue number it chose. `armory-pool` prints `issue counter N`, checks the signature and binding, and writes `node.cert` in the same format as `bursa cert op-cert`.

To check a certificate against the device later, `opcert-check` has the device reproduce its signature. Like every opcert request, it raises the device floor to the chain counter it reports:

```sh
opcert-check -vkey "$(jq -r .cborHex pool-cold.vkey)" -cert "$(jq -r .cborHex node.cert)" \
  -pool <pool id hex> -profile mypool@preview -signer http://10.0.0.1 -source 10.0.0.2
```

The block producer validates the certificate when it starts. A good start logs:

```
block producer credentials validated  pool_id=pool1... opcert_kes_period=976 opcert_counter=1
block producer pool registration verified on chain
block forger started in production mode with leader election
```

### A new pool

A pool that has never forged has no counter on chain, so `on_chain_counter` is `null`.

- With no recorded counter, the ledger uses 0 as the baseline and accepts counter 0 or 1 for the pool's first block.
- The host sends `none`, which the armory treats as chain counter 0, so it issues counter 1. That is valid.
- `bursa query pool` shows `next_counter: 0` for such a pool, the cardano-cli convention. Both numbers work; the armory always uses the chain counter plus one.
- Kubernetes `Auto` mode refuses to rotate a pool with no on-chain counter. Issue the first opcert with the armory, store it in the keys Secret, and run in `Assisted` mode until the pool forges its first block. Then switch to `Auto`.

Expect to wait. A new pool gets stake two epochs after its delegation, and on Preview a small pool may go several epochs without a slot.

## Rotating the KES key

A KES key is valid for a fixed number of KES periods (62 periods of 129600 slots on Preview). Rotate before it expires.

You do not need to track whether the pool forged with the current opcert. The node records, for every pool, the opcert counter of the last block from that pool adopted on chain. `bursa query pool` shows it as `opcert.on_chain_counter`. A block header's counter must be equal to that value or one more.

| On-chain counter vs current opcert | Meaning | Next opcert |
|---|---|---|
| Equal | A block with the current opcert is on chain | Current + 1 |
| One lower | The pool has not forged with the current opcert | The same counter again |
| `null` | The pool has never forged | See [A new pool](#a-new-pool) |

The armory always issues the on-chain counter plus one, so the host only reports the chain. Reissuing the same counter burns nothing, and the counter on chain never skips. The device remembers the highest counter the host has reported (its floor) and refuses a request that reports a lower one.

To rotate:

1. Generate a new KES key with the next `--index`.
2. Query the pool for `on_chain_counter` and `current_kes_period`.
3. Get the opcert from the armory with `armory-pool opcert`, as in Step 5.
4. Replace `kes.skey` and `node.cert` on the producer and restart it. On Kubernetes in `Assisted` mode, replace the Secret's contents and the operator rolls the pod. In `Auto` mode the operator does all of this through the cold signer.

### Rollbacks

The on-chain counter is read at the node's tip. The last `k` blocks can still be rolled back.

If you rotate just after the pool forged a block, and that block is later rolled back:

- The chain's counter drops back by one.
- The new opcert's counter is now two above the chain, which the ledger rejects. Blocks forged with it are invalid.
- The armory's floor still holds the higher value, so it refuses the lower counter the host now reports.

To recover:

1. Confirm the real counter with `bursa query pool`.
2. Unplug the board, load the provisioning image, and reset the device floor to it:

   ```sh
   armory-boot-usb -i armory-provision.imx
   curl -s -X POST http://10.0.0.1/provision/floor \
     -d '{"profile": "mypool@preview", "chain_counter": <on-chain counter>}'
   ```

3. Load the signing image again, as in [Switch to the signing image](#switch-to-the-signing-image), then issue a new opcert and install it.

Rotate several KES periods before expiry, as the operator's `renewBeforePeriods: 8` does. A rotation then rarely lands right after a fresh block, and a mistake leaves time to recover.

## Day-to-day operations

All of these use the same flow: build with `bursa tx build`, sign the body with the armory, add the payer's witness, assemble and submit.

- **Change pool parameters.** Build a new `pool-registration` certificate. No deposit is charged for a pool that is already registered. The armory still requires the pinned reward account and the device owner.
- **Vote as an SPO.** `bursa tx build --vote-pool-id pool1... --vote-gov-action <txid>#<index> --vote yes|no|abstain`. The armory signs with the cold key, and only for its own pool.
- **Retire.** `bursa cert pool-retirement --cold-vkey pool-cold.vkey --epoch <epoch>`. The deposit returns to the reward account.

## Migrating an existing pool

A pool that already forges can move its cold key onto the armory.

1. Import the existing cold key, as in [Import the cold key](#import-the-cold-key).
2. Create the profile with `chain_counter` set to the pool's `on_chain_counter`. This sets the device floor.
3. Load the signing image, as in [Switch to the signing image](#switch-to-the-signing-image), and check the device reproduces the pool's current opcert:

   ```sh
   opcert-check -vkey <cold vkey cborHex> -cert <node.cert cborHex> \
     -pool <pool id hex> -profile mypool@preview -signer http://10.0.0.1 -source 10.0.0.2
   ```

4. Re-register the pool with the device owner key as owner, and move the pledge to an address with that stake key.

## Troubleshooting

`armory-pool` prints the device's reason when it refuses. The common ones:

| Message | Cause | Fix |
|---|---|---|
| `pool registration reward account is not the profile's reward account` | The certificate's `--reward-account` differs from the pinned one | Use the pinned account, or change it with `/provision/reward` on the provisioning image |
| `a second pool registration in one body` | The body carries two pool registration certificates; the second would replace the first's parameters on chain | Put one `pool-registration` certificate in the transaction |
| `pool owners must be exactly the device owner` | The certificate lists another owner, or more than one | Pass only `device/owner.vkey` as `--owner-stake-vkey` |
| `pool registration for another operator` | `--cold-vkey` is not this profile's cold key | Use `pool-cold.vkey` for this profile |
| `delegation other than owner to this pool` or `stake registration of another credential` | The body carries a certificate for another stake key | Register and delegate other stake keys in their own transaction |
| `policy: body key N not allowed` | The body has a field outside pool operations, such as a withdrawal or mint | Build pool operations in a transaction of their own |
| `policy: network id does not match profile` or `output N is on another network` | A mainnet address in a Preview transaction, or the reverse | Check `CARDANO_NETWORK` and the change address |
| `key hash does not match the profile key for this role` | The wrong `-role` for this witness | `pool` for the cold key, `stake` for the owner key |
| `unknown profile` | The `-profile` name is not on the device | Use the exact name given to `/provision/profile`, on the device that holds it |
| `malformed request` | A request field is misspelled or unknown, or the JSON has trailing data | Check the field names against the examples in this guide; the device never ignores an unknown field |
| `nonce replayed` | A request was sent twice | Run the command again; each run uses a new nonce |
| `cold key object already exists with a different key` | The object already holds another key | Use a free object; keys are never overwritten |
| `owner key object already exists with a different key` | The slot already holds another owner key | Use a free slot |

A `404` from a `/provision/` endpoint means the signing image is running; a `404` from `armory-pool` means the provisioning image is. See [Build the firmware](#build-the-firmware).

An opcert request below the floor is refused. If a rollback lowered the chain counter, or a host reported a wrong, higher counter, reset the floor with the provisioning image as in [Rollbacks](#rollbacks).

## Keys to keep and delete

| File | Where | Keep? |
|---|---|---|
| Pool mnemonic words | Paper, checked | Keep. The only backup of the cold and owner keys. |
| `pool/seed.txt` | Offline machine | Delete once the armory is provisioned and the paper is checked. |
| `pool-cold.skey`, `owner.skey`, other files in `pool/` | Offline machine | Delete after import. |
| `vrf.skey`, `kes.skey` | Block producer | Only on the producer. Delete other copies. |
| `node.cert` (the opcert) | Block producer | Keep the current one with its `kes.skey`. Not secret, but with that `kes.skey` and `vrf.skey` it forges blocks, so after a rotation delete the old `node.cert` and `kes.skey` together. |
| `kes.vkey` | Host | Needed only to issue its opcert. Delete it with its `kes.skey` at the next rotation. |
| `reward.skey` | Offline | Keep offline, or re-derive from the mnemonic (account 1) when you withdraw rewards. |
| `payer/` | Host | A hot wallet for fees and deposits. Keep only what the next transactions need. |
| `pool-cold.vkey`, `device/*.vkey`, `vrf.vkey`, `reward.vkey` | Host | Keep. Public, and needed for every re-registration, vote and retirement. |
| `*.cert` other than `node.cert` (pool registration, owner registration and delegation, reward account registration) | Host | Public and single-use. Delete once the transaction is on chain, or keep as a record. Build new ones for later changes. |
| `*.tx`, `*.wit`, `*.signed` | Host | Public. A `.signed` file can be submitted by anyone who holds it until it is on chain or its inputs are spent. Delete them after submission. |
| `pool.json` | Web server | Keep it at the metadata URL, unchanged: the registration pins its hash. Re-register to change it. |
| Identity public key | Anywhere | Keep. Every `armory-pool` call pins it. |

Never paste the mnemonic into a shell command, and keep `seed.txt` out of synced folders.

## Recovery

| Lost | Effect | Recovery |
|---|---|---|
| Armory | No new signatures | Restore the cold key and owner key from the pool mnemonic on a new device, with the same reward account. The pool, owner and pledge address stay the same. |
| Pool mnemonic | No backup of the cold key | The armory keeps signing, but the SE050 cannot export the key. If the armory is lost too, the pool is gone and a new pool needs a new cold key. |
| Pledge hardware wallet | Pledge funds | Restore from the pledge mnemonic. |
| Block producer | No blocks | Restore VRF and KES keys from the pool mnemonic, then issue a new opcert. |

## Testing on Preview

`armory/e2e/preview-pool-registration.sh` in the Bursa repository runs this guide against Preview and checks each step against the chain:

- cold and owner key derivation from the mnemonic, their import, and the profile;
- reward account registration;
- owner and pool registration signed by the armory;
- a refused registration that names another reward account;
- the first opcert, cross-checked with `opcert-check`;
- retirement, when `RETIRE=1` is set.

Start the device on the provisioning image. With `SIGNING_IMX` set to the signing image, the script resets the board and loads it after provisioning; without it, the script stops and asks you to load it. The header lists the other environment variables. Rerunning it on the same work directory skips the steps already done and re-registers the existing pool, so repeated runs use no new device keys.

## What is not built yet

- A Bursa signer backend for the armory, in [bursa#1125](https://github.com/blinklabs-io/bursa/pull/1125). `armory-pool` is the host tool until it is merged.
- Automatic rotation on Kubernetes through the armory. The operator's `Auto` mode talks to the Bursa signer service.
