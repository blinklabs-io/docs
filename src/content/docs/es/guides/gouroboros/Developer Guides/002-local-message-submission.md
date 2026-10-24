---
title: Protección contra repeticiones de LocalMessageSubmission
description: Configura la protección contra repeticiones y la gestión de duplicados de los mensajes autenticados de LocalMessageSubmission.
---

# Protección contra repeticiones de LocalMessageSubmission

Esta guía explica la protección contra repeticiones de la ruta autenticada `LocalMessageSubmission` disponible en gOuroboros `v0.213.7`. Describe la secuencia de envío y la configuración necesaria para deduplicar identificadores de mensajes entre conexiones.

## Descripción general

El servidor utiliza una caché de repeticiones asociada a `Config` para impedir que un identificador de mensaje DMQ local autenticado se procese más de una vez mientras su valor `ExpiresAt` original siga vigente. El servidor elimina los identificadores caducados al procesar nuevas reservas.

Este comportamiento está disponible en [gOuroboros `v0.213.7`](https://github.com/blinklabs-io/gouroboros/releases/tag/v0.213.7). Consulta la referencia de paquetes en la [documentación de la API de gOuroboros](https://pkg.go.dev/github.com/blinklabs-io/gouroboros).

## Configuración

Crea `Config` mediante `localmessagesubmission.NewConfig` y establece explícitamente el callback del servidor, la autenticación de mensajes, la validación TTL y la capacidad de la caché:

```go
cfg := localmessagesubmission.NewConfig(
	localmessagesubmission.WithSubmitMessageFunc(submitMessage),
	localmessagesubmission.WithAuthenticator(authenticator),
	localmessagesubmission.WithTTLValidator(ttlValidator),
	localmessagesubmission.WithMaxReplayEntries(10000),
)
```

`WithMaxReplayEntries` controla el máximo de identificadores de mensajes autenticados que conserva el servidor hasta su caducidad. No limita la concurrencia de callbacks ni el número de conexiones activas.

### Compartir una configuración entre conexiones

Construye un único `Config` fuera del bucle de aceptación de conexiones y pásalo a todos los servidores `LocalMessageSubmission`. Las copias del mismo `Config` comparten el estado de repeticiones. Las llamadas independientes a `localmessagesubmission.NewConfig` crean estados independientes y no deduplican el mismo identificador entre esas configuraciones.

```go
cfg := localmessagesubmission.NewConfig(
	localmessagesubmission.WithSubmitMessageFunc(submitMessage),
	localmessagesubmission.WithAuthenticator(authenticator),
	localmessagesubmission.WithTTLValidator(ttlValidator),
	localmessagesubmission.WithMaxReplayEntries(10000),
)

// Create each connection's LocalMessageSubmission server with &cfg.
// Do not call NewConfig inside this loop.
for {
	conn := acceptConnection()
	startLocalMessageSubmission(conn, &cfg)
}
```

Las funciones de preparación de conexiones del ejemplo representan la gestión de conexiones de la aplicación anfitriona. El requisito esencial es que todos los servidores reciban el mismo valor `Config` creado antes del bucle.

### Capacidad y caducidad

- `MaxReplayEntries` utiliza `10,000` cuando vale cero o no se especifica.
- `localmessagesubmission.WithMaxReplayEntries(...)` modifica el límite de identificadores autenticados conservados.
- Al procesar una reserva nueva, el servidor elimina los identificadores cuyo `ExpiresAt` ya haya pasado.
- Al alcanzar la capacidad, rechaza los identificadores nuevos hasta que caduque y elimine una entrada existente.
- Un valor negativo no es válido. El servidor rechaza el envío antes de llamar a `SubmitMessageFunc`.

Los fallos de capacidad y configuración no utilizan un código de error independiente. En ambos casos, el servidor devuelve un rechazo de protocolo con `pcommon.OtherReason`.

## Comportamiento del envío

Para un envío DMQ local autenticado, el servidor sigue este orden:

1. Validar el TTL del mensaje.
2. Preparar y autenticar el mensaje.
3. Validar de nuevo el TTL con la hora del envío.
4. Reservar el identificador en la caché de repeticiones.
5. Llamar a `SubmitMessageFunc` únicamente si la reserva tiene éxito.

Solo entran en la caché los envíos que superan la autenticación y la validación TTL. La reserva ocurre antes de `SubmitMessageFunc`, y el mutex la hace atómica entre los envíos concurrentes que comparten configuración.

### Envíos duplicados

El primer envío válido reserva el identificador y puede alcanzar `SubmitMessageFunc`. Un duplicado posterior recibe `pcommon.AlreadyReceivedReason`, y el servidor no invoca el callback para ese duplicado.

La misma regla se aplica a envíos concurrentes con el mismo identificador. El primero que lo reserva puede alcanzar `SubmitMessageFunc`; todos los demás reciben `pcommon.AlreadyReceivedReason` sin alcanzar el callback. Esto también se aplica entre conexiones distintas que reutilizan un único `Config`.

El servidor conserva la reserva hasta que pase el `ExpiresAt` original. Si `SubmitMessageFunc` rechaza el primer envío, ese resultado no libera la reserva. Un envío posterior no puede reutilizar inmediatamente el identificador; debe esperar a su caducidad.

## Comportamiento de rechazo

| Condición | Resultado | Invocación del callback |
| --- | --- | --- |
| Identificador válido, autenticado, sin caducar y con capacidad disponible | El servidor reserva el identificador y procesa el envío. | `SubmitMessageFunc` se ejecuta una vez. |
| Identificador reservado y sin caducar | Rechazo con `pcommon.AlreadyReceivedReason`. | No se ejecuta. |
| Caché en `MaxReplayEntries` para un identificador nuevo | Rechazo con `pcommon.OtherReason`. | No se ejecuta. |
| `MaxReplayEntries` negativo | Rechazo con `pcommon.OtherReason`. | No se ejecuta. |
| Fallo de validación TTL o autenticación | Rechazo según el resultado de validación o autenticación. | No se ejecuta. |

Un identificador caducado puede volver a entrar en la caché cuando el servidor elimina la reserva anterior. Un duplicado que siga vigente nunca alcanza el callback de la aplicación, independientemente de que el callback original aceptara o rechazara el mensaje.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
