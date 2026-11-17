---
title: Guía de solución de problemas de Adder
description: Procedimientos de diagnóstico y observabilidad para Adder.
---

# Guía de solución de problemas

Esta guía cubre los problemas operativos más frecuentes de Adder e incluye comandos de diagnóstico, causas habituales y procedimientos de resolución.

---

## 1. Problemas de conexión

Estos problemas aparecen cuando el plugin de entrada `chainsync` no puede conectarse al nodo Cardano o completar la negociación inicial.

### A. Problemas con la ruta del socket (NtC)

* **Síntoma**: Adder registra un rechazo de conexión o un error `no such file or directory` al intentar conectarse al socket local Node-to-Client (NtC).
* **Causa**: El archivo de socket UNIX no existe en la ruta indicada o el usuario que ejecuta Adder no tiene permisos de lectura y escritura sobre el socket.
* **Resolución**:
  1. Comprueba que el nodo Cardano esté completamente iniciado y haya creado el archivo de socket.
  2. Comprueba la ruta del socket en la configuración, en `--input-chainsync-socket-path` o en `INPUT_CHAINSYNC_SOCKET_PATH`.
  3. Comprueba los permisos del archivo:
     ```bash
     ls -la /path/to/cardano-node.socket
     ```

### B. Diferencia en la selección de red

* **Síntoma**: La conexión se establece, pero el protocolo rechaza la negociación de inmediato con errores como `handshake failed: network magic mismatch`.
* **Causa**: El network magic de Adder no coincide con el network magic del nodo Cardano en ejecución, por ejemplo, cuando Adder usa `mainnet` y el nodo usa `preview`.
* **Resolución**: Alinea la configuración de red.
  - Establece la red correcta mediante una variable de entorno:
    ```bash
    export INPUT_CHAINSYNC_NETWORK=preview
    ```
  - Comprueba el valor de `network` en `config.yaml`.
  - Si la red requiere un valor explícito, comprueba `--input-chainsync-network-magic`.

### C. Selección de NtC y NtN

* **Síntoma**: La conexión falla o Adder no puede resolver la dirección.
* **Causa**: La configuración mezcla Node-to-Client (socket local) y Node-to-Node (TCP remoto).
* **Resolución**:
  - Para una conexión local al nodo mediante NtC, proporciona la ruta del socket UNIX.
  - Para una conexión remota mediante NtN, proporciona un host y un puerto, por ejemplo `relays-new.cardano-mainnet.iohk.io:3001`, y comprueba que el puerto TCP 3001 sea accesible:
    ```bash
    nc -zv relays-new.cardano-mainnet.iohk.io 3001
    ```
  - Usa `--input-chainsync-ntc-tcp` solo cuando `socat` u otra herramienta equivalente exponga un socket NtC mediante TCP.

---

## 2. Problemas de configuración

Adder resuelve la configuración en este orden: valores predeterminados, archivo YAML, variables de entorno y opciones explícitas de la línea de comandos. Una opción CLI prevalece sobre una variable de entorno, una variable de entorno prevalece sobre YAML y YAML prevalece sobre los valores predeterminados.

### A. La variable de entorno no se carga

* **Síntoma**: Una variable de entorno no cambia el comportamiento de Adder.
* **Causa**: El nombre contiene un error, no pertenece a la familia del ajuste o una opción CLI explícita lo reemplaza.
* **Resolución**:
  - Usa nombres principales sin un prefijo general, como `INPUT`, `OUTPUT` y `API_PORT`, o los espacios de nombres de los plugins, como `INPUT_CHAINSYNC_`.
  - Lista los nombres activos sin imprimir credenciales:
    ```bash
    env | cut -d= -f1 | grep -E "^(INPUT|OUTPUT|API|DEBUG|KUPO)(_|$)"
    ```
  - Consulta la referencia de comandos para distinguir el nombre de una opción CLI, su variable de entorno y su clave YAML. En particular, los filtros usan nombres de entorno basados en el plugin, no una traducción literal de la opción.

### B. El archivo YAML no existe o contiene un valor no válido

* **Síntoma**: Adder muestra `failed to read configuration file` o `yaml: unmarshal errors`.
* **Causa**: La ruta contiene un error, la indentación no es válida o un valor tiene un tipo incorrecto, como una cadena donde se espera un entero.
* **Resolución**: Valida la sintaxis YAML:
  ```bash
  python3 -c "import yaml; yaml.safe_load(open('config.yaml'))"
  ```

---

## 3. Problemas con los filtros

Los filtros aplican lógica **AND** entre tipos de filtro. Dentro de una lista de un mismo filtro, Adder aplica lógica **OR**; `--filter-pool` y `--filter-drep` también aplican **OR** entre sí. Las restricciones de política y activo reducen aún más las coincidencias de transacciones. Consulta la [referencia de comandos](./006-command_list.md#filtro).

### A. Los eventos no pasan el filtro

* **Síntoma**: Adder se ejecuta, pero no emite eventos y el pipeline parece inactivo.
* **Causa**: Hay demasiados filtros, como un filtro de política de activo aplicado a un evento de bloque, o las entradas del filtro tienen un formato incorrecto.
* **Resolución**:
  - Comprueba `--output-log-level`: `warn` y `error` suprimen los registros de eventos; usa `info` o `debug` para verlos.
  - Recuerda que `--filter-policy` y `--filter-asset` no se aplican a los eventos `input.block` ni `input.governance`.
  - Empieza con un filtro basado solo en el tipo para comprobar la emisión de eventos sin otras restricciones:
    ```bash
    ./adder --filter-type input.transaction
    ```

### B. Requisitos de formato

* **Direcciones**: Usa direcciones de pago o stake Bech32 válidas, como `addr1...` y `stake1...`.
* **Policy IDs**: Usa cadenas hexadecimales de exactamente 28 bytes, es decir, 56 caracteres.
* **DRep IDs**: Adder acepta Bech32 (`drep1...` o `drep_script1...`) y hashes hexadecimales sin formato.
* **Diagnóstico**: Comprueba la longitud de un policy ID con:
  ```bash
  echo -n "2dd15e0efd5c07b6bfbc0cf7fb2f767a50e189d7bfa50e1ef0b87abc" | wc -c
  ```

---

## 4. Problemas con las notificaciones push

### A. Credenciales de FCM

* **Síntoma**: El plugin push registra `failed to get token` o `failed to read credential file`.
* **Causa**: El archivo JSON de la cuenta de servicio no existe, no se puede leer o no contiene credenciales válidas de Google.
* **Resolución**:
  1. Comprueba que el archivo exista y sea legible:
     ```bash
     test -r /path/to/service-account.json
     ```
  2. Comprueba que el JSON incluya `project_id` como una cadena no vacía.

### B. Fallos de entrega

* **Síntoma**: Adder registra errores `failed to send message to token...`.
* **Causa**: El token de FCM caducó, dejó de estar registrado o los servicios de Firebase no están disponibles.
* **Resolución**: Inspecciona la respuesta de error de FCM. Si indica `UNREGISTERED`, elimina el token inválido del registro de clientes mediante el endpoint REST `/v1/fcm`:
  ```bash
  curl -X DELETE http://localhost:8080/v1/fcm/<token>
  ```

---

## 5. Problemas con los webhooks

### A. Reintentos y tiempos de espera

* **Síntoma**: Los mensajes del webhook se retrasan o Adder registra `webhook delivery to ... failed after 4 attempts`.
* **Causa**: El servidor de destino responde lentamente, no está disponible o devuelve un estado HTTP que Adder no puede reintentar.
* **Resolución**:
  - Prueba manualmente el endpoint para comprobar que responde y acepta cargas `POST`:
    ```bash
    curl -H "Content-Type: application/json" -X POST -d '{"type":"test"}' https://your-webhook-url.com
    ```
  - Selecciona el output y el endpoint con las opciones registradas:
    ```bash
    ./adder --output webhook --output-webhook-url="https://your-webhook-url.com"
    ```
  - Usa las opciones registradas `--output-webhook-format`, `--output-webhook-username`, `--output-webhook-password`, `--output-webhook-tls-skip-verify`, `--output-webhook-state-path` y `--output-webhook-max-pending` según corresponda. El número de reintentos y el backoff forman parte del comportamiento interno y no se configuran mediante opciones CLI.
  - Los llamadores Go pueden usar `webhook.WithRetryConfig`; el comportamiento interno de reintentos no crea opciones CLI nuevas.

### B. Política de reintentos

Adder realiza un intento inicial y, de forma predeterminada, hasta tres reintentos. Solo reintenta los fallos de transporte transitorios y las respuestas HTTP `408`, `429` y `5xx`. Usa un backoff exponencial acotado, con esperas predeterminadas de `1s`, `2s` y `4s`, hasta un máximo de `30s`.

Una respuesta `Retry-After` válida puede aumentar la espera, pero Adder la limita al máximo configurado. Si solicita una espera superior a ese máximo, Adder clasifica el fallo como `terminal` y detiene la entrega inmediatamente. Los fallos permanentes de transporte, las respuestas HTTP no reintentables y otras respuestas no `2xx` también detienen la entrega inmediatamente. Cuando se alcanza el límite de reintentos, Adder clasifica el resultado como `exhausted` y descarta el evento sin `--output-webhook-state-path`.

### C. Problemas con certificados TLS

* **Síntoma**: La entrega del webhook falla con `x509: certificate signed by unknown authority`.
* **Causa**: El servidor usa un certificado TLS autofirmado o no válido.
* **Resolución**: Instala los certificados de la autoridad certificadora en el sistema local o configura un certificado válido para el host del webhook. Usa `--output-webhook-tls-skip-verify` solo para una prueba controlada con certificados autofirmados.

---

## 6. Salud y métricas operativas

La API sirve los endpoints de diagnóstico fuera del grupo de rutas `/v1`, en la dirección configurada por `API_ADDRESS` y `API_PORT` (valores predeterminados: `0.0.0.0:8080`).

### Endpoint de salud

Consulta `GET /healthcheck` para comprobar el estado del pipeline:

```bash
curl -i http://localhost:8080/healthcheck
```

La respuesta conserva el campo JSON `failed`. Adder devuelve HTTP `200` cuando todos los comprobadores registrados indican que siguen en ejecución y HTTP `503` cuando alguno indica que se detuvo. El estado HTTP conserva el comportamiento de probe aunque la respuesta incluya diagnósticos adicionales.

Cuando un componente proporciona detalles, la respuesta puede incluir `checks[]` con datos sanitizados:

* `uptimeSeconds`: tiempo de actividad finito y no negativo.
* `terminalFailure`: indica si ocurrió un fallo terminal.
* `components[]`: componentes con `role` `input`, `filter` u `output`, su `index` y su `state`.
* `state`: uno de `unknown`, `starting`, `running`, `stopped` o `failed`.

Los diagnósticos no incluyen secretos, cadenas de error ni configuración. Adder filtra los roles y estados no permitidos y limita la lista de componentes a 128 entradas.

### Endpoint de métricas

Consulta `GET /metrics` para obtener el formato de texto de Prometheus:

```bash
curl http://localhost:8080/metrics
```

La siguiente tabla enumera las métricas de entrega de webhooks:

| Métrica | Uso operativo |
| --- | --- |
| `adder_webhook_http_attempts_total{status_class}` | Cuenta los intentos lógicos de entrega HTTP. `status_class` solo admite `1xx`, `2xx`, `3xx`, `4xx`, `5xx`, `network` y `other`. |
| `adder_webhook_delivery_outcomes_total{outcome}` | Cuenta el resultado final de cada evento: `success`, `terminal` o `exhausted`. |
| `adder_webhook_http_attempt_duration_seconds` | Mide el tiempo de cada intento HTTP hasta consumir la respuesta o fallar la solicitud. |

Las métricas se mantienen en el proceso y se reinician cuando Adder se reinicia. No incluyen etiquetas con la URL, el evento, secretos ni otros datos sensibles; los nombres de endpoint y los datos del evento no forman parte de las etiquetas.

---

## 7. Referencia de mensajes de error comunes

| Mensaje de error | Componente de origen | Causa | Resolución |
| :--- | :--- | :--- | :--- |
| `failed to read credential file: open ...: no such file or directory` | `output/push` | La ruta de las credenciales de FCM es incorrecta. | Comprueba que la ruta de configuración coincida con el sistema de archivos local. |
| `failed to get token: oauth2: cannot fetch token` | `output/push` | El host no tiene conexión a Internet o las credenciales de Google IAM fueron revocadas. | Comprueba la conectividad de red y el estado de la cuenta de servicio. |
| `invalid intersect point format: expected '<slot>.<hash>'` | `input/chainsync` | El punto indicado en `--input-chainsync-intersect-point` tiene un formato incorrecto. | Usa el formato correcto: `<slot_integer>.<block_hex_hash>`. |
| `server returned status: 500` | `output/webhook` | El servidor de destino recibió la solicitud, pero encontró un error interno. | Revisa los registros del servidor del webhook para localizar el fallo. |
| `failed to parse credential file` | `output/push` / `internal/config` | El archivo JSON de credenciales contiene errores de sintaxis o un formato inválido. | Valida el formato de las credenciales de la cuenta de servicio. |
| `failed to resolve plugin config` | `internal/config` / `plugin` | Las claves de configuración contienen tipos no reconocidos o valores incompatibles. | Ajusta los tipos a las definiciones de las opciones en las configuraciones estándar. |

---

## 8. Perfil de fugas de goroutines en Go 1.26 o posterior

Go 1.26 o posterior puede generar un perfil de fugas de goroutines mediante `GOEXPERIMENT=goroutineleakprofile`. Activa el servidor de depuración de Adder y ejecuta el proceso con la variable de entorno:

```bash
GOEXPERIMENT=goroutineleakprofile \
DEBUG_ADDRESS=127.0.0.1 \
DEBUG_PORT=6060 \
./adder
```

Con el proceso en ejecución, solicita el perfil mediante `go tool pprof`:

```bash
go tool pprof http://127.0.0.1:6060/debug/pprof/goroutineleak
```

Usa el perfil para localizar goroutines que permanecen después de cancelar o detener el pipeline. Cierra el servidor de depuración cuando termine el diagnóstico y protege el puerto si el proceso se ejecuta fuera de un entorno local.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
