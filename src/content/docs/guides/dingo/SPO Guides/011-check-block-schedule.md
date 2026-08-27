---
title: Check Block Schedule
description: SPO Guide for Dingo Pools - How to run slot leader check to see your block schedule.
---

You can check if you are scheduled to mint block by running the slot leader check in the `cardano-cli`.

This can be done for either the current epoch or the next epoch. The next epoch's schedule becomes avaiable once the current epoch is at least 70% complete.

***

<img src="/dingo-epoch-70-percent-over.png"
     alt="dingo-epoch-70-percent-over"
     style="max-width:100%; height:auto; max-height:350px; object-fit:contain; border:1px solid #ccc;" />

***

<br> 

## Run Slot Leader Check for Current Epoch
Run the following command to check whether your pool is scheduled to mint a block in the current epoch. 

> ✅ This assumes you have a stakepoodid.txt file on your BP. If not, follow steps [here](../005-register-pool/#step-81---create-stakepoolidtxt-file).
>
> ⚠️ Adjust paths if needed

```
cd ~/dingo
cardano-cli query leadership-schedule \
   --genesis $HOME/dingo/config/cardano/preview/shelley-genesis.json \
   --stake-pool-id $(cat stakepoolid.txt) \
   --vrf-signing-key-file vrf.skey \
   --current
```

***

<br>

## Run Slot Leader Check for Next Epoch
Run the following command to check whether your pool is scheduled to mint a block in the next epoch. (Only run this when the current epoch is more than 70% complete.)

> ✅ This assumes you have a stakepoodid.txt file on your BP. If not, follow steps [here](../005-register-pool/#step-81---create-stakepoolidtxt-file).
>
> ⚠️ Adjust paths if needed

```
cd ~/dingo
cardano-cli query leadership-schedule \
   --genesis $HOME/dingo/config/cardano/preview/shelley-genesis.json \
   --stake-pool-id $(cat stakepoolid.txt) \
   --vrf-signing-key-file vrf.skey \
   --next
```

***

<br>

### Congratulations! 
Hopefully your pool is scheduled to mint **Cardano** blocks using Dingo!
