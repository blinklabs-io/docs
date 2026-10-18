---
title: Protección contra repeticiones de LocalMessageSubmission
description: Configura y opera la protección contra repeticiones de mensajes autenticados en LocalMessageSubmission.
---

## Descripción general

gOuroboros v0.213.7 incorpora protección contra repeticiones para los mensajes autenticados de `LocalMessageSubmission`. El servidor reserva el ID de cada mensaje autenticado y no expirado antes de ejecutar `SubmitMessageFunc`. Solo la primera entrega aceptada puede llegar a la función de callback; las entregas posteriores con el mismo ID reciben `pcommon.AlreadyReceivedReason` mientras el mensaje no haya expirado.

La reserva también coordina las entregas simultáneas. Cuando varias conexiones intentan enviar el mismo ID al mismo tiempo, solo una ejecución llega a `SubmitMessageFunc`, siempre que todas las conexiones utilicen la misma instancia de `Config`.

## Configuración

`NewConfig` establece `MaxReplayEntries` en `10,000` de forma predeterminada. El límite controla la cantidad de IDs autenticados que el servidor conserva hasta su vencimiento. Para definir el límite explícitamente, utilice `localmessagesubmission.WithMaxReplayEntries(10000)`:

```go
config := localmessagesubmission.NewConfig(
    localmessagesubmission.WithSubmitMessageFunc(submitMessage),
    localmessagesubmission.WithMaxReplayEntries(10000),
)
```

Construya `Config` fuera del bucle que acepta conexiones y reutilice la misma instancia para cada conexión. La configuración mantiene el estado de protección contra repeticiones; las llamadas independientes a `NewConfig` crean estados separados y no deduplican los mensajes entre sí.

## Uso entre conexiones

Un host que atiende varias conexiones debe compartir una sola instancia de `Config` con cada servidor `LocalMessageSubmission`. Las copias de esa instancia comparten el estado de reservas, por lo que una entrega aceptada en una conexión impide que otra conexión ejecute `SubmitMessageFunc` con el mismo ID antes de `ExpiresAt`.

El servidor elimina las reservas expiradas antes de comprobar la capacidad. Cuando una reserva alcanza `MaxReplayEntries`, el servidor rechaza los nuevos IDs autenticados hasta que las reservas anteriores expiren y se eliminen. Una entrega cuyo ID ya está reservado continúa recibiendo `pcommon.AlreadyReceivedReason`.

## Rechazos

La protección contra repeticiones aplica los siguientes resultados:

- Una entrega duplicada secuencial recibe `pcommon.AlreadyReceivedReason` y no ejecuta `SubmitMessageFunc`.
- Las entregas duplicadas simultáneas reciben el mismo tipo de rechazo después de que una sola entrega reserve el ID.
- Un nuevo ID recibe un rechazo cuando la caché alcanza `MaxReplayEntries`.
- Un valor de `MaxReplayEntries` menor que `1` provoca un rechazo antes de ejecutar `SubmitMessageFunc`.
- Cuando `ExpiresAt` queda atrás, el servidor elimina la reserva y permite una nueva entrega que supere la validación de autenticación y vigencia.

La reserva ocurre antes del callback de la aplicación. Por tanto, un callback que tarde en responder no permite que otra entrega con el mismo ID lo ejecute de nuevo.

## Referencias

- [Documentación de la API de `LocalMessageSubmission`](https://pkg.go.dev/github.com/blinklabs-io/gouroboros/protocol/localmessagesubmission)
- [gOuroboros v0.213.7](https://github.com/blinklabs-io/gouroboros/releases/tag/v0.213.7)