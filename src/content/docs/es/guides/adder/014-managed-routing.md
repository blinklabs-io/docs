---
title: Referencia de enrutamiento y configuración administrados de clientes
description: Configure el enrutamiento administrado de clientes de Adder, recargue su configuración e interprete el estado del enrutamiento y las evidencias de entrega.
---

# Enrutamiento y configuración administrados de clientes

## Descripción general

Esta referencia describe el modo administrado opcional de Adder. El modo
administrado lee un único flujo de ChainSync, aplica carriles de filtros
independientes para clientes identificados y envía los eventos coincidentes a
los destinos de cada cliente. El [resumen de los modos de
funcionamiento](/es/guides/adder/002-operating-mode-overview/) explica cómo encaja el modo
administrado con los demás modos de funcionamiento de Adder. La [referencia
de comandos](/es/guides/adder/006-command_list/) enumera la CLI completa; esta página describe
los indicadores administrados y su comportamiento durante la ejecución.

El modo administrado no cambia los flujos normales de la CLI ni los
integrados cuando falta `--managed-config-dir`. Esos flujos conservan sus
filtros, la presión inversa de salida, la precedencia de configuración, la API
HTTP y el flujo público `/events` existentes.

## Activación y requisitos previos

Establezca `--managed-config-dir` para seleccionar el modo administrado. Adder
requiere entonces la entrada `chainsync` con estos ajustes:

- `intersect-tip=true`
- `auto-reconnect=true`
- sin `state-path`
- sin `intersect-point` explícito
- sin opciones de filtro globales

El modo administrado utiliza la fuente ChainSync como una cola activa. Adder no
inicia la API HTTP normal ni el flujo público `/events`. Un reinicio del proceso
puede perder eventos entre ejecuciones porque Adder comienza en la punta actual
en ese momento. Durante una reconexión dentro del proceso, Adder puede repetir
eventos recientes o emitir un rollback. Ni el enrutador ni sus componentes
habilitados conservan una cola de entrega.

La fuente puede conectarse a Dingo o a un par Cardano público. Todos los
carriles de clientes comparten esta entrada; la configuración asigna cada
evento coincidente a sus destinos.

## Indicadores del operador y requisitos previos

Los indicadores administrados son:

| Indicador | Valor predeterminado | Propósito |
| --- | --- | --- |
| `--managed-config-dir` | Empty | Activa el modo administrado e identifica el directorio que contiene `manifest.json` y los archivos de clientes. |
| `--managed-credentials-dir` | Empty | Identifica el directorio que contiene los archivos de credenciales restringidos. |
| `--managed-log-dir` | Empty | Identifica el directorio local de confianza para los destinos administrados `log`. |
| `--managed-token-file` | Empty | Identifica el archivo restringido que contiene el token de la API del operador. |
| `--managed-address` | `127.0.0.1:8081` | Establece la dirección del servidor privado de la API administrada. Adder solo acepta una dirección de loopback literal. |
| `--managed-allow-hosts` | Empty | Enumera los nombres de host de webhook aprobados por el operador. |
| `--managed-allow-local-targets` | `false` | Permite receptores webhook de loopback para pruebas locales. |

El servidor de la API administrada solo acepta una dirección de loopback
literal. El operador debe proporcionar el acceso remoto mediante un túnel seguro
administrado por separado. El indicador `--managed-allow-local-targets` es una
excepción explícita para los receptores webhook de loopback que se utilizan en
pruebas locales. Los demás destinos webhook requieren HTTPS, un nombre de host
aprobado y una dirección de destino pública.

Guarde el token en un archivo normal restringido. Mantenga una sola línea con
al menos 32 caracteres y no incluya el token en las URL. En Unix, los archivos
de credenciales y de token del operador requieren el modo `0600` o uno más
restrictivo. En Windows, la propiedad debe pertenecer a la cuenta en
ejecución, `LocalSystem` o `Administrators`, y la lista de control de acceso de
Windows solo puede conceder acceso a esas identidades.

## Publique los archivos de configuración

El operador controla los archivos de configuración y credenciales. Adder nunca
escribe estos archivos. Publique un paquete completo mediante reemplazo
atómico, en este orden:

1. Publique los archivos de credenciales.
2. Publique los archivos de clientes.
3. Publique `manifest.json` al final.

Incremente `generation` del manifiesto para cada publicación completa e
incremente `revision` de cada cliente modificado. Use directorios privados
propiedad del operador. Conserve un paquete válido protegido fuera del
directorio de publicación activo para restaurar una actualización rechazada o
reemplazarla con una revisión corregida.

El paquete inicial debe contener al menos un cliente antes de que Adder se
inicie. Adder confina cada referencia a un archivo del manifiesto o del cliente
en su directorio configurado y solo acepta nombres base seguros. Los
identificadores de cliente deben seguir siendo únicos al compararlos sin
distinguir mayúsculas y minúsculas ASCII, incluidas las identidades eliminadas
anteriormente durante la misma ejecución. Las referencias a archivos del
manifiesto también deben seguir siendo únicas sin distinguir mayúsculas y
minúsculas ASCII. Un reinicio borra el historial en memoria de identidades y
revisiones aplicadas.

### Manifiesto

El manifiesto contiene una generación positiva y al menos una referencia de
cliente. Cada referencia repite el ID y la revisión del cliente y nombra un
archivo de cliente:

```json
{
  "generation": 1,
  "customers": [
    {
      "id": "u1",
      "revision": 1,
      "file": "u1.json"
    }
  ]
}
```

El archivo del manifiesto debe contener un único valor JSON válido. Los campos
desconocidos y los valores JSON adicionales hacen que la validación falle. Un
archivo de cliente debe repetir exactamente el `id` y `revision` de la
referencia.

### Reglas y destinos de clientes

Un cliente necesita al menos un destino y una regla de filtro. Cada regla tiene
un identificador, un tipo de evento de entrada canónico y `all` o un destino
nombrado. Los tipos de evento canónicos admitidos son:

- `input.block`
- `input.transaction`
- `input.rollback`
- `input.governance`
- `input.drep-registration`
- `input.drep-update`
- `input.drep-retirement`

`criteria` puede contener opcionalmente matrices llamadas `addresses`,
`policies`, `asset_fingerprints`, `pool_ids` y `drep_ids`. El motor de
coincidencias combina con AND los criterios de dirección, política y activo.
También combina con OR las identidades de pool y DRep cuando aparecen ambas.
El motor acepta criterios de pool
para reglas de bloque, todos los criterios para reglas de transacción,
criterios de dirección, pool y DRep para reglas de gobernanza, criterios de
DRep para reglas de certificados DRep y ningún criterio de Cardano para reglas
de rollback.

Este cliente envía los bloques y rollbacks a todos los destinos, y las
transacciones al destino `local`:

```json
{
  "id": "u1",
  "revision": 1,
  "destinations": [
    {
      "id": "local",
      "plugin": "log",
      "options": {
        "path": "u1.events.jsonl",
        "format": "json"
      }
    }
  ],
  "filters": [
    {
      "id": "blocks",
      "event_type": "input.block",
      "destination": "all"
    },
    {
      "id": "transactions",
      "event_type": "input.transaction",
      "destination": "local"
    },
    {
      "id": "rollbacks",
      "event_type": "input.rollback",
      "destination": "all"
    }
  ]
}
```

Los destinos administrados `log` escriben archivos JSON locales de anexado de
confianza. El nombre base debe comenzar por el ID del cliente propietario
seguido de un punto, y Adder confina el archivo abierto y verifica su identidad
como archivo normal. Un destino de registro administrado no puede usar una ruta
arbitraria ni stdout como destino de carga útil.

### Destinos webhook y credenciales

Los destinos webhook utilizan referencias versionadas a archivos restringidos
para la URL y los valores opcionales de autenticación básica:

```json
{
  "id": "alerts",
  "plugin": "webhook",
  "options": {
    "format": "adder"
  },
  "credentials": {
    "url": {
      "file": "u1-alert-url-v1.json",
      "version": 1
    }
  },
  "limit_group": "alerts.example.com",
  "interval_ms": 1000
}
```

El archivo de credenciales referenciado contiene el cliente propietario, su
versión de credencial y el valor:

```json
{
  "customer_id": "u1",
  "version": 1,
  "value": "https://alerts.example.com/incoming/SECRET"
}
```

Las referencias a credenciales pertenecen a una instancia, están confinadas
al directorio de credenciales y los operadores no pueden compartirlas entre
clientes. Adder no permite cambiar el contenido de una versión de referencia aplicada, aunque
aumente la revisión del cliente. Publique una versión nueva para rotar una
credencial. El operador debe restringir los archivos de credenciales del mismo
modo que el archivo de token del operador.

Adder valida destinos webhook, vinculaciones de credenciales, formatos, hosts
aprobados, excepciones de destinos locales, redirecciones y grupos de cuota del
proveedor. Rechaza redirecciones, proxies del entorno, direcciones de destino
privadas o reservadas, cambios DNS hacia direcciones denegadas, `state-path`,
la omisión de la verificación TLS y opciones no declaradas. `format=discord`
requiere un intervalo de al menos dos segundos.

## API de configuración autenticada

Cada ruta administrada, incluidos el estado, la salud y las métricas, requiere
este encabezado:

```http
Authorization: Bearer <operator token>
```

Adder devuelve `401 Unauthorized` cuando falta el token bearer o no es válido,
y establece `WWW-Authenticate: Bearer`. Las solicitudes utilizan el token
cargado y leen los archivos publicados; las solicitudes de recarga no aceptan
cuerpos de configuración de reemplazo.

| Solicitud | Cuerpo | Resultado |
| --- | --- | --- |
| `POST /v1/config/reload` | `{"generation":2}` | Valida y prepara el manifiesto completo, y después lo cambia en un único límite de despacho. Use esta ruta para añadir y eliminar clientes. |
| `POST /v1/config/customers/{id}/reload` | `{"revision":2}` | Recarga un cliente existente mientras el conjunto de clientes del manifiesto permanece sin cambios. Los demás clientes conservan sus revisiones aplicadas. |
| `GET /v1/config/status` | None | Devuelve las generaciones observadas y aplicadas, las revisiones y recortes de clientes, los errores de validación, el estado de los destinos, los contadores, las capacidades y el estado de la fuente. |
| `GET /healthcheck` | None | Devuelve la preparación del enrutador. La conectividad de la fuente y la degradación de los destinos siguen siendo señales de estado independientes. |
| `GET /metrics` | None | Devuelve los contadores administrados agregados sin etiquetas de cliente ni de credencial. |

La ruta administrada autenticada `/metrics` es independiente de las
métricas del flujo normal descritas en la [referencia de
métricas](/es/guides/adder/010-metrics/). Los componentes de salida normales y su configuración
habitual aparecen en la [guía de integraciones de salida](/es/guides/adder/008-output-integrations/);
el modo administrado no habilita esos adaptadores.

## Semántica de recarga y cambio de configuración

Adder serializa las recargas, valida y prepara la configuración nueva antes de
cambiarla. El plazo de preparación predeterminado es de 10 segundos. Si la
preparación falla, Adder mantiene activa la configuración existente y limpia los
componentes preparados. La limpieza puede tardar hasta cinco segundos; la limpieza
sin terminar continúa consumiendo el presupuesto de trabajo administrado y
puede producir un error de limpieza pendiente.

La ruta de recarga completa requiere la `generation` esperada del manifiesto.
Una recarga dirigida requiere la `revision` esperada del cliente, un cliente
existente y un conjunto de clientes del manifiesto sin cambios. Las
generaciones y revisiones obsoletas, los cambios de contenido sin incremento,
las identidades no coincidentes, los archivos no válidos y las reservas de
recursos que exceden los límites hacen que la recarga falle. Repetir contenido
idéntico en una generación o revisión aplicada es idempotente. Una recarga
dirigida puede dejar mezcladas las revisiones de los clientes. La última
identidad y revisión aplicadas de un cliente eliminado permanecen reservadas
durante la vida del proceso; un reinicio borra ese historial.

Una respuesta de recarga correcta incluye `cutover_occurrence_id`. Adder asigna
IDs de ocurrencia que aumentan monótonamente a los eventos de la fuente,
incluidos los rollbacks y los eventos idénticos repetidos. El valor identifica
la última ocurrencia de la fuente asignada antes del cambio de configuración.
Puede aparecer aunque no llegue ningún evento después, y una repetición
idempotente devuelve el valor de cambio original.

`cutover_occurrence_id` no confirma el vaciado de las colas, no afirma que la
revisión haya gestionado un evento y no confirma la entrega externa. Los eventos
que Adder ya admitió para un cliente conservan su revisión de configuración.
Eliminar un cliente o un destino, o rotar credenciales, revoca la generación
antigua del destino aunque queden eventos de la revisión anterior en la cola
del cliente. Las operaciones ya enviadas pueden tener un resultado incierto.

## Aislamiento de colas, límites y contadores

El despacho administrado utiliza colas acotadas por cliente y por destino. Cada
cliente tiene un trabajador de filtros que conserva el orden de entrada,
mientras los trabajadores de destino funcionan de forma independiente. Un
cliente lento no consume la cuota de cola de otro cliente. Las reglas
Adder combina las reglas superpuestas en un único envío por ocurrencia y destino,
con los IDs de reglas coincidentes ordenados. Adder ofrece una coincidencia de inmediato y
no utiliza un temporizador de vaciado periódico.

Los límites predeterminados del enrutamiento administrado son:

| Recurso | Valor predeterminado |
| --- | ---: |
| Clientes | `32` |
| Reglas por cliente | `32` |
| Destinos por cliente | `8` |
| Instancias de componentes activas, preparadas o en retirada | `512` |
| Cola de entrada por cliente | `256` items |
| Cola de destino | `256` items |
| Representación JSON del evento | `1 MiB` |
| Datos retenidos contabilizados por cola | `16 MiB` |
| Presupuesto de reserva administrado de todo el proceso | `512 MiB` |

Adder reserva la capacidad de las colas antes de cambiar una configuración.
Cada cola utiliza un cargo conservador de ocho veces el tamaño del evento
codificado más una sobrecarga fija. Los objetos de configuración, los metadatos
de reglas coincidentes, las ranuras de canales de componentes, las credenciales
decodificadas y las configuraciones retiradas con eventos en cola también
consumen el presupuesto de todo el proceso. Estos son límites del trabajo de
enrutamiento, no una garantía de memoria total del proceso; la sobrecarga del
entorno de ejecución de Go, los búferes de las entradas y las asignaciones temporales
del codificador quedan fuera de la garantía.

Una cola llena descarta el elemento nuevo e incrementa los contadores de
descartes de ese carril. Una recarga que no puede reservar recursos falla antes
del cambio. El presupuesto de trabajo administrado también contabiliza los
metadatos de diagnóstico. Su cola asíncrona contiene como máximo 1,024
entradas, con un límite inferior para presupuestos de proceso menores;
`diagnostic_dropped` cuenta el desbordamiento de diagnósticos por separado de la
pérdida de eventos.

El estado y los totales del proceso distinguen estos contadores:

| Contador | Significado |
| --- | --- |
| `input_dropped` | Cuenta los eventos que un carril de cliente rechaza durante la admisión. |
| `matched` | Cuenta las coincidencias de reglas por regla. |
| `destination_dropped` | Cuenta los elementos que una cola de destino rechaza. |
| `submitted_to_plugin` | Cuenta los elementos que acepta un canal de componente administrado. |
| `plugin_errors` | Cuenta los errores de procesamiento del componente. |
| `unknown_outcomes` | Cuenta los envíos cuyo resultado externo sigue siendo incierto. |
| `canceled` | Cuenta el trabajo que la revocación o el apagado cancela. |
| `diagnostic_dropped` | Cuenta los diagnósticos de metadatos que desbordan la cola de diagnósticos. |

Los contadores de clientes cubren la admisión y la coincidencia. Los contadores
de destinos cubren los envíos y los resultados. Los totales del proceso
conservan los recuentos de los destinos eliminados. Los diagnósticos utilizan
`component=managed.router` e incluyen IDs opacos de cliente y regla, revisiones
e IDs de ocurrencia, pero nunca credenciales ni cargas útiles de eventos.

## Evidencia de entrega, errores y apagado

La entrega administrada no es duradera ni exactamente una vez. El canal del
componente informa de la finalización del procesamiento, no de la entrega
externa. El observador de finalización gestiona un evento de componente
pendiente a la vez y solo observa que el componente terminó de procesarlo. Por
tanto, la aceptación por el canal del componente nunca demuestra que un
proveedor haya aceptado, almacenado o entregado el evento.

Los resultados externos siguen siendo desconocidos, incluido un fallo de
aceptación seguido de desconexión que puede causar un reintento y un envío
duplicado. Los errores de escritura HTTP y de registro siguen siendo
diagnósticos independientes. Un destino que falla o agota su presupuesto de
trabajo activo permanece degradado, mientras el destino de otro cliente sigue
funcionando de forma independiente.

Los intentos HTTP tienen un plazo de cinco segundos. El procesamiento de
destinos administrados tiene un presupuesto de trabajo activo de 15 segundos,
sin incluir el tiempo de espera de su cuota compartida. Los reintentos de
webhook siguen acotados. Una respuesta `429` de un proveedor y su valor
`Retry-After` retrasan cada destino del grupo de límite compartido de la
autoridad de destino canónica; otro origen avanza de forma independiente. El
`interval_ms` configurado establece el espacio mínimo entre intentos, incluidos
los reintentos. Todos los destinos de un grupo de autoridades deben usar el
mismo intervalo. Los retrasos pendientes del proveedor sobreviven a la
eliminación de rutas y a los cambios de intervalo en el cambio de configuración.
El piloto admite cuotas con alcance de autoridad; una salida que necesite cuotas
compartidas entre autoridades distintas requiere un adaptador dedicado.

El apagado sigue esta secuencia:

1. Detenga la admisión de la fuente.
2. Drene el trabajo de enrutamiento admitido durante hasta 20 segundos de forma predeterminada.
3. Cancele el trabajo restante.
4. Espere a los trabajadores cancelados durante hasta cinco segundos adicionales, o durante el tiempo de espera de apagado configurado si es menor.

Un componente sin finalizar devuelve un error de limpieza pendiente, conserva sus
reservas de recursos e impide que el mismo enrutador se reinicie hasta que su
trabajador termine. Adder cierra los archivos de registro solo después de que
termina su escritor. Las operaciones enviadas pueden seguir teniendo un resultado
incierto aunque termine el procesamiento del componente. La preparación es falsa
durante el inicio y el apagado. Un destino degradado no termina la ruta de otro
cliente ni reconecta la entrada.

## Capacidades de los adaptadores administrados

El modo administrado restringe los destinos a `log` y `webhook`:

| Adaptador | Disposición administrada |
| --- | --- |
| `log` | Habilitado para archivos JSON locales de anexado de confianza cuyo nombre base comienza por el ID del cliente propietario seguido de un punto. |
| `webhook` | Habilitado para un destino que utiliza el formato `adder` o `discord`, credenciales propias de la instancia, transporte confinado, cuota de autoridad y reintentos acotados. |
| `slack`, `telegram`, `discord`, `matrix`, `signal`, `push` | El modo administrado rechaza estos adaptadores porque el ciclo de vida del bot o servidor, el envío a varios destinos o las cuotas de cuentas de proveedores requieren un adaptador dedicado. |
| `sns`, `sqs`, `pubsub`, `s3`, `kafka`, `nats`, `mqtt`, `rabbitmq`, `redis`, `postgres`, `clickhouse`, `elasticsearch` | El modo administrado rechaza estos adaptadores porque los búferes de las bibliotecas o del servidor, los reintentos, el descubrimiento de destinos, las credenciales y los límites de cuota requieren un adaptador dedicado. |
| `notify`, `notify-json` | El modo administrado rechaza estos adaptadores porque los efectos secundarios de escritorio y de archivos no están aislados por cliente. |

El registro de salidas por sí solo no hace que un adaptador esté disponible en
el modo administrado. Antes de habilitarlo, un adaptador debe definir su ciclo
de vida, los eventos permitidos, la entrega a varios destinos, los búferes
retenidos, los límites de frecuencia, las credenciales, las restricciones de
destino y los resultados observables.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>