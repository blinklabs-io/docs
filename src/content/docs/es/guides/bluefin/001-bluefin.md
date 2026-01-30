---
title: Bluefin
description: Introduccion a Bluefin.
---

![bluefin-logo](/bluefin-logo.png)

Bluefin es un minero independiente de Fortuna (TUNA), escrito en Go, que sincroniza la cadena, mina TUNA y envia transacciones a nodos remotos sin ninguna otra infraestructura.

***

## Que es $TUNA y como funciona Bluefin?

TUNA es el token de Fortuna, pero que es Fortuna? Fortuna es un proyecto de token de prueba de trabajo construido sobre un contrato inteligente de Cardano. El minero de Fortuna fue escrito en Typescript usando Lucid y requeria acceso a Kupo y Ogmios o un proveedor de API para hacer su trabajo. En Blinklabs queriamos que nuestro minero funcionara sin dependencias de servicios externos, y aqui es donde entra Bluefin.

Bluefin sigue la blockchain usando nodos publicos de Cardano y almacena UTxOs interesantes en disco. Despues de minar un bloque, envia transacciones directamente a nodos publicos usando el protocolo NtN (nodo-a-nodo) TxSubmission. Como todos los proyectos Go de Binklabs, se ejecuta como un unico binario en multiples plataformas y arquitecturas. Bluefin tambien soporta mineria de $TUNA v2.

Aprende mas sobre Fortuna en <a href="https://minefortuna.com/" target="_blank">minefortuna.com/</a>.

***

## Como uso Bluefin realmente?

Bluefin es autocontenido y se ejecuta sin dependencias externas. Puedes ejecutarlo a traves de las <a href="https://github.com/blinklabs-io/bluefin/pkgs/container/bluefin" target="_blank">imagenes Docker</a> o binarios desde la <a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">pagina de releases</a>.

Comienza con nuestra guia de [Inicio Rapido](../002-quick-start-overview).
