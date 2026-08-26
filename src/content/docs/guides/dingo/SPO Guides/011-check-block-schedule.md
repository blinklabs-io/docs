---
title: Check Block Schedule
description: SPO Guide for Dingo Pools - How to run slot leader check to see your block schedule.
---

You can check if you are scheduled to mint block by running the slot leader check in the cardano-cli. This can be done for the current Epoch or the next Epoch. The next epoch schedule can be checked before the start of the next epoch at the 70% of the current epoch's completion.
<img src="/dingo-epoch-70-percent-over.png"
     alt="dingo-epoch-70-percent-over"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />
     
## Run Slot Leader Check for Current Epoch

```
cardano-cli query leadership-schedule \
   --genesis $HOME/dingo/config/cardano/preview/shelley-genesis.json \
   --stake-pool-id $(cat stakepoolid.txt) \
   --vrf-signing-key-file vrf.skey \
   --current
```


## Run Slot Leader Check for Next Epoch

```
cardano-cli query leadership-schedule \
   --genesis $HOME/dingo/config/cardano/preview/shelley-genesis.json \
   --stake-pool-id $(cat stakepoolid.txt) \
   --vrf-signing-key-file vrf.skey \
   --next
```
