---
title: Reference Guide
description: A guide how to use cardano-up.
---

# Reference Guide

cardano up is a command line utility for managing Cardano services. cardano-up allows you to use a command line utility to install cardano service by using docker images.

This guide further explains how cardano-up works, managing packages and commands you can use. 

***

> ✅ For this guide we assume you have already downloaded the cardano-up binary and have opened the Ubuntu app. If not see our [Quick Start](../002-quick-start-docker-desktop) guide.

***

## List available packages

We can see what available packages or put another way what available Cardano services we can install with cardano-up by running the following command in our Ubuntu app:

```
cardano-up list-available
```

![cardano-up-list-available](/cardano-up-list-available.png)

***

## Contexts

Before we start installing packages we need to understand what `contexts` are and how cardano-up use them. 

Contexts are used to allow you to install multiple copies of the same package with different network configurations side by side. They allow you to do things
such as running a `preprod` and `mainnet` Cardano node on the same machine, or even have multiple `preview` Cardano node instances running different versions
of the node.

Commands such as `install`, `uninstall`, and `list` work in the active context. You can use the `context` command to change the active context or manage available contexts.

The `context` subcommand manages contexts. It has subcommands of its own for the various context-related functions.

#### `context create`

Create a new context with a given name, optionally specifying a description and a Cardano network. We use the `-n` flag to specify the Cardano network and the `-d` flag to give it a description

✅ In this sample we name our new context `dev` and set the network to `preview` with description of `preview test`

```
cardano-up context create dev -n preview -d 'preview test'
```

![cardano-up-context-create-dev-sample](/cardano-up-context-create-dev-sample.png)

#### `context delete`

Delete the context with the given name, if it exists

```
cardano-up context delete contextName
```

✅ In this sample we name our context `dev`

![cardano-up-context-delete](/cardano-up-context-delete.png)

#### `context env`

Output environment variables for the active context

#### `context list`

Lists the available contexts

```
cardano-up context list
```

![cardano-up-context-list](/cardano-up-context-list.png)


#### `context select`

Sets the active context to the given context name

***

> 🛑 In order to install a package and interact with it we need to add `~/.local/bin` to your `$PATH` by adding the following to your shell RC/profile to make any commands/scripts installed readily available
> 
> ```
> export PATH=~/.local/bin:$PATH
> ```

## Install

