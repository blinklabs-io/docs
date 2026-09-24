# ---
# title: Guía de resolución de problemas de Adder
# description: Procedimientos para diagnosticar conexiones, configuración, filtros, FCM y webhooks de Adder.
# ---

# Guía de resolución de problemas de Adder

## Descripción general

Esta guía ayuda a diagnosticar fallos de conexión, configuración, filtros, notificaciones FCM y webhooks en Adder. Los ejemplos usan las opciones, rutas y respuestas que admite la versión actual.

## 1. Problemas de conexión

Estos problemas aparecen cuando el plugin de entrada `chainsync` no puede conectarse al nodo Cardano o completar el protocolo de enlace.

### A. Problemas con la ruta del socket NtC

**Síntoma:** Adder registra un rechazo de conexión o un error `no such file or directory` al conectarse mediante el socket local Node-to-Client (NtC).

**Causa habitual:** El nodo Cardano todavía no creó el socket, la ruta configurada no coincide o la cuenta que ejecuta Adder no tiene permisos de lectura y escritura.

**Resolución:**

1. Verifique que el nodo Cardano esté activo y que haya creado el socket.
2. Configure la ruta con `--input-chainsync-socket-path` o con la clave YAML correspondiente.
3. Compruebe la ruta y los permisos:

   ```bash
   ls -la /path/to/cardano-node.socket
   ```

### B. La red no coincide

**Síntoma:** La conexión se establece, pero el protocolo de enlace termina con un error como `handshake failed: network magic mismatch`.

**Causa habitual:** El nombre o el valor `magic` de la red de Adder no coincide con el del nodo Cardano.

**Resolución:**

1. Configure una red compatible con `--input-chainsync-network` o configure el valor explícito con `--input-chainsync-network-magic`.
2. Para una configuración mediante entorno, use el nombre de variable admitido por el plugin:

   ```bash
   export INPUT_CHAINSYNC_NETWORK=preview
   ```

3. Compruebe que ningún valor de YAML o de la línea de comandos sobrescriba la selección esperada.

### C. Diferencia entre NtC y NtN

**Síntoma:** Adder no conecta o no puede resolver la dirección del nodo.

**Causa habitual:** La configuración mezcla Node-to-Client (socket local) con Node-to-Node (TCP remoto).

**Resolución:**

- Para una conexión NtC local, configure `--input-chainsync-socket-path`.
- Para una conexión NtN remota, configure `--input-chainsync-address` con el formato `host:puerto` y compruebe que el puerto TCP esté accesible. Por ejemplo:

  ```bash
  nc -zv relays-new.cardano-mainnet.iohk.io 3001
  ```

- Para exponer un socket UNIX mediante TCP, active `--input-chainsync-ntc-tcp` y configure la dirección TCP correspondiente.

## 2. Problemas de configuración

Adder aplica esta precedencia, de mayor a menor prioridad: opciones de CLI > archivo YAML > variables de entorno > valores predeterminados.

### A. Una variable de entorno no tiene efecto

**Síntoma:** Una variable de entorno parece configurada, pero Adder usa otro valor.

**Causa habitual:** El nombre de la variable no coincide con el plugin o una opción de CLI o una clave YAML la sobrescribe.

**Resolución:**

1. Use el nombre de variable definido por la configuración o el plugin. No añada `ADDER_` como prefijo general.
2. Compruebe las variables relevantes en el entorno:

   ```bash
   env | grep -E "INPUT_|OUTPUT_|API_|DEBUG_|LOGGING_"
   ```

3. Revise `--config` y las opciones de CLI. Una opción de CLI explícita siempre prevalece sobre YAML, entorno y valores predeterminados.

### B. El archivo YAML no existe o contiene un valor inválido

**Síntoma:** Adder devuelve un error al leer o analizar el archivo de configuración, como `error reading config file` o `error parsing config file`.

**Causa habitual:** La ruta es incorrecta, la indentación YAML no es válida o un valor tiene un tipo incompatible, como una cadena donde se espera un entero.

**Resolución:**

1. Confirme la ruta que recibe `--config`.
2. Valide el formato YAML:

   ```bash
   python3 -c "import yaml; yaml.safe_load(open('config.yaml'))"
   ```

3. Compare cada clave con la configuración de la opción correspondiente y vuelva a ejecutar Adder.

## 3. Problemas con filtros

Adder combina los distintos tipos de filtro con lógica **AND**. Dentro de una misma lista de filtros aplica lógica **OR**; por ejemplo, dos direcciones permiten cualquiera de las dos.

### A. Ningún evento supera el filtro

**Síntoma:** Adder permanece activo, pero no emite eventos.

**Causa habitual:** El filtro es demasiado restrictivo o combina un filtro con un tipo de evento que no contiene ese dato. `--filter-policy` y `--filter-asset` no aplican a los eventos `input.block` ni `input.governance`.

**Resolución:**

1. Quite temporalmente los filtros de dirección, activo, política, pool y DRep.
2. Pruebe primero un filtro por tipo:

   ```bash
   ./adder --filter-type input.transaction
   ```

3. Añada los filtros de uno en uno y compruebe qué combinación detiene la emisión.

### B. Valores de filtro con formato incorrecto

- Las direcciones deben ser direcciones de pago o de stake válidas en Bech32, como `addr1...` o `stake1...`.
- Los identificadores de política deben contener exactamente 56 caracteres hexadecimales, equivalentes a 28 bytes.
- Los identificadores de DRep admiten Bech32, incluidos `drep1...` y `drep_script1...`, o hashes hexadecimales sin formato Bech32.

Compruebe la longitud de un identificador de política con:

```bash
echo -n "2dd15e0efd5c07b6bfbc0cf7fb2f767a50e189d7bfa50e1ef0b87abc" | wc -c
```

## 4. Problemas de notificaciones FCM

### A. Credenciales de FCM

**Síntoma:** El plugin `push` registra `failed to get token` o `failed to read credential file`.

**Causa habitual:** La cuenta que ejecuta Adder no encuentra el archivo JSON de la cuenta de servicio, no puede leerlo o no contiene credenciales válidas de Google.

**Resolución:**

1. Configure `--output-push-serviceAccountFilePath` con una ruta no vacía cuando use `--output push`.
2. Compruebe que el archivo incluya un `project_id` de tipo cadena y con contenido.
3. Confirme que el archivo sea accesible:

   ```bash
   cat /path/to/service-account.json | grep "project_id"
   ```

### B. Fallos de entrega o tokens caducados

**Síntoma:** Adder registra `failed to send message to token...` o FCM devuelve `UNREGISTERED`.

**Causa habitual:** El token caducó, Firebase lo anuló o el servicio no está accesible.

**Resolución:**

1. Revise el error que devuelve FCM.
2. Elimine el token inválido de Adder mediante la ruta `DELETE /v1/fcm/<token>`:

   ```bash
   curl -X DELETE http://localhost:8080/v1/fcm/your-expired-token
   ```

3. Una eliminación correcta devuelve `204 No Content`. Si el token no existe, Adder devuelve `404 Not Found`.

### C. Registro de un token

El cuerpo de la solicitud debe incluir la clave no vacía `fcmToken`. Registre un token con:

```bash
curl -X POST http://localhost:8080/v1/fcm \
  -H "Content-Type: application/json" \
  -d '{"fcmToken":"your-token"}'
```

Adder almacena el token y devuelve `201 Created`. Si falta `fcmToken`, su valor está vacío o el JSON no es válido, Adder devuelve `400 Bad Request` con un objeto de error.

## 5. Problemas con webhooks

### A. Endpoint inaccesible o respuesta no válida

**Síntoma:** Adder retrasa la entrega o registra `server returned status: 500` y otros errores de entrega.

**Causa habitual:** El servidor está detenido, tarda demasiado, no acepta solicitudes `POST` o devuelve un estado HTTP fuera de `2xx`. Cada solicitud tiene un tiempo de espera de cinco segundos.

**Resolución:**

1. Compruebe manualmente que el endpoint acepte una carga JSON:

   ```bash
   curl -H "Content-Type: application/json" -X POST -d '{"type":"test"}' https://your-webhook-url.com
   ```

2. Configure únicamente las opciones de webhook registradas:

   ```bash
   ./adder --output webhook \
     --output-webhook-url="https://your-webhook-url.com" \
     --output-webhook-format="adder" \
     --output-webhook-username="username" \
     --output-webhook-password="password"
   ```

   Las opciones disponibles son `--output-webhook-format`, `--output-webhook-url`, `--output-webhook-username`, `--output-webhook-password` y `--output-webhook-tls-skip-verify`. El formato predeterminado es `adder` y la URL predeterminada es `http://localhost:3000`.

3. No configure opciones de reintento en la CLI. Adder aplica internamente tres reintentos después del intento inicial, comienza con una espera de un segundo y duplica la espera hasta un máximo de 30 segundos.

4. Compruebe el canal de errores del pipeline. Cuando Adder agota los reintentos, registra el fallo y publica un error que identifica el endpoint y el número de reintentos.

### B. Certificados TLS

**Síntoma:** La entrega falla con `x509: certificate signed by unknown authority`.

**Causa habitual:** El endpoint usa un certificado autofirmado o una cadena de confianza no válida.

**Resolución:**

1. Instale la autoridad certificadora necesaria o configure un certificado válido para el endpoint.
2. Solo para un endpoint controlado que use un certificado autofirmado, active `--output-webhook-tls-skip-verify`. Esta opción omite la verificación TLS y no resulta adecuada para un endpoint público.

### C. Carga, contexto o tipo de evento incorrectos

Adder informa como errores las cargas `nil`, los contextos ausentes o incompatibles y los tipos de evento desconocidos. El plugin no continúa con una carga que no coincida con el tipo de evento y no depende de un acceso inseguro que provoque un `panic`.

Revise el productor de eventos cuando aparezca un error de payload, contexto o tipo de evento. Durante el apagado, Adder interrumpe la espera de un reintento en curso, detiene el plugin y evita que el proceso quede esperando al siguiente intervalo.

## 6. Referencia rápida de errores adicionales

| Mensaje | Componente | Diagnóstico |
| :--- | :--- | :--- |
| `invalid intersect point format: expected '<slot>.<hash>'` | `input/chainsync` | Use `--input-chainsync-intersect-point` con el formato `<slot_integer>.<block_hex_hash>`. |
| `failed to process plugin config` | `internal/config` / `plugin` | Compare los tipos y valores de las claves con las opciones del plugin. |