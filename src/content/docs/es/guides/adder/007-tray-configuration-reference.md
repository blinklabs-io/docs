---
title: Referencia de configuración de Tray
description: Configure los objetivos, las notificaciones y la migración desde la configuración de filtros heredada de Adder Tray.
---

Esta referencia describe los cambios de configuración de Adder Tray en `adder-tray.yaml`. Tray usa la sección `filter` para encontrar los objetivos de las notificaciones; el motor ya no proporciona las listas de objetivos de Tray.

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

- `wallets`: direcciones de pago o de participación de Cardano que comienzan por `addr1` o `stake1`.
- `dreps`: identificadores de DRep que comienzan por `drep1` o identificadores de DRep hexadecimales.
- `pools`: identificadores de grupos de participación que comienzan por `pool1` o identificadores de grupo hexadecimales.
- `assets`: huellas digitales de activos CIP-14 que comienzan por `asset1`.
- `policies`: identificadores hexadecimales de políticas de acuñación de 56 caracteres.

### Modos de coincidencia

Configure `drep_match`, `pool_match`, `asset_match` y `policy_match` como `any` o `all`. Un campo de coincidencia omitido usa `any` de forma predeterminada.

Cada lista de objetivos coincide con cualquiera de sus valores. Un campo de coincidencia conecta su grupo de objetivos, cuando contiene valores, con el grupo anterior:

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

El asistente de configuración muestra las categorías que corresponden a los objetivos seleccionados:

- `wallets` muestra `Incoming transactions`, `Outgoing transactions` y `Token transfers`.
- `dreps` muestra `New governance proposals`, `Votes cast` y `Registration changes`.
- `pools` muestra `Blocks minted`, `Pool parameter changes` y `Chain rollbacks`.
- `assets` muestra `Asset activity`.
- `policies` muestra `Policy activity`.
- `monitor_everything: true` muestra `Incoming transactions`, `Blocks minted`, `Chain rollbacks` y `Votes cast`.
- `Connection issues` permanece disponible como preferencia del estado de conexión.

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
