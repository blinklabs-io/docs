---
title: Topology Guide Overview
description: SPO Guide for Dingo Pools - Overview on how to setup a Topology JSON file.
---

Dingo works with the embedded default topology file, but as an SPO you should use your own `topology.json`. This guide will use the preview network topology file as a sample. All network topology files can be found here: <a href="https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

Please modify for your network and node layout. For this guide we will provide an overview based on the common recommendation of using a Block producer node behind two relay nodes.

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
Bootstrapping peers are good for when your node has had an extended outage, you'll sync from those and trusted peers and then ledger once on tip.

***

<h3 id="advertise">Advertise Flag</h3>
When advertise is true, the node may share that peer’s address through peer sharing. That can increase inbound connections to the advertised peer. This is useful for unregistered relays. Never advertise the block producer.

***

<h3 id="access">Access Points</h3>
You can have multiple localRoots groups. Why would you want to use this? This way you can keep advertise as false for your BP while true for your relay. 

***

<h3 id="trustable">Trustable Flag</h3>
Trustable peers consist of the bootstrap peers and the trustable local root peers. By default, local root peers are not trustable.  

<br>

Your own Relays and BP should be set to `"trustable": true`

***

<h2 id="relay">Relay Sample Topology File</h2>
For a typical 2 relay and BP setup, for the topology on your relay use:

- Use two localRoots groups so you can advertise your other relays while hiding our BP.
- Set `"advertise": false,` on the group that contains the BP, since we want to keep the BP private.
- Because there is one additional Relay, (2 relays in total) set "valency": 1, if you had two additional Relays (3 relays in total), you would set "valency": 2, and so on.
- Set your Relays to "trustable": true, so you can sync if you get too far off the tip.
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
For a block producer node we only want it to connect to our relays. To do this we use the following configuration:

- Set `"bootstrapPeers": null`.
- Set `"advertise": false,` since these are local root on BP and we want to keep private.
- Set our Relays to `"trustable": true,`.
- Since in this example we use 2 Relays, we set `"valency": 2`, if you had three Relays set it to `3`.
- Leave Public roots blank by using `"publicRoots": [{ "accessPoints": [], "advertise": false }]`.
- Set `"useLedgerAfterSlot": -1` so the BP doesn't try to connect to other nodes using ledger peer data.
- BP does not need peerSnapshotFile or bootstrap peers because it should not sync from the public network.

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
  "useLedgerAfterSlot": -1
}
```

***

After you save each topology file, point Dingo at it, restart the node, and confirm the block producer has hot connections only to your relays.

Add this to the existing `/etc/dingo/dingo.yaml` (do not overwrite the file):

```bash
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Path to the topology configuration file
topology: \"$DINGO_HOME/config/topology.json\"
EOF"

> Paths based on Dingo SPO guides, adjust paths if necessary.
>
>$DINGO_HOME expands when you run that command, the same way it does in the Dingo Node Setup guide. Use a different topology.json on the block producer and on each relay.

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
