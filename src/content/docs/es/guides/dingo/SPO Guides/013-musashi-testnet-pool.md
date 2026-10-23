---
title: Configurar un pool en la testnet Musashi
description: Guía SPO para pools de Dingo - Cómo configurar un pool en la testnet Musashi.
---

Esta guía configura un stake pool de la testnet Musashi en un nodo Dingo, en dos secciones:
1. **Configuración del nodo Dingo.**
2. **Registro del pool en la testnet Musashi.**

⚠️ Musashi es la testnet del prototipo de Leios. Se reinicia (respin) de vez en cuando, y cada respin necesita una versión de Dingo que incluya la nueva configuración de Musashi. Consulta las notas de versión de Dingo para comprobar la compatibilidad con Musashi antes de empezar.

<br>

***

## Sección 1 - Configuración del nodo Dingo

✅ Esta guía asume una configuración típica de Linux con `systemd`, en una máquina x86-64 (`amd64`) o ARM64 (`aarch64`). Por favor ajusta los comandos y rutas según sea necesario.

***

<br>

### Paso 1 - Configurar tu entorno

Crea un directorio para los archivos de tu pool y define las variables que `cardano-cli` usa para llegar a tu nodo.

Agrega las variables a tu `.bashrc` y cárgalas:

```
cat <<'EOF' >> ~/.bashrc
export DINGO_HOME=~/dingo-leios-testnet
export CARDANO_NODE_NETWORK_ID=164
export CARDANO_NODE_SOCKET_PATH="$DINGO_HOME/dingo.socket"
EOF
source ~/.bashrc
```

> 💡 Con `CARDANO_NODE_NETWORK_ID` definida, `cardano-cli` se comunica con Musashi (network magic 164) sin el flag `--testnet-magic`.

Crea el directorio de trabajo:

```
mkdir -p "$DINGO_HOME"
```

Un block producer necesita un reloj preciso. Instala y habilita `chrony`:

```
sudo apt install -y chrony
sudo systemctl enable --now chrony
```

> Puedes verificarlo ejecutando:
> ```
> echo $DINGO_HOME $CARDANO_NODE_NETWORK_ID $CARDANO_NODE_SOCKET_PATH
> ```

***

<br>

### Paso 2 - Descargar el binario de Dingo

Descarga la última versión desde la página de <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">versiones de Dingo</a>.

Define la arquitectura para la descarga. Dingo publica builds de Linux para `amd64` y `arm64`:

```
case "$(uname -m)" in
  x86_64) DINGO_ARCH=amd64 ;;
  aarch64|arm64) DINGO_ARCH=arm64 ;;
  *) echo "Unsupported architecture: $(uname -m)" ;;
esac
echo $DINGO_ARCH
```

Después descarga y extrae la versión:

```
cd $DINGO_HOME
wget https://github.com/blinklabs-io/dingo/releases/download/v0.86.0/dingo-v0.86.0-linux-$DINGO_ARCH.tar.gz -O - | tar -xz
```

Verifica la versión del binario y cópialo a `/usr/local/bin/` para que sea accesible a nivel de sistema:

```
./dingo version
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

> ✅ Puedes verificar que el binario fue copiado ejecutando `which dingo`

***

<br>

### Paso 3 - Descargar el binario Cardano-CLI de Leios

Musashi necesita el `cardano-cli` de la versión del prototipo de Leios que corresponde a la red. Encuentra la versión de la red en el campo `MinNodeVersion` del <a href="https://book.play.dev.cardano.org/environments-pre/leios/config.json" target="_blank">config.json</a> de Musashi. Por ejemplo, `11.1.0.164-prototype-2026w42` corresponde a la versión `rc-2026w42` de la página de <a href="https://github.com/input-output-hk/ouroboros-leios/releases" target="_blank">versiones de ouroboros-leios</a>.

Crea un directorio y entra en él:

```
mkdir -p "$DINGO_HOME/cli" && cd "$DINGO_HOME/cli"
```

La versión de Leios nombra sus builds de Linux `x86_64` y `aarch64`. Define la etiqueta de la versión y tu arquitectura, y después descarga el archivo comprimido y su checksum:

```
LEIOS_RELEASE=rc-2026w42
LEIOS_ARCH=$(uname -m)
[ "$LEIOS_ARCH" = arm64 ] && LEIOS_ARCH=aarch64
wget https://github.com/input-output-hk/ouroboros-leios/releases/download/$LEIOS_RELEASE/cardano-node-leios-$LEIOS_ARCH-linux.tar.gz
wget https://github.com/input-output-hk/ouroboros-leios/releases/download/$LEIOS_RELEASE/cardano-node-leios-$LEIOS_ARCH-linux.sha256
sha256sum -c cardano-node-leios-$LEIOS_ARCH-linux.sha256
tar -xzf cardano-node-leios-$LEIOS_ARCH-linux.tar.gz
```

> ✅ `sha256sum` debe imprimir `cardano-node-leios-x86_64-linux.tar.gz: OK` (o `aarch64` en ARM64)

Mueve `cardano-cli` a `/usr/local/bin`, comprueba su versión y elimina los archivos descargados:

```
sudo mv bin/cardano-cli /usr/local/bin/cardano-cli
cardano-cli --version
cd $DINGO_HOME
rm -rf cli
```

***

<br>

### Paso 4 - Descargar los archivos de la red

Dingo incluye configuraciones de red de Cardano integradas (archivos de génesis y config.json) para Musashi, así que no las necesita para ejecutarse. `cardano-cli` necesita el archivo de génesis de Shelley más adelante en esta guía, y Dingo necesita un archivo de topología.

Crea el directorio `config` y descarga los archivos:

```
mkdir -p "$DINGO_HOME/config" && cd "$DINGO_HOME/config"
wget https://book.play.dev.cardano.org/environments-pre/leios/shelley-genesis.json
wget https://book.play.dev.cardano.org/environments-pre/leios/topology.json
wget https://book.play.dev.cardano.org/environments-pre/leios/peer-snapshot.json
```

La topología descargada se conecta al relay de arranque de Musashi y usa `peer-snapshot.json` para encontrar más peers, lo cual basta para sincronizar.

> 💡 Consejo: Los archivos de configuración de Musashi aparecen en la <a href="https://book.play.dev.cardano.org/adv-musashi.html" target="_blank">página del entorno Musashi</a>.

**Opcional: agrega peers que conozcas**

También puedes agregar relays de otros pools de Musashi como local roots. Encuéntralos en la página de <a href="https://kleioscan.com/#/musashi/pools" target="_blank">pools de Musashi en Kleioscan</a>:

<img src="/dingo-kleio-explorer-pools.png"
     alt="Lista de pools de Musashi en Kleioscan"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Haz clic en algunos de tus amigos SPO y copia 📝 sus IPs públicas y puertos:

<img src="/dingo-kleio-explorer-pool-relay-example.png"
     alt="Relays de un pool de Musashi en Kleioscan"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Después agrégalos a la sección `localRoots` de `topology.json`:

```
nano $DINGO_HOME/config/topology.json
```

***Ejemplo de sección `localRoots` con 3 pools:***
```
  "localRoots": [
    {
      "accessPoints": [
        { "address": "RELAY_1_ADDRESS", "port": RELAY_1_PORT },
        { "address": "RELAY_2_ADDRESS", "port": RELAY_2_PORT },
        { "address": "RELAY_3_ADDRESS", "port": RELAY_3_PORT }
      ],
      "advertise": false,
      "trustable": false,
      "valency": 3
    }
  ],
```

Reemplaza los marcadores `RELAY_*` con las direcciones y puertos que copiaste de Kleioscan, y define `valency` con el número de relays que agregaste. Deja el resto del archivo tal como se descargó; `useLedgerAfterSlot` cambia cuando se hace un respin de la red.

***

<br>

### Paso 5 - Crear el archivo de configuración dingo.yaml

Crea el directorio de configuración y el directorio de la base de datos:

```
sudo mkdir -p /etc/dingo
mkdir -p $DINGO_HOME/.dingo
```

Crea el archivo `dingo.yaml`:

> La variable `$DINGO_HOME` se expandirá automáticamente a la ruta de tu directorio de inicio.

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$DINGO_HOME/.dingo\"

# Network
network: \"musashi\"
relayPort: 3010
socketPath: \"$DINGO_HOME/dingo.socket\"

# Path to the topology configuration file for Cardano node
topology: \"$DINGO_HOME/config/topology.json\"
EOF"
```

Puedes ver y verificar el archivo `dingo.yaml` ejecutando:

```
cat /etc/dingo/dingo.yaml
```

> 💡 Consejo: Asegúrate de que el puerto 3010 esté abierto.
> ```
> sudo ufw allow 3010/tcp
> ```

***

<br>

### Paso 6 - Crear el archivo de unidad `dingo.service`

Crea el archivo de servicio systemd. Reemplaza `YOUR_USER` con tu nombre de usuario de Linux (`echo $USER`):

```
cat <<ENDFILE | sudo tee /etc/systemd/system/dingo.service > /dev/null
[Unit]
Description=Dingo Node
After=network-online.target

[Service]
Type=simple
Restart=on-failure
RestartSec=10
User=YOUR_USER
ExecStart=/usr/local/bin/dingo serve --config /etc/dingo/dingo.yaml
SyslogIdentifier=dingo
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
ENDFILE
```

Puedes ver y verificar el archivo `dingo.service` ejecutando:

```
cat /etc/systemd/system/dingo.service
```

***

<br>

### Paso 7 - Habilitar e iniciar el servicio

Habilita el servicio para que se inicie en el arranque e inícialo ahora:

```
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

### Paso 8 - Verificar el estado

Verifica que el servicio está ejecutándose:

```
sudo systemctl status dingo.service
```

Para seguir los registros en tiempo real:

```
sudo journalctl -u dingo -f
```

Para ver los registros recientes si hay un error:

```
sudo journalctl -u dingo -n 50 --no-pager
```

Comprueba el progreso de la sincronización. El nodo está sincronizado cuando `syncProgress` muestra `100.00`:

```
cardano-cli query tip
```

***

<br>

#### ¡Felicidades! Ya puedes pasar a la sección **Registro del pool en la testnet Musashi**

<br>

***

## Sección 2 - Registro del pool en la testnet Musashi

> Asegúrate de que el nodo esté completamente sincronizado antes de continuar. `cardano-cli query tip` debe mostrar `"syncProgress": "100.00"`.

Los comandos de esta sección usan la era `dijkstra`. Confirma la era con el campo `era` de `cardano-cli query tip`.

***

<br>

### Paso 1 - Crear la carpeta `keys`

Crea una carpeta `keys` para las claves de tu pool y los archivos de certificados, y entra en ella. Haz una copia de seguridad de esta carpeta: estas claves controlan tu pool.

```
mkdir -p "$DINGO_HOME/keys" && cd "$DINGO_HOME/keys"
```

***

<br>

### Paso 2 - Crear las claves de pago y de stake

Crea las claves de pago:
```
cardano-cli dijkstra address key-gen \
  --verification-key-file payment.vkey \
  --signing-key-file payment.skey
```

Crea las claves de stake:
```
cardano-cli dijkstra stake-address key-gen \
  --verification-key-file stake.vkey \
  --signing-key-file stake.skey
```

***

<br>

### Paso 3 - Crear y fondear tu dirección de pago

Crea la dirección de pago y guárdala en `payment.addr`:
```
cardano-cli dijkstra address build \
  --payment-verification-key-file payment.vkey \
  --stake-verification-key-file stake.vkey \
  --out-file payment.addr
```

Muestra tu dirección de pago y cópiala:

```
cat payment.addr; echo
```

Ve al <a href="https://faucet.leios.play.dev.cardano.org/basic-faucet" target="_blank">faucet de Musashi</a>, pega tu dirección en el primer formulario (`address`), marca su casilla reCAPTCHA y envíalo. El faucet envía 10,000 ada de prueba, lo que cubre el depósito de 500 ada del pool, el depósito de 2 ada de la dirección de stake, el pledge y las comisiones.

<img src="/dingo-musashi-faucet.png"
     alt="Faucet de Musashi con el formulario de dirección arriba y el formulario de delegación al pool debajo"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Confirma que llegaron los ada de prueba. Debes ver una entrada de UTxO:

```
cardano-cli dijkstra query utxo --address "$(cat payment.addr)"
```

***

<br>

### Paso 4 - Crear las claves operativas del nodo

Crea las claves cold, las claves KES y las claves VRF.

**Claves cold (la identidad de tu pool)**
```
cardano-cli dijkstra node key-gen \
  --cold-verification-key-file cold.vkey \
  --cold-signing-key-file cold.skey \
  --operational-certificate-issue-counter-file opcert.counter
```

> ⚠️ Esta guía de testnet crea las claves cold en el nodo por simplicidad. En mainnet, crea y guarda las claves cold en una máquina sin conexión.

**Claves KES (claves hot, rotadas periódicamente)**
```
cardano-cli dijkstra node key-gen-KES \
  --verification-key-file kes.vkey \
  --signing-key-file kes.skey
```

**Claves VRF (usadas para ganar slots de producción de bloques)**
```
cardano-cli dijkstra node key-gen-VRF \
  --verification-key-file vrf.vkey \
  --signing-key-file vrf.skey
```

***

<br>

### Paso 5 - Crear las claves BLS

Las claves BLS son las claves que los pools usan para votar y certificar los endorser blocks de Leios. El certificado de registro del pool del Paso 9 no se puede crear sin una.

```
cardano-cli dijkstra node key-gen-BLS \
  --verification-key-file bls.vkey \
  --signing-key-file bls.skey
```

> ✅ `jq -r .type bls.vkey` debe imprimir `BlsVerificationKey_bls12-381-BLS-Signature-Minimal-Signature-Size`

***

<br>

### Paso 6 - Crear el certificado operativo

Encuentra el período KES actual:

```
slotsPerKESPeriod=$(jq -r '.slotsPerKESPeriod' "$DINGO_HOME/config/shelley-genesis.json")
slotNo=$(cardano-cli query tip | jq -r '.slot')
kesPeriod=$(( slotNo / slotsPerKESPeriod ))
echo $kesPeriod
```

Crea el certificado operativo `node.cert`:
```
cardano-cli dijkstra node issue-op-cert \
  --kes-verification-key-file kes.vkey \
  --cold-signing-key-file cold.skey \
  --operational-certificate-issue-counter-file opcert.counter \
  --kes-period "$kesPeriod" \
  --out-file node.cert
```

***

<br>

### Paso 7 - Crear los metadatos de tu pool

Actualiza los valores siguientes con la información de tu pool.

📝 **ticker** debe tener entre 3 y 5 caracteres de longitud
📝 **description** no puede superar los 255 caracteres de longitud.

```
cat > meta.json << EOF
{
"name": "MyPoolName",
"description": "My pool description",
"ticker": "ABC",
"homepage": "https://pool-Website.com"
}
EOF
```

Calcula el hash de tu archivo de metadatos. El hash se guarda en `poolMetaDataHash.txt`:

```
cardano-cli dijkstra stake-pool metadata-hash \
  --pool-metadata-file meta.json \
  --out-file poolMetaDataHash.txt
```

***

<br>

### Paso 8 - Alojar tus metadatos

La URL de metadatos del registro de tu pool puede tener como máximo 128 caracteres. Si ya alojas los metadatos en tu propio sitio web, define `METADATA_URL` con esa URL más abajo y omite los pasos de GitHub. De lo contrario, GitHub Pages los aloja gratis:

1. Inicia sesión en <a href="https://github.com" target="_blank">GitHub</a> y crea un nuevo repositorio **public** llamado `pool`.
2. En el repositorio, selecciona **Add file** → **Upload files**, sube tu `meta.json` y haz commit en la rama `main`.
3. Abre **Settings** → **Pages**. En **Build and deployment**, define **Source** como **Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)`, y selecciona **Save**.

   <img src="/dingo-musashi-github-pages.png"
        alt="Ajustes de compilación e implementación de GitHub Pages con Deploy from a branch, main y / (root) seleccionados"
        style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

4. Después de uno o dos minutos, tus metadatos se sirven en `https://YOUR_GITHUB_USERNAME.github.io/pool/meta.json`.

Define la URL y comprueba que funciona y que no supera los 128 caracteres:

```
METADATA_URL=https://YOUR_GITHUB_USERNAME.github.io/pool/meta.json
curl -s -L "$METADATA_URL"
echo -n "$METADATA_URL" | wc -c
```

Comprueba que el archivo alojado tiene el mismo hash que tu archivo local. Los dos comandos deben imprimir el mismo hash:

```
cardano-cli dijkstra stake-pool metadata-hash --pool-metadata-file <(curl -s -L "$METADATA_URL")
cat poolMetaDataHash.txt; echo
```

> ⚠️ Sube el archivo exactamente como `cardano-cli` calculó su hash. Editarlo después en GitHub cambia el hash, de modo que ya no coincide con el hash de tu registro y las wallets y los exploradores ignoran tus metadatos.

***

<br>

### Paso 9 - Registrar la dirección de stake y el pool

Crea los certificados de la dirección de stake y del pool, y después envíalos en una sola transacción.

**Certificado de registro de la dirección de stake:**
```
cardano-cli dijkstra stake-address registration-certificate \
  --stake-verification-key-file stake.vkey \
  --key-reg-deposit-amt "$(cardano-cli dijkstra query protocol-parameters | jq .stakeAddressDeposit)" \
  --out-file stake-reg.cert
```

**Certificado de registro del pool:**

Define `RELAY_IP` con la dirección IPv4 pública de tu nodo, la que usan otros nodos para llegar a él. La URL de metadatos proviene de la `METADATA_URL` que definiste en el Paso 8.

```
RELAY_IP=YOUR_PUBLIC_IP
```

Después crea el certificado. Los valores siguientes establecen un pledge de 1,000 ada de prueba, un costo fijo de 170 ada de prueba y un margen del 5%.

```
cardano-cli dijkstra stake-pool registration-certificate \
  --cold-verification-key-file cold.vkey \
  --vrf-verification-key-file vrf.vkey \
  --bls-signing-key-file bls.skey \
  --pool-pledge 1000000000 \
  --pool-cost 170000000 \
  --pool-margin 0.05 \
  --pool-reward-account-verification-key-file stake.vkey \
  --pool-owner-stake-verification-key-file stake.vkey \
  --pool-relay-ipv4 "$RELAY_IP" \
  --pool-relay-port 3010 \
  --metadata-url "$METADATA_URL" \
  --metadata-hash $(cat poolMetaDataHash.txt) \
  --out-file pool-reg.cert
```

**Crea, firma y envía la transacción:**

Obtén el UTxO para `--tx-in`. Justo después del pago del faucet, hay un solo UTxO en tu dirección:
```
TXIN=$(cardano-cli dijkstra query utxo --address "$(cat payment.addr)" | jq -r 'keys[0]')
```

Crea la transacción:
```
cardano-cli dijkstra transaction build \
  --tx-in "$TXIN" \
  --change-address "$(cat payment.addr)" \
  --certificate-file stake-reg.cert \
  --certificate-file pool-reg.cert \
  --out-file pool-reg-tx.raw
```

Firma la transacción:
```
cardano-cli dijkstra transaction sign \
  --tx-body-file pool-reg-tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --signing-key-file cold.skey \
  --out-file pool-reg-tx.signed
```

Envía la transacción:
```
cardano-cli dijkstra transaction submit \
  --tx-file pool-reg-tx.signed
```

***

<br>

### Paso 10 - Delegar stake a tu pool

Tu pledge solo cuenta cuando tu propio stake está delegado a tu pool. Crea un certificado de delegación y envíalo en su propia transacción.

Crea el certificado de delegación:
```
cardano-cli dijkstra stake-address stake-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --cold-verification-key-file cold.vkey \
  --out-file delegation.cert
```

Obtén el UTxO para `--tx-in`:
```
TXIN=$(cardano-cli dijkstra query utxo --address "$(cat payment.addr)" | jq -r 'keys[0]')
```

Crea la transacción:
```
cardano-cli dijkstra transaction build \
  --tx-in "$TXIN" \
  --change-address "$(cat payment.addr)" \
  --certificate-file delegation.cert \
  --out-file delegation-tx.raw
```

Firma la transacción:
```
cardano-cli dijkstra transaction sign \
  --tx-body-file delegation-tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --out-file delegation-tx.signed
```

Envía la transacción:
```
cardano-cli dijkstra transaction submit \
  --tx-file delegation-tx.signed
```

***

<br>

### Paso 11 - Solicitar delegación al faucet

Un pledge de 1,000 ada es demasiado pequeño para que tu pool sea seleccionado para forjar bloques. El faucet puede delegar unos 1,000,000 ada de prueba a tu pool.

Obtén el ID de tu pool en formato bech32 (`pool1…`):

```
cardano-cli dijkstra stake-pool id --output-bech32 --cold-verification-key-file cold.vkey
```

Ve al <a href="https://faucet.leios.play.dev.cardano.org/basic-faucet" target="_blank">faucet de Musashi</a>, pega el ID de tu pool en el segundo formulario (`pool`, el formulario inferior de la captura de pantalla del Paso 3), marca su casilla reCAPTCHA y envíalo.

***

<br>

### Paso 12 - Verificar el registro

Guarda el ID de tu pool y tu dirección de stake:

```
POOL_ID=$(cardano-cli dijkstra stake-pool id --cold-verification-key-file cold.vkey --output-format hex)
STAKE_ADDR=$(cardano-cli dijkstra stake-address build --stake-verification-key-file stake.vkey)
echo "pool id: $POOL_ID"
echo "stake address: $STAKE_ADDR"
```

Comprueba que el pool está registrado on-chain. Esto imprime los parámetros de tu pool (pledge, costo, margen, VRF):
```
cardano-cli dijkstra query pool-state --stake-pool-id "$POOL_ID"
```

Comprueba que la delegación surtió efecto. `stakeDelegation` debe mostrar el ID de tu pool:

```
cardano-cli dijkstra query stake-address-info --address "$STAKE_ADDR"
```

Comprueba que tu clave BLS está registrada:

```
cardano-cli dijkstra query pool-state --stake-pool-id "$POOL_ID" | jq '.[].blsKey'
```

- `bksKey.blsPubKey` debe coincidir con tu clave. Compárala con tu `bls.vkey` sin su prefijo CBOR `5860` de 4 caracteres:
  ```
  jq -r .cborHex bls.vkey | cut -c5-
  ```
- `bksRegisteredIn` es la epoch en la que tu registro surte efecto. `cardano-cli` informa esta epoch porque el nodo no expone la epoch en la que se registró la clave. Anótala: la clave caduca un número fijo de epochs después (consulta el Paso 15).


> 💡 El <a href="https://leios.cardano-scaling.org/docs/testnet/rewards-program" target="_blank">programa de recompensas de la testnet Musashi</a> ya no acepta nuevos pools. Los pools que ya están en el programa reportan telemetría con <a href="https://metsuke-leios.play.dev.cardano.org/" target="_blank">Metsuke</a>, un agente creado para el cardano-node de Haskell que lee el endpoint de Prometheus del nodo y sus líneas de traza.

***

<br>

### Paso 13 - Configurar Dingo como block producer

Detén el nodo Dingo:
```
sudo systemctl stop dingo
```

Restringe las claves de firma para que solo tu usuario pueda leerlas. Dingo se niega a cargar una clave de firma BLS que el grupo u otros usuarios puedan leer:

```
chmod 600 $DINGO_HOME/keys/*.skey
```

Reemplaza tu `dingo.yaml` con la configuración de block producer, que agrega tu clave KES, tu clave VRF, tu certificado operativo y tu clave BLS a los ajustes de la Sección 1:

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$DINGO_HOME/.dingo\"

# Network
network: \"musashi\"
relayPort: 3010
socketPath: \"$DINGO_HOME/dingo.socket\"

# Path to the topology configuration file for Cardano node
topology: \"$DINGO_HOME/config/topology.json\"

# Block producer
blockProducer: true
shelleyVrfKey: \"$DINGO_HOME/keys/vrf.skey\"
shelleyKesKey: \"$DINGO_HOME/keys/kes.skey\"
shelleyOperationalCertificate: \"$DINGO_HOME/keys/node.cert\"

# Leios voting: the BLS key registered with your pool in Step 9
leiosVoteSigningKeyFile: \"$DINGO_HOME/keys/bls.skey\"
EOF"
```

> 💡 Sin `leiosVoteSigningKeyFile`, el pool sigue forjando bloques pero no vota los endorser blocks de Leios.

Puedes ver y verificar el archivo `dingo.yaml` ejecutando:

```
cat /etc/dingo/dingo.yaml
```

***

<br>

### Paso 14 - Iniciar Dingo y verificar el estado

Inicia el nodo Dingo:

```
sudo systemctl start dingo
```

Verifica que Dingo está ejecutándose:

```
sudo systemctl status dingo
```

Para seguir los registros en tiempo real:

```
sudo journalctl -u dingo -f
```

Para ver los registros recientes si hay un error:

```
sudo journalctl -u dingo -n 50 --no-pager
```

> 💡 Tu pool empieza a forjar unas dos epochs después del registro, cuando surte efecto el snapshot de stake que incluye tu stake.

***

<br>

### Paso 15 - Rotar tu clave BLS

Las claves BLS caducan. Una clave es válida mientras la epoch actual sea menor que `bksRegisteredIn` más la antigüedad máxima de clave de la red, que la testnet anuncia. Después de eso, tu pool conserva su puesto en el comité pero no puede votar.

Rotar la clave es un nuevo registro con una nueva clave BLS y todos los demás valores sin cambios. Rota la clave con mucha antelación a su caducidad: la nueva clave surte efecto en un límite de epoch.

Crea la nueva clave y conserva la anterior hasta que la rotación esté on-chain:

```
cd $DINGO_HOME/keys
cardano-cli dijkstra node key-gen-BLS \
  --verification-key-file bls-new.vkey \
  --signing-key-file bls-new.skey
```

Crea el nuevo certificado de registro con los mismos valores que en el Paso 9. En una shell nueva, define antes `RELAY_IP` y `METADATA_URL` de nuevo:

```
RELAY_IP=YOUR_PUBLIC_IP
METADATA_URL=https://YOUR_GITHUB_USERNAME.github.io/pool/meta.json
```


```
cardano-cli dijkstra stake-pool registration-certificate \
  --cold-verification-key-file cold.vkey \
  --vrf-verification-key-file vrf.vkey \
  --bls-signing-key-file bls-new.skey \
  --pool-pledge 1000000000 \
  --pool-cost 170000000 \
  --pool-margin 0.05 \
  --pool-reward-account-verification-key-file stake.vkey \
  --pool-owner-stake-verification-key-file stake.vkey \
  --pool-relay-ipv4 "$RELAY_IP" \
  --pool-relay-port 3010 \
  --metadata-url "$METADATA_URL" \
  --metadata-hash $(cat poolMetaDataHash.txt) \
  --out-file pool-rotate.cert
```

Envíalo por separado (esta vez sin certificado de dirección de stake):

```
TXIN=$(cardano-cli dijkstra query utxo --address "$(cat payment.addr)" | jq -r 'keys[0]')

cardano-cli dijkstra transaction build \
  --tx-in "$TXIN" \
  --change-address "$(cat payment.addr)" \
  --certificate-file pool-rotate.cert \
  --out-file pool-rotate.raw

cardano-cli dijkstra transaction sign \
  --tx-body-file pool-rotate.raw \
  --signing-key-file payment.skey \
  --signing-key-file cold.skey \
  --out-file pool-rotate.signed

cardano-cli dijkstra transaction submit --tx-file pool-rotate.signed
```

Vigila la nueva epoch de registro:

```
cardano-cli dijkstra query pool-state --stake-pool-id "$POOL_ID" | jq '.[].blsKey.bksRegisteredIn'
```

Cambia Dingo a la nueva clave solo después de que `bksRegisteredIn` muestre la nueva epoch **y** haya pasado el siguiente límite de epoch. Después define `leiosVoteSigningKeyFile` en `/etc/dingo/dingo.yaml` como `bls-new.skey`, haz que solo tu usuario pueda leerla (`chmod 600`) y reinicia Dingo con `sudo systemctl restart dingo`.

***

<br>

### Paso 16 - Monitorear tu nodo

Dingo sirve métricas de Prometheus en `127.0.0.1:12798`. Para graficarlas, sigue la [guía de dashboards de Grafana (en inglés)](/guides/dingo/spo-guides/008-grafana-dashboard/) y elige `musashi` en el selector de red de los dashboards.

Para comprobar desde la línea de comandos si tu pool está votando:

```
curl -s 127.0.0.1:12798/metrics | grep -E '^dingo_metrics_leios_(committee_size|votes_not_emitted)'
```

`dingo_metrics_leios_votes_not_emitted_total` cuenta los endorser blocks que tu nodo no votó, por motivo. Hasta que tu clave BLS esté en el snapshot de stake on-chain, el conteo aumenta bajo `reason="no_key"`.

***

<br>

#### ¡Felicidades! Tienes un nodo Dingo de Leios ejecutándose en la testnet Musashi.

***

<br>

> Créditos a las guías originales y recursos adicionales aquí: <a href="https://leios.cardano-scaling.org/docs/testnet/getting-started" target="_blank">Getting started</a> y <a href="https://leios.cardano-scaling.org/docs/testnet/register-stake-pool" target="_blank">Register a stake pool</a>
