---
title: Adder Command List
description: List of Adder Commands.
---

# <ins>List of commands:</ins>

## Configuration:


```
 -config string
```
 
> path to config file to load

***

## Filter:

```
  -filter-address string
```
  
> specifies address to filter on
<br />


```
  -filter-asset string
```
  
> specifies the asset fingerprint (asset1xxx) to filter on
<br />

```
  -filter-policy string
```
  
> specifies asset policy ID to filter on
<br />

```
  -filter-pool string
```
  
> specifies Pool ID to filter on
<br />

```
  -filter-type string
```
  
> specifies event type to filter on
        
***

## Input:

```
  -input string
```
  
> input plugin to use, 'list' to show available (default "chainsync")
<br />

```
  -input-chainsync-address string
```
  
> specifies the TCP address of the node to connect to in the form 'host:port'
<br />

 ```
  -input-chainsync-auto-reconnect
```
  
> auto-reconnect if the connection is broken (default true)
<br />

```
  -input-chainsync-bulk-mode
```
  
> use the 'bulk' sync mode with NtN (node-to-node). This should only be used against your own nodes for resource usage reasons
<br />

```
  -input-chainsync-include-cbor
```
  
> include original CBOR for block/transaction in events
<br />

```
  -input-chainsync-intersect-point string
```
  
> start syncing at the specified chain point(s) in '<slot>.<hash>' format
<br />

```
  -input-chainsync-intersect-tip
```
  
> start syncing at the chain tip (defaults to chain genesis) (default true)
<br />

```
  -input-chainsync-kupo-url string
```
  
> kupo-url address
<br />

```
  -input-chainsync-network string
```
  
> specifies a well-known Cardano network name (default "mainnet")
<br />

```
  -input-chainsync-network-magic uint
```
  
> specifies the network magic value to use, overrides 'network'
<br />

```
  -input-chainsync-ntc-tcp
```
  
> use the NtC (node-to-client) protocol over TCP, for use when exposing a node's UNIX socket via socat or similar
<br />

```
  -input-chainsync-socket-path string
```
  
> specifies the path to the UNIX socket to connect to

***

## Output:

```
  -output string
```
  
> output plugin to use, 'list' to show available (default "log")
<br />

```
  -output-log-level string
```
  
> specifies the log level to use (default "info")
<br />

```
  -output-notify-title string
```
  
> specifies the title to use (default "Adder")
<br />

```
  -output-push-accessTokenUrl string
```
  
> specifies the url to get access token from (default "https://www.googleapis.com/auth/firebase.messaging")
<br />

```
  -output-push-serviceAccountFilePath string
```
  
> specifies the path to the service account file
<br />

```
  -output-webhook-format string
```
  
> specifies the webhook payload format to use (default "adder")
<br />

```
  -output-webhook-password string
```
  
> specifies the password for basic auth
<br />

```
  -output-webhook-tls-skip-verify
```
  
> skip tls verification (for self-signed certs)
<br />

```
  -output-webhook-url string
```
  
> specifies the url to use (default "http://localhost:3000")
<br />

```
  -output-webhook-username string
```
  
> specifies the username for basic auth

***

## Version:

```
  -version
```
  
> show version and exit

