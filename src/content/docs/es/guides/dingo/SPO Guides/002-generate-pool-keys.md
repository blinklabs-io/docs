---
title: Generar las claves del pool
description: Guía para SPO de pools Dingo - Generación de claves del pool.
---

# Nodo Dingo - Claves de producción de bloques

Genera las claves necesarias para producir bloques en la red Preview.

| Clave | Finalidad | Ubicación |
| --- | --- | --- |
| Clave fría (`node.skey` / `node.vkey`) | Autoriza el registro del pool y la rotación KES | Únicamente en la máquina aislada de la red; nunca se transfiere |
| Clave KES (`kes.skey` / `kes.vkey`) | Firma bloques; debe rotarse antes de que caduque KES | `kes.skey`: productor de bloques |
| Clave VRF (`vrf.skey` / `vrf.vkey`) | Demuestra el liderazgo de slots | `vrf.skey`: productor de bloques |
| Certificado operativo (`node.cert`) | Vincula la clave KES con la clave fría del nodo | Productor de bloques |

Para conocer la función de estas claves, consulta [Pares de claves de Cardano](https://developers.cardano.org/docs/operate-a-stake-pool/basics/cardano-key-pairs/).

⚠️ Esta guía presupone que ya has completado la instalación del nodo Dingo y que está sincronizado al 100%. Si no es así, completa esos pasos antes de continuar.

✅ Los archivos se encuentran en `$DINGO_HOME`. Ajusta las rutas si es necesario.

## Paso 1 - Generar el par de claves KES

```
cd $DINGO_HOME
cardano-cli conway node key-gen-KES \
--verification-key-file kes.vkey \
--signing-key-file kes.skey
```

## Paso 2 - Crear un directorio para las claves frías

⚠️ En una máquina aislada de la red.

Crea el directorio y entra en él:

```
mkdir -p "$DINGO_HOME/cold-keys" && cd "$DINGO_HOME/cold-keys"
```

## Paso 3 - Generar las claves frías y el archivo de contador frío

⚠️ En una máquina aislada de la red.

```
cardano-cli conway node key-gen \
--cold-verification-key-file node.vkey \
--cold-signing-key-file node.skey \
--operational-certificate-issue-counter node.counter
```

## Paso 4 - Obtener el período KES inicial

El siguiente comando necesita el archivo JSON de génesis de Shelley. Crea un directorio para los archivos de configuración de Cardano; este ejemplo utiliza `$DINGO_HOME/config/`.

Crea el directorio y entra en él:

```
mkdir -p "$DINGO_HOME/config" && cd "$DINGO_HOME/config"
```

Descarga el archivo de génesis de Shelley:

```
wget https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json
```

💡 Los archivos de configuración de Cardano están en la [documentación de entornos](https://book.play.dev.cardano.org/environments.html).

**Obtén el período KES inicial:**

```
cd $DINGO_HOME
slotNo=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
slotsPerKESPeriod=$(cat $DINGO_HOME/config/shelley-genesis.json | jq -r '.slotsPerKESPeriod')
kesPeriod=$((${slotNo} / ${slotsPerKESPeriod}))
startKesPeriod=${kesPeriod}
echo startKesPeriod: ${startKesPeriod}
```

📝 ANOTA ESTE NÚMERO.

## Paso 5 - Generar el certificado operativo del pool

✅ Sustituye el valor `<startKesPeriod>` por el número anotado en el paso anterior.

⚠️ En una máquina aislada de la red, después de copiar `kes.vkey` al entorno frío.

```
cd $DINGO_HOME
cardano-cli conway node issue-op-cert \
--kes-verification-key-file kes.vkey \
--cold-signing-key-file $DINGO_HOME/cold-keys/node.skey \
--operational-certificate-issue-counter $DINGO_HOME/cold-keys/node.counter \
--kes-period <startKesPeriod> \
--out-file node.cert
```

## Paso 6 - Copiar node.cert al entorno conectado

Copia el archivo `node.cert` al productor de bloques.

## Paso 7 - Generar un par de claves VRF

```
cd $DINGO_HOME
cardano-cli conway node key-gen-VRF \
--verification-key-file vrf.vkey \
--signing-key-file vrf.skey
```

## Paso 8 - Establecer permisos de solo lectura para la clave VRF

También debes copiar `vrf.vkey` al entorno frío.

```
chmod 400 vrf.skey
```

### Recordatorio

**Productor de bloques**

Estos son los únicos tres archivos de claves y certificados del stake pool que deben almacenarse en el productor de bloques:

> ```
> ###
> ### On block producer node
> ###
> KES = kes.skey
> VRF = vrf.skey
> CERT = node.cert
> ```

**Todas las demás claves deben permanecer sin conexión en el entorno frío aislado de la red.**

**Nodos relay**

Los relays NO deben almacenar certificados operativos, claves VRF, claves de firma ni claves frías.

### ¡Enhorabuena! Ya puedes continuar con la siguiente sección.
