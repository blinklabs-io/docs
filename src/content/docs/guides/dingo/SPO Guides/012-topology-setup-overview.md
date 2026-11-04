---
title: Topology Guide Overview
description: SPO Guide for Dingo Pools - Overview on how to set up a Topology JSON file.
---

Dingo works with the embedded default topology file, but as an SPO you should use your own `topology.json`. This guide will use the preview network topology file as a sample. All network topology files can be found here: <a href="https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

Please modify for your network and node layout. This guide uses the common layout of one block producer behind two relays.

**This guide will cover:**

- <a href="#default">Default Preview Topology JSON File</a>
- <a href="#flags">Understanding Topology Flags</a>
- <a href="#relay">Relay Sample Topology File</a>
- <a href="#bp">BP Sample Topology File</a> 

***

<h2 id="default">Default Preview Topology JSON File</h2>

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

> Copy `useLedgerAfterSlot` and `bootstrapPeers` from the official topology for your network. The Preview slot above will go stale and is wrong for preprod/mainnet.

***

<h2 id="flags">Understanding Topology Flags</h2>

To understand how to modify and use the topology JSON file it's important to understand:

- <a href="#local">Local vs Public Peers</a>
- <a href="#bootstrapping">Bootstrapping Peers</a>
- <a href="#advertise">Advertise Flag</a>
- <a href="#access">Access Points</a>
- <a href="#trustable">Trustable Flag</a> 

<h3 id="local"> Local vs Public Peers</h3>
Local roots are designed for peers that the node should always keep as hot or warm, such as its own block producer. On the other hand, Public roots serve as a source of fallback peers.

***

<h3 id="bootstrapping">Bootstrapping Peers</h3>
Bootstrapping peers are good for when your node has had an extended outage: the node syncs from those peers, then uses ledger peers once it is on tip.

***

<h3 id="advertise">Advertise Flag</h3>
When `advertise` is true, the node may share that peer’s address through peer sharing. That can increase inbound connections to the advertised peer. This is useful for unregistered relays. Never advertise the block producer.

***

<h3 id="access">Access Points</h3>
Access points sit inside a `localRoots` group. Why would you want to use this? This way you can keep advertise as false for your BP while true for your relay. 

***

<h3 id="trustable">Trustable Flag</h3>
Dingo accepts `trustable` so that cardano-node topology files load unchanged, but it does not use the flag. A trustable local root does not help a node that is behind the tip leave Genesis chain selection.

<br>

On mainnet, preprod and preview, Genesis chain selection uses `genesisBootstrap.corroborationPeers: 0` by default, so the default allows a single upstream peer to satisfy the selection. Set `genesisBootstrap.corroborationPeers` to a positive value to require independent corroborating peers before the node follows a chain. Dingo does not inject network-specific control groups when `genesisBootstrap.controlGroups` is absent. To require a fixed control-group set, configure `genesisBootstrap.controlGroups` explicitly in `dingo.yaml`; Dingo counts only the listed endpoints and groups them by their configured `identity`.

***

<h2 id="relay">Relay Sample Topology File</h2>
For a typical 2 relay and BP setup, for the topology on your relay use:

- Use two localRoots groups so you can advertise your other relays while hiding your BP.
- Set `"advertise": false,` on the group that contains the BP, to keep the BP private.
- Because there is one additional relay, (2 relays in total) set "valency": 1, if you had two additional relays (3 relays in total), you would set "valency": 2, and so on.
- Dingo accepts `hotValency` as an alias for `valency`; when both keys are present, `valency` takes precedence. For non-empty topology groups, Dingo validates `warmValency` against the number of access points.
- Keep `useLedgerAfterSlot` at your network's value, so the relay can catch up after falling behind the tip.
- Genesis/snapshot mode uses `peerSnapshotFile` instead of (or in addition to) bootstrap peers.
- Leave Public roots blank by using `"publicRoots": [{ "accessPoints": [], "advertise": false }]`.

> In the sample below change "relay2.Address" and "blockProducerAddress" to your relay and BP address and change "port": 3001 to the port you use.

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
      "accessPoints": [
        {
          "address": "relay2.Address",
          "port": 3001
        }
      ],
      "advertise": true,
      "valency": 1,
      "trustable": true
    },
    {
      "accessPoints": [
        {
          "address": "blockProducerAddress",
          "port": 3001
        }
      ],
      "advertise": false,
      "valency": 1,
      "trustable": true
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

***

<h2 id="bp">BP Sample Topology File</h2>
A block producer keeps your own relays as its only local roots. Use the following configuration:

- Set `"bootstrapPeers": null`.
- Set `"advertise": false,` since these are the BP's local roots and should stay private.
- This example uses 2 relays, so it sets `"valency": 2`. With three relays, set it to `3`.
- Leave Public roots blank by using `"publicRoots": [{ "accessPoints": [], "advertise": false }]`.
- Set `useLedgerAfterSlot` to your network's value, as on the relays. With `-1`, a BP with one relay, or with relays that share one IPv4 /24 or IPv6 /64, may need ledger peers to catch up after a restart if it falls behind the tip (<a href="https://github.com/blinklabs-io/dingo/issues/5831" target="_blank">dingo#5831</a>). The default `genesisBootstrap.corroborationPeers: 0` does not prevent Genesis chain selection in this topology. When configuration sets a positive value, provide independent corroborating peers. The BP then also connects to ledger peers.
- The BP does not need `peerSnapshotFile` or `bootstrapPeers`.

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
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 119231973
}
```

***

After you save each topology file, point Dingo at it, restart the node, and confirm the block producer has hot connections to your relays.

Add this to the existing `/etc/dingo/dingo.yaml` (do not overwrite the file):

```
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Path to the topology configuration file
topology: \"$DINGO_HOME/config/topology.json\"
EOF"
```

> Paths follow the Dingo SPO guides; adjust them if necessary.
>
> $DINGO_HOME expands when you run that command, the same way it does in the Dingo Node Setup guide. Use a different topology.json on the block producer and on each relay.

***

You can check the file with:
```
sudo nano /etc/dingo/dingo.yaml
```

Then restart:
```
sudo systemctl restart dingo
```

***

### Congratulations! You now have custom topology files for your relays and block producer.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
