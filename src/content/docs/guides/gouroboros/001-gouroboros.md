---
title: gOuroboros
description: Introduction to gOuroboros.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros is a powerful and versatile framework for building Go apps that interact with the Cardano blockchain. Quickly and easily write Go apps that communicate with Cardano nodes or manage blocks/transactions. Sync the blockchain from a local or remote node, query a local node for protocol parameters or UTxOs by address, and much more.

## New in v0.182.0

### Governance queries

gOuroboros now includes clearer Conway governance query examples and reference guidance for governance state queries. The `drep-state` example shows how to inspect registered DReps, including their deposit, expiry, and optional metadata anchor. The `committee-state` example shows how to inspect constitutional committee members, their authorization status, their term status, and the current committee threshold. The `proposals` example shows how to inspect active governance actions, their voting window, and the votes recorded so far. The `vote-delegatees` example shows how to inspect which DRep each stake credential delegates its voting rights to.

The local state query reference also explains when to use each governance query, what each one returns, and when a narrower query fits better than a full governance snapshot. This guidance covers `GetConstitution`, `GetGovState`, `GetDRepState`, `GetDRepStakeDistr`, `GetCommitteeMembersState`, `GetFilteredVoteDelegatees`, `GetSPOStakeDistr`, `GetProposals`, and `GetRatifyState`. Each of these governance queries requires Conway era ledger state.

### Governance action and proposal constructors

gOuroboros now provides constructor helpers for Conway governance data so applications can build anchors, action identifiers, governance actions, and proposal procedures without manually setting every required value. This support includes `NewGovAnchor`, `NewGovActionId`, `NewHardForkInitiationGovAction`, `NewTreasuryWithdrawalGovAction`, `NewNoConfidenceGovAction`, `NewUpdateCommitteeGovAction`, `NewNewConstitutionGovAction`, `NewInfoGovAction`, `NewConwayParameterChangeGovAction`, `NewConwayGovAction`, and `NewConwayProposalProcedure`.

These helpers also enforce the validation rules that matter when preparing governance data. `NewGovAnchor` and `NewGovActionId` require 32 byte hashes for anchor data and governance action transaction IDs. `NewTreasuryWithdrawalGovAction`, `NewNewConstitutionGovAction`, and `NewConwayParameterChangeGovAction` require any optional policy or script hash to use 28 bytes. `NewTreasuryWithdrawalGovAction` rejects empty withdrawal sets and nil withdrawal entries. `NewUpdateCommitteeGovAction` rejects nil committee entries and zero value quorum ratios. `NewConwayGovAction` rejects nil, typed nil, or unsupported governance actions.

***

Learn more about the code documentation of gOuroboros here: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.  
