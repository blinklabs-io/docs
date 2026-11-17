---
title: Referencia de la salida Signal
description: Configura y verifica la salida Signal de Adder.
---

# Referencia de la salida Signal

## Descripción general

La salida `signal` envía los eventos seleccionados de Adder mediante un demonio HTTP JSON-RPC de [`signal-cli`](https://github.com/AsamK/signal-cli/blob/master/man/signal-cli-jsonrpc.5.adoc) que Adder no administra. Signal no ofrece una API oficial para bots. Ejecuta un demonio de `signal-cli` mantenido con una cuenta vinculada o registrada, por ejemplo:

```text
signal-cli -a ACCOUNT daemon --http=127.0.0.1:8081
```

## Configuración

Configura la salida `signal` en YAML:

```yaml
plugins:
  output:
    signal:
      endpoint: http://127.0.0.1:8081/api/v1/rpc
      recipients: "+15551234567,+15557654321"
      account: "+15550001111"
      event-types: blocks,rollbacks,governance
```

### Campos

- `endpoint`: URL `/api/v1/rpc` del demonio de `signal-cli`. El valor predeterminado es `http://127.0.0.1:8081/api/v1/rpc`.
- `recipients`: lista obligatoria de números de destinatario o identificadores de servicio separados por comas. No existe ningún valor predeterminado.
- `account`: cuenta opcional para un demonio con varias cuentas.
- `event-types`: lista separada por comas de los tipos de evento que Adder envía. Adder no distingue mayúsculas y minúsculas en estos valores. El valor predeterminado es `blocks,rollbacks,governance`.

Adder elimina los espacios al principio y al final de cada destinatario y de cada tipo de evento, e ignora las entradas vacías de estas listas. `event-types` admite los siguientes valores:

- `blocks`
- `rollbacks`
- `governance`
- `transactions`
- `drep-registration`
- `drep-update`
- `drep-retirement`

La configuración debe incluir al menos un destinatario y al menos un tipo de evento válido.

## Restricciones del endpoint

Adder acepta un endpoint `https` para un demonio remoto. Adder solo acepta `http` cuando el hostname es `localhost`, `127.0.0.1` o `::1`. El endpoint debe usar la ruta `/api/v1/rpc`.

Adder rechaza endpoints con cualquiera de estas características:

- Un esquema distinto de `http` o `https`.
- Un hostname vacío.
- Credenciales de usuario.
- Una consulta URL.
- Un fragmento URL.
- Una ruta distinta de `/api/v1/rpc`.
- HTTP para un hostname que no corresponde a loopback.

## Entrega y validación JSON-RPC

Cada mensaje contiene el JSON del evento. Adder envía una solicitud JSON-RPC `send` con los destinatarios, el mensaje y `account` cuando la configuración incluye ese campo.

Adder acepta la respuesta únicamente cuando todas estas condiciones son verdaderas:

- La respuesta HTTP tiene estado `200`.
- La respuesta JSON-RPC usa la versión `2.0`.
- El identificador de respuesta coincide con el identificador de la solicitud.
- El resultado exitoso de `send` contiene una marca de tiempo distinta de cero.
- Cada resultado de destinatario informa `SUCCESS`.

Cuando un destinatario falla, Adder informa el tipo de resultado de ese destinatario sin registrar el mensaje ni la dirección. Adder envía los errores al canal de errores de la salida.

Una respuesta RPC correcta confirma que `signal-cli` aceptó el envío. No confirma que el destinatario haya leído el mensaje.

## Reintentos y reinicio

Adder no reintenta automáticamente las solicitudes. Signal puede enviar el mensaje antes de que la solicitud agote el tiempo de espera, y un reintento podría duplicarlo.

Adder no conserva los eventos pendientes después de un reinicio.

## Comprobación en vivo

1. Configura una cuenta de Signal y un destinatario independientes para la comprobación.
2. Ejecuta un demonio `signal-cli` con la cuenta de comprobación y configura su URL `/api/v1/rpc` en `endpoint`.
3. Configura `recipients` con el destinatario de comprobación y selecciona un tipo de evento mediante `event-types`.
4. Inicia Adder y genera el evento seleccionado.
5. Confirma que el mensaje llega al destinatario de comprobación.

Las pruebas locales usan un demonio HTTP de prueba para verificar la solicitud JSON-RPC y el contrato de respuesta documentados.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>