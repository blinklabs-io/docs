---
title: Referencia de configuración de la bandeja
description: Configure los objetivos y las preferencias de notificación de Adder en la bandeja de Windows.
---

Esta referencia describe la configuración de los objetivos y las preferencias de notificación de Adder, tanto durante la configuración inicial como al editar las reglas desde la bandeja. También documenta los valores persistidos en `adder-tray.yaml` y la migración desde la configuración de filtros heredada.

## Ubicación del archivo de configuración

Adder Tray guarda su configuración en `adder-tray.yaml` en `<ConfigDir>/adder-tray.yaml`.

Configure `ADDER_TRAY_CONFIG_DIR` para cambiar el directorio que contiene `adder-tray.yaml`. El valor identifica el directorio, no un nombre de archivo alternativo. Este archivo es independiente de la configuración del motor.

## Inicio automático y estado

Adder Tray guarda la opción de inicio automático como un booleano YAML en `auto_start`:

```yaml
auto_start: true
```

- `true` activa el inicio automático de Adder Tray al iniciar sesión o reiniciar el equipo.
- `false` desactiva el inicio automático.

El asistente de configuración ofrece esta opción con la etiqueta `Start Adder automatically on login / reboot`. Esta es la forma normal de cambiar el valor; al guardar la configuración, el asistente persiste la selección en `adder-tray.yaml`.

El asistente muestra uno de estos estados:

- `Background Activity: Registered & Running (io.blinklabs.adder)`: el sistema registra el inicio de Adder y el proceso está activo.
- `Background Activity: Registered (io.blinklabs.adder)`: el sistema registra el inicio, pero el proceso no está activo.
- `Background Activity: Not registered`: el sistema no registra el inicio automático.
- `Background Activity: Status unknown`: Adder Tray no pudo determinar el estado.

### Windows

Con `auto_start: true`, Windows registra Adder Tray para el usuario actual mediante el registro `Run`. La bandeja se inicia de forma silenciosa al iniciar sesión y después administra el proceso del motor. Con `auto_start: false`, Adder no solicita ese inicio automático.

### macOS

Con `auto_start: true`, macOS configura el `LaunchAgent` de Adder para cargarlo y mantenerlo activo al iniciar la sesión, y agrega la aplicación a `Login Items`. Con `auto_start: false`, macOS desactiva la carga automática del agente y quita la aplicación de `Login Items`.

## Editor `Notification Rules...`

Durante la configuración inicial, el asistente presenta las secciones de objetivos y las preferencias de notificación. Para editar una configuración existente, abra el menú contextual de Adder desde el icono de la bandeja y seleccione `Notification Rules...`.

El editor trabaja con una copia de la configuración actual. Use `Apply & Restart` para validar y guardar los cambios, o `Cancel` para cerrar el editor y descartar los cambios no guardados.

### Modos de monitoreo

El editor ofrece dos modos:

- `Monitor Everything (ignore per-target lists)` activa el monitoreo general e ignora los valores de `Wallets`, `DReps`, `Pools`, `Assets` y `Policies`.
- La configuración estándar desactiva `Monitor Everything` y usa uno o más objetivos de esas secciones.

El editor conserva el modo seleccionado junto con las listas de objetivos. La configuración estándar limita las alertas a los objetivos y preferencias seleccionados.

### Entrada y validación de objetivos

El editor valida cada valor según su sección. Una entrada inválida muestra un error junto a la sección y no agrega el valor. Consulte los formatos aceptados en [Filtros de objetivos](#filtros-de-objetivos).

Una entrada separada por comas crea varias filas. Adder recorta los espacios de cada valor, omite los elementos vacíos y rechaza los duplicados sin distinguir mayúsculas de minúsculas. Si una parte de una entrada múltiple es inválida o duplicada, el editor no agrega ninguna parte de esa entrada.

El botón de eliminar de cada fila solicita confirmación en `Notification Rules...`. El asistente de configuración inicial elimina la fila directamente.

## Filtros de objetivos

Este ejemplo usa listas de objetivos explícitos:

```yaml
filter:
  monitor_everything: false
  wallets:
    - addr1...
    - stake1...
  dreps:
    - drep1...
    - deadbeef
  pools:
    - pool1...
    - 0123456789abcdef
  assets:
    - asset1...
  policies:
    - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  drep_match: any
  pool_match: all
  asset_match: any
  policy_match: any
```

Configure `filter.monitor_everything` como `true` para supervisar todos los tipos de eventos compatibles. Esta configuración ignora todas las listas de objetivos. Configure el valor como `false` para encontrar objetivos seleccionados; en ese caso, incluya al menos un objetivo en `wallets`, `dreps`, `pools`, `assets` o `policies`.

Use estos valores en las listas de objetivos:

- `wallets`: direcciones de pago o de participación de Cardano que comienzan por `addr...` o `stake...`.
- `dreps`: identificadores de DRep que comienzan por `drep1` o identificadores de DRep hexadecimales.
- `pools`: identificadores de grupos de participación que comienzan por `pool1...` o identificadores de grupo hexadecimales.
- `assets`: huellas digitales de activos CIP-14 que comienzan por `asset1...`.
- `policies`: identificadores hexadecimales de políticas de acuñación de 56 caracteres.

### Modos de coincidencia

Configure `drep_match`, `pool_match`, `asset_match` y `policy_match` como `any` o `all`. Un campo de coincidencia omitido usa `any` de forma predeterminada.

Cada lista de objetivos coincide con cualquiera de sus valores mediante `OR`. Un campo de coincidencia conecta su grupo de objetivos, cuando contiene valores, con el grupo anterior:

- `any` conecta los grupos con `OR`.
- `all` conecta los grupos con `AND`.

Por ejemplo, este filtro coincide con eventos de una billetera seleccionada o de un DRep seleccionado:

```yaml
filter:
  wallets: [addr1...]
  dreps: [drep1...]
  drep_match: any
```

Cuando `drep_match` cambia a `all`, un evento debe coincidir con el grupo de billeteras y el grupo de DRep. Los valores dentro de cada grupo siguen usando `OR`, por lo que la expresión adopta la forma `(wallet 1 OR wallet 2) AND (DRep 1 OR DRep 2)` cuando ambos grupos contienen varios valores. El primer grupo con valores no tiene un grupo anterior, por lo que su campo de coincidencia no tiene efecto. Adder Tray no admite un campo `wallet_match`.

El editor muestra los conectores `AND` y `OR` entre grupos poblados. Las wallets, los assets y las policies coinciden con transacciones; los pools coinciden con bloques cuyo emisor corresponde al pool seguido; y los DReps coinciden con eventos de gobernanza. Una expresión `AND` que une familias incompatibles no puede coincidir con ningún evento, por lo que el editor la rechaza antes de aplicar los cambios. Use `OR` o elimine uno de los grupos.

## Preferencias de notificación

`notify_prefs` asigna `true` o `false` a cada categoría de alerta compatible. Las siguientes son las claves YAML exactas del mapa:

```yaml
notify_prefs:
  "Incoming transactions": true
  "Outgoing transactions": true
  "Token transfers": true
  "Blocks minted": true
  "Chain rollbacks": true
  "Pool parameter changes": true
  "New governance proposals": true
  "Votes cast": true
  "Registration changes": true
  "Asset activity": true
  "Policy activity": true
  "Connection issues": true
```

El editor muestra cada categoría y cada casilla controla la regla correspondiente para todos los objetivos configurados:

- `Incoming transactions`: transacciones entrantes para wallets seguidas.
- `Outgoing transactions`: transacciones salientes para wallets seguidas cuando Adder puede resolver sus entradas.
- `Token transfers`: transferencias de tokens que involucran una wallet seguida.
- `Blocks minted`: bloques emitidos por pools seguidos en la configuración estándar. En `Monitor Everything`, controla las alertas generales de bloques.
- `Chain rollbacks`: alertas de reorganizaciones o rollbacks de la cadena, independientemente de una identidad seguida.
- `Pool parameter changes`: opción visible, pero Adder no emite actualmente una notificación funcional de cambios de parámetros de pool. Activarla no garantiza una alerta de ese tipo.
- `New governance proposals`: alertas generales de propuestas de gobernanza. Una propuesta no pertenece a un DRep concreto.
- `Votes cast`: votos de los DReps seguidos cuando coincide el ID o el hash del votante.
- `Registration changes`: cambios de registro de los DReps seguidos cuando coincide el ID o el hash del DRep.
- `Asset activity`: actividad de los assets seguidos.
- `Policy activity`: actividad asociada con las policies seguidas.
- `Connection issues`: alertas del estado de conexión. Esta categoría funciona de forma independiente y requiere activación propia.

Los DReps y pools no seguidos no activan las alertas de identidad de los DReps y pools seguidos. Las propuestas son alertas generales de gobernanza, mientras que los bloques de la configuración estándar quedan limitados al emisor de un pool seguido.

## Aplicar, cancelar y resolver problemas

`Apply & Restart` valida la expresión completa, guarda la configuración y actualiza las reglas y el límite de notificaciones del motor activo. Adder puede reiniciar o reconectar el servicio subyacente, pero no exige cerrar y volver a abrir el proceso de la bandeja. El editor deshabilita los controles durante la aplicación y Adder cierra el editor cuando la operación termina correctamente.

`Cancel` descarta la copia de trabajo y conserva la configuración aplicada anteriormente. No guarda los objetivos, conectores ni preferencias modificados durante la sesión del editor.

Una advertencia posterior a `Apply & Restart` indica un fallo no fatal después de guardar la configuración. La advertencia identifica si Adder no encuentra el binario, no puede registrar o reiniciar el servicio, o no puede alcanzar la API durante la reconexión. El editor vuelve a habilitar los controles y permite reintentar `Apply & Restart`. Adder no revierte la configuración ya guardada por este tipo de fallo.

## Recent Events

`Recent Events` muestra los eventos recientes de la bandeja y usa la red asociada con cada evento al construir sus enlaces:

- las transacciones y las acciones de gobernanza abren transacciones mediante su transaction hash;
- los bloques abren bloques mediante su block hash.

De este modo, un evento recibido de una red distinta conserva la red correcta al abrirse en el explorador.

## Agrupación de notificaciones

`notify_rate_limit` establece el número máximo de notificaciones que Tray puede emitir durante `notify_rate_window`. Tray combina los eventos adicionales que coinciden en una notificación al final de la ventana.

- Omita ambos campos o establezca cualquiera de ellos en `0` para usar una notificación cada cinco segundos.
- Establezca `notify_rate_limit` en un número negativo para desactivar la agrupación y emitir de inmediato cada evento coincidente.
- Establezca `notify_rate_window` como una cadena de duración positiva, por ejemplo `5s`, `30s` o `1m`.
- El asistente de configuración acepta el mismo formato de duración y rechaza las duraciones de ventana iguales o menores que cero.

Por ejemplo:

```yaml
notify_rate_limit: 1
notify_rate_window: 5s
```

## Migración desde la configuración de filtros heredada

Las configuraciones antiguas almacenaban los valores de objetivos de Tray en `plugins.filter.cardano`, dentro de la configuración del motor. Durante la actualización, Adder Tray importa esos valores solo cuando el nuevo `filter` de Tray no contiene una configuración de supervisión completa ni valores de objetivos. Adder Tray convierte los valores separados por comas en entradas de las listas de objetivos correspondientes.

### Antes de la migración

```yaml
plugins:
  filter:
    cardano:
      address: addr1...,stake1...
      drep: drep1...,deadbeef
      pool: pool1...,0123456789abcdef
      asset: asset1...
      policy: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

### Después de la migración

Adder Tray guarda los objetivos importados en `adder-tray.yaml`:

```yaml
filter:
  monitor_everything: false
  wallets:
    - addr1...
    - stake1...
  dreps:
    - drep1...
    - deadbeef
  pools:
    - pool1...
    - 0123456789abcdef
  assets:
    - asset1...
  policies:
    - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

Cuando Adder Tray guarda la nueva configuración, elimina las claves heredadas `address`, `drep`, `pool`, `asset` y `policy` de la configuración del motor. Las modificaciones manuales posteriores de esos valores heredados del motor no cambian la coincidencia de las notificaciones de Tray. Esta migración solo afecta a la coincidencia de Tray; no elimina las opciones de filtro de la CLI.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
