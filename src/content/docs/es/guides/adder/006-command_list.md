---
title: Guia de Referencia de Comandos
description: Lista de Comandos de Adder.
---

# <ins>Lista de comandos:</ins>

## Configuracion:


```
 -config string
```

> ruta al archivo de configuracion a cargar

***

## Filtro:

```
  -filter-address string
```

> especifica la direccion para filtrar
<br />


```
  -filter-asset string
```

> especifica la huella digital del activo (asset1xxx) para filtrar
<br />

```
  -filter-policy string
```

> especifica el ID de politica del activo para filtrar
<br />

```
  -filter-pool string
```

> especifica el ID del Pool para filtrar
<br />

```
  -filter-type string
```

> especifica el tipo de evento para filtrar

***

## Entrada:

```
  -input string
```

> plugin de entrada a usar, 'list' para mostrar disponibles (predeterminado "chainsync")
<br />

```
  -input-chainsync-address string
```

> especifica la direccion TCP del nodo al que conectarse en el formato 'host:puerto'
<br />

 ```
  -input-chainsync-auto-reconnect
```

> reconectar automaticamente si la conexion se interrumpe (predeterminado true)
<br />

```
  -input-chainsync-bulk-mode
```

> usar el modo de sincronizacion 'bulk' con NtN (nodo-a-nodo). Esto solo debe usarse contra tus propios nodos por razones de uso de recursos
<br />

```
  -input-chainsync-include-cbor
```

> incluir CBOR original para bloque/transaccion en eventos
<br />

```
  -input-chainsync-intersect-point string
```

> comenzar sincronizacion en el(los) punto(s) de cadena especificado(s) en formato '<slot>.<hash>'
<br />

```
  -input-chainsync-intersect-tip
```

> comenzar sincronizacion en la punta de la cadena (predeterminado genesis de la cadena) (predeterminado true)
<br />

```
  -input-chainsync-kupo-url string
```

> direccion kupo-url
<br />

```
  -input-chainsync-network string
```

> especifica un nombre de red Cardano conocido (predeterminado "mainnet")
<br />

```
  -input-chainsync-network-magic uint
```

> especifica el valor magic de red a usar, anula 'network'
<br />

```
  -input-chainsync-ntc-tcp
```

> usar el protocolo NtC (nodo-a-cliente) sobre TCP, para usar cuando se expone el socket UNIX de un nodo via socat o similar
<br />

```
  -input-chainsync-socket-path string
```

> especifica la ruta al socket UNIX al que conectarse

***

## Salida:

```
  -output string
```

> plugin de salida a usar, 'list' para mostrar disponibles (predeterminado "log")
<br />

```
  -output-log-level string
```

> especifica el nivel de log a usar (predeterminado "info")
<br />

```
  -output-notify-title string
```

> especifica el titulo a usar (predeterminado "Adder")
<br />

```
  -output-push-accessTokenUrl string
```

> especifica la url para obtener token de acceso (predeterminado `https://www.googleapis.com/auth/firebase.messaging`)
<br />

```
  -output-push-serviceAccountFilePath string
```

> especifica la ruta al archivo de cuenta de servicio
<br />

```
  -output-webhook-format string
```

> especifica el formato de carga del webhook a usar (predeterminado "adder")
<br />

```
  -output-webhook-password string
```

> especifica la contrasena para autenticacion basica
<br />

```
  -output-webhook-tls-skip-verify
```

> omitir verificacion tls (para certificados autofirmados)
<br />

```
  -output-webhook-url string
```

> especifica la url a usar (predeterminado `http://localhost:3000`)
<br />

```
  -output-webhook-username string
```

> especifica el nombre de usuario para autenticacion basica

***

## Version:

```
  -version
```

> mostrar version y salir

