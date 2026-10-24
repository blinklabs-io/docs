---
title: Crear un panel de gobernanza
description: Ejecuta y amplía el panel de gobernanza completo en Go y su configuración PostgreSQL de Dingo.
---

El paquete contiene el servidor Go completo de Gov Lens, las pruebas, el frontend integrado, los permisos de base de datos de solo lectura y los valores Kubernetes para Dingo:

[Descargar los ejemplos de aplicaciones de Dingo para v0.73.4](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

Consulta el [código versionado de Gov Lens](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-gov-lens). Utiliza Go 1.26 o posterior, Helm, kubectl y un contexto Kubernetes seleccionado. Antes de desplegar el nodo, prepara una base de datos privada de metadatos PostgreSQL accesible desde Dingo y la aplicación local.

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-gov-lens
cp k8s/dingo-values.yaml gov-lens-values.local.yaml
```

Edita el DSN de PostgreSQL de los valores copiados para indicar el propietario y la base de datos. Utiliza un certificado de servidor de confianza para el almacén de CA del sistema de la imagen Dingo y un nombre DNS que coincida con él. Conserva las credenciales en la configuración local. Los valores suministrados fijan Dingo 0.73.4, seleccionan Preview y el almacenamiento API, utilizan metadatos PostgreSQL y bloques Badger, y desactivan los servicios de API opcionales.

```sh
helm upgrade --install dingo-governance oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo --version 0.1.3 --namespace dingo-governance --create-namespace --values gov-lens-values.local.yaml
```

Después de que Dingo cree el esquema, edita `sql/create-readonly-user.sql` para indicar la base de datos, el propietario de Dingo y la contraseña de la aplicación. Establece POSTGRES_ADMIN_DSN para la conexión de administrador y ejecuta:

```sh
psql "$POSTGRES_ADMIN_DSN" --set ON_ERROR_STOP=1 --file sql/create-readonly-user.sql
```

Gov Lens debe utilizar el rol independiente de solo lectura. Ejecuta la aplicación Go localmente mediante los comandos que aparecen más abajo y abre <http://127.0.0.1:8088>. La carga del historial puede continuar después de que el nodo alcance la punta; el panel informa de este estado en lugar de interpretar la ausencia de filas como prueba de que no existe gobernanza.

El README del paquete documenta las comprobaciones de `scripts/e2e-kubernetes.sh` para un proceso Gov Lens en ejecución y un pod PostgreSQL seleccionado explícitamente mediante espacio de nombres y nombre. El script comprueba el estado HTTP, la configuración del nodo y el número de filas de gobernanza sin desplegar servicios.

## Servidor Go y SQL

El servidor de `dingo-gov-lens/main.go` abre la base de datos, registra las rutas de la API JSON y sirve el frontend integrado. Estos son los registros de rutas reales de la aplicación:

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /api/status", a.handleStatus)
mux.HandleFunc("GET /api/proposals", a.handleProposals)
mux.HandleFunc("GET /api/proposals/{txHash}/{index}", a.handleProposalDetail)
mux.HandleFunc("GET /api/dreps", a.handleDreps)
mux.HandleFunc("GET /api/dreps/{credential}", a.handleDrepDetail)
mux.HandleFunc("GET /api/stake/{credential}", a.handleStakeLookup)
mux.HandleFunc("GET /api/epochs", a.handleEpochs)
```

Por ejemplo, `handleStatus` lee la red y el modo de almacenamiento directamente de la tabla de metadatos de Dingo:

```go
err := a.db.QueryRowContext(ctx, `
    SELECT COALESCE(network, ''), COALESCE(storage_mode, '')
    FROM node_settings
    ORDER BY id ASC
    LIMIT 1
`).Scan(&ret.Network, &ret.StorageMode)
```

`main.go` incluye los manejadores completos y las consultas parametrizadas de propuestas, DRep, stake y épocas. `static/app.js` llama a esos endpoints y presenta los resultados. Utiliza los archivos descargados para copiar o adaptar la aplicación; los fragmentos anteriores muestran cómo se conecta el servidor, pero dependen de los tipos y manejadores del resto de la aplicación.

Para desarrollar la aplicación Go con una base de datos Postgres compatible ya en ejecución:

```sh
cd dingo-gov-lens
export DATABASE_URL='host=postgres.example.com port=5432 user=dingo_gov_lens password=change-me dbname=dingo_metadata sslmode=verify-full sslrootcert=system TimeZone=UTC'
export ADDR=127.0.0.1:8088
go test ./...
go run .
```

Esta aplicación consulta el esquema interno de metadatos de Dingo, que no es una API pública estable. Revisa el diseño de la base de datos de la versión de Dingo que despliegues y repite las pruebas después de actualizar. El historial puede estar incompleto durante la carga, y la retención y las opciones de funciones afectan a los registros disponibles. Mantén PostgreSQL privado, concede a la aplicación acceso de solo lectura y utiliza una aplicación de gobernanza compatible para firmar y enviar propuestas o votos. La documentación de la biblioteca Go está en [pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo).
