---
title: Reference Guide
description: A guide how to use cardano-up.
---

# Reference Guide

cardano up is a command line utility for managing Cardano services. cardano-up allows you to use a command line utility to install Cardano service by using docker images.

This guide further explains how cardano-up works, managing packages and commands you can use. 

### Quick Links:

[Command Reference](#1) | [General cardano-up Commands](#2) | [Contexts](#3)

***

<a name="1"></a>

## Command Reference

The `cardano-up` command consists of multiple subcommands. You can list all subcommands by running `cardano-up` with no arguments or with the `--help` option.

```
$ cardano-up
Usage:
  cardano-up [command]

Available Commands:
  completion     Generate the autocompletion script for the specified shell
  context        Manage the current context
  down           Stops all Docker containers
  help           Help about any command
  info           Show info for an installed package
  install        Install package
  list           List installed packages
  list-available List available packages
  logs           Show logs for an installed package
  uninstall      Uninstall package
  up             Starts all Docker containers
  update         Update the package registry cache
  upgrade        Upgrade package
  validate       Validate package file(s) in the given directory
  version        Displays the version

Flags:
  -D, --debug   enable debug logging
  -h, --help    help for cardano-up
  -v, --verbose Show all available versions of packages

Use "cardano-up [command] --help" for more information about a command.
```

***

<a name="2"></a>

## General cardano-up Commands:

#### List available packages

We can see what available packages or put another way what available Cardano services we can install with cardano-up by running the following command in our Ubuntu app:

```
cardano-up list-available
```

![cardano-up-list-available](/cardano-up-list-available.png)

#### Install a Package

> 🛑 In order to install a package and interact with it we need to add `~/.local/bin` to your `$PATH` by adding the following to your shell RC/profile to make any commands/scripts installed readily available
> 
> ```
> export PATH=~/.local/bin:$PATH
> ```

To install a package we run `cardano-up install (Package Name)` for this example `cardano-node`

```
cardano-up install cardano-node
```

#### Uninstall a Package

To uninstall a package we run `cardano-up uninstall (Package Name)` for this example `cardano-node`

```
cardano-up uninstall cardano-node
```

#### `down`

Stops all running services for packages in the active context

#### `help`

Displays usage information for commands and subcommands

#### `info`

Shows information for an installed package, including the name, version, context name, any post-install notes, etc.

#### `list`

Lists installed packages in the active context, or all contexts with `-A`

#### `logs`

Displays logs from a running service for the specified package in the active context

#### `up`

Starts all services for packages in the active context

#### `update`

Force a refresh of the package registry cache

#### `upgrade`

Upgrade the specified package

#### `validate`

Validates packages defined in specified path

#### `version`

Displays the version

***

<a name="3"></a>

## Contexts

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

```
cardano-up context env
```

![cardano-up-context-env](/cardano-up-context-env.png)

#### `context list`

Lists the available contexts

```
cardano-up context list
```

![cardano-up-context-list](/cardano-up-context-list.png)


#### `context select`

Sets the active context to the given context name. In this example we select the `dev` context.

```
cardano-up context select dev
```

![cardano-up-context-select](/cardano-up-context-select.png)

***

