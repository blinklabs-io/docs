---
title: Guía de inicio rápido
description: Resumen de inicio rápido de Bursa.
---

# Bursa

Una billetera programática de Cardano, escrita en Go, que expone una API, CLI e interfaz de biblioteca, permitiendo a los desarrolladores integrar fácilmente la funcionalidad de billetera.

Descarga el binario o archivo comprimido de CLI de Bursa o el instalador de escritorio correspondiente desde blinklabs.io. Luego ejecuta Bursa en la línea de comandos o API.

<br>

Para comenzar, sigue los pasos a continuación

<br>

Esta guía asume una configuración típica de Linux. Por favor ajusta los comandos y rutas según sea necesario.

***

<br>

## Paso 1 - Descargar el binario o archivo comprimido de CLI o el instalador de escritorio desde Blinklabs
<br>

**Paso 1-A** - Primero ve a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplázate hacia abajo hasta Bursa.



![bursa-blinklabs-site](/bursa-blinklabs-site.png)
<br>


**Paso 1-B** - Selecciona el sistema operativo que quieres usar para ejecutar Bursa.

![bursa-blinklabs-site-operating-system](/bursa-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - La ruta de CLI en Linux o FreeBSD permite descargar el archivo comprimido y moverlo a la ubicación preferida o...

![bursa-blinklabs-site-download](/bursa-blinklabs-site-download.png)

<br>

En la ruta de CLI para Linux o FreeBSD, la ruta copiada desde Blinklabs permite ejecutar los siguientes comandos para descargar y extraer el archivo comprimido de la versión.

<br>

Ajusta la ruta del enlace a la ruta correcta para la versión que deseas descargar.

> Consejo: Puedes descargar la última versión de Bursa desde la página <a href="https://github.com/blinklabs-io/bursa/releases" target="_blank"> https://github.com/blinklabs-io/bursa/releases</a>.

```
wget -O bursa-v0.15.0-linux-amd64.tar.gz https://github.com/blinklabs-io/bursa/releases/download/v0.15.0/bursa-v0.15.0-linux-amd64.tar.gz
tar xzf bursa-v0.15.0-linux-amd64.tar.gz
```

Las descargas de CLI para Linux y FreeBSD usan archivos `.tar.gz` específicos para cada arquitectura. Las descargas de CLI para Windows siguen usando archivos `.exe`, y Bursa distribuye el monedero de escritorio para Windows como un instalador `.msi` firmado y específico para cada arquitectura. El instalador MSI puede incluir el bootstrapper de WebView2 Evergreen cuando la versión incluye ese paquete opcional y el runtime no está instalado. Las descargas de CLI para macOS siguen usando archivos `.zip`, y Bursa distribuye el monedero de escritorio para macOS como un instalador `.pkg` notarizado y específico para cada arquitectura.

***

<br>



## Paso 2 - Cambiar permisos

<br>

Este paso solo aplica al archivo binario de CLI obtenido mediante un archivo comprimido para Linux o FreeBSD. Este ejemplo usa `bursa` como nombre del archivo binario. El siguiente comando concede permisos de ejecución:

<br>

Ajusta la ruta del archivo y el nombre del archivo si es necesario. En Windows y macOS, el instalador de escritorio correspondiente evita la extracción del archivo y la ejecución de `chmod`.

```
chmod +x bursa
```

***

<br>



## Paso 3 - Conectarse a la API

<br>

De forma predeterminada, la API de Bursa escucha en `127.0.0.1:8080`. Los clientes locales se conectan a `localhost:8080` sin abrir un puerto del firewall.

Para aceptar conexiones remotas, configura explícitamente `api.address` en el archivo YAML o `API_LISTEN_ADDRESS`. Cuando Bursa escucha fuera del loopback, requiere TLS y exactamente una fuente de confianza bearer: `API_JWT_SECRET` o `API_JWKS_URL`. Consulta la [referencia de configuración](./009-configuration-reference) para configurar estos ajustes.

***

<br>

### ¡Felicidades, estás listo para comenzar a usar Bursa!

Ahora podemos usar la línea de comandos para crear una billetera de Cardano y generar todos los archivos que necesitaremos para administrar la billetera. También podemos iniciar la API y acceder a la documentación Swagger de la API.

Bursa también se puede usar para generar scripts multifirma, hashes y claves, incluidas las claves y certificados necesarios para ejecutar un stake pool de Cardano.

[Aprende más sobre cómo usar Bursa con la línea de comandos y los comandos útiles que puedes ejecutar.](../003-commands)

Consulta la [guía del monedero de nodo completo](../012-full-node-wallet) para instalarlo, compilarlo desde el código fuente y solucionar problemas.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
