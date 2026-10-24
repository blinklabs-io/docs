---
title: Crear un cliente de la API Blockfrost
description: Descarga y ejecuta un explorador TypeScript completo que utiliza la API compatible con Blockfrost de Dingo.
---

Descarga el explorador TypeScript completo, sus valores de configuración del nodo Kubernetes y los otros dos proyectos de aplicaciones:

[Descargar los ejemplos de aplicaciones de Dingo para v0.73.4](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

Consulta el [código versionado del explorador](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-blockfrost-explorer). Utiliza Node.js 24 o posterior, Helm, kubectl y un contexto Kubernetes seleccionado explícitamente, con almacenamiento persistente disponible para un nodo Preview.

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-blockfrost-explorer
helm upgrade --install dingo-explorer oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo --version 0.1.3 --namespace dingo-explorer --create-namespace --values k8s/dingo-values.yaml
```

Los valores suministrados fijan `ghcr.io/blinklabs-io/dingo:0.73.4`, seleccionan Preview, activan el almacenamiento API con metadatos SQLite y bloques Badger, y sirven Blockfrost en el puerto 3000. El chart realiza el arranque con Mithril antes de iniciar el servicio. En otra terminal, mantén en ejecución esta redirección de puerto sobre loopback:

```sh
kubectl -n dingo-explorer port-forward svc/dingo-explorer 3000:3000 12798:12798 --address 127.0.0.1
```

Inicia el frontend localmente y abre <http://127.0.0.1:5173>:

```sh
npm ci
DINGO_BLOCKFROST_URL=http://127.0.0.1:3000 DINGO_METRICS_URL=http://127.0.0.1:12798 npm run dev -- --host 127.0.0.1
```

La configuración completa del nodo está en `k8s/dingo-values.yaml`; el README de la raíz del paquete explica los puntos de entrada de las otras aplicaciones. Utiliza esta configuración versionada con Dingo v0.73.4. Para versiones posteriores, consulta [Acceso y configuración de las API](/es/guides/dingo/006-apis-and-archive/).

## Seguir la solicitud del navegador al nodo

El explorador completo está en `dingo-dev-guides/dingo-blockfrost-explorer/`. Su `vite.config.ts` redirige `/api/v0/*` al servicio Dingo para que las solicitudes del navegador mantengan el mismo origen:

```ts
import { defineConfig } from "vite";

const dingoTarget = process.env.DINGO_BLOCKFROST_URL ?? "http://127.0.0.1:3000";
const dingoMetricsTarget = process.env.DINGO_METRICS_URL ?? "http://127.0.0.1:12798";

const blockfrostProxy = {
  target: dingoTarget,
  changeOrigin: true,
  ws: false,
};

const metricsProxy = {
  target: dingoMetricsTarget,
  changeOrigin: true,
  ws: false,
};

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api/v0": blockfrostProxy,
      "/health": blockfrostProxy,
      "/metrics": metricsProxy,
    },
  },
});
```

`src/main.ts` contiene la función auxiliar de solicitudes con tipos que utilizan el panel, la búsqueda y las vistas de detalle:

```ts
async function blockfrostFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new HTTPError(response.status, await responseErrorMessage(response));
  }
  return (await response.json()) as T;
}

async function fetchLatestBlock(): Promise<BlockResponse> {
  return await blockfrostFetch<BlockResponse>("/api/v0/blocks/latest");
}
```

Estas son las funciones de solicitud reales de la aplicación. El `main.ts` completo incluye los tipos de respuesta, la gestión de rutas, las vistas del panel y la representación de los detalles. Descarga el paquete para copiar los archivos completos y ejecutar la aplicación; los fragmentos anteriores no sustituyen las dependencias ni los recursos HTML/CSS del proyecto.

Para desarrollar el frontend localmente con un nodo existente, entra en el directorio del proyecto, instala las dependencias fijadas y dirige el proxy de Vite a una API de Dingo en ejecución:

```sh
cd dingo-blockfrost-explorer
npm ci
DINGO_BLOCKFROST_URL=http://127.0.0.1:3000 npm run dev -- --host 127.0.0.1
```

El explorador utiliza los endpoints disponibles en la versión de Dingo a la que se conecta. Gestiona las respuestas `404` de las rutas que esa versión no proporcione. Para la documentación de la biblioteca Go, consulta [pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo).
