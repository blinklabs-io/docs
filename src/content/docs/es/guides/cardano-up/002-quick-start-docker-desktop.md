---
title: Inicio Rapido usando Docker Desktop
description: Como usar cardano-up con Docker Desktop.
---

# cardano-up usando Docker Desktop en Windows

cardano-up es una utilidad de linea de comandos para gestionar servicios de Cardano. cardano-up te permite usar una utilidad de linea de comandos para instalar servicios de Cardano utilizando imagenes de docker.

Esta guia te mostrara como descargar Docker Desktop, ejecutar Ubuntu WSL y descargar el binario de cardano-up en Windows.

Para comenzar sigue los pasos a continuacion

## Paso 1 - Descargar Docker Desktop

Primero ve a <a href="https://www.docker.com/products/docker-desktop/" target="_blank">https://www.docker.com/products/docker-desktop/</a> y desplazate hacia abajo hasta `Download Docker Desktop`

![cardano-up-docker-desktop-website](/cardano-up-docker-desktop-website.png)

***

## Paso 2 - Seleccionar Sistema Operativo

Para este ejemplo, seleccionamos Windows - AMD64. Por favor selecciona tu sistema operativo.

![cardano-up-docker-desktop-website-operating-system](/cardano-up-docker-desktop-website-operating-system.png)

Sigue las instrucciones en pantalla.

![cardano-up-docker-desktop-install](/cardano-up-docker-desktop-install.png)

> Consejo: Docker Desktop instala un Subsistema de Windows para Linux donde docker se ejecutara.
>
> ![cardano-up-subsystem-install](/cardano-up-subsystem-install.png)

***

## Paso 3 - Abrir PowerShell como Administrador

En tu barra de busqueda escribe `powershell` y selecciona ejecutar como administrador.

![cardano-up-open-powershell-admin](/cardano-up-open-powershell-admin.png)

> Consejo: puedes verificar que docker desktop esta ejecutandose con el siguiente comando en tu PowerShell
>
> ```
> wsl -l -v
> ```
>
> ![cardano-up-verify-wsl-docker-desktop](/cardano-up-verify-wsl-docker-desktop.png)

***

## Paso 4 - Instalar Ubuntu en WSL

Para instalar Ubuntu en WSL ejecutamos el siguiente comando en nuestro PowerShell:

```
wsl --install -d Ubuntu
```

![cardano-up-install-ubuntu-wsl](/cardano-up-install-ubuntu-wsl.png)

***

<a name="step-5"></a>

## Paso 5 - Iniciar WSL y Completar la Configuracion

Una vez que Ubuntu este instalado, ejecutaremos el siguiente comando en nuestro PowerShell para completar la configuracion creando un usuario y contrasena. Primero inicia Ubuntu WSL ejecutando:

```
wsl.exe -d Ubuntu
```

![cardano-up-finish-install-ubuntu-wsl-exe](/cardano-up-finish-install-ubuntu-wsl-exe.png)


Ahora escribe un nombre de usuario y contrasena. Tendras que escribir tu contrasena dos veces.

![cardano-up-finish-install-ubuntu-username](/cardano-up-finish-install-ubuntu-username.png)

Una vez que hayas agregado un nombre de usuario y contrasena veras un mensaje de `Welcome to Ubuntu...`. Ahora puedes salir de tu PowerShell escribiendo `exit`

![cardano-up-install-ubuntu-wsl-successful](/cardano-up-install-ubuntu-wsl-successful.png)

***

## Paso 6 - Habilitar Ubuntu en Docker Desktop

Para habilitar Ubuntu en Docker Desktop, vuelve a Docker Desktop y selecciona configuracion.

![cardano-up-docker-desktop-settings](/cardano-up-docker-desktop-settings.png)

Una vez en configuracion selecciona la pestana `Resources` en el lado izquierdo.

![cardano-up-docker-desktop-resources](/cardano-up-docker-desktop-resources.png)

Bajo la pestana Resources selecciona `WSL integration`

![cardano-up-docker-desktop-wsl-integration](/cardano-up-docker-desktop-wsl-intergration.png)

Bajo WSL integration selecciona `Ubuntu` y haz clic en `Apply & restart`

![cardano-up-docker-desktop-apply-ubuntu](/cardano-up-docker-desktop-apply-ubuntu.png)

***

## Paso 7 - Iniciar la aplicacion Ubuntu

En tu barra de busqueda escribe `ubuntu`, selecciona la aplicacion ubuntu y haz clic en abrir.

![cardano-up-launch-ubuntu-app](/cardano-up-launch-ubuntu-app.png)

> CONSEJO: Puedes verificar si docker esta disponible ejecutando `docker`. Mostrara una lista de todos los comandos de docker disponibles.
>
> ![cardano-up-check-docker-available-tip](/cardano-up-check-docker-available-tip.png)

***

## Paso 8 - Descargar el binario de cardano-up

Ajusta el enlace de descarga a la version mas actual.

> Consejo: Puedes descargar la ultima version de cardano-up desde la pagina <a href="https://github.com/blinklabs-io/cardano-up/releases" target="_blank">https://github.com/blinklabs-io/cardano-up/releases</a>.

Descargaremos el binario de cardano-up ejecutando el siguiente comando:

```
wget -O - https://github.com/blinklabs-io/cardano-up/releases/download/v0.14.2/cardano-up-v0.14.2-linux-amd64 > cardano-up
```

![cardano-up-download-cardano-up](/cardano-up-download-cardano-up.png)

***

## Paso 9 - Cambiar Permisos

Para este ejemplo, nombramos el archivo binario `cardano-up`. Para hacer el archivo ejecutable ejecuta el siguiente comando:

```
chmod +x cardano-up
```

![cardano-up-change-permissions](/cardano-up-change-permissions.png)

***

## Paso 10 - Mover cardano-up

Para este ejemplo, vamos a poner nuestro binario cardano-up en `/usr/local/bin`. Para mover el binario cardano-up podemos ejecutar:

```
sudo mv cardano-up /usr/local/bin/cardano-up
```

![cardano-up-move-binary](/cardano-up-move-binary.png)

Tendras que ingresar tu contrasena que creaste en el [Paso 5](#step-5)

![cardano-up-move-binary-password](/cardano-up-move-binary-password.png)

> CONSEJO: Puedes ejecutar `which cardano-up` para verificar la ruta donde esta ubicado tu binario cardano-up.
>
> ![cardano-up-verify-binary-path](/cardano-up-verify-binary-path.png)

***

### Felicitaciones!

Ahora estamos listos para comenzar a usar cardano-up. Ahora podemos revisar [como usar cardano-up](../003-using-cardano-up) para demostrar la facilidad de uso y el poder de usar cardano-up para instalar imagenes de docker de los servicios de Cardano que necesitas.
