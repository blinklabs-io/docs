---
title: Adder API and Event Reference
description: Configure event delivery and implement the Adder Go API shutdown contract.
---

# Adder API and Event Reference

## Overview

This reference describes the public `/events` replay option and the Go API shutdown contract. It covers event delivery and API lifecycle behavior.

## `/events` replay behavior

Connect to `/events` to receive Adder events. Add the optional `replay` query parameter when a connection needs a specific delivery mode:

```
/events?replay=false
```

The endpoint applies these rules:

- When a client omits the parameter, Adder uses `replay=true` and enables buffered replay.
- `replay=true` enables buffered replay.
- `replay=false` delivers live events only. Adder does not replay buffered events.

### Tray connections

The built-in tray requests `/events?replay=false` for its initial connection. When the tray reconnects, it requests `/events?replay=true`, and the server replays buffered events. Other API clients can choose their own connection policy.

## Go API shutdown contract

The `api.API` interface requires this method:

```go
Shutdown(context.Context) error
```

`APIv1` implements `Shutdown` to shut down its listener. Code that implements or calls `api.API` must provide or handle this method and its returned error.