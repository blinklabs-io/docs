---
title: Guia de Configuracion de Endpoint Personalizado de Billetera
description: Tx Submit API Configuracion de billetera para usar endpoint de envio personalizado.
---

# Usar Tx Submit API para Enviar Transacciones Desde Tu Billetera

Tx Submit API es un servicio de API para envio de transacciones de Cardano escrito en Go que toma cargas de transacciones codificadas en CBOR a traves de HTTP y las convierte al mini-protocolo LocalTxSubmission de la Red Ouroboros mediante gOuroboros. Este proyecto fue financiado en Project Catalyst Fund 9.

Tx Submit API envia transacciones a traves de HTTP, lo que lo convierte en una opcion mas rapida para enviar transacciones a la blockchain de Cardano.

Para enviar transacciones usando Tx Submit API con tu billetera, necesitaremos configurar un `endpoint de envio personalizado` en tu billetera.

Para configurar tu billetera, sigue los pasos a continuacion.

***

El proceso para conectar tu billetera a Tx Submit API es similar entre cada billetera de Cardano. Sin embargo, el nombre de la opcion puede diferir ligeramente. Por ejemplo, la billetera Eternl llama a la opcion `Custom Submit Endpoint`

![txsubmit-eternl-custom-submit-endpoint-screen](/txsubmit-eternl-custom-submit-endpoint-screen.png)

Mientras que la billetera Lace llama a la opcion `Custom Submit API`

![txsubmit-lace-custom-submit-api-screen](/txsubmit-lace-custom-submit-api-screen.png)

Para esta guia usaremos la billetera Eternl.

***

## Paso 1 - Abrir Configuracion en la Billetera Eternl

Abre tu billetera Eternl y haz clic en la opcion de configuracion.

![txsubmit-eternl-settings-screen](/txsubmit-eternl-settings-screen.png)

## Paso 2 - Seleccionar Configuracion de la Aplicacion

Haz clic en App settings (Configuracion de la aplicacion)

![txsubmit-eternl-app-settings-screen](/txsubmit-eternl-app-settings-screen.png)

## Paso 3 - Seleccionar Custom Submit Endpoint

Desplazate hacia abajo y haz clic en Custom Submit Endpoint

![txsubmit-eternl-custom-submit-endpoint-select-screen](/txsubmit-eternl-custom-submit-endpoint-select-screen.png)

## Paso 4 - Agregar Endpoint

Haz clic en Add Endpoint (Agregar Endpoint)

![txsubmit-eternl-add-endpoint-screen](/txsubmit-eternl-add-endpoint-screen.png)

## Paso 5 - Ingresa tu URL de Endpoint

Ingresa tu URL de Tx Submit API. Deberia verse como `http://192.0.2.0:8090/api/submit/tx`. Ajusta a tu IP y Puerto.

![txsubmit-eternl-IP-endpoint-screen](/txsubmit-eternl-IP-endpoint-screen.png)

### Felicitaciones, estas listo para comenzar a enviar transacciones con Tx Submit API a traves de tu billetera!

