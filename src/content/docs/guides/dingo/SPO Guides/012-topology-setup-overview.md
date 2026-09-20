---
title: Topology Guide Overview
description: SPO Guide for Dingo Pools - Overview on how to setup a Topology JSON file.
---

While Dingo will work with the default topology file embedded it's recommened as an SPO that you use your own topology JSON file. This guide with use the default preview network topology file as a sample. All network topology files can be found <a href="here https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

Please modify according to the network you are using and to your Node structure. For this guide we will provide an overview based on the common recommendation of using a Block producer node behind two relay nodes.

Sample Preview topology JSON file:
```
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [],
      "advertise": false,
      "trustable": false,
      "valency": 1
    }
  ],
  "peerSnapshotFile": "peer-snapshot.json",
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 119231973
}
```
