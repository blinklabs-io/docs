---
title: Cardano Node API
description: Una guia sobre Cardano Node API.
---

![cardano-node-api-logo](/cardano-node-api-logo.png)

Una API HTTP para interactuar con un Nodo Cardano local y proporcionar los datos internos del nodo a clientes HTTP. Este servicio se comunica con un nodo completo de Cardano utilizando el protocolo de red Ouroboros a traves de un socket UNIX y expone los mini-protocolos Ouroboros subyacentes de Nodo-a-Cliente (NtC) a los clientes mediante una API REST o una API gRPC UTxO RPC.

<br>

Cardano Node API es un servicio escrito en Go que se comunica con un Nodo Cardano a traves de su interfaz privada y proporciona un conjunto completo de APIs HTTP basadas en estandares colaborativos.

<br>

## Como uso realmente Cardano Node API?
Simplemente descarga el archivo binario de Cardano Node API desde blinklabs.io en el servidor de tu nodo. Luego ejecuta Cardano Node API en la linea de comandos del servidor. La configuracion se puede realizar mediante un archivo de configuracion o estableciendo variables de entorno.

<br>

Comienza con nuestra guia de [Inicio Rapido](../002-quick-start) para empezar a usar Cardano Node API.


