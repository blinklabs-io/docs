---
title: Referencia de compilación móvil
description: Configuración reproducible para compilar y validar las aplicaciones móviles de Bursa.
---

Esta guía describe los contratos de compilación de Android e iOS para Bursa. Incluye los modos de compilación, la firma de artefactos, los controles ejecutables de CI y los ajustes necesarios para generar la aplicación de simulador de iOS.

## Android

### Modos de compilación

El contenedor de compilación espera el repositorio en `/code` y puede copiar los artefactos a `/out`. `BURSA_BUILD_TYPE` acepta únicamente `debug` o `release`:

- `BURSA_BUILD_TYPE=debug` ejecuta `./gradlew assembleDebug` y produce el APK de depuración sin firma.
- `BURSA_BUILD_TYPE=release` ejecuta `./gradlew assembleRelease bundleRelease` y produce el APK de lanzamiento firmado y el Android App Bundle (`.aab`).

El contenedor prepara primero el paquete Android de la biblioteca con `gomobile bind` para `android/arm64`, `-androidapi 24` y el paquete Java `io.blinklabs.bursa`. El contenedor ejecuta Gradle después de generar ese paquete.

El flujo de CI selecciona `debug` para las ejecuciones que no parten de una etiqueta `v*`. Las ejecuciones basadas en una etiqueta seleccionan `release`.

### Firma de lanzamiento

Una compilación `release` requiere un almacén de claves existente y estas variables:

```text
BURSA_KEYSTORE_PATH
BURSA_KEYSTORE_PASSWORD
BURSA_KEY_ALIAS
BURSA_KEY_PASSWORD
```

En CI, las variables de firma proceden de estos secretos, cuyos valores no forman parte de la documentación:

| Secreto de CI | Uso |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | El flujo decodifica este valor en un almacén de claves y lo monta como `BURSA_KEYSTORE_PATH`. |
| `ANDROID_KEYSTORE_PASSWORD` | Alimenta `BURSA_KEYSTORE_PASSWORD`. |
| `ANDROID_KEY_ALIAS` | Alimenta `BURSA_KEY_ALIAS`. |
| `ANDROID_KEY_PASSWORD` | Alimenta `BURSA_KEY_PASSWORD`. |

El flujo rechaza la compilación si falta una variable de firma o si `BURSA_KEYSTORE_PATH` no apunta a un archivo existente. Gradle aplica la misma protección al detectar una tarea de empaquetado `Release`. El proceso nunca selecciona `*-unsigned.apk`: selecciona únicamente el APK firmado y también exige el AAB de lanzamiento. `apksigner verify --verbose --print-certs` debe validar el APK antes de copiarlo, atestarlo o cargarlo.

### Herramientas y versiones

Android usa `35.0.0` como versión fija de Build Tools. La configuración de Gradle usa este valor para `buildToolsVersion`.

Las compilaciones de lanzamiento derivan los valores de versión de una etiqueta `v*`:

- `BURSA_VERSION_NAME` recibe la etiqueta sin el prefijo `v`.
- `BURSA_VERSION_CODE` usa la fórmula `(major*10000 + minor*100 + patch) * 100 + rank`.
- La parte principal debe seguir `MAJOR.MINOR.PATCH`, sin ceros iniciales; `major` admite como máximo cuatro dígitos y `minor` y `patch` admiten como máximo dos. `major` no puede superar `2099`.
- Las versiones previas admitidas son `-alpha.N`, `-beta.N` y `-rc.N`, con `N` entre `1` y `29`.
- `rank` conserva el orden de lanzamiento: `alpha.N` usa `N`, `beta.N` usa `30 + N`, `rc.N` usa `60 + N` y la versión final usa `99`.
- El flujo rechaza cualquier formato previo diferente y cualquier `versionCode` superior a `2100000000`.

Las compilaciones de depuración que no reciben valores de versión conservan `BURSA_VERSION_NAME=0.1.0` y `BURSA_VERSION_CODE=1`.

## Control de CI y prueba de humo

Los trabajos `android` y `android-smoke-test` usan exactamente este control:

```yaml
if: ${{ vars.BURSA_ANDROID_ENABLED == 'true' }}
```

Cuando `vars.BURSA_ANDROID_ENABLED` no es exactamente `true`, CI no ejecuta el trabajo de Android. Por ello no se ejecutan la compilación, la atestación ni la carga de artefactos. El trabajo `android-smoke-test` tampoco se ejecuta.

Cuando el control está habilitado, la prueba de humo descarga el artefacto Android y lo inicia en un emulador `arm64-v8a` con API 34 sobre un ejecutor arm64. La prueba falla si el APK seleccionado no demuestra que la billetera integrada está lista o que `WalletService` funciona.

## iOS

La compilación de iOS se ejecuta en macOS y genera un artefacto para simulador sin firma. El flujo relevante es:

1. Ejecutar `gomobile bind` con `-target=ios` para generar `mobile/ios/Bursa.xcframework`.
2. Ejecutar `cd mobile/ios && xcodegen generate` para generar `Bursa.xcodeproj` desde `project.yml`.
3. Ejecutar `xcodebuild` con el proyecto `Bursa.xcodeproj`, el esquema `Bursa`, `-sdk iphonesimulator` y `-configuration Debug`.

El comando de compilación de simulador usa `CODE_SIGNING_ALLOWED=NO`. El proyecto también establece `CODE_SIGNING_ALLOWED: NO` y `CODE_SIGNING_REQUIRED: NO`, por lo que esta compilación no necesita una identidad de firma.

El proyecto conserva estos ajustes de identidad y enlace:

| Ajuste | Valor |
| --- | --- |
| `PRODUCT_MODULE_NAME` | `BursaApp` |
| `OTHER_LDFLAGS` | `$(inherited) -lresolv` |
| `PRODUCT_NAME` | `Bursa` |
| `PRODUCT_BUNDLE_IDENTIFIER` | `io.blinklabs.bursa` |

La aplicación incorpora `Bursa.xcframework` como framework. `PRODUCT_NAME` y `PRODUCT_BUNDLE_IDENTIFIER` permanecen sin cambios mientras `PRODUCT_MODULE_NAME` define el módulo Swift `BursaApp` y `OTHER_LDFLAGS` enlaza `-lresolv`.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>