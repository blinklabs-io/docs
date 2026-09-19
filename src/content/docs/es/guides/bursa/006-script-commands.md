---
title: Guía de línea de comandos de script
description: Guía de línea de comandos de Bursa para operaciones multifirma.
---

<a name="script"></a>

Guía de línea de comandos de Bursa para operaciones multifirma.

## Comandos para operaciones multifirma
Bursa también se puede usar para generar scripts multifirma. El comando `script` de Bursa tiene 3 tipos de comandos que puedes ejecutar.

> **Tipos de comandos de script:**
>  - **create:** Crea un nuevo script multifirma
>  - **validate:** Valida un script contra testigos de vkey y el slot
>  - **address:** Genera una dirección de mainnet desde un script

#### Crear script multifirma

- Crear un script multifirma 2-de-3

```bash
./bursa script create --required 2 --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13,abcdef1234567890abcdef1234567890abcdef14
```

- Crear un script que requiera todos los firmantes

```bash
./bursa script create --all --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13
```

- Crear un script de cualquier firmante

```bash
./bursa script create --any --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13,abcdef1234567890abcdef1234567890abcdef14
```

- Crear un script con bloqueo de tiempo (válido después del slot 1000000)

```bash
./bursa script create --required 2 --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13 --timelock-after 1000000
```

#### Validar script

- Validar un script con testigos de Ed25519:

```bash
./bursa script validate --script script.json --public-keys abcdef1234...,1234567890... --signatures 0123abcd...,fedcba9876... --message-hex 74657874 --slot 123456789
```

- `--script` requiere la ruta al archivo de script.
- `--public-keys` acepta una lista separada por comas de claves de verificación Ed25519 codificadas en hexadecimal. `--signatures` acepta una lista separada por comas de firmas codificadas en hexadecimal. El elemento de la posición `i` en cada lista forma un testigo y ambas listas deben tener la misma longitud.
- Use `--message` para indicar el mensaje firmado como texto UTF-8 o `--message-hex` para indicarlo en hexadecimal. Estos indicadores son mutuamente excluyentes. El modo de validación predeterminado requiere uno de estos indicadores cuando se proporcionan testigos.
- `--slot` proporciona el slot actual para la validación de bloqueos de tiempo.
- De forma predeterminada, Bursa valida criptográficamente cada testigo proporcionado: compara el hash Blake2b-224 de cada clave de verificación con el hash de clave del script y verifica la firma Ed25519 con el mensaje proporcionado. Un script que requiere firmas y no recibe testigos termina con un diagnóstico distinto de cero.
- `--structural-only` realiza la validación estructural sin verificar testigos ni firmas.

El comando devuelve JSON con los campos `valid`, `slot`, `signatures`, `scriptHash` y `structuralOnly`.

***

Explora otros comandos de Bursa

> **Categorías de comandos de Bursa**
> 1. [wallet](../003-commands) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](#script) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica

***
