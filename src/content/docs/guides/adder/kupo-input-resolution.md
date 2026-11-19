---
title: Resolve transaction senders with Kupo
description: Configure optional Kupo input resolution so Adder filters can match the outputs a transaction spends.
---

Transaction inputs contain output references, not the address, assets, or policy
of the output being spent. Adder can query Kupo for those outputs and attach
them to each transaction event as `resolvedInputs`.

The Cardano address, asset, and policy filters inspect both collections:

| Event field | What it represents | Typical match |
| --- | --- | --- |
| `outputs` | New outputs created by the transaction | Receiver or change address |
| `resolvedInputs` | Previous outputs consumed by the transaction | Sender or spent assets |

Kupo is optional. Without it, ChainSync still emits transaction events, but an
address that appears only on a spent output cannot match. The mempool input can
resolve outputs created by another transaction in the same poll; it uses Kupo
for older on-chain outputs.

## Prepare Kupo

Use a Kupo instance synchronized to the same Cardano network as Adder. Its
match patterns must retain every output Adder may need to resolve. A full index
uses Kupo's `*` match pattern. A narrower pattern is suitable only when it is
guaranteed to include the sender outputs you monitor.

Adder accepts an `http` or `https` Kupo endpoint. Use a loopback endpoint when
Kupo runs on the same host. Save this configuration as `adder.yaml`:

```yaml
input: chainsync
kupo_url: http://127.0.0.1:1442

plugins:
  input:
    chainsync:
      network: mainnet
```

The top-level `kupo_url` value is a fallback for inputs that support Kupo. To
configure one input independently, use
`plugins.input.chainsync.kupo-url` or
`plugins.input.mempool.kupo-url` instead.

You can also set the shared endpoint in the environment:

```sh
export KUPO_URL=http://127.0.0.1:1442
```

The complete option and precedence rules are in the
[command reference](/guides/adder/006-command_list/#optional-kupo-input-resolution).

## Match a sender address

Set `SENDER_ADDRESS` to a payment or stake address whose UTxO is spent by a
transaction. For a clear check, choose a transaction that does not create a new
output at that same address; otherwise the ordinary output match would hide
whether input resolution worked.

```sh
export SENDER_ADDRESS=addr1q...

adder \
  --config adder.yaml \
  --filter-type input.transaction \
  --filter-address "$SENDER_ADDRESS"
```

When the transaction arrives, Adder asks Kupo for each referenced output. The
filter matches when one resolved output uses `SENDER_ADDRESS`, even though none
of the transaction's new outputs does.

If Kupo is unavailable, behind the node, or did not index a referenced output,
sender-side data for that input is unavailable. ChainSync continues with the
transaction event without resolved inputs; the mempool input may retain other
inputs it resolved successfully. Check Kupo synchronization and match patterns
before changing the Adder filter.

A ChainSync transaction emitted without resolved inputs is not retried when
Kupo recovers. A mempool transaction that remains present is also not
reprocessed on later polls. Sender-only filters therefore miss those events;
replay the affected source data after Kupo is synchronized when completeness is
required.
