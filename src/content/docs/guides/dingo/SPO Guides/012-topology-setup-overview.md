---
title: Topology Guide Overview
description: SPO Guide for Dingo Pools - Overview on how to setup a Topology JSON file.
---

While Dingo will work with the default topology file embedded it's recommened as an SPO that you use your own topology JSON file. This guide with use the default preview network topology file as a sample. All network topology files can be found <a href="here https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

Please modify according to the network you are using and to your Node structure. For this guide we will provide an overview based on the common recommendation of using a Block producer node behind two relay nodes.

***

## Default Preview Topology JSON File

The default Preview topology JSON file looks like this:
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

To understand how to modify and use the topology JSON file it's important to understand:

- <a href="#local">Local vs Public Peers</a>
- <a href="#bootstrapping">Bootstrapping Peers</a>
- <a href="#advertise">Advertise Flag</a>
- <a href="#access">Access Points</a>

<h2 id="local"> Local vs Public Peers</h2>
Local Roots is designed for peers that the node should always keep as hot or warm, such as its own block producer. On the other hand, Public Roots serves as a source of fallback peers.

<h2 id="bootstrapping">Bootstrapping Peers</h2

<h2 id="advertise">Advertise Flag</h2>

<h2 id="access">Access Points</h2>

## Relay Sample Topology File

## BP Sample Topology File
For a block producer node we only want it to connect to our relays. To do this we use the following confiuration:

- Set `"bootstrapPeers": null`
- Set `"advertise": false,` since these are local root on BP and we want to keep private.
- Set our Relays to `"trustable": true,`
- Since in this example we use 2 Relays, we set `"valency": 2,` if we had 3 Relays it would be set to `3`.
- Last of all we leave Public Roots blank by using `"publicRoots": []`
- Last of all we set `"useLedgerAfterSlot": -1` so the BP doesn't try to connect to other nodes using ledger peer data.

Sample BP Topology JSON FILE: 
```
{
  "bootstrapPeers": null,
  "localRoots": [
    {
      "accessPoints": [
        {
          "address": "relay1.Address",
          "port": 3001
        },
        {
          "address": "relay2.Address",
          "port": 3001
        }
      ],
      "advertise": false,
      "trustable": true,
      "valency": 2
    }
  ],
  "publicRoots": [],
  "useLedgerAfterSlot": -1
}
```
