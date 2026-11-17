---
title: "Validate Adder with Dingo on Cardano Preview"
description: "Connect Adder to a running Dingo Preview node through its N2C Unix socket."
---

Use a running Dingo node on Cardano `preview` and make its Node-to-Client Unix socket accessible to the user running Adder. See the [Dingo setup guide](/guides/dingo/002-quick-start-overview/) for node setup.

Set `DINGO_SOCKET_PATH` to that node’s socket path, then run Adder:

```sh
export DINGO_SOCKET_PATH=/path/to/dingo.socket
adder --input chainsync --input-chainsync-network preview \
  --input-chainsync-socket-path "$DINGO_SOCKET_PATH" \
  --input-chainsync-intersect-tip=true --output log
```

Check the log output for a successful connection, ChainSync intersection, and subsequent block events. New events depend on the node receiving blocks; a rollback can move the reported slot backwards. Stop Adder with Ctrl-C.

When no saved cursor is configured, `intersect-tip` requests the node’s current tip on each start. A saved cursor takes precedence; see [cursor persistence](/guides/adder/chainsync-cursor-persistence/).

For container stacks, use [cardano-compose-stacks](https://github.com/blinklabs-io/cardano-compose-stacks).

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
