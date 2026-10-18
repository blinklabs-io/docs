---
title: Protección contra repeticiones de LocalMessageSubmission
description: Configura y opera la protección contra repeticiones de mensajes autenticados en LocalMessageSubmission.
---

## Descripción general

gOuroboros v0.213.7 incorpora protección contra repeticiones para los mensajes autenticados de `LocalMessageSubmission`. El servidor reserva el ID de cada mensaje autenticado y vigente antes de ejecutar `SubmitMessageFunc`. Solo la primera entrega que logra reservar el ID llega a `SubmitMessageFunc`; las entregas posteriores con el mismo ID activo reciben `pcommon.AlreadyReceivedReason`.

La reserva también coordina las entregas simultáneas cuando varias conexiones intentan enviar el mismo ID.

## Configuración

`NewConfig` establece `MaxReplayEntries` en `10,000` de forma predeterminada. El límite controla la cantidad de IDs autenticados que el servidor conserva hasta su vencimiento. La configuración explícita usa `localmessagesubmission.WithMaxReplayEntries(10000)`:

```go
config := localmessagesubmission.NewConfig(
    localmessagesubmission.WithSubmitMessageFunc(submitMessage),
    localmessagesubmission.WithMaxReplayEntries(10000),
)
```

El proceso debe crear `Config` fuera del bucle que acepta conexiones y reutilizar la misma instancia para cada conexión. Esta configuración mantiene el registro de protección contra repeticiones; las llamadas independientes a `NewConfig` crean registros separados y no impiden que las conexiones reutilicen un mismo ID.

## Uso entre conexiones

El proceso que atiende varias conexiones debe compartir una sola instancia de `Config` con cada servidor `LocalMessageSubmission`. Las copias de esa instancia comparten el estado de reservas, por lo que una entrega aceptada en una conexión impide que otra conexión ejecute `SubmitMessageFunc` con el mismo ID antes de `ExpiresAt`.

El servidor elimina las reservas expiradas antes de comprobar la capacidad. Cuando una reserva alcanza `MaxReplayEntries`, el servidor rechaza los nuevos IDs autenticados hasta que las reservas anteriores expiren y el servidor las elimine. Una entrega cuyo ID ya está reservado continúa recibiendo `pcommon.AlreadyReceivedReason`.

## Rechazos

La protección contra repeticiones aplica los siguientes resultados:

- Una entrega duplicada secuencial recibe `pcommon.AlreadyReceivedReason` y no ejecuta `SubmitMessageFunc`.
- Las entregas duplicadas simultáneas reciben `pcommon.AlreadyReceivedReason` después de que una sola entrega reserve el ID.
- Un nuevo ID recibe un rechazo cuando el registro alcanza `MaxReplayEntries`.
- Un valor de `MaxReplayEntries` menor que `1` provoca un rechazo antes de ejecutar `SubmitMessageFunc`.
- Si `SubmitMessageFunc` rechaza la entrega, el servidor conserva la reserva y protege el ID hasta `ExpiresAt`.
- Cuando `ExpiresAt` ya pasó, el servidor elimina la reserva y permite una nueva entrega que supere la validación de autenticación y vigencia.

## Referencias

- [Documentación de la API de `LocalMessageSubmission`](https://pkg.go.dev/github.com/blinklabs-io/gouroboros/protocol/localmessagesubmission)
- [gOuroboros v0.213.7](https://github.com/blinklabs-io/gouroboros/releases/tag/v0.213.7)
- [Implementación de la protección contra repeticiones](https://github.com/blinklabs-io/gouroboros/pull/2748)
- [Requisito de protección contra repeticiones](https://github.com/blinklabs-io/gouroboros/issues/2615)