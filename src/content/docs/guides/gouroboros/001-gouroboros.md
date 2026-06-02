---
title: gOuroboros
description: Introduction to gOuroboros.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros is a powerful and versatile framework for building Go apps that interact with the Cardano blockchain. Quickly and easily write Go apps that communicate with Cardano nodes or manage blocks/transactions. Sync the blockchain from a local or remote node, query a local node for protocol parameters or UTxOs by address, and much more.

Byron remains the standalone legacy era. The Shelley lineage continues through Shelley, Allegra, Mary, Alonzo, Babbage, Conway, and now Dijkstra. Dijkstra is the newest ledger era currently supported by gOuroboros.

Leios no longer appears here as a separate terminal ledger era. Current Leios functionality ships within or on top of Dijkstra, so the ledger era hierarchy now ends at Dijkstra.

Leios names still appear in experimental CIP-0164 mini protocols such as `LeiosFetch`, `LeiosNotify`, and `LeiosVotes`. Those names identify experimental network messages and related data. They do not mean that gOuroboros treats Leios as a separate ledger era.

gOuroboros now centers ledger era support on Dijkstra, including Leios extensions that the project maintains on top of it. Experimental Leios features still use Leios names, and their behavior can still change as that work evolves.

***

Learn more about the code documentation of gOuroboros here: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.  
