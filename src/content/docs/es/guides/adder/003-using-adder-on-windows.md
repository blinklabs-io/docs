---
title: Usar Adder en Windows
description: Cómo utilizar Adder en Windows.
---

Adder es una aplicación de escritorio que se ejecuta en la bandeja del sistema y facilita la observación de la actividad de la blockchain de Cardano.

## Instalar y configurar

### Paso 1.1 - Descargar el instalador de Adder

La forma más sencilla de instalar Adder en Windows es utilizar el instalador MSI disponible en [blinklabs.io](https://blinklabs.io/projects-open-source).

<img src="/adder-windows-release-download.webp"
     alt="adder-windows-release-download"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Selecciona la versión adecuada para tu sistema: Windows x64 o Windows arm64.

### Paso 1.2 - Abrir el archivo .msi

Cuando termine la descarga, pulsa `Open` para abrir el archivo `.msi`.

<img src="/adder-windows-open-msi.webp"
     alt="adder-windows-open-msi"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Paso 1.3 - Iniciar la instalación

Pulsa `Run` para iniciar la instalación.

<img src="/adder-windows-run-msi.webp"
     alt="adder-windows-run-msi"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Paso 2 - Iniciar Adder

### Paso 2.1 - Abrir el menú Inicio de Windows

<img src="/adder-windows-start-menu.webp"
     alt="adder-windows-start-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Paso 2.2 - Buscar Adder

Busca la aplicación `Adder` y ábrela.

<img src="/adder-windows-search-adder-app.webp"
     alt="adder-windows-search-adder-app"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Si no aparece la pantalla de configuración **Welcome**, abre la bandeja del sistema, haz clic derecho en Adder y selecciona **Configure** para abrir el asistente.

### Paso 3 - Configurar Adder

Al abrir *Adder Tray App*, verás la pantalla **Welcome**, que te guía para configurar Adder y las alertas que quieras recibir.

<img src="/adder-windows-config-welcome.webp"
     alt="adder-windows-config-welcome"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Paso 3.1 - Seleccionar la red Cardano que quieres observar

<img src="/adder-windows-config-network.webp"
     alt="adder-windows-config-network"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Paso 3.2 - Añadir los objetivos de observación

Introduce los datos que quieras observar: dirección de billetera, identificador de política, huella de activo, identificador de pool o identificador de DRep.

En este ejemplo, introducimos un identificador de pool y otro de DRep.

<img src="/adder-windows-config-pool-id-drep-id.webp"
     alt="adder-windows-config-pool-id-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Selecciona `OR` para recibir una alerta cuando cualquiera de los dos realice un evento que hayas seleccionado.

<img src="/adder-windows-config-or.webp"
     alt="adder-windows-config-or"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Paso 3.3 - Salida de notificaciones, opcional

Adder ya está configurado para mostrar notificaciones de escritorio. Puedes seleccionar otros métodos si lo prefieres.

<img src="/adder-windows-config-output.webp"
     alt="adder-windows-config-output"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Pulsa `Next Step`.

### Paso 3.4 - Alertas de eventos

Marca las casillas de los eventos sobre los que quieras recibir alertas de escritorio.

<img src="/adder-windows-config-events.webp"
     alt="adder-windows-config-events"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Paso 3.5 - Enviar una notificación de prueba

Pulsa `Test Notification` para confirmar que recibes las alertas de escritorio.

<img src="/adder-windows-config-send-test.webp"
     alt="adder-windows-config-send-test"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Si ves la notificación, pulsa `Yes, I saw it`.

### Paso 3.6 - Terminar la configuración

Pulsa `Finish Setup`.

### ¡Enhorabuena! Adder te avisará cuando ocurra uno de los eventos seleccionados.

## Usar el menú de la bandeja

Para ver eventos recientes, ajustar la configuración o iniciar, detener o reiniciar la aplicación, haz clic derecho en Adder en la bandeja del sistema y elige la opción que necesites.

<img src="/adder-windows-tray-app-menu.webp"
     alt="adder-windows-tray-app-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
