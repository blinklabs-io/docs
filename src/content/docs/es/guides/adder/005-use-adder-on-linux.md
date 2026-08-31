---
title: Uso en Linux
description: Cómo usar Adder en Linux.
---


## Descargar binario de Adder

Puedes descargar la última versión de Adder desde la página <a href="https://github.com/blinklabs-io/adder/releases" target="_blank">https://github.com/blinklabs-io/adder/releases</a>.

Descargaremos el binario de Adder ejecutando el siguiente comando. Ajusta el enlace de descarga a la versión más actual.

```
wget -c https://github.com/blinklabs-io/adder/releases/download/v0.39.1/adder-v0.39.1-linux-amd64.tar.gz -O - | tar -xz
```


***

## Ejecutar Adder con Filtros y Comandos

Ahora podemos ejecutar Adder `./adder` con filtros y comandos. Por ejemplo, puedes obtener una lista de todos los argumentos de línea de comandos disponibles usando la bandera `-h`/`--help`.

```
./adder -h
```

![adder-linux-h-sample](/adder-linux-h-sample.png)

***

### Felicitaciones!

Ahora estamos listos para ejecutar Adder con filtros y comandos para que podamos rastrear cierta informacion y elegir la forma en que somos notificados.

<br />

Ahora estamos listos para revisar algunos [ejemplos](../examples/001-using-adder-examples-desc) sobre la utilidad y el poder de Adder!
