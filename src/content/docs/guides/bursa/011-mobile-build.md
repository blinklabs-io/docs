---
title: Bursa Mobile Build Reference
description: Configure and validate Bursa Android and iOS mobile builds.
---

## Overview

This guide defines the reproducible build contract for Bursa mobile artifacts. It covers Android debug and signed release builds, Android CI validation, and the iOS framework and unsigned simulator build.

## Prerequisites

- Use the canonical Android build container for Android builds.
- Provide the release keystore and its credentials before creating Android release artifacts.
- Run the iOS framework and simulator build on macOS with the required Apple build tools.

## Android builds

The Android container accepts `BURSA_BUILD_TYPE=debug` or `BURSA_BUILD_TYPE=release`. The container runs the web bundle build, creates the mobile AAR with `gomobile`, and then runs the Android Gradle build.

### Debug build

Set `BURSA_BUILD_TYPE=debug` to run `assembleDebug`. The container copies the resulting unsigned debug APK to `/out`. This mode does not require Android signing material.

The Android project uses Android Build Tools `35.0.0`. Keep this version aligned with the build image so Gradle uses the installed toolchain.

### Release build and signing

Set `BURSA_BUILD_TYPE=release` to run `assembleRelease bundleRelease`. A release build requires all of the following container inputs:

| Input | Purpose |
| --- | --- |
| `BURSA_KEYSTORE_PATH` | Path to an existing keystore file. |
| `BURSA_KEYSTORE_PASSWORD` | Keystore password. |
| `BURSA_KEY_ALIAS` | Alias of the signing key. |
| `BURSA_KEY_PASSWORD` | Password for the signing key. |

The release build fails when any input is missing or when the keystore file does not exist. The Gradle configuration also refuses artifact-producing release tasks without signing material. These checks prevent the build from producing a distributable unsigned APK.

The container selects only an APK whose name does not end in `-unsigned.apk` and selects the release AAB. It then runs `apksigner verify --verbose --print-certs` against the selected APK. The verification must pass before the container copies the signed APK and AAB to `/out`.

### CI signing inputs

The Android release job reads these four GitHub secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

CI decodes `ANDROID_KEYSTORE_BASE64` into a temporary keystore and mounts that file in the container as `BURSA_KEYSTORE_PATH`. CI maps the other three secrets to `BURSA_KEYSTORE_PASSWORD`, `BURSA_KEY_ALIAS`, and `BURSA_KEY_PASSWORD`. The build does not expose secret values in the build command.

### Tag version validation

For a `v*` tag, CI removes the leading `v` and sets `BURSA_VERSION_NAME` to the remaining version. The tag must use this form:

```text
vMAJOR.MINOR.PATCH[-PRERELEASE]
```

The core version has no leading zeros. `MAJOR` contains up to four digits and cannot exceed `2099`; `MINOR` and `PATCH` contain up to two digits. The resulting `BURSA_VERSION_CODE` cannot exceed the Android maximum of `2100000000`.

Supported prereleases use `-alpha.N`, `-beta.N`, or `-rc.N`, where `N` is an integer from `1` through `29` without leading zeros. CI orders prereleases below the final version of the same core version as follows:

| Stage | Rank |
| --- | --- |
| `alpha.N` | `N` (`1` through `29`) |
| `beta.N` | `30 + N` (`31` through `59`) |
| `rc.N` | `60 + N` (`61` through `89`) |
| Final release | `99` |

CI calculates the version code with this formula:

```text
((MAJOR * 10000 + MINOR * 100 + PATCH) * 100) + rank
```

CI rejects tags that do not satisfy these rules instead of assigning a potentially colliding version code. Non-tag builds use the debug variant and do not set tag-derived version values.

## Android CI gate and smoke test

The `android` and `android-smoke-test` jobs run only when this expression evaluates to true:

```text
vars.BURSA_ANDROID_ENABLED == 'true'
```

When the value is absent or differs from `true`, CI skips the Android build, artifact attestation and upload, and arm64 smoke test. The iOS job does not use this Android gate.

When enabled, the smoke test downloads the APK selected by the Android build and installs it on an arm64 `arm64-v8a` emulator. The test fails if the signed APK does not produce the embedded wallet readiness signal, reports a wallet boot failure or crash, or does not expose `WalletService` through `dumpsys`. This test validates the build before CI publishes the Android artifacts.

## iOS framework and simulator build

The iOS build uses this sequence:

1. Run `cd ui && gomobile bind -target=ios -o ../mobile/ios/Bursa.xcframework ./mobile` to create `mobile/ios/Bursa.xcframework`.
2. Run `cd mobile/ios && xcodegen generate` to create `Bursa.xcodeproj`.
3. Run `cd mobile/ios && xcodebuild -project Bursa.xcodeproj -scheme Bursa -sdk iphonesimulator -configuration Debug -derivedDataPath build CODE_SIGNING_ALLOWED=NO build` to create the unsigned simulator app.

The generated iOS app target must use these settings:

| Setting | Value |
| --- | --- |
| `PRODUCT_MODULE_NAME` | `BursaApp` |
| `PRODUCT_NAME` | `Bursa` |
| `PRODUCT_BUNDLE_IDENTIFIER` | `io.blinklabs.bursa` |
| `OTHER_LDFLAGS` | `$(inherited) -lresolv` |
| `CODE_SIGNING_ALLOWED` | `NO` |
| `CODE_SIGNING_REQUIRED` | `NO` |

`BursaApp` keeps the app module distinct from the `Bursa` framework module. `-lresolv` links the system resolver required by the framework. The product name and bundle identifier remain unchanged, and the simulator build runs without signing.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>