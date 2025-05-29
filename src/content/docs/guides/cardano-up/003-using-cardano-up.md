---
title: Using cardano-up
description: A guide how to use cardano-up.
---

# Using cardano-up to install Cardano services

cardano up is a command line utility for managing Cardano services. cardano-up allows you to use a command line utility to install cardano service by using docker images.

Let's walk through how to open cardano-up, and see how we can use it to install Cardano services that we might need.

> ✅ For this guide we assume you have already downloaded the cardano-up binary and have opened the Ubuntu app. If not see our [Quick Start](../002-quick-start-docker-desktop) guide.

***

### Contexts

Before we start installing packages we need to understand what `contexts` are and how cardano-up use them. 

Contexts are used to allow you to install multiple copies of the same package with different network configurations side by side. They allow you to do things
such as running a `preprod` and `mainnet` Cardano node on the same machine, or even have multiple `preview` Cardano node instances running different versions
of the node.

Commands such as `install`, `uninstall`, and `list` work in the active context. You can use the `context` command to change the active context or manage available contexts.

The `context` subcommand manages contexts. It has subcommands of its own for the various context-related functions. Learn more in our [Reference Guide](../004-reference-guide).

#### `context create`

Create a new context with a given name, optionally specifying a description and a Cardano network. We use the `-n` flag to specify the Cardano network and the `-d` flag to give it a description

✅ In this sample we name our new context `dev` and set the network to `preview` with description of `preview test`

```
cardano-up context create dev -n preview -d 'preview test'
```

![cardano-up-context-create-dev-sample](/cardano-up-context-create-dev-sample.png)


***

> 🛑 In order to install a package and interact with it we need to add `~/.local/bin` to your `$PATH` by adding the following to your shell RC/profile to make any commands/scripts installed readily available
> 
> ```
> export PATH=~/.local/bin:$PATH
> ```

## Install
