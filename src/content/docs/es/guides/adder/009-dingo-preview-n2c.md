---
title: "Validar Adder con Dingo en Cardano Preview"
description: "Conecta Adder al socket Unix N2C de un nodo Dingo Preview en ejecución."
---

Usa un nodo Dingo en la red Cardano `preview` y permite que el usuario de Adder acceda a su socket Unix Node-to-Client. Consulta la [guía de Dingo](/es/guides/dingo/002-quick-start-overview/) para configurar el nodo.

Establece `DINGO_SOCKET_PATH` con la ruta del socket del nodo y ejecuta Adder:

```sh
export DINGO_SOCKET_PATH=/path/to/dingo.socket
adder --input chainsync --input-chainsync-network preview \
  --input-chainsync-socket-path "$DINGO_SOCKET_PATH" \
  --input-chainsync-intersect-tip=true --output log
```

Comprueba que el registro muestre una conexión correcta, una intersección ChainSync y eventos de bloques posteriores. Los eventos nuevos dependen de que el nodo reciba bloques; una reversión puede reducir el slot indicado. Detén Adder con Ctrl-C.

Sin un cursor guardado, `intersect-tip` solicita la punta actual del nodo en cada inicio. Un cursor guardado tiene prioridad; consulta la [persistencia del cursor](/es/guides/adder/chainsync-cursor-persistence/).

Para pilas de contenedores, utiliza [cardano-compose-stacks](https://github.com/blinklabs-io/cardano-compose-stacks).

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
