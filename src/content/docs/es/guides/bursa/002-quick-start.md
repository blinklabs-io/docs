---
title: Guía de inicio rápido
description: Resumen de inicio rápido de Bursa.
---

# Bursa

Una billetera programática de Cardano, escrita en Go, que expone una API, CLI e interfaz de biblioteca, permitiendo a los desarrolladores integrar fácilmente la funcionalidad de billetera.

Simplemente descarga el archivo binario de Bursa desde blinklabs.io. Luego ejecuta Bursa en la línea de comandos o API.

<br>

Para comenzar, sigue los pasos a continuación

<br>

Esta guía asume una configuración típica de Linux. Por favor ajusta los comandos y rutas según sea necesario.

***

<br>

## Paso 1 - Descargar binario desde Blinklabs
<br>

**Paso 1-A** - Primero ve a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplázate hacia abajo hasta Bursa.



![bursa-blinklabs-site](/bursa-blinklabs-site.png)
<br>


**Paso 1-B** - Selecciona el sistema operativo que quieres usar para ejecutar Bursa.

![bursa-blinklabs-site-operating-system](/bursa-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puedes descargar el archivo binario y mover el archivo a tu ubicación preferida o...

![bursa-blinklabs-site-download](/bursa-blinklabs-site-download.png)

<br>

Copia la ruta desde Blinklabs y ejecuta el siguiente comando para descargar el archivo binario.

<br>

Ajusta la ruta del enlace a la ruta correcta para la versión que deseas descargar.

> Consejo: Puedes descargar la última versión de Bursa desde la página <a href="https://github.com/blinklabs-io/bursa/releases" target="_blank"> https://github.com/blinklabs-io/bursa/releases</a>.

```
wget -O - https://github.com/blinklabs-io/bursa/releases/download/v0.15.0/bursa-v0.15.0-linux-amd64 > bursa
```

***

<br>



## Paso 2 - Cambiar permisos

<br>

Para este ejemplo, nombramos el archivo binario `bursa`. Para hacer el archivo ejecutable ejecuta el siguiente comando:

<br>

Ajusta la ruta del archivo y el nombre del archivo si es necesario.

```
chmod +x bursa
```

***

<br>



## Paso 3 - Abrir el firewall en el puerto 8080 para la API

<br>

Asegúrate de que tu firewall esté abierto para la API. Para este ejemplo, usamos el puerto 8080. Para abrir el puerto 8080 ejecutamos el siguiente comando:

```
sudo ufw allow 8080/tcp
```

***

<br>

### ¡Felicidades, estás listo para comenzar a usar Bursa!

Ahora podemos usar la línea de comandos para crear una billetera de Cardano y generar todos los archivos que necesitaremos para administrar la billetera. También podemos iniciar la API y acceder a la documentación Swagger de la API.

Bursa también se puede usar para generar scripts multifirma, hashes y claves, incluidas las claves y certificados necesarios para ejecutar un stake pool de Cardano.

[Aprende más sobre cómo usar Bursa con la línea de comandos y los comandos útiles que puedes ejecutar.](../003-commands)
