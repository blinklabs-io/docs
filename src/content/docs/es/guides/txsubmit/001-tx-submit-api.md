---
title: Tx Submit API
description: Una guia sobre Tx Submit API.
---

![txsubmit-logo](/txsubmit-logo.png)

Tx Submit API es un servicio de API para envio de transacciones de Cardano escrito en Go que toma cargas de transacciones codificadas en CBOR a traves de HTTP y las convierte al mini-protocolo LocalTxSubmission de la Red Ouroboros mediante gOuroboros. Este proyecto fue financiado en Project Catalyst Fund 9.

Tx Submit API envia transacciones a traves de HTTP, lo que lo convierte en una opcion mas rapida para enviar transacciones a la blockchain de Cardano.

## Como uso realmente Tx Submit API?

Simplemente descarga el archivo binario de Tx Submit API desde blinklabs.io en tu servidor de nodo. Luego ejecuta Tx Submit API en la linea de comandos del servidor. La configuracion se puede realizar usando un archivo de configuracion o estableciendo variables de entorno.

Comienza con nuestra guia de [Inicio Rapido](../002-quick-start) para empezar a enviar transacciones a traves de HTTP usando Tx Submit API.
