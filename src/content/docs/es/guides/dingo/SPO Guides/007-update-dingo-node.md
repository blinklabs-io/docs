---
title: Actualizar el nodo Dingo
description: Guía para SPO de pools Dingo - Cómo actualizar el nodo Dingo.
---

## Cómo actualizar el nodo Dingo

## Paso 1 - Descargar la última versión

Descarga la última versión desde la página de [versiones de Dingo](https://github.com/blinklabs-io/dingo/releases).

⚠️ Ajusta la versión y la arquitectura a tu sistema.

```
cd ~/dingo
 wget https://github.com/blinklabs-io/dingo/releases/download/v0.87.0/dingo-v0.87.0-linux-amd64.tar.gz -O - | tar -xz
```

## Paso 2 - Detener el nodo Dingo

```
sudo systemctl stop dingo
```

## Paso 3 - Copiar el binario de Dingo a `/usr/local/bin/`

```
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

Comprueba que se haya copiado con `which dingo`.

## Paso 4 - Comprobar las actualizaciones de configuración

Comprueba si es necesario actualizar la configuración. Consulta las [notas de la versión de Dingo](/es/guides/dingo/releases/001-release-notes/).

💡 Para ver y editar `dingo.yaml`:

> ```
> sudo nano /etc/dingo/dingo.yaml
> ```

⚠️ Ajusta la ruta según sea necesario.

## Paso 5 - RECOMENDADO - Eliminar la base de datos .dingo y volver a sincronizar desde Mithril

Dingo está en desarrollo activo, por lo que se recomienda eliminar la base de datos y empezar de nuevo durante las actualizaciones.

⚠️ **Requisito de Musashi v0.87.0:** La revisión `rc-2026w42` sustituye los hashes de génesis de Byron y Shelley incluidos. Musashi no puede reutilizar su base de datos de cadena existente. Elimina la base de datos configurada y vuelve a sincronizar desde una instantánea nueva de Mithril o desde la génesis. Las demás redes pueden seguir la recomendación general anterior; en Musashi, este reinicio es obligatorio.

### Paso 5.1 - Eliminar la base de datos .dingo

💡 Muestra los archivos ocultos y comprueba la ruta:

> ```
> cd $DINGO_HOME
> ls -a
> ```

Deberías ver `.dingo`. Si no aparece, consulta en `dingo.yaml` la ruta de base de datos configurada.

Elimina el directorio de base de datos `.dingo`:

```
cd $DINGO_HOME
rm -r .dingo
```

### Paso 5.2 - Sincronizar con Mithril

Dingo incorpora un cliente Mithril que descarga y carga una instantánea automáticamente. Esto ahorra horas de sincronización frente a reproducir la cadena desde la génesis.

Ejecuta desde `$DINGO_HOME`:

```
dingo sync --mithril
```

Dingo realizará estos pasos:

1. Descargar la última instantánea de Mithril para la red configurada.
2. Verificar la cadena de certificados.
3. Cargar la instantánea en la base de datos.

El proceso tarda aproximadamente 20-30 minutos, según el sistema y la velocidad de la red.

📝 Si omites este paso, Dingo se sincronizará desde la génesis al iniciarse, lo que tarda bastante más.

### Paso 5.3 - Iniciar Dingo

Cuando termine la carga de la instantánea de Mithril, inicia el nodo:

```
cd $DINGO_HOME
sudo systemctl start dingo
```

## Paso 6 - Verificar la actualización

Comprueba que esté instalada la nueva versión:

```
dingo version
```

## Paso 7 - Comprobar el estado del servicio

Comprueba que el servicio esté en ejecución:

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

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
