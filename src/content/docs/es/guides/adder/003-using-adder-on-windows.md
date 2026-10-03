---
title: Uso en Windows
description: Como usar Adder en Windows.
---

# Usando Adder en Windows

Esta guia te mostrara como usar Adder en Windows. En las siguientes secciones te mostraremos ejemplos de como usar Adder. Recuerda que estos son ejemplos para familiarizarte con el tipo de cosas que Adder es capaz de hacer. El verdadero poder de Adder puede ser desbloqueado por tu imaginacion.

> Nota: descarga el instalador `.msi` de Adder desde <a href="https://blinklabs.io/projects-open-source" target="_blank">blinklabs.io</a>. Si falta el instalador, consulta [Inicio Rápido](../002-quick-start-overview).

## Paso 1 - Instalar Adder en Windows

1. Descarga el MSI correspondiente a la arquitectura de Windows: `x64` o `arm64`.
2. Ejecuta el MSI y completa el asistente de instalación.

El MSI de lanzamiento firmado instala `adder.exe` y `adder-tray.exe` en `%ProgramFiles%\Adder`. También crea el acceso directo de la bandeja en el menú Inicio y registra Adder en `Aplicaciones y características` o `Agregar o quitar programas`.

El MSI no registra una `Tarea programada` ni activa el inicio automático por sí mismo. Los MSI compilados localmente o de prueba pueden carecer de firma, y Windows puede mostrar una advertencia de `SmartScreen` o de editor desconocido.

## Paso 2 - Configurar Adder Tray

En el asistente de configuración, seleccione un modo de monitoreo:

- Active `Monitor Everything` para monitorear todos los eventos compatibles. Esta opción ignora las listas de las secciones de destino.
- Desactive `Monitor Everything` y agregue al menos un valor válido en `Wallets`, `DReps`, `Pools`, `Assets` o `Policies`.

Introduzca los valores con el formato aceptado por cada sección:

- `Wallets`: una dirección de pago o de participación que comience por `addr1...` o `stake1...`.
- `DReps`: un ID de DRep con prefijo `drep1...` o un valor hexadecimal.
- `Pools`: un ID de pool con prefijo `pool1...` o un valor hexadecimal.
- `Assets`: una huella digital de activo CIP-14 con prefijo `asset1...`.
- `Policies`: un ID de política hexadecimal de 56 caracteres.

Los valores de una misma sección funcionan como alternativas. Los controles `OR` y `AND` combinan las secciones de destino que contienen valores. Use `OR` cuando cualquiera de las secciones pueda producir el evento correspondiente. No use `AND` entre familias de eventos incompatibles: `Pools` coincide con bloques, `Wallets`, `Assets` y `Policies` coinciden con transacciones, y `DReps` coincide con eventos de gobernanza. El asistente rechaza una combinación `AND` que no pueda coincidir con ningún evento.

En la pantalla `Notifications`, seleccione las categorías de alertas relevantes para los grupos de destino configurados. Seleccione `Notify on connection issues` por separado para recibir alertas sobre problemas de conexión.

Abra `Advanced — Rate Limiting` para definir `Max notifications per window` y `Window duration`. Introduzca una duración como `5s`, `30s` o `1m`. Los campos vacíos usan el valor predeterminado de una notificación cada cinco segundos. Introduzca un límite negativo para desactivar por completo la agrupación de notificaciones.

Consulte la [referencia de configuración de la bandeja](../007-tray-configuration-reference) para conocer las opciones disponibles de destinos y notificaciones.

### Paso 3 - Inicio automático y actividad en segundo plano

Seleccione la casilla `Start Adder automatically on login / reboot` para iniciar Adder automáticamente con la cuenta de Windows actual. Desmarque la casilla para desactivar el inicio automático. La bandeja registra esta opción solo para el usuario actual de Windows; el MSI no la activa de forma independiente. La bandeja inicia el motor de Adder en segundo plano, sin abrir una ventana y sin requerir elevación de privilegios.

El estado de actividad en segundo plano muestra uno de los siguientes valores:

- `Background Activity: Registered & Running (io.blinklabs.adder)`: el inicio automático está registrado y el motor de Adder está en ejecución.
- `Background Activity: Registered (io.blinklabs.adder)`: el inicio automático está registrado, pero el motor no está en ejecución.
- `Background Activity: Not registered`: el inicio automático está desactivado.
- `Background Activity: Status unknown`: Adder no pudo determinar el estado del inicio automático.

Seleccione `Open Login Items Settings...` para abrir la configuración de aplicaciones de inicio de Windows y revisar el registro de inicio de Adder.

## Menú de la bandeja

Haga clic con el botón derecho en Adder desde la bandeja del sistema para abrir el menú y ajustar la configuración de la aplicación.

Seleccione [Notification Rules...](../007-tray-configuration-reference) para editar los objetivos de monitoreo y las categorías de notificación. `Apply & Restart` guarda los cambios y reinicia el motor necesario sin reiniciar la bandeja.

Seleccione `Recent Events` para consultar los eventos recientes. Las entradas de transacción y gobernanza abren la transacción en el explorador; las entradas de bloque abren el bloque. Cada enlace usa la red del evento.

Seleccione `Show Logs` para abrir la carpeta de registros. La bandeja guarda el registro en `%LOCALAPPDATA%\Adder\Logs\adder-tray.log`.

Seleccione `About` para abrir un cuadro de diálogo dentro de Adder. El cuadro muestra la versión que está en ejecución y, si está disponible, el hash del commit con el formato `Version: <version> (commit: <hash>)`. Si no hay información del commit, muestra `Version: <version>`.

## Diagnóstico y reintento

La GUI de Windows no tiene una consola normal. El archivo de registro recoge los fallos de inicio o ejecución, incluidos los pánicos y los problemas de gráficos; use `Show Logs` para abrir la carpeta y revisar el archivo.

Adder ejecuta una sola instancia de la bandeja por sesión de inicio de Windows. Si un segundo lanzamiento termina inmediatamente, compruebe si ya existe una instancia de la bandeja en ejecución.

Si aparece un aviso al aplicar la configuración, Adder ya guardó la configuración. El editor permanece abierto y la aplicación vuelve a habilitar sus controles si el reinicio o la reconexión falla de forma recuperable. Revise el estado o los registros y vuelva a aplicar la configuración.

<br />


> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `--help`.

<br />


Ahora estamos listos para revisar algunos [ejemplos](../examples/001-using-adder-examples-desc) sobre la utilidad y el poder de Adder!


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
