---
title: Guía de topología
description: Guía para SPO de pools Dingo - Cómo configurar un archivo JSON de topología.
---

Dingo funciona con el archivo de topología predeterminado integrado, pero como SPO debes utilizar tu propio `topology.json`. Esta guía utiliza como ejemplo la topología de preview. Los archivos de topología de todas las redes están en la [documentación de entornos de Cardano](https://book.play.dev.cardano.org/environments.html).

Adapta la configuración a tu red y a la distribución de tus nodos. Esta guía utiliza la distribución habitual de un productor de bloques detrás de dos relays.

**Contenido de la guía:**

- [Topología JSON predeterminada de Preview](#default)
- [Opciones de topología](#flags)
- [Ejemplo de topología de relay](#relay)
- [Ejemplo de topología de productor de bloques](#bp)

<h2 id="default">Topología JSON predeterminada de Preview</h2>

El archivo JSON de topología predeterminado de Preview tiene este aspecto:

```
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [],
      "advertise": false,
      "trustable": false,
      "valency": 1
    }
  ],
  "peerSnapshotFile": "peer-snapshot.json",
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 119231973
}
```

Copia `useLedgerAfterSlot` y `bootstrapPeers` de la topología oficial de tu red. El slot de Preview del ejemplo quedará desactualizado y no es válido para preprod/mainnet.

<h2 id="flags">Opciones de topología</h2>

Para modificar y utilizar el archivo JSON de topología, es importante conocer estos conceptos:

- [Pares locales y públicos](#local)
- [Pares de arranque](#bootstrapping)
- [Opción advertise](#advertise)
- [Puntos de acceso](#access)
- [Opción trustable](#trustable)

<h3 id="local">Pares locales y públicos</h3>

Las raíces locales se utilizan para los pares que el nodo debe mantener siempre en estado hot o warm, como su propio productor de bloques. Las raíces públicas proporcionan pares alternativos.

<h3 id="bootstrapping">Pares de arranque</h3>

Los pares de arranque son útiles después de una interrupción prolongada. El nodo se sincroniza desde esos pares y otros pares de confianza, y utiliza los pares del ledger cuando alcanza la punta.

<h3 id="advertise">Opción advertise</h3>

Cuando `advertise` es true, el nodo puede compartir la dirección de ese par mediante peer sharing. Esto puede aumentar las conexiones entrantes al par anunciado y resulta útil para relays no registrados. Nunca anuncies al productor de bloques.

<h3 id="access">Puntos de acceso</h3>

Los puntos de acceso pertenecen a un grupo `localRoots`. Así puedes mantener advertise en false para el productor de bloques y en true para el relay.

<h3 id="trustable">Opción trustable</h3>

Los pares de confianza incluyen los pares de arranque y las raíces locales marcadas como de confianza. De forma predeterminada, las raíces locales no son de confianza.

Configura tus propios relays y el productor de bloques con `"trustable": true`.

<h2 id="relay">Ejemplo de topología de relay</h2>

Para una distribución típica de dos relays y un productor de bloques, utiliza esta configuración en el relay:

- Usa dos grupos localRoots para anunciar los demás relays y ocultar al productor de bloques.
- Configura `"advertise": false,` en el grupo que contiene al productor para mantenerlo privado.
- Como hay un relay adicional, dos en total, establece `"valency": 1`. Con dos relays adicionales, tres en total, utiliza `"valency": 2`, y así sucesivamente.
- Dingo admite `hotValency` como alias de `valency`; si aparecen ambas claves, `valency` tiene prioridad. Para los grupos de topología no vacíos, valida `warmValency` frente al número de puntos de acceso.
- Configura los relays con `"trustable": true` para poder sincronizar si te alejas demasiado de la punta.
- El modo Genesis/snapshot utiliza `peerSnapshotFile` en lugar de los pares de arranque o junto con ellos.
- Deja vacías las raíces públicas mediante `"publicRoots": [{ "accessPoints": [], "advertise": false }]`.

En el siguiente ejemplo, sustituye `relay2.Address` y `blockProducerAddress` por las direcciones del relay y del productor de bloques, y cambia `"port": 3001` al puerto utilizado.

```
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [
        {
          "address": "relay2.Address",
          "port": 3001
        }
      ],
      "advertise": true,
      "valency": 1,
      "trustable": true
    },
    {
      "accessPoints": [
        {
          "address": "blockProducerAddress",
          "port": 3001
        }
      ],
      "advertise": false,
      "valency": 1,
      "trustable": true
    }
  ],
  "peerSnapshotFile": "peer-snapshot.json",
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 119231973
}
```

<h2 id="bp">Ejemplo de topología de productor de bloques</h2>

Un productor de bloques debe conectarse únicamente a tus propios relays. Utiliza esta configuración:

- Establece `"bootstrapPeers": null`.
- Establece `"advertise": false,`, porque estas raíces locales del productor deben permanecer privadas.
- Configura los relays con `"trustable": true,`.
- Este ejemplo utiliza dos relays y establece `"valency": 2`. Con tres relays, utiliza `3`.
- Deja vacías las raíces públicas mediante `"publicRoots": [{ "accessPoints": [], "advertise": false }]`.
- Establece `"useLedgerAfterSlot": -1` para impedir que el productor intente conectarse a otros nodos mediante los pares del ledger.
- El productor no necesita `peerSnapshotFile` ni `bootstrapPeers`, porque no debe sincronizar desde la red pública.

Ejemplo de archivo JSON de topología del productor de bloques:

```
{
  "bootstrapPeers": null,
  "localRoots": [
    {
      "accessPoints": [
        {
          "address": "relay1.Address",
          "port": 3001
        },
        {
          "address": "relay2.Address",
          "port": 3001
        }
      ],
      "advertise": false,
      "trustable": true,
      "valency": 2
    }
  ],
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": -1
}
```

Después de guardar cada archivo de topología, indica su ruta a Dingo, reinicia el nodo y comprueba que el productor de bloques mantenga conexiones hot únicamente con tus relays.

Añade lo siguiente al archivo `/etc/dingo/dingo.yaml` existente, sin sobrescribirlo:

```
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Path to the topology configuration file
topology: \"$DINGO_HOME/config/topology.json\"
EOF"
```

Las rutas siguen las guías para SPO de Dingo; ajústalas si es necesario. `$DINGO_HOME` se expande al ejecutar el comando, igual que en la guía de instalación del nodo. Utiliza un topology.json distinto en el productor de bloques y en cada relay.

Comprueba el archivo:

```
sudo nano /etc/dingo/dingo.yaml
```

Después reinicia:

```
sudo systemctl restart dingo
```

### ¡Enhorabuena! Ya tienes archivos de topología personalizados para los relays y el productor de bloques.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
