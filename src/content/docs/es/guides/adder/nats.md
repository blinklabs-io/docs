---
title: Salida NATS
description: Referencia de configuración y comportamiento de la salida NATS de Adder.
---

# Salida NATS

La salida `nats` publica eventos seleccionados de Adder como JSON en [subjects de Core NATS](https://docs.nats.io/learn/core-nats/publish-subscribe). Utiliza el [cliente oficial actual de Go](https://github.com/nats-io/nats.go/releases/tag/v1.54.0). Core NATS proporciona [entrega como máximo una vez](https://docs.nats.io/learn/core-nats); esta salida no requiere JetStream ni almacenamiento persistente.

## Configuración

```yaml
output: nats
plugins:
  output:
    nats:
      servers: "nats://127.0.0.1:4222"
      subject-prefix: "adder.events"
      event-types: "blocks,rollbacks,governance"
```

La salida admite estas opciones:

| Opción | Valor predeterminado | Descripción |
| --- | --- | --- |
| `servers` | `nats://127.0.0.1:4222` | URLs de servidores NATS separadas por comas. |
| `token` | vacío | Token opcional de autenticación NATS. |
| `subject-prefix` | `adder.events` | Prefijo de los subjects de eventos. |
| `event-types` | `blocks,rollbacks,governance` | Tipos de eventos separados por comas. |

`servers` debe contener al menos una URL. Cada URL debe usar el esquema `nats://` o `tls://`, incluir un nombre de host y no incluir credenciales, parámetros de consulta ni fragmentos. La ruta debe estar vacía o ser `/`. Si se especifica un puerto, debe estar entre `1` y `65535`. Al proporcionar un `token`, utiliza TLS y suministra la credencial mediante una configuración administrada por secretos.

`subject-prefix` no puede estar vacío ni contener espacios, `/` o tokens comodín (`*`, `>`). No puede comenzar ni terminar con `.` ni contener `..`; cada token del subject debe ser no vacío.

`event-types` debe nombrar al menos un tipo compatible. Adder admite los siguientes tipos:

- `blocks`
- `transactions`
- `rollbacks`
- `governance`
- `drep-registration`
- `drep-update`
- `drep-retirement`

## Subjects y cargas útiles

La salida publica cada evento en el subject `<subject-prefix>.<event-type>`. El sufijo corresponde al nombre del evento sin el prefijo interno `input.`:

| `event-types` | Subject con el prefijo predeterminado |
| --- | --- |
| `blocks` | `adder.events.block` |
| `transactions` | `adder.events.transaction` |
| `rollbacks` | `adder.events.rollback` |
| `governance` | `adder.events.governance` |
| `drep-registration` | `adder.events.drep-registration` |
| `drep-update` | `adder.events.drep-update` |
| `drep-retirement` | `adder.events.drep-retirement` |

Cada carga útil contiene el JSON completo del evento de Adder.

## Entrega y errores

Después de cada publicación, la salida hace flush de la conexión. Este recorrido de ida y vuelta por evento confirma la recepción explícita por parte del servidor y limita el rendimiento de recuperación a aproximadamente un evento por recorrido de ida y vuelta con el broker. Un flush correcto indica que el servidor procesó el comando de publicación; no confirma que un suscriptor haya recibido el evento.

Las publicaciones, los flushes y los rechazos asíncronos del broker que fallen se informan mediante el canal de errores de la salida. La salida no reintenta un fallo de flush ambiguo porque el reintento podría duplicar el mensaje. El cliente se vuelve a conectar para eventos posteriores, pero la salida desactiva el almacenamiento temporal de publicaciones sin conexión. Los eventos publicados mientras la conexión está desconectada fallan en lugar de acumularse en una cola. Durante el cierre, la conexión se cierra y la salida no recupera los eventos pendientes en memoria.

## Comprobación en vivo

Para comprobar una implementación activa, suscríbete a `adder.events.>` y envía un evento seleccionado. Verifica el subject y la carga útil JSON. Después, desconecta el broker y confirma que la salida informa un error.

La prueba del paquete utiliza un par local del protocolo Core NATS para verificar la correspondencia de subjects y la carga útil serializada sin un broker independiente.

---
<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>