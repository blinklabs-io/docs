---
title: Métricas de node-parity from-genesis
description: Referencia operativa para habilitar y supervisar las métricas Prometheus de node-parity from-genesis.
---

# Métricas de `node-parity from-genesis`

Esta referencia explica cómo habilitar el endpoint Prometheus de `node-parity from-genesis`, qué métricas consultar y cómo interpretar las alertas de supervisión.

## Requisitos

- Usar `--network preview` o `--network preprod`.
- Proporcionar `--dingo-addr` con la dirección Node-to-Client del nodo Dingo.
- Configurar Prometheus para consultar el endpoint `/metrics` en la dirección configurada.

## Habilitar las métricas

La ejecución de `node-parity from-genesis` debe incluir explícitamente `--metrics-addr`:

```bash
node-parity from-genesis \
  --network preview \
  --dingo-addr 127.0.0.1:3001 \
  --metrics-addr :9464
```

El valor `preview` del ejemplo corresponde a Preview; una ejecución en Preprod utiliza `--network preprod`. El proceso sigue la cadena de Dingo desde el génesis y compara los parámetros de protocolo, la distribución de participación y el conjunto completo de UTxO con Koios.

`--metrics-addr` es una opción explícita. Aunque su valor predeterminado es `:9464`, `from-genesis` no inicia el servicio HTTP si el comando no incluye la opción. `--metrics-addr=` desactiva el servicio incluso cuando el comando incluye la opción con un valor vacío.

Prometheus debe consultar `/metrics` en la dirección configurada, por ejemplo `http://<host>:9464/metrics`. Esta dirección corresponde al servicio HTTP de métricas de `node-parity`; no corresponde a la opción `metricsPort` del archivo `dingo.yaml`.

## Contrato de métricas

Todas las series incluyen la etiqueta `network`, con el valor `preview` o `preprod` utilizado por el comando.

| Métrica | Etiquetas adicionales | Significado |
| --- | --- | --- |
| `node_parity_epochs_total` | Ninguna | Cuenta los epochs en los que al menos una comprobación alcanzó un veredicto fiable. |
| `node_parity_epoch_checks_incomplete_total` | `field` | Cuenta las comprobaciones que no alcanzaron un veredicto fiable. `field` puede ser `protocol_params`, `stake_distribution` o `utxo`. |
| `node_parity_divergence_total` | `field`, `reference` | Cuenta las divergencias detectadas. `field` puede ser `protocol_params`, `stake_distribution` o `utxo`; `reference` es `koios` para `from-genesis`. |

Una divergencia indica que Dingo y la referencia comparada produjeron valores diferentes. Una comprobación incompleta indica que el proceso no pudo obtener un resultado fiable; no representa por sí misma una divergencia.

`node_parity_divergence_total` también utiliza `reference="cardano_node"` para los comandos `check` y `watch`. `from-genesis` utiliza `reference="koios"` y no registra los contadores de comprobación de `check` y `watch`. Por tanto, la ausencia de esos contadores no confirma que una ejecución de `from-genesis` funcione correctamente; la supervisión debe usar las métricas específicas de `from-genesis`.

## Alertas

- `NodeParityFromGenesisStalled` identifica un proceso que lleva más de dos horas activo y no ha registrado ningún epoch con un veredicto fiable ni ninguna comprobación incompleta durante las dos horas anteriores. La regla mantiene esta condición durante 15 minutos antes de alertar.
- `NodeParityFromGenesisNotVerifying` identifica comprobaciones incompletas durante las dos horas anteriores sin ningún epoch con un veredicto fiable en el mismo periodo. La regla mantiene esta condición durante 30 minutos antes de alertar.
- `NodeParityDivergence` alerta cuando `node_parity_divergence_total` registra una divergencia durante la última hora y mantiene esa condición durante 5 minutos. `NodeParityRepeatedDivergence` identifica al menos dos divergencias en esa ventana. El texto de ambas alertas utiliza `{{ $labels.reference }}` para indicar si la referencia es `koios` o `cardano_node`.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>