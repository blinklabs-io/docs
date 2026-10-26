---
title: Referencia de configuración de LocalMessageNotification
description: Referencia de configuración para el límite de identificadores aceptados de LocalMessageNotification.
---

# Referencia de configuración de LocalMessageNotification

Esta guía describe la configuración de `MaxReplayEntries` del cliente `LocalMessageNotification` y el comportamiento cuando el cliente alcanza ese límite.

## Configuración

Crea `Config` con `localmessagenotification.NewConfig` y establece el límite mediante `localmessagenotification.WithMaxReplayEntries`:

```go
cfg := localmessagenotification.NewConfig(
	localmessagenotification.WithMaxReplayEntries(50000),
)
```

El código puede omitir `WithMaxReplayEntries` o pasarle `0`; en ambos casos, el cliente utiliza `126976`. Un valor positivo configura explícitamente el máximo de identificadores aceptados que el cliente puede conservar. Este límite pertenece a `LocalMessageNotification` y no cambia el límite `10,000` de `LocalMessageSubmission`.

## Límite y caducidad

`Config.MaxReplayEntries` cuenta los identificadores de mensajes aceptados que el cliente conserva hasta la hora de caducidad firmada de cada mensaje. El cliente no expulsa un identificador aceptado antes de que caduque para crear espacio para otro.

El valor predeterminado `126976` representa `31` mensajes sin caducar por cada uno de `4096` grupos de participación.

## Desbordamiento de capacidad

Cuando los mensajes nuevos de una respuesta hacen que los identificadores aceptados sin caducar superen `MaxReplayEntries`, el cliente rechaza la respuesta completa. No entrega ni registra ningún mensaje de esa respuesta. El error del protocolo cierra la conexión, y el cliente sigue rechazando las respuestas posteriores hasta que caduquen suficientes identificadores aceptados.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>