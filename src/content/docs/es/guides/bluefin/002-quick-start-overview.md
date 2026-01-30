---
title: Guia de Inicio Rapido
description: Resumen de Inicio Rapido de Bluefin.
---

# Bluefin

Bluefin es un minero independiente de Fortuna (TUNA), escrito en Go, que sincroniza la cadena, mina TUNA y envia transacciones a nodos remotos sin ninguna otra infraestructura.

Bluefin es autocontenido y se ejecuta sin dependencias externas. Puedes ejecutarlo a traves de las <a href="https://github.com/blinklabs-io/bluefin/pkgs/container/bluefin" target="_blank">imagenes Docker</a> o binarios desde la <a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">pagina de releases</a>.

<br>

En esta guia te guiaremos a traves de la descarga y ejecucion del binario de Bluefin. Para comenzar sigue los pasos a continuacion.

<br>

Esta guia asume una configuracion tipica de Linux. Por favor ajusta los comandos y rutas segun sea necesario.

***

<br>

## Paso 1 - Descargar binario de Blinklabs
<br>

**Paso 1-A** - Primero ve a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplazate hacia abajo hasta Bluefin.

![bluefin-blinklabs-site](/bluefin-blinklabs-site.png)
<br>


**Paso 1-B** - Selecciona el sistema operativo que quieres usar para ejecutar Bluefin.

![bluefin-blinklabs-site-operating-system](/bluefin-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puedes descargar el archivo binario y mover el archivo a tu ubicacion preferida o...

![bluefin-blinklabs-site-download](/bluefin-blinklabs-site-download.png)

<br>

Copia la ruta de Blinklabs y ejecuta el siguiente comando para descargar el archivo binario.

<br>

Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

> Consejo: Puedes descargar la ultima version de Bluefin desde la pagina <a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">https://github.com/blinklabs-io/bluefin/releases</a>.

```
wget -O - https://github.com/blinklabs-io/bluefin/releases/download/v0.13.5/bluefin-v0.13.5-linux-amd64 > bluefin
```

***

<br>

## Paso 2 - Cambiar Permisos

<br>

Para este ejemplo, nombramos el archivo binario `bluefin`. Para hacer el archivo ejecutable ejecuta el siguiente comando:

<br>

Ajusta la ruta del archivo y el nombre del archivo si es necesario.

```
chmod +x bluefin
```

***

<br>

## Paso 3 - Ejecutar Bluefin

<br>

> Bluefin esta disenado para tomar su configuracion de variables de entorno. Todos los ejemplos a continuacion muestran la ejecucion del binario bluefin directamente desde la shell y necesitaran ser adaptados para uso con Docker.
>
> Cuando se ejecuta sin configuracion, bluefin por defecto mina TUNA v1 en mainnet. Generara una nueva billetera y escribira la frase semilla en el archivo seed.txt en el directorio actual.

```
./bluefin
...
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"wallet/wallet.go:62","msg":"wrote generated mnemonic to seed.txt"}
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"bluefin/main.go:73","msg":"loaded mnemonic for address: addr1..."}
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"bluefin/main.go:79","msg":"starting indexer on mainnet"}
```

Puedes usar las variables de entorno `NETWORK` y `PROFILE` para cambiar el modo en que bluefin opera.
Por ejemplo, para minar TUNA v2 en `preview`:

```
NETWORK=preview PROFILE=tuna-v2 ./bluefin
```

Si quieres proporcionar tu propia frase semilla de billetera, puedes establecer la variable de entorno `MNEMONIC` o crear el archivo `seed.txt` antes de ejecutar bluefin.

### Fondear la billetera

Si permites que bluefin genere una nueva billetera, necesitaras fondear la billetera con algunos fondos iniciales usando la direccion de billetera registrada al inicio. Si la billetera ya existe, puede que necesites enviar fondos de vuelta a tu propia billetera para que sean visibles para bluefin.
La billetera necesitara al menos 2 UTxOs disponibles, uno para cubrir las tarifas de TX, y otro de al menos 5 (t)ADA para usar como colateral.

### Enviar TXs

Por defecto, bluefin usara el protocolo NtN (nodo-a-nodo) TxSubmission para enviar transacciones directamente a la red Cardano.
Este metodo tiene la desventaja de no proporcionar ninguna retroalimentacion si una transaccion falla. Puedes usar la variable de entorno `SUBMIT_URL` para especificar la URL de una API de envio para usar en su lugar, que proporcionara retroalimentacion sobre cualquier problema de validacion de transacciones.

### Limpiar los datos locales

Bluefin almacena sus datos locales en `.bluefin/` en el directorio actual. Si encuentras un problema que requiere limpiar los datos, puedes eliminar estos datos y bluefin se re-sincronizara desde cero.
