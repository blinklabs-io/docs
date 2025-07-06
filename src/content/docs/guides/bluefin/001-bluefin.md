---
title: Bluefin
description: Introduction to Bluefin.
---

![bluefin-logo](/bluefin-logo.png)

Bluefin a standalone Fortuna (TUNA) miner, written in Go, which syncs the chain, mines for TUNA, and submits transactions to remote nodes without any other infrastructure.  

## How do I actually use Bluefin?

Bluefin is self-contained and runs with no external dependencies. You can run it via the <a href="https://github.com/blinklabs-io/bluefin/pkgs/container/bluefin" target="_blank">Docker images</a> or binaries from the <a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">releases page</a>.  

✅ Get started with our [Quick Start](../002-quick-start-overview) guide.  

## What is $TUNA and how does Bluefin work?

TUNA is the token for Fortuna, but what is Fortuna? Fortuna is a proof of work token project built on top of a Cardano smart contract. The Fortuna miner was written in Typescript using Lucid and required access to Kupo and Ogmios or an API provider to do its work. At Blinklabs we wanted our miner to work with no external service dependencies and this is where Bluefin comes in.  

Bluefin would follow the blockchain using public Cardano nodes and store interesting UTxOs on disk. After mining a block, it would submit transactions directly to public nodes using the NtN (node-to-node) TxSubmission protocol. Like all of Binklabs Go projects, it would run as a single binary on multiple platforms and architectures. In June of 2024 support for $TUNA v2 was integrated into Bluefin.  

Learn more about Fortuna at <a href"https://minefortuna.com/" target="_blank">minefortuna.com/</a>.  
