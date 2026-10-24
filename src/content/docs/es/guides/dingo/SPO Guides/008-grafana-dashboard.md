---
title: Paneles de Grafana
description: Guía para SPO de pools Dingo - Paneles de Grafana.
---

# Paneles de Grafana para Dingo

Paneles de monitorización para [Dingo](https://github.com/blinklabs-io/dingo), la implementación de un nodo Cardano en Go desarrollada por Blink Labs. Los archivos de los paneles y su README están en el [repositorio de Dingo](https://github.com/blinklabs-io/dingo/tree/main/docs/dashboards).

## Paneles

| Panel | Archivo | Descripción |
| --- | --- | --- |
| **Node Overview** | `node-overview.json` | Resumen de época, slot, distancia a la punta, densidad, blockfetch, mempool, KES, pares, almacenamiento y entorno de ejecución; altura de bloque, progreso de época y estadísticas de forjado |
| **Block Production** | `block-production.json` | Mapa de calor de latencia de forjado, distribuciones acumuladas de retraso de bloques, tasas de forjado y ciclo de vida KES |
| **Peer Health** | `peer-health.json` | Pares hot/warm/cold, tipos de conexión, series temporales de estado, promociones/degradaciones y E/S de red |
| **Mempool** | `mempool.json` | Transacciones pendientes, tamaño del mempool, ciclo de vida de las transacciones, caché CBOR y bus de eventos |
| **Resource Usage** | `resources.json` | CPU, memoria, mapa de calor de GC, E/S de disco, IOPS, presión PSI, Badger y descriptores de archivo |

## Requisitos previos

Antes de comenzar, comprueba que dispones de:

- **Grafana 12+**, probado con 12.4: [guía de instalación](https://grafana.com/docs/grafana/latest/setup-grafana/installation/).
- **Prometheus** recopilando métricas del nodo Dingo en `localhost:12798` para instalaciones locales, como se configura en el paso 2. La recopilación remota requiere un valor explícito de `metricsBindAddr` o `DINGO_METRICS_BIND_ADDR` en Dingo; `bindAddr` no cambia la exposición de métricas.
- Un nodo **Dingo** con métricas activadas, en el puerto predeterminado `12798`. El servicio de métricas escucha en `127.0.0.1` de forma predeterminada.
- El **[plugin Business Text](https://grafana.com/grafana/plugins/marcusolsson-dynamictext-panel/)**, necesario para la cabecera de todos los paneles.
- **[prometheus-node-exporter](https://github.com/prometheus/node_exporter)**, necesario únicamente para las métricas de CPU, memoria y disco del host en Resource Usage.

## Inicio rápido

### 1. Instalar el plugin Business Text

En una terminal de la máquina que ejecuta Grafana:

```bash
sudo grafana cli --homepath /usr/share/grafana --pluginsDir /var/lib/grafana/plugins plugins install marcusolsson-dynamictext-panel
sudo systemctl restart grafana-server
```

Las rutas `--homepath` y `--pluginsDir` corresponden a los paquetes `.deb` y `.rpm` de Grafana. Sin ellas, Grafana 13 se detiene con `Could not find config defaults`.

Si ejecutas Grafana en Docker o Kubernetes, utiliza esta variable de entorno:

```text
GF_INSTALL_PLUGINS=marcusolsson-dynamictext-panel
```

### 2. Configurar los objetivos de recopilación de Prometheus

Prometheus necesita conocer la ubicación del nodo Dingo. Añade lo siguiente bajo `scrape_configs` en `prometheus.yml`:

```yaml
- job_name: dingo
  scrape_interval: 15s
  static_configs:
    - targets: ['localhost:12798']

# Optional: required for Resource Usage dashboard
- job_name: node
  scrape_interval: 15s
  static_configs:
    - targets: ['localhost:9100']
```

Establece el token en el YAML de Dingo mediante `metricsAuthToken` o `DINGO_METRICS_AUTH_TOKEN`; Dingo no proporciona una opción CLI para este secreto. Añade lo siguiente al trabajo de recopilación `dingo`:

```yaml
  authorization:
    credentials_file: /run/secrets/dingo-metrics-token
```

`credentials_file` debe contener únicamente el valor del token configurado, sin el prefijo literal `Bearer `. El mismo token protege las métricas de Mithril, así que utiliza la misma configuración de credenciales de Prometheus para recopilarlas. El servicio utiliza HTTP sin cifrar; protege el tráfico remoto del token con un proxy inverso TLS o un túnel cifrado y autenticado.

Vuelve a cargar Prometheus para aplicar los cambios:

```bash
sudo systemctl reload prometheus
```

### 3. Añadir la fuente de datos Prometheus

Grafana necesita una fuente de datos Prometheus marcada como predeterminada. Omite este paso únicamente si ya la tienes; en caso contrario, añade esta fuente o activa **Default** en la tuya mediante **Connections → Data sources**.

```bash
sudo tee /etc/grafana/provisioning/datasources/prometheus.yaml >/dev/null <<'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://localhost:9090
    access: proxy
    isDefault: true
EOF
sudo systemctl restart grafana-server
```

Cambia `url` si Prometheus se ejecuta en otro host o puerto.

### 4. Importar los paneles

Hay dos formas de añadir los paneles a Grafana.

**Opción A: Aprovisionamiento, recomendado**

El aprovisionamiento carga automáticamente los paneles desde archivos del disco. Grafana los detecta al iniciarse o en unos 30 segundos si ya está en ejecución.

```bash
DASH_URL=https://raw.githubusercontent.com/blinklabs-io/dingo/main/docs/dashboards
sudo mkdir -p /var/lib/grafana/dashboards/dingo
sudo curl -fsSL -o /etc/grafana/provisioning/dashboards/dingo.yaml "$DASH_URL/provisioning.yaml"
for f in node-overview block-production peer-health mempool resources; do
  sudo curl -fsSL -o "/var/lib/grafana/dashboards/dingo/$f.json" "$DASH_URL/$f.json"
done
sudo chown -R grafana:grafana /var/lib/grafana/dashboards/dingo/
sudo systemctl restart grafana-server
```

Después de reiniciar, abre **Dashboards → Browse** y busca «Dingo». Los cinco paneles aparecen automáticamente en una carpeta **Dingo**.

**Nota:** `allowUiUpdates: true` permite editar los paneles desde la interfaz, pero el próximo ciclo de aprovisionamiento, cada 30 segundos, sobrescribe esos cambios. Para conservar las modificaciones, edita directamente los archivos JSON.

**Opción B: Importación manual**

1. Abre Grafana en el navegador.
2. Ve a **Dashboards → New → Import**.
3. Sube cada archivo JSON.

Los paneles utilizan automáticamente la fuente de datos Prometheus predeterminada; consulta [Fuente de datos](#fuente-de-datos).

### 5. Reglas de alerta, opcionales

El archivo de reglas de alerta está listo para utilizarse sin editar. Cópialo al directorio de reglas de Prometheus:

```bash
sudo mkdir -p /etc/prometheus/rules
sudo curl -fsSL -o /etc/prometheus/rules/dingo.yaml https://raw.githubusercontent.com/blinklabs-io/dingo/main/docs/dashboards/alerts.yaml
```

Añádelo a `prometheus.yml`:

```yaml
rule_files:
  - /etc/prometheus/rules/dingo.yaml
```

Vuelve a cargar Prometheus:

```bash
sudo systemctl reload prometheus
```

## Fuente de datos

Todos los paneles hacen referencia a la fuente de datos Prometheus mediante el UID `default`, el alias integrado de Grafana para la fuente marcada como predeterminada. Basta con que tu fuente Prometheus sea la predeterminada; no necesitas modificar ningún UID.

## Variables de plantilla

Todos los paneles incluyen dos variables que descubren automáticamente las instancias de Dingo:

| Variable | Consulta | Finalidad |
| --- | --- | --- |
| `$network` | `label_values(dingo_build_info, network)` | Selecciona la red Cardano: `preview`, `preprod` o `mainnet`. |
| `$instance` | `label_values(dingo_build_info{network="$network"}, instance)` | Selecciona una o varias instancias Dingo. La opción predeterminada es «All». |

Solo Dingo expone `dingo_build_info`, que incluye las etiquetas `network`, `version` y `commit`. Así, los desplegables muestran únicamente objetivos Dingo, nunca cardano-node de Haskell.

Todas las consultas utilizan `{network="$network", instance=~"$instance"}` como selector.

**Resource Usage** añade una tercera variable:

| Variable | Consulta | Finalidad |
| --- | --- | --- |
| `$node_instance` | `label_values(node_uname_info, instance)` | Selecciona el objetivo node_exporter de las métricas del host: CPU, memoria, disco y red. Como utiliza otro puerto, de forma predeterminada `9100`, necesita su propio selector de instancia. |

Establece `$node_instance` en el host y puerto del objetivo de recopilación node_exporter, normalmente `localhost:9100` o la IP del host.

## Navegación

Los enlaces de la parte superior conectan los cinco paneles y conservan el intervalo temporal y las variables seleccionadas.

## Métricas inactivas

Algunas métricas solo emiten datos cuando su función está activa. Hasta entonces, los paneles muestran «No data».

| Métrica | Se activa cuando |
| --- | --- |
| `cardano_node_metrics_Forge_node_is_leader_int` | El forjado está activado |
| `cardano_node_metrics_Forge_adopted_int` | Se forja y adopta un bloque |
| `dingo_metrics_blockForgingLatency_seconds_bucket` | Se forja un bloque |
| `cardano_node_metrics_remainingKESPeriods_int` | Se configura una clave KES |
| `dingo_forge_tip_gap_slots` | El forjado está activado |
| `dingo_forge_opcert_counter_loaded` | Se cargan las credenciales del productor |
| `dingo_forge_opcert_counter_onchain` | Se cargan las credenciales; devuelve `NaN` hasta que el ledger aplica un bloque con uno de los certificados operativos del pool |
| `dingo_forge_slots_per_kes_period` | Se cargan las credenciales del productor |
| `dingo_forge_credentials_valid` | Se cargan las credenciales; vale 0 si no podían firmar en el slot actual |
| `dingo_forge_missed_leader_slots_total` | El forjado está activado; cuenta los slots de liderazgo sin un bloque propio adoptado |
| `dingo_database_size_bytes` | Se inicializan los almacenes de la base de datos |
| `database_blob_*` | El almacén de blobs Badger está activo |

## Lista de archivos

```text
https://github.com/blinklabs-io/dingo/tree/main/docs/dashboards
  node-overview.json       Node Overview dashboard
  block-production.json    Block Production dashboard
  peer-health.json         Peer Health dashboard
  mempool.json             Mempool dashboard
  resources.json           Resource Usage dashboard
  provisioning.yaml        Grafana provisioning config
  prometheus.yaml          Prometheus scrape config snippet
  alerts.yaml              Prometheus alert rules
  alerts_test.yaml         promtool test cases for alerts.yaml
  README.md                Source for this page
```

## Resolución de problemas

**No se encuentra Business Text o aparece «Panel plugin not found: marcusolsson-dynamictext-panel».** Instala el plugin según el paso 1 y reinicia Grafana. En un entorno gestionado, añade `marcusolsson-dynamictext-panel` a `GF_INSTALL_PLUGINS`.

**Los paneles muestran «No data».** Comprueba en **Status → Targets** de Prometheus que el trabajo `dingo` esté activo. Verifica también las variables `$network` y `$instance` de la parte superior del panel.

**No se encuentra la fuente de datos.** Los paneles utilizan la fuente predeterminada. Abre la fuente Prometheus en **Connections → Data sources** y activa **Default**.

**Los paneles no aparecen tras el aprovisionamiento.** Comprueba que `/etc/grafana/provisioning/dashboards/dingo.yaml` indique la ruta correcta. Grafana vuelve a cargar los paneles aprovisionados cada 30 segundos. Si no aparecen después de un minuto, busca errores en sus registros con `journalctl -u grafana-server`.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
