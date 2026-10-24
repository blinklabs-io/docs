---
title: Instalar y configurar un nodo Dingo
description: Guía para SPO de pools Dingo - Instalación y configuración del nodo.
---

✅ Esta guía presupone una instalación Linux típica. Ajusta los comandos y las rutas según sea necesario.

### Paso 1 - Crear el directorio de trabajo

Crea un directorio para los archivos del pool. Primero exporta la ruta del directorio en `.bashrc`:

```
echo 'export DINGO_HOME=~/dingo-testnet-preview' >> ~/.bashrc
source ~/.bashrc
```

Después crea el directorio:

```
mkdir -p "$DINGO_HOME"
```

✅ Compruébalo ejecutando:

> ```
> echo $DINGO_HOME
> ```

### Paso 2 - Descargar el binario de Dingo

Descarga la última versión desde la página de [versiones de Dingo](https://github.com/blinklabs-io/dingo/releases).

⚠️ Ajusta la versión y la arquitectura a tu sistema.

```
cd $DINGO_HOME
 wget https://github.com/blinklabs-io/dingo/releases/download/v0.87.0/dingo-v0.87.0-linux-amd64.tar.gz -O - | tar -xz
```

✅ Comprueba la versión del binario:

```
./dingo version
```

Copia el binario de Dingo a `/usr/local/bin/` para que esté disponible en todo el sistema:

```
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

✅ Comprueba que se haya copiado:

> ```
> which dingo
> ```

### Paso 3 - Descargar el binario de Cardano-CLI

Descarga el binario de Cardano-CLI y ejecuta:

```
cd $DINGO_HOME
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-11.2.3.1/cardano-cli-11.2.3.1-x86_64-linux.tar.gz -O - | tar -xz
```

Las versiones más recientes de Cardano-CLI están en [GitHub](https://github.com/IntersectMBO/cardano-cli/releases).

Mueve `cardano-cli` a `/usr/local/bin`:

```
sudo mv cardano-cli-x86_64-linux /usr/local/bin/cardano-cli
```

✅ Comprueba la versión de `cardano-cli`:

```
cardano-cli version
```

**Algunos comandos de la CLI necesitan el archivo JSON de génesis de Shelley.** Este ejemplo utiliza `$DINGO_HOME/config/`. El siguiente comando crea el directorio y entra en él:

```
mkdir -p "$DINGO_HOME/config" && cd "$DINGO_HOME/config"
```

Descarga el archivo de génesis de Shelley:

```
wget https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json
```

💡 Los archivos de configuración de Cardano están en la [documentación de Preview](https://book.play.dev.cardano.org/env-preview.html).

### Paso 4 - Añadir variables de entorno

Abre tu archivo bashrc:

```
nano ~/.bashrc
```

Añade las variables de entorno:

```
export CARDANO_NODE_NETWORK_ID=2
export CARDANO_NODE_SOCKET_PATH="$DINGO_HOME/dingo.socket"
```

💡 2 = Preview.

**Guarda y cierra el archivo.** Vuelve a cargar bashrc:

```
source ~/.bashrc
```

✅ Comprueba las variables de entorno:

> ```
> echo $CARDANO_NODE_NETWORK_ID
> ```

> ```
> echo $CARDANO_NODE_SOCKET_PATH
> ```

### Paso 5 - Crear el archivo de configuración dingo.yaml

Dingo incluye configuraciones de red de Cardano integradas (archivos de génesis y config.json) para preview, preprod y mainnet. No necesitas descargarlas por separado.

Primero crea los directorios necesarios:

```
sudo mkdir -p /etc/dingo
```

Después crea el directorio `.dingo`:

```
mkdir -p $DINGO_HOME/.dingo
```

Crea el archivo `dingo.yaml`. La variable `$DINGO_HOME` se expandirá automáticamente a la ruta de tu directorio de trabajo en el siguiente comando:

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$DINGO_HOME/.dingo\"

# Network
network: \"preview\"
relayPort: 3001
socketPath: \"$DINGO_HOME/dingo.socket\"

EOF"
```

Visualiza y comprueba el archivo `dingo.yaml`:

```
sudo nano /etc/dingo/dingo.yaml
```

💡 Asegúrate de que el puerto 3001 esté abierto:

> ```
> sudo ufw allow 3001/tcp
> ```

### Paso 6 - Crear la unidad dingo.service

Crea el archivo del servicio systemd. ⚠️ Sustituye `YOUR_USER` por tu nombre de usuario Linux; puedes comprobarlo con `echo $USER`:

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

✅ Visualiza y comprueba el archivo `dingo.service`:

```
sudo nano /etc/systemd/system/dingo.service
```

### Paso 7 - Activar e iniciar el servicio

Activa el inicio automático al arrancar el sistema y después inicia el servicio:

```
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

### Paso 8 - Comprobar el estado

✅ Comprueba que el servicio esté en ejecución:

```
sudo systemctl status dingo.service
```

Para seguir los registros en tiempo real:

```
sudo journalctl -u dingo -f
```

Para ver los registros recientes si ocurre un error:

```
sudo journalctl -u dingo -n 50 --no-pager
```

#### ¡Enhorabuena! El nodo Dingo debería estar sincronizándose. Comprueba que esté completamente sincronizado antes de continuar.

Ejecuta este comando para comprobar si el nodo está sincronizado al 100%:

> ```
> cardano-cli query tip
> ```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
