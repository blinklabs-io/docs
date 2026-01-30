---
title: Guia de Inicio Rapido
description: Resumen de Inicio Rapido de Bursa.
---

# Bursa

Una billetera programatica de Cardano, escrita en Go, que expone una API, CLI e interfaz de biblioteca, permitiendo a los desarrolladores integrar facilmente la funcionalidad de billetera.

Simplemente descarga el archivo binario de Bursa desde blinklabs.io. Luego ejecuta Bursa en la linea de comandos o API.

<br>

Para comenzar sigue los pasos a continuacion

<br>

Esta guia asume una configuracion tipica de Linux. Por favor ajusta los comandos y rutas segun sea necesario.

***

<br>

## Paso 1 - Descargar binario desde Blinklabs
<br>

**Paso 1-A** - Primero ve a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplazate hacia abajo hasta Bursa.



![bursa-blinklabs-site](/bursa-blinklabs-site.png)
<br>


**Paso 1-B** - Selecciona el sistema operativo que quieres usar para ejecutar Bursa.

![bursa-blinklabs-site-operating-system](/bursa-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puedes descargar el archivo binario y mover el archivo a tu ubicacion preferida o...

![bursa-blinklabs-site-download](/bursa-blinklabs-site-download.png)

<br>

Copia la ruta desde Blinklabs y ejecuta el siguiente comando para descargar el archivo binario.

<br>

Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

> Consejo: Puedes descargar la ultima version de Bursa desde la pagina <a href="https://github.com/blinklabs-io/bursa/releases" target="_blank"> https://github.com/blinklabs-io/bursa/releases</a>.

```
wget -O - https://github.com/blinklabs-io/bursa/releases/download/v0.11.1/bursa-v0.11.1-linux-amd64 > bursa
```

***

<br>



## Paso 2 - Cambiar Permisos

<br>

Para este ejemplo, nombramos el archivo binario `bursa`. Para hacer el archivo ejecutable ejecuta el siguiente comando:

<br>

Ajusta la ruta del archivo y el nombre del archivo si es necesario.

```
chmod +x bursa
```

***

<br>



## Paso 3 - Abrir Firewall en el Puerto 8080 para la API

<br>

Asegurate de que tu firewall este abierto para la API. Para este ejemplo, usamos el puerto 8080. Para abrir el puerto en 8080 ejecutamos el siguiente comando:

```
sudo ufw allow 8080/tcp
```

***

<br>

### Felicidades, estas listo para comenzar a usar Bursa!

Ahora podemos usar la linea de comandos para crear una billetera de Cardano y generar todos los archivos que necesitaremos para administrar la billetera. Tambien podemos iniciar la API y acceder a la documentacion Swagger de la API.

## Usar Linea de Comandos para Crear Billetera y Generar Archivos de Billetera

Podemos usar la linea de comandos para crear una billetera y generar todos los archivos que necesitaremos para administrar nuestra billetera de Cardano.

Para este ejemplo creamos los archivos de billetera en la carpeta `dev` usando la bandera `--output` y dandole un directorio donde generar los archivos.

```
./bursa wallet create --output dev
```

![bursa-wallet-create-with-output-string](/bursa-wallet-create-with-output-string.png)

Ahora tendremos todos los archivos de billetera en nuestro directorio `dev`.

![bursa-wallet-files](/bursa-wallet-files.png)

## Usar Linea de Comandos para Iniciar API

Si queremos usar la API podemos usar la linea de comandos para iniciarla, ejecutando el siguiente comando.

```
./bursa api
```

![bursa-start-api](/bursa-start-api.png)

## Acceder a la Documentacion Swagger de la API

Puedes verificar la API de Bursa yendo a tu IP:puerto/swagger/index.html. Por favor ajusta la IP y tu puerto si es necesario.

```
http://localhost:8080/swagger/index.html
```

![bursa-swagger](/bursa-swagger.png)
