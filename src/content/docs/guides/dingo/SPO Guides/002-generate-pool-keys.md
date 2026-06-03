---
title: Generate Pool Keys
description: SPO Guide for Dingo Pools - Generate Pool Keys.
---

# Dingo - Block Production Keys

We will now generate the Pool Keys needed for Block Production on the Preview Network. 


| Key	| Purpose	| Where it lives
|-------|---------------|-------------------|
|Cold key (cold.skey / cold.vkey)	|Authorizes pool registration and KES rotation	|Air-gapped machine only — never transferred
|KES key (kes.skey / kes.vkey)	|Signs blocks; rotated every ~90 days	|kes.skey - Block producer
|VRF key (vrf.skey / vrf.vkey)	|Proves slot leadership	|vrf.skey - Block producer
|Operational certificate (node.cert)	|Binds KES key to cold key for the node	|Block producer


For background on what these keys do, see <a href="https://developers.cardano.org/docs/operate-a-stake-pool/basics/cardano-key-pairs/" target="new" >Cardano Key Pairs</a>.

***

> ⚠️ The following guide assumes your have already completed the following 3 steps. If not please do them first and return here when done. 
> 
> - [x] 1. Complete the [Quick Start](../002-quick-start-overview) guide.
> - [x] 2. [Create Start Up Serivce](../003-create-start-up-service)
> - [x] 3. [Install Cardano CLI](../004-using-dingo-with-cardano-cli)

***



## Step 1 



A Block Producer node only requires 3 files:

- stake pool cold key (node.cert)
- stake pool hot key (kes.skey)
- stake pool VRF key (vrf.skey)
