---
title: Registrar un stake pool
description: Guía para SPO de pools Dingo - Registro del stake pool.
---

# Dingo - Registrar el stake pool

✅ Esta guía presupone que los archivos están en `$DINGO_HOME`. Ajusta las rutas si es necesario.

## Paso 1 - Crear el archivo JSON de metadatos del pool

Actualiza los valores con la información de tu pool.

📝 **ticker** debe tener entre 3 y 5 caracteres. **description** no puede superar los 255 caracteres.

```
cd $DINGO_HOME
cat > preview-pool-metadata.json << EOF
{
"name": "MyPoolName",
"description": "My pool description",
"ticker": "ABC",
"homepage": "https://pool-Website.com"
}
EOF
```

## Paso 2 - Calcular el hash de los metadatos

Calcula el hash del archivo de metadatos. Se guarda en `previewPoolMetaDataHash.txt`.

```
cardano-cli conway stake-pool metadata-hash \
--pool-metadata-file preview-pool-metadata.json \
--out-file previewPoolMetaDataHash.txt
```

Copia `previewPoolMetaDataHash.txt` a la máquina aislada de la red.

## Paso 3 - Publicar preview-pool-metadata.json en un sitio web público

Sube `preview-pool-metadata.json` a un sitio web que administres o a un sitio público. Por ejemplo, puedes publicar los metadatos del pool en GitHub; consulta la [guía de Coincashew](https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node/part-v-tips/uploading-pool-metadata-to-github).

## Paso 4 - Verificar los hashes de los metadatos

Obtén el hash de los metadatos desde su URL JSON. Sustituye <https://www.METADATA-URL.com> por la URL real del paso 3:

```
cardano-cli conway stake-pool metadata-hash --pool-metadata-file <(curl -s -L <https://www.METADATA-URL.com>)
```

Comprueba que coincida con el valor de este archivo:

```
cat previewPoolMetaDataHash.txt
```

## Paso 5 - Crear el certificado de registro del stake pool

Para simplificar futuras actualizaciones del certificado, crea un archivo de entorno (`env`) con la configuración del pool y un script para generar `pool.cert`.

### Paso 5.1 - Crear la carpeta pool-scripts

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
mkdir pool-scripts
```

### Paso 5.2 - Crear el archivo env

Crea el archivo de entorno (`env`) del pool en la carpeta pool-scripts.

✅ Actualiza la URL de los metadatos, la IP y el puerto del relay, la cantidad comprometida al pool (pledge), el coste (comisión mínima del pool) y el margen.

```
cat > $DINGO_HOME/pool-scripts/env << 'EOF'
#!/bin/bash

PLEDGE=25000000000  # 25,000 ADA
COST=170000000     #  170 ADA
MARGIN=0.01        #    1 %

NET="--testnet-magic 2"  #preview
RELAY1_HOST=55.209.117.58
RELAY1_PORT=6000
RELAY2_HOST=55.23.123.206
RELAY2_PORT=6000
METADATA_URL=https://website.com/preview-pool-metadata.json
METADATA_HASH=$(cat $DINGO_HOME/previewPoolMetaDataHash.txt)
EOF
```

El ejemplo utiliza direcciones IP. Si tus relays utilizan nombres DNS, usa estas opciones:

> ```
> --single-host-pool-relay <relaynode1.pool.example.com> \
> --pool-relay-port 6000 \
> --single-host-pool-relay <relaynode2.pool.example.com> \
> --pool-relay-port 6000 \
>```

💡 Comprueba que las reglas del cortafuegos permitan el `RELAY_PORT` de los relays. Para consultar los puertos abiertos:

```
sudo ufw status numbered
```

### Paso 5.3 - Crear pool-registration.sh

Crea el script pool-registration.sh en la carpeta pool-scripts:

```
cat > $DINGO_HOME/pool-scripts/pool-registration.sh << EOF
#!/bin/bash

source ./env

cardano-cli conway stake-pool registration-certificate \
--cold-verification-key-file $DINGO_HOME/cold-keys/node.vkey \
--vrf-verification-key-file $DINGO_HOME/vrf.vkey \
--pool-pledge \${PLEDGE} \
--pool-cost \${COST} \
--pool-margin \${MARGIN} \
--pool-reward-account-verification-key-file $DINGO_HOME/stake.vkey \
--pool-owner-stake-verification-key-file $DINGO_HOME/stake.vkey \
\${NET} \
--pool-relay-ipv4 \${RELAY1_HOST} \
--pool-relay-port \${RELAY1_PORT} \
--pool-relay-ipv4 \${RELAY2_HOST} \
--pool-relay-port \${RELAY2_PORT} \
--metadata-url \${METADATA_URL} \
--metadata-hash \${METADATA_HASH} \
--out-file $DINGO_HOME/pool.cert
EOF
```

### Paso 5.4 - Añadir permisos de ejecución

Añade permisos de ejecución a `pool-registration.sh`:

```
chmod +x $DINGO_HOME/pool-scripts/pool-registration.sh
```

### Paso 5.5 - Ejecutar el script

Ejecuta el script para generar el nuevo certificado de registro del pool, que después deberás enviar en una transacción:

```
cd $DINGO_HOME/pool-scripts
./pool-registration.sh
```

### Paso 5.6 - Copiar pool.cert al entorno conectado

Copia `pool.cert` al directorio `$DINGO_HOME` del entorno conectado, ya sea el productor de bloques o un relay.

## Paso 6 - Comprometer stake al pool

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
cardano-cli conway stake-address stake-delegation-certificate \
--stake-verification-key-file stake.vkey \
--cold-verification-key-file $DINGO_HOME/cold-keys/node.vkey \
--out-file deleg.cert
```

## Paso 7 - Enviar los certificados

Crea y firma la transacción que envía tanto `pool.cert` como `deleg.cert`.

### Paso 7.1 - Consultar el slot actual

```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

### Paso 7.2 - Crear la transacción

```
cd $DINGO_HOME
cardano-cli conway transaction build \
    --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
    --change-address $(cat payment.addr) \
    --certificate-file pool.cert \
    --certificate-file deleg.cert \
    --invalid-hereafter $(( ${currentSlot} + 1000 )) \
    --witness-override 3 \
    --out-file tx.raw
```

### Paso 7.3 - Firmar la transacción

Copia `tx.raw` al directorio `$DINGO_HOME` de la máquina aislada de la red.

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file $DINGO_HOME/cold-keys/node.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

### Paso 7.4 - Enviar la transacción

Copia `tx.signed` al directorio `$DINGO_HOME` del entorno conectado, ya sea el productor de bloques o un relay.

```
cd $DINGO_HOME
cardano-cli conway transaction submit --tx-file tx.signed
```

## Paso 8 - Verificar el registro

<a id="step-81---create-stakepoolidtxt-file"></a>

### Paso 8.1 - Crear stakepoolid.txt

⚠️ En una máquina aislada de la red.

```
cardano-cli conway stake-pool id \
--cold-verification-key-file $DINGO_HOME/cold-keys/node.vkey \
--output-format hex \
> stakepoolid.txt

cat stakepoolid.txt
```

### Paso 8.2 - Copiar stakepoolid.txt al entorno conectado

Copia `stakepoolid.txt` al directorio `$DINGO_HOME` del entorno conectado, ya sea el productor de bloques o un relay.

### Paso 8.3 - Comprobar que el pool aparezca en la cadena

```
cd $DINGO_HOME
cardano-cli query stake-snapshot --stake-pool-id $(cat stakepoolid.txt)
```

## Paso 9 - Actualizar dingo.yaml con las claves KES y VRF y el certificado operativo

⚠️ En el productor de bloques.

Detén el nodo Dingo:

```
sudo systemctl stop dingo
```

Añade las siguientes líneas a `dingo.yaml`:

```
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Validator / block producer (core storage, API ports ignored):
blockProducer: true
shelleyVrfKey: \"$DINGO_HOME/vrf.skey\"
shelleyKesKey: \"$DINGO_HOME/kes.skey\"
shelleyOperationalCertificate: \"$DINGO_HOME/node.cert\"
EOF"
```

Visualiza y verifica el archivo:

```
sudo nano /etc/dingo/dingo.yaml
```

## Paso 10 - Iniciar el nodo Dingo

```
sudo systemctl start dingo
```

## Paso 11 - Comprobar el estado

Comprueba que Dingo esté en ejecución:

```
sudo systemctl status dingo
```

Para seguir los registros en tiempo real:

```
sudo journalctl -u dingo -f
```

Para ver los registros recientes si ocurre un error:

```
sudo journalctl -u dingo -n 50 --no-pager
```

💡 Puedes solicitar una delegación de ADA de prueba para el pool mediante el [faucet de Cardano](https://docs.cardano.org/cardano-testnets/tools/faucet). Selecciona Preview y `receive pool delegation`, y pega el identificador del pool, que puedes copiar desde tu explorador de Cardano preferido.

### ¡Enhorabuena! Ya tienes un stake pool Dingo en ejecución en la red Preview.
