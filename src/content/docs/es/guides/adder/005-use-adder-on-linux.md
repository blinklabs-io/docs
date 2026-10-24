---
title: Uso en Linux
description: Cómo usar Adder en Linux.
---


## Descargar binario de Adder

Puedes descargar la última versión de Adder desde la página <a href="https://github.com/blinklabs-io/adder/releases" target="_blank">https://github.com/blinklabs-io/adder/releases</a>.

Descargaremos el binario de Adder ejecutando el siguiente comando. Ajusta el enlace de descarga a la versión más actual.

```
 wget -c https://github.com/blinklabs-io/adder/releases/download/v0.46.0/adder-v0.46.0-linux-amd64.tar.gz -O - | tar -xz
```


***

## Ejecutar Adder con filtros y comandos

Ahora podemos ejecutar Adder `./adder` con filtros y comandos. Por ejemplo, puedes obtener una lista de todos los argumentos de línea de comandos disponibles usando la opción `-h`/`--help`.

```
./adder -h
```

![adder-linux-h-sample](/adder-linux-h-sample.png)

***

### ¡Enhorabuena!

Ya puedes ejecutar Adder con filtros y comandos para seguir la información que te interese y elegir cómo recibir las notificaciones.

<br />

Consulta los [ejemplos](../examples/001-using-adder-examples-desc) para conocer las posibilidades de Adder.
