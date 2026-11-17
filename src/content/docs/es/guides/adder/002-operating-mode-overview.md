---
title: Resumen de los modos de funcionamiento
description: Modos de funcionamiento de Adder. Adder ofrece dos modos principales, Adder Tray y Adder CLI.
---

Adder ofrece tres modos de funcionamiento, cada uno adaptado a distintos usuarios y entornos de despliegue. Elige el modo que proporcione el equilibrio adecuado entre facilidad de uso, configuración y control operativo.

## 1. Adder Tray (Windows y macOS)

Adder Tray es una aplicación de escritorio que se ejecuta en la bandeja del sistema y permite monitorizar la actividad de la blockchain de Cardano de forma sencilla.

- [Guía de instalación en Windows](../003-using-adder-on-windows)
- [Guía de instalación en Mac](../004-use-adder-on-mac)

### Características principales

- Instaladores firmados (`.msi` para Windows y `.pkg` para macOS).
- Integración automática con el sistema operativo:
  - Menú en la bandeja del sistema.
  - Asistente de configuración.
  - Permisos de notificación.
  - Gestión del servicio en segundo plano.
- Configuración simplificada:
  - Selección de wallets, DReps y pools como objetivos de monitorización, con activos y políticas opcionales.
  - Adder Tray determina las opciones de notificación a partir de los objetivos seleccionados.
- No requiere YAML ni línea de comandos; es adecuado para usuarios sin conocimientos técnicos.

### Casos de uso

- Operadores de pools o delegadores que quieren notificaciones sencillas.
- Participantes en la gobernanza que siguen votaciones o propuestas.
- Usuarios que prefieren una interfaz gráfica a herramientas de línea de comandos.

## 2. Adder CLI / Monitor de eventos (binario para Linux)

El binario de línea de comandos ofrece acceso completo al procesamiento de eventos de Adder. Está pensado para operadores, desarrolladores e integradores que necesitan controlar cómo se filtran y emiten los eventos. Si la ejecución no incluye `--managed-config-dir`, Adder mantiene el flujo normal de `CLI` y el `pipeline` integrado existente.

- [Guía para Linux](../005-use-adder-on-linux)

### Características principales

- Instalación mediante descarga del binario.
- Configuración completa mediante:
  - Opciones de línea de comandos.
  - Archivos de configuración YAML.
  - Variables de entorno.
- Acceso a todos los plugins de entrada y salida:
  - Entradas chainsync, mempool, ntn y ntc.
  - Salidas log, push, webhook y otras.
- Filtrado detallado por:
  - Tipo de evento.
  - Dirección de wallet.
  - Dirección de staking.
  - Huella de activo.
  - ID de política.
  - ID de pool y otros criterios.
- Adecuado para automatización, scripts e integración con sistemas externos.

### Casos de uso

- Monitorización de infraestructura de operadores de pools.
- Indexadores personalizados o procesamiento para análisis.
- Sistemas automáticos de alertas: webhooks, notificaciones push y procesamiento de JSON.
- Desarrolladores que integran Adder como biblioteca Go.

## 3. Enrutamiento administrado de clientes (CLI)

El modo de enrutamiento administrado distribuye eventos de `ChainSync` entre clientes independientes, cada uno con sus propios filtros y destinos con nombre. Este modo está diseñado para operadores que necesitan separar el procesamiento y la entrega por cliente.

### Características principales

- Requiere la entrada `chainsync` con `intersect-tip=true` y `auto-reconnect=true`. No permite `state-path` ni un punto de intersección explícito.
- Rechaza los filtros globales para que cada cliente defina su propio enrutamiento.
- Expone una API privada para recargar configuraciones y consultar el estado. La API escucha únicamente en una dirección literal de `loopback` configurada con `--managed-address` y autentica todas las solicitudes mediante un token restringido indicado por `--managed-token-file`.
- Admite únicamente los adaptadores `log` y `webhook` en este modo. Las configuraciones validan los destinos de webhook y las rutas de los archivos de registro según la política administrada.
- Asigna una cola de entrada independiente a cada cliente y una cola independiente a cada destino. Las colas tienen límites definidos, impiden que un cliente lento bloquee a los demás y registran los eventos descartados cuando alcanzan su capacidad.
- No inicia la API pública `/events` en este modo.

La [referencia de enrutamiento administrado](../014-managed-routing) describe el formato de configuración, las restricciones de los destinos y las operaciones de recarga.

## Matriz de decisión rápida

| Requisito | Modo recomendado |
| --- | --- |
| Notificaciones sencillas | **Adder Tray** |
| Sin experiencia con la línea de comandos | **Adder Tray** |
| Personalización completa | **Adder CLI** |
| Enrutamiento independiente por cliente | **Enrutamiento administrado** |
| Recarga de clientes sin reiniciar `ChainSync` | **Enrutamiento administrado** |
| Configuración YAML | **Adder CLI** |
| Webhooks / salidas JSON | **Adder CLI** |
| Notificaciones nativas del sistema operativo | **Adder Tray** |
| Ejecución en Linux | **Adder CLI** |
| Integración con scripts o servicios | **Adder CLI** |
| Configuración mediante interfaz gráfica | **Adder Tray** |

## Guías de Adder Tray (Windows y macOS)

- [Guía de instalación en Windows](../003-using-adder-on-windows)
- [Guía de instalación en Mac](../004-use-adder-on-mac)

## Guías de Adder CLI / Monitor de eventos (Linux)

- [Guía para Linux](../005-use-adder-on-linux)

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
