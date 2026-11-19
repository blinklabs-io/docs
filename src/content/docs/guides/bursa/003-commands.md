---
title: Command Line Guide
description: Bursa Command Line Guide.
---

We can now use the command line to create a Cardano wallet and output all the files we will need to manage the wallet. We can also start the API and access the API Swagger documentation. 

Bursa can also be used to generate multi-signature scripts, hashes, keys, including keys and certificates needed to run a Cardano stake pool. 

There are currently 11 categories of commands that Bursa can run which makes it a power tool for Cardano users.

> **Bursa Command Categories**
> 1. [wallet](#wallet) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [kes-agent](#kes-agent) &emsp;&nbsp; - Commands for running the KES agent daemon for a Cardano block producer
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 6. [script](../006-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 7. [address](../007-address-commands) - Commands for working with Cardano addresses
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic
> 9. [tx](#tx) - Transaction operations
> 10. [sign](#sign) - CIP-8/CIP-30 message signing and verification
> 11. [signer](#signer) - Remote signing service

***

<a name="wallet"></a>

## Use Command Line to Create a Wallet and Output Wallet Files

We can use the command line to create a wallet and output all the files we will need to manage our Cardano wallet.

✅ For this example we create the wallet files to the `dev` folder by using the `--output` flag and giving it a directory to output to.

```
./bursa wallet create --output dev
```

![bursa-wallet-create-with-output-string](/bursa-wallet-create-with-output-string.png)

Now we will have all the wallet files in our `dev` directory.

![bursa-wallet-files](/bursa-wallet-files.png)

### Restore and inspect a wallet

Restore an existing BIP-39 mnemonic from a protected file, then inspect the generated key files:

```sh
./bursa wallet restore --mnemonic-file dev/seed.txt --output restored-wallet
./bursa wallet load --dir restored-wallet
```

`--output` writes addresses and key files; without it, restoration logs addresses only. Restoration does not copy the mnemonic into the output directory. Keep mnemonic and signing-key files private and backed up securely. Mnemonic sources are checked in this order: deprecated `--mnemonic`, `MNEMONIC` environment variable, `--mnemonic-file`, then the default `seed.txt` file. Unset `MNEMONIC` when using `--mnemonic-file`. The `--mnemonic` and `--password` arguments are deprecated because process arguments are visible to other local users; use `--mnemonic-file` and `--password-file` instead. Use `--password-file /path/to/password.txt` if the wallet was derived with a BIP-39 password; this is a derivation password, not encryption for the output files.

`wallet load` reads existing key files without deriving a new wallet. Private key hex is hidden by default; `--show-secrets` explicitly reveals it. Use `./bursa wallet restore --help` and `./bursa wallet load --help` for the available options.

***

<a name="api"></a>

## Use Command Line to Start API

If we want to use the API we can use the command line to start it, by running the following command.

```
./bursa api
```

![bursa-start-api](/bursa-start-api.png)

## Access API Swagger Documentation

You can check the Bursa API by going to your IP:port/swagger/index.html. Please adjust the IP and your port if needed.

```
http://localhost:8080/swagger/index.html
```

![bursa-swagger](/bursa-swagger.png)

For non-loopback listeners, use the [configuration reference](../009-configuration-reference) to configure TLS and exactly one bearer authentication trust source.

***

<a name="kes-agent"></a>

## Use Command Line to Start KES Agent

Start the KES agent daemon for a Cardano block producer with a YAML configuration file:

```
./bursa kes-agent --config /path/to/kes-agent.yaml
```

The `--config` flag selects the YAML configuration file. When the flag is omitted, Bursa uses the `BURSA_CONFIG` environment variable. Configure the `kes_agent.mode` value as `serve-key` or `sign`. Use the [configuration reference](../009-configuration-reference) for the `kes_agent` YAML fields and environment variables, including the mode and required socket, key, and timing settings.

Check KES agent readiness without starting the daemon:

```
./bursa kes-agent ready --config /path/to/kes-agent.yaml
```

The command exits successfully only when the KES agent is ready and exits with a failure status otherwise. Use it as an `exec` readiness probe.

### Control the KES agent

Use `bursa kes-agent control` to send a command to a running local KES agent through its control socket:

```
./bursa kes-agent control [--config /path/to/kes-agent.yaml] [--socket /run/bursa/kes-agent-control.sock] [--profile PROFILE] <command>
```

An explicit `--socket` value takes precedence. Without `--socket`, the command reads `kes_agent.control_socket` from the YAML file selected by `--config`; when `--config` is omitted, `BURSA_CONFIG` selects that file. The command does not discover a control socket from another source. See the [configuration reference](../009-configuration-reference) for `kes_agent.control_socket`, socket permissions, and configuration-file selection.

Use `--profile` to select the profile affected when the agent serves several profiles. Without `--profile`, `info` lists every profile; a single-profile agent can omit the profile name.

The control command provides these subcommands:

- `info` prints the agent state. It does not require additional flags.
- `gen-staged-key [--out FILE]` generates a staged key. The optional `--out` flag writes the KES verification key as a `cardano-cli` envelope, prints the JSON reply before attempting the write, and refuses to overwrite an existing file.
- `install-key --opcert FILE` installs a staged key from a `NodeOperationalCertificate` `cardano-cli` envelope. The command requires the `--opcert` flag.
- `drop-key --target VALUE` drops key material. The `--target` flag is required and accepts only `staged`, `active`, or `all`.

The command prints agent replies as JSON and represents byte fields as hexadecimal. An agent refusal causes a non-zero CLI exit. Each control request has a 30-second limit, and cancellation ends blocked socket I/O promptly.

The local control socket accepts all four commands. The attested listener admits remote control only over TLS with verified client certificates and a client certificate SPKI fingerprint that matches the configured `control_client_spki_sha256` for the selected profile. Admitted remote control provides `info`, `gen-staged-key`, and `install-key`; `drop-key` remains local-only. A control pin does not authorize remote signing, which requires the separate `sign_client_spki_sha256` authorization.

Rotate a KES key in three steps:

1. Generate the staged key and write its verification key to an envelope:

   ```
   ./bursa kes-agent control --config /etc/bursa/kes-agent/config.yaml gen-staged-key --out kes.vkey
   ```

2. Issue an operational certificate for `kes.vkey` offline with the pool cold key. The agent does not issue the certificate.

3. Install the certificate and inspect the result:

   ```
   ./bursa kes-agent control --config /etc/bursa/kes-agent/config.yaml install-key --opcert node.cert
   ./bursa kes-agent control --config /etc/bursa/kes-agent/config.yaml info
   ```

***

<a name="tx"></a>

## Transaction operations

The `tx decode`, `tx id`, `tx sign`, `tx witness`, and `tx assemble` commands inspect or modify an existing transaction without contacting a node. Supply `unsigned.tx` as hex CBOR or a JSON text envelope containing `cborHex`:

```sh
./bursa tx decode --tx-file unsigned.tx
./bursa tx id --tx-file unsigned.tx
./bursa tx sign --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --era Conway --out-file signed.tx
```

Repeat `--signing-key-file` to add multiple signers. The optional `--era` flag accepts `Shelley`, `Allegra`, `Mary`, `Alonzo`, `Babbage`, `Conway`, or `Dijkstra` without regard to letter case. Use it with `tx sign`, `tx witness`, or `tx assemble` when raw CBOR or a legacy era-less `Tx` envelope does not identify a single era:

```sh
./bursa tx witness --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --era Conway --out-file payment.witness
./bursa tx assemble --tx-file unsigned.tx \
  --witness-file payment.witness --era Conway --out-file assembled.tx
```

Repeat `--witness-file` to include additional witnesses. Bursa uses an era named in a text envelope and requires it to match `--era` when both are present. Raw hex and a legacy era-less `Tx` envelope work without `--era` only when the CBOR resolves to one era. If the CBOR is valid in more than one era, Bursa does not guess: provide `--era` or an era-typed envelope such as `Tx ConwayEra`. An unknown era or a conflict between the envelope and `--era` fails.

Signing and assembly write JSON text envelopes to `--out-file`, or to standard output when it is omitted. Signed and assembled outputs use `TxSignedShelley` for Shelley, `Tx <Era>Era` for Allegra through Dijkstra, such as `Tx ConwayEra`, and plain `Tx` for Byron. Detached witnesses use `TxWitness <Era>Era` for Shelley through Dijkstra, such as `TxWitness ConwayEra`, and plain `TxWitness` for Byron.

The `/api/tx/sign` and `/api/tx/assemble` endpoints resolve the era from `tx_cbor`. When raw or era-less CBOR is valid in multiple eras, the request returns HTTP `400` unless `tx_cbor` uses an era-named text envelope such as `Tx ConwayEra`; the response includes remediation guidance. `tx decode --protocol-params protocol-parameters.json` also estimates the minimum fee from a Cardano protocol-parameters JSON file. Use `./bursa tx --help` and each subcommand's `--help` for options.

The `--era` option is available on `tx sign`, `tx witness`, and `tx assemble`. For raw or era-less CBOR that is valid in more than one era, `--era` is required; for example:

```sh
./bursa tx sign --tx-file unsigned.tx --era conway \
  --signing-key-file dev/payment.skey --out-file signed.tx
```

Bursa resolves the era from an era-typed JSON text envelope, such as one with type `Tx ConwayEra`, when the flag is absent. Without `--era`, Bursa accepts raw or era-less CBOR only when it decodes unambiguously. Provide `--era` or an era-typed envelope when the input is ambiguous. The command fails when `--era` conflicts with the era declared by the input envelope.

The resolved era selects the output envelope type and witness encoding for signing, witnessing, and assembly.

### Build a transaction

`tx build` connects to the node specified by `--socket-path` and uses the node's protocol parameters while constructing a pool operation transaction. The `--max-fee` flag sets the maximum fee in lovelace and defaults to `2_000_000`:

```sh
./bursa tx build \
  --socket-path /run/cardano/node.socket \
  --network mainnet \
  --change-address "$CHANGE_ADDRESS" \
  --max-fee 3000000 \
  --out-file unsigned.tx
```

If the node reports protocol parameters that produce a minimum fee above `--max-fee`, Bursa refuses to construct the transaction. Raise `--max-fee` explicitly when the network or node parameters require a higher fee.

<a name="sign"></a>

## Sign and verify messages

`sign data` produces a CIP-8/CIP-30 COSE signature and public key as JSON. Set `ADDRESS_HEX` to the hex-encoded address bytes for the signing key (rather than the Bech32 address text). After signing, set `SIGNATURE_HEX` and `COSE_KEY_HEX` to the returned `signature` and `key` fields:

```sh
./bursa sign data --address "$ADDRESS_HEX" --payload 'Hello Cardano' \
  --signing-key-file dev/payment.skey
./bursa sign verify --signature "$SIGNATURE_HEX" --key "$COSE_KEY_HEX" \
  --payload 'Hello Cardano'
```

Use `--payload-hex` instead of `--payload` for binary data. Verification with the expected payload prints `VALID` on success and exits with an error if verification fails.

<a name="signer"></a>

## Start the remote signing service

The `signer` command serves authenticated remote signing requests with configured custody backends, caller permissions, key policies, and anti-double-sign watermarks:

```sh
./bursa signer --config /path/to/signer.yaml
```

When `--config` is omitted, `BURSA_CONFIG` selects the YAML file. Configure at least one authentication mode; JWT bearer, mTLS client certificates, and authorized-key request signatures are supported. Before starting the service, follow the [signer runbook](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/runbook.md) and adapt the [example signer configuration](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/signer.example.yaml) for custody, authentication, TLS, caller permissions, and durable watermarks. The [signer overview](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/README.md) links the API specification and security guidance.

The `signer` command accepts no positional arguments. Bursa rejects unknown or misspelled subcommands before it starts the signing service.

Reset an operational certificate counter with the signer configuration and the current chain counter:

```
./bursa signer counter-reset --config /path/to/signer.yaml \
  --key "$COLD_KEY_HASH" --chain-counter 10 --yes
```

Use `--profile <configured-profile>` when the selected backend has a profile, including a SOPS backend. When the configuration contains profiled backends and the selected backend has no profile, use `--unprofiled`. A configuration with no profiled backend needs neither selector. Bursa refuses requests without a profile or with a mismatched profile when the selected backend requires one. See the [signer runbook](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/runbook.md) for the complete reset procedure.

## Custody command references

### Confidential Space workload

Start a Confidential Space workload with repeatable profile options:

```
./bursa confidential-space-workload \
  --listen :8080 \
  --audience "$WORKLOAD_AUDIENCE" \
  --kms-key "$KMS_KEY_RESOURCE" \
  --wrapped-key-file /var/lib/bursa/pool-key.wrapped \
  --counter-bucket "$COUNTER_BUCKET" \
  --counter-object pool-counter \
  --wif-credentials /etc/bursa/wif.json \
  --tls-cert-file /etc/bursa/workload.crt \
  --tls-key-file /etc/bursa/workload.key \
  --client-ca-file /etc/bursa/signer-ca.crt \
  --profile pool@mainnet \
  --profile pool@preview \
  --create-profile-counter pool@mainnet \
  --create-profile-counter pool@preview
```

Repeat `--profile` for each explicitly configured profile and repeat `--create-profile-counter <profile>` for each profile that needs a counter. Bursa isolates each profile in its own Cloud Storage counter object. During active-key startup, Bursa does not silently recreate a missing profile counter; specify that profile with `--create-profile-counter` when adding it.

A Confidential Space VM has no persistent storage. To run the workload without local state, keep the wrapped pool key and every profile counter in Secret Manager with `--state-secret`, and the workload HTTPS certificate in a separate Secret Manager secret with `--tls-secret`:

```
./bursa confidential-space-workload \
  --listen :8080 \
  --audience "$WORKLOAD_AUDIENCE" \
  --kms-key "$KMS_KEY_RESOURCE" \
  --state-secret "projects/$PROJECT/secrets/$STATE_SECRET" \
  --tls-secret "projects/$PROJECT/secrets/$TLS_SECRET" \
  --wif-credentials /etc/bursa/wif.json \
  --client-ca-file /etc/bursa/signer-ca.crt \
  --profile pool@mainnet \
  --profile pool@preview
```

`--state-secret` cannot be combined with `--wrapped-key-file`, `--counter-bucket`, or `--counter-object`, and `--tls-secret` cannot be combined with `--tls-cert-file` or `--tls-key-file`. Each profile counter is a record in the state secret instead of a Cloud Storage object. Bursa creates neither secret, and in this mode it never generates a pool cold key: a normal start fails until an import has written the key into the state secret. The client CA and the Workload Identity Federation configuration are not secret; build them into an image derived from the Bursa image. See [Confidential Space custody persistence](/guides/bursa/009-configuration-reference/#confidential-space-custody-persistence) for the permissions and failure behavior.

#### Import an existing pool cold key

Start the workload once in import mode against an empty state secret:

```
./bursa confidential-space-workload \
  --listen :8080 \
  --import \
  --import-authority-file /etc/bursa/import-authority.pub \
  --audience "$WORKLOAD_AUDIENCE" \
  --kms-key "$KMS_KEY_RESOURCE" \
  --state-secret "projects/$PROJECT/secrets/$STATE_SECRET" \
  --tls-secret "projects/$PROJECT/secrets/$TLS_SECRET" \
  --wif-credentials /etc/bursa/wif.json \
  --client-ca-file /etc/bursa/signer-ca.crt
```

`--import` requires `--state-secret` and `--import-authority-file`, and it excludes `--profile` and `--create-profile-counter` because the profiles come from the import request. `--import-authority-file` holds the hex Ed25519 public key of the provisioning authority, which must be a different key from the signer client's TLS identity. In import mode the workload serves only the import routes, never signs, and exits after one successful import.

Run the import client on the machine that holds the cold key:

```
./bursa confidential-space import \
  --address https://workload.example.internal:8080 \
  --tls-ca-file ca.pem \
  --tls-client-cert-file client.pem \
  --tls-client-key-file client-key.pem \
  --audience "$WORKLOAD_AUDIENCE" \
  --image-digest sha256:IMAGE_DIGEST \
  --kms-key "$KMS_KEY_RESOURCE" \
  --signing-key-file pool-cold.skey \
  --vkey-file pool-cold.vkey \
  --authority-key-file import-authority.key \
  --profile pool@mainnet=8 \
  --profile pool@preview=0
```

The client verifies the workload's attestation token, including the audience and the image digest, before it seals the key to the workload and sends it. `--signing-key-file` must be the non-extended `StakePoolSigningKey_ed25519` file, and it must derive the key in `--vkey-file`. `--authority-key-file` holds the provisioning authority's hex Ed25519 seed. Each `--profile` is `NAME=NEXT`, where `NEXT` is the next operational certificate issue number that profile may sign: one above the highest issue number signed under that profile, whether or not that certificate is on chain, and never below the pool's on-chain counter on that profile's network plus one. Use `0` for a profile that has never issued. Stop issuing certificates with the previous signer first; the workload cannot correct `NEXT` after the import.

For distinct keys, use `NAME=FILE` for every value in both repeatable key flags:

```sh
--signing-key-file pool@mainnet=mainnet-cold.skey \
--signing-key-file pool@preview=preview-cold.skey \
--vkey-file pool@mainnet=mainnet-cold.vkey \
--vkey-file pool@preview=preview-cold.vkey
```

Use one plain path in each flag instead to share one key across all profiles. Do not mix plain paths with `NAME=FILE` values. In per-profile mode, name every `--profile` exactly once in each key flag, and use a distinct key for every profile.

After the import, start the workload without `--import` and with a `--profile` option for each imported profile. For a multi-key import, the configured profile set must match the imported set exactly: an unprofiled start or any missing or extra profile refuses startup. Multi-key state uses the `bursa-confidential-space-key/3` envelope, which older Bursa releases cannot read. For a shared-key import, a served profile that was not imported stops startup unless `--create-profile-counter` names it, as in the Cloud Storage mode.

### Nitro enclave

Start the Nitro enclave with separate provisioning and signer authority files:

```
./bursa nitro enclave \
  --server-cert-file /etc/bursa/nitro/server.pem \
  --server-key-file /etc/bursa/nitro/server-key.pem \
  --client-ca-file /etc/bursa/nitro/proxy-ca.pem \
  --provision-authority-file /etc/bursa/nitro/provision-authority.hex \
  --signer-authority-file /etc/bursa/nitro/signer-authority.hex
```

The provisioning and signer authorities must not be the same.

### Nitro proxy

Set `--socket-mode` when the proxy socket requires group access:

```
./bursa nitro proxy \
  --enclave-cid "$ENCLAVE_CID" \
  --region "$AWS_REGION" \
  --secret-id "$NITRO_SECRET_ID" \
  --enclave-ca-file /etc/bursa/nitro/enclave-ca.pem \
  --client-cert-file /etc/bursa/nitro/proxy.pem \
  --client-key-file /etc/bursa/nitro/proxy-key.pem \
  --enclave-server-name "$ENCLAVE_SERVER_NAME" \
  --socket /run/bursa/nitro.sock --socket-mode 0660
```

Mode `0660` supports owner and group access. Bursa rejects world-writable socket modes.

***

Explore other Bursa Commands

> **Bursa Command Categories**
> 1. [wallet](#wallet) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [kes-agent](#kes-agent) &emsp;&nbsp; - Commands for running the KES agent daemon for a Cardano block producer
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 6. [script](../006-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 7. [address](../007-address-commands) - Commands for working with Cardano addresses
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic
> 9. [tx](#tx) - Transaction operations
> 10. [sign](#sign) - CIP-8/CIP-30 message signing and verification
> 11. [signer](#signer) - Remote signing service

***



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
