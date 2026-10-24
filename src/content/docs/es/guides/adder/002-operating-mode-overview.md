---
title: Resumen de los modos de funcionamiento
description: Modos de funcionamiento de Adder. Adder ofrece dos modos principales, Adder Tray y Adder CLI.
---

Adder ofrece dos modos de funcionamiento, cada uno adaptado a distintos usuarios y entornos de despliegue. Elige el modo que proporcione el equilibrio adecuado entre facilidad de uso, configuración y control operativo.

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
  - Selección de objetivos: direcciones, claves de staking, IDs de pools, DReps, etc.
  - Adder Tray aplica el tipo de notificación predefinido.
- No requiere YAML ni línea de comandos; es adecuado para usuarios sin conocimientos técnicos.

### Casos de uso

- Operadores de pools o delegadores que quieren notificaciones sencillas.
- Participantes en la gobernanza que siguen votaciones o propuestas.
- Usuarios que prefieren una interfaz gráfica a herramientas de línea de comandos.

## 2. Adder CLI / Monitor de eventos (binario para Linux)

El binario de línea de comandos ofrece acceso completo al procesamiento de eventos de Adder. Está pensado para operadores, desarrolladores e integradores que necesitan controlar cómo se filtran y emiten los eventos.

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

## Matriz de decisión rápida

| Requisito | Modo recomendado |
| --- | --- |
| Notificaciones sencillas | **Adder Tray** |
| Sin experiencia con la línea de comandos | **Adder Tray** |
| Personalización completa | **Adder CLI** |
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
