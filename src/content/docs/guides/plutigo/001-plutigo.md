---
title: plutigo
description: Introduction to plutigo.
---

plutigo is a pure Go implementation of Plutus focused on evaluating Untyped Plutus Core programs.

## What plutigo supports

plutigo supports Plutus V1, V2, V3, and initial V4 support. It selects the cost model and builtin behavior for each program from the Plutus version that the program declares.

plutigo covers representative Cardano Improvement Proposal support for `serialiseData`, ECDSA and Schnorr verification, `expModInteger`, integer and bytestring conversion and bitwise operations, BLS12-381 and pairing operations, Mary-era `Value` builtins, and array operations.

## Core architecture

- `CEK machine`: runs Plutus programs and applies the correct execution budget rules.
- `syntax`: reads programs, converts names into De Bruijn form, and pretty prints results.
- `builtins`: provides the functions that Plutus programs call during evaluation.
- `data`: encodes and decodes the data values that programs read and return.

## Installation

```sh
go get github.com/blinklabs-io/plutigo
```

## Basic usage

This flow parses UPLC input, converts names to De Bruijn form, creates an evaluation context, runs the machine, and pretty prints the result.

```go
package main

import (
	"fmt"

	"github.com/blinklabs-io/plutigo/cek"
	"github.com/blinklabs-io/plutigo/syn"
)

func main() {
	input := `
	(program 1.2.0
	  [
	    [
	      (builtin addInteger)
	      (con integer 1)
	    ]
	    (con integer 1)
	  ]
	)
	`

	parsed, _ := syn.Parse(input)
	program, _ := syn.NameToDeBruijn(parsed)
	ctx := cek.NewDefaultEvalContext(program.Version, cek.ProtoVersion{Major: 200})
	machine := cek.NewMachine[syn.DeBruijn](program.Version, 0, ctx)
	term, _ := machine.Run(program.Term)

	fmt.Println(syn.PrettyTerm[syn.DeBruijn](term))
}
```

## v0.1.13 highlights

- `expModInteger` budget overflow handling now uses checked arithmetic and returns budget errors instead of corrupting budget accounting.
- Plutus data decoding now enforces nesting depth and node count limits so hostile or malformed CBOR inputs fail fast.

This page serves as the landing guide for deeper plutigo documentation as the documentation set grows.