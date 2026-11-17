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

El MSI firmado admite Windows x64 y arm64 e instala `adder.exe` y `adder-tray.exe` en `%ProgramFiles%\Adder`. El menú Inicio incluye un acceso a la aplicación de bandeja, y la instalación aparece en **Agregar o quitar programas**. El instalador no crea ninguna tarea programada.

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

Selecciona `Mainnet`, `Preprod`, `Preview` o `Dijkstra`. La opción `Dijkstra` utiliza la red `DijkstraNet`.

<img src="/adder-windows-config-network.webp"
     alt="adder-windows-config-network"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Paso 3.2 - Añadir los objetivos de observación

Añade uno o varios valores en cada sección de objetivos que corresponda:

- `Watch Wallet` para direcciones de wallets.
- `Track DRep` para IDs de DRep.
- `Monitor Pool` para IDs de pool.
- La sección opcional `Follow Asset` para huellas de activos, cuando las necesites.
- La sección opcional `Follow Policy` para IDs de política, cuando los necesites.

<img src="/adder-windows-config-pool-id-drep-id.webp"
     alt="adder-windows-config-pool-id-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

También puedes utilizar el modo exclusivo `Monitor Everything` para monitorizar todos los tipos de objetivos admitidos en lugar de introducir listas de objetivos explícitas. No combines este modo con valores de objetivos.

Continúa al siguiente paso. Adder determina las opciones de notificación a partir de los tipos de objetivos introducidos o del modo `Monitor Everything`.

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

Marca las casillas de los eventos sobre los que quieras recibir alertas de escritorio, incluida `Chain rollbacks`. Esta casilla controla las notificaciones de retroceso de forma independiente de `Blocks minted`.

<img src="/adder-windows-config-events.webp"
     alt="adder-windows-config-events"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

### Controles de inicio y actividad en segundo plano

La casilla `Start Adder automatically on login / reboot` configura el inicio automático de Adder Tray al iniciar sesión o reiniciar Windows.

El indicador de actividad en segundo plano muestra si Adder está registrado y en ejecución. La opción `Open Login Items Settings...` abre la configuración de aplicaciones de inicio de Windows.

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

Adder guarda el registro de la bandeja de Windows en `%LOCALAPPDATA%/Adder/Logs/adder-tray.log`, incluidos los detalles de los pánicos recuperados. Solo se ejecuta una instancia de la bandeja por sesión de inicio de sesión.

<img src="/adder-windows-tray-app-menu.webp"
     alt="adder-windows-tray-app-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Los enlaces del explorador para los eventos recientes utilizan la red configurada. Los eventos de transacción y gobernanza utilizan el hash de transacción, mientras que los eventos de bloque utilizan el hash de bloque.

### Editar las reglas de notificación

La opción `Notification Rules...` del menú de la bandeja permite editar los objetivos `Wallets`, `DReps`, `Pools`, `Assets` y `Policies`. El editor también ofrece controles para activar o desactivar las categorías de notificación disponibles o utilizar `Monitor Everything` de forma exclusiva en lugar de mantener listas de objetivos explícitas.

Al aplicar los cambios, Adder guarda la configuración y actualiza las reglas y los límites de frecuencia sin reiniciar el proceso de la bandeja. El editor solicita confirmación antes de eliminar un objetivo. Si la reconexión muestra una advertencia recuperable, el editor permanece abierto y vuelve a habilitar sus entradas para permitir un nuevo intento.

Las notificaciones de bloques de pools solo coinciden con los pools seguidos. Las notificaciones de gobernanza de DRep solo coinciden con los DRep seguidos. Cuando un evento contiene varios votos, el texto muestra el voto del DRep seguido.

### Consultar la versión

La opción `About` abre el diálogo integrado. Cuando los metadatos del commit están disponibles, el diálogo muestra `Version: <version> (commit: <hash>)`; de lo contrario, muestra únicamente la versión.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
