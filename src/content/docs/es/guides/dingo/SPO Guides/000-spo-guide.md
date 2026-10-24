---
title: Resumen de la guía para SPO
description: Guía para SPO de pools Dingo.
---

# Nodo Dingo

## Esta guía describe los pasos necesarios para crear un pool de prueba en la red Preview con el nodo Dingo.

⚠️ El nodo Dingo sigue en desarrollo intensivo. Actualmente se recomienda producir bloques con Dingo únicamente en redes de prueba.

> 📝 Nota: Consulta en las notas de la versión la tabla de compatibilidad de red recomendada.
>
> ### Compatibilidad de red recomendada ⚠️
>
> | Red | Compatible |
> | --- | --- |
> | mainnet | ⛔ |
> | preprod-testnet | ✅ |
> | preview-testnet | ✅ |
> | musashi | ✅ |

<br>

Registrar y poner en marcha un nodo Dingo en la red Preview requiere cinco pasos principales.

- [x] 1. Instalar y configurar el nodo Dingo
- [x] 2. Generar las claves del pool
- [x] 3. Generar las claves de pago y stake
- [x] 4. Registrar la dirección de stake
- [x] 5. Registrar el stake pool

***

📝 Esta guía presupone que has reforzado la seguridad del servidor. Para más información, consulta la <a href="https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node/part-i-installation/hardening-an-ubuntu-server" target="_blank">guía de Coincashew</a>.

<br>

⚠️ Esta guía también omite la configuración de un entorno aislado de la red y presupone que has protegido los archivos según sea necesario.
