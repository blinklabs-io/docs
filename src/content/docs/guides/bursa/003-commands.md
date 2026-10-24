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
> 9. [tx](#tx) - Offline transaction operations
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

***

<a name="tx"></a>

## Offline transaction operations

The `tx` commands inspect and sign an existing transaction without contacting a node. Supply `unsigned.tx` as hex CBOR or a JSON text envelope containing `cborHex`:

```sh
./bursa tx decode --tx-file unsigned.tx
./bursa tx id --tx-file unsigned.tx
./bursa tx sign --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --out-file signed.tx
```

Repeat `--signing-key-file` to add multiple signers. For separate signing sessions, create detached witnesses and assemble them against the same transaction:

```sh
./bursa tx witness --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --out-file payment.witness
./bursa tx assemble --tx-file unsigned.tx \
  --witness-file payment.witness --out-file assembled.tx
```

Repeat `--witness-file` to include additional witnesses. Signing, witnessing, and assembly write JSON text envelopes to `--out-file`, or to standard output when it is omitted. `tx decode --protocol-params protocol-parameters.json` also estimates the minimum fee from a Cardano protocol-parameters JSON file. Use `./bursa tx --help` and each subcommand's `--help` for options.

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
> 9. [tx](#tx) - Offline transaction operations
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
