---
title: Guía de solución de problemas
description: Procedimientos para diagnosticar conexiones, configuración, filtros, notificaciones push y webhooks de Adder.
---

# <ins>Guía de solución de problemas:</ins>

<br />

Esta guía describe procedimientos para diagnosticar los problemas más comunes al ejecutar Adder. Incluye únicamente opciones de CLI, nombres de configuración y rutas de API verificadas.

## 1. Problemas de conexión

Estos problemas aparecen cuando el plugin de entrada `chainsync` no puede conectarse al nodo de Cardano o completar el protocolo de enlace.

### A. Problemas con la ruta del socket local (NtC)

Si Adder rechaza la conexión o muestra un error como `no such file or directory`, compruebe el socket local de Node-to-Client (NtC).

1. Confirme que el nodo de Cardano está en ejecución y creó el archivo de socket.
2. Compruebe que la ruta configurada coincide con el socket. Use `--input-chainsync-socket-path` o la variable de entorno `CARDANO_NODE_SOCKET_PATH`.
3. Compruebe los permisos del archivo:

   ```bash
   ls -la /path/to/cardano-node.socket
   ```

### B. Desajuste de red

Si Adder establece la conexión pero no completa el protocolo de enlace y muestra un error como `handshake failed: network magic mismatch`, haga coincidir la red y el valor magic del nodo de Cardano con los de Adder.

Configure el nombre de la red con `--input-chainsync-network` o con `INPUT_CHAINSYNC_NETWORK`. También puede usar la variable de entorno personalizada `CARDANO_NETWORK`:

```bash
export INPUT_CHAINSYNC_NETWORK=preview
```

Cuando la red requiere un valor específico, configure `--input-chainsync-network-magic`. Esta opción tiene prioridad sobre `--input-chainsync-network`.

### C. Selección de NtC, NtN o NtC sobre TCP

Seleccione el modo de conexión según la ubicación y el protocolo del nodo:

- Para una conexión local NtC, configure `--input-chainsync-socket-path` con la ruta del socket UNIX.
- Para una conexión remota NtN, configure `--input-chainsync-address` con un host y un puerto, como `relays-new.cardano-mainnet.iohk.io:3001`.
- Para NtC sobre TCP, configure `--input-chainsync-address` y `--input-chainsync-ntc-tcp` cuando un proxy como `socat` exponga el socket UNIX del nodo.

Compruebe que el puerto TCP remoto acepta conexiones:

```bash
nc -zv relays-new.cardano-mainnet.iohk.io 3001
```

---

## 2. Problemas de configuración

Adder aplica esta precedencia: indicadores de CLI > archivo YAML > variables de entorno > valores predeterminados.

### A. Una variable de entorno no tiene efecto

Compruebe el nombre exacto de la variable y confirme que ningún indicador de CLI ni clave YAML la reemplaza.

Para el plugin `chainsync`, use `INPUT_CHAINSYNC_NETWORK` para la opción `network`, `CARDANO_NETWORK` como nombre alternativo personalizado y `CARDANO_NODE_SOCKET_PATH` para `socket-path`. No agregue el prefijo `ADDER_` a estos nombres.

Un archivo YAML coloca las opciones del plugin dentro de los grupos `input` o `output`, el nombre del plugin y la opción correspondiente. Por ejemplo:

```yaml
plugins:
  input:
    chainsync:
      network: preview
      socket-path: /path/to/cardano-node.socket
```

### B. Archivo YAML ausente o valor no válido

Compruebe la ruta indicada por `--config` y valide la sintaxis YAML antes de iniciar Adder:

```bash
```

Cada valor YAML debe usar el tipo esperado por la opción correspondiente. Por ejemplo, `network` acepta una cadena y `ntc-tcp` acepta un valor booleano.

---

## 3. Problemas con los filtros

Los filtros de tipos diferentes usan lógica `AND`; los valores de una misma lista de filtros usan lógica `OR`.

### A. Los eventos no atraviesan el filtro

Si Adder se ejecuta pero no emite eventos, quite temporalmente los filtros adicionales y compruebe primero la emisión de eventos sin condiciones específicas. Los eventos `input.block` e `input.governance` no admiten los filtros `--filter-policy` ni `--filter-asset`.

Ejecute un filtro mínimo por tipo:

```bash
./adder --filter-type input.transaction
```

Si este comando produce eventos, vuelva a agregar los demás filtros de uno en uno para identificar la condición que impide la emisión.

---

## 4. Problemas con las notificaciones push

### A. Credenciales de FCM

El plugin `push` necesita una ruta no vacía al archivo de cuenta de servicio. Configure `--output-push-serviceAccountFilePath` con la ruta del archivo JSON y confirme que el sistema puede leer el archivo:

```bash
cat /path/to/service-account.json | grep "project_id"
```

El archivo debe contener el campo JSON `project_id` como una cadena no vacía. Un archivo ausente, ilegible, mal formado o sin un `project_id` válido impide que el plugin obtenga el token de acceso.

### B. Fallos de entrega

Si FCM indica que no tiene registrado un token (`UNREGISTERED`), elimine el token del registro mediante la ruta de API completa:

```bash
curl -X DELETE http://localhost:8080/v1/fcm/<token>
```

La API usa el grupo `/v1`, por lo que `/fcm/<token>` sin el prefijo `/v1` no es una ruta válida para esta operación.

---

## 5. Problemas con los webhooks

### A. URL o formato del webhook

Configure el plugin con `--output webhook`, `--output-webhook-url`, `--output-webhook-format`, `--output-webhook-username`, `--output-webhook-password` y `--output-webhook-tls-skip-verify` según corresponda:

```bash
./adder --output webhook \
        --output-webhook-url="https://your-webhook-url.com" \
        --output-webhook-format=adder \
        --output-webhook-username="username" \
        --output-webhook-password="password" \
        --output-webhook-tls-skip-verify=false
```

Compruebe que el servidor responde a una solicitud `POST`:

```bash
curl -H "Content-Type: application/json" -X POST -d '{"type":"test"}' https://your-webhook-url.com
```

`--output-webhook-max-retries` y `--output-webhook-initial-backoff` no son opciones de CLI ni claves YAML de Adder. No las incluya en comandos ni en archivos de configuración.

### B. Problemas con el certificado TLS

Si el servidor rechaza la entrega y devuelve `x509: certificate signed by unknown authority`, compruebe su certificado TLS. Para un certificado autofirmado, habilite `--output-webhook-tls-skip-verify` únicamente cuando la omisión de la verificación resulte aceptable.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>