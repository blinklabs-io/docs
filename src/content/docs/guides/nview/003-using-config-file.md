---
title: nview Configuration File Guide
description: nview - How to use a Configuration (YAML) file.
---

# Using Configuration (YAML) File

Running nview against a running Cardano Node will work out of the box with a default Cardano Node configuration, which exposes metrics in Prometheus data format on a specific port. However if you need to make change you can run nview with a configuration file.

***

To use a configuration file, run `nview` with a command line flag to set the file to load as a configuration. Edit the path to match the path to your `config.yml` file.

```
./nview -config /path/to/config.yml
```

config.yaml:

```
app:
  nodeName: Cardano Node
  network:
node:
  network: mainnet
  port: 3001
prometheus:
  host: 127.0.0.1
  port: 12798
  timeout: 3
```

***

A detailed breakdown of the configuration file:

```

---
# Example config file for nview
# The values shown below correspond to the in-code defaults

app:
  # Display name for the node
  #
  # This can also be set via the NODE_NAME environment variable
  nodeName: Cardano Node

  # Named Cardano network for cardano-node
  #
  # This is a short-cut to select the NetworkMagic and can be used to
  # select mainnet, preprod, preview, or sancho networks.
  #
  # This can also be set via the NETWORK environment variable and overrides
  # the node specific setting below
  network:

node:
  # Named Cardano network for cardano-node
  #
  # This is a short-cut to select the NetworkMagic and can be used to
  # select mainnet, preprod, preview, or sancho networks.
  #
  # This can also be set via the CARDANO_NETWORK environment variable
  network: mainnet

  # NetworkMagic for network for cardano-node
  #
  # This selects the correct network for operation and can be configured to
  # any network, not just the named networks.
  #
  # This can also be set via the CARDANO_NODE_NETWORK_MAGIC environment
  # variable
  networkMagic:

  # Port for cardano-node
  #
  # Listening port for cardano-node for NtN communication.
  #
  # This can also be set via the CARDANO_PORT environment variable
  port: 3001

  # Socket path for cardano-node
  #
  # Listening UNIX socket path and file name for cardano-node NtC
  # communication.
  #
  # This can also be set via the CARDANO_NODE_SOCKET_PATH environment variable
  socketPath:

prometheus:
  # host/port for cardano-node Prometheus metrics
  #
  # These can also be set via the PROM_HOST and PROM_PORT environment variables
  host: 127.0.0.1
  port: 12798

  # Timeout for connections to cardano-node
  #
  # This can also be set via the PROM_TIMEOUT environment variable
  timeout: 3

```

### Congratulations you are ready to start monitoring your node using nview with your own config file!
