// Copyright 2026 Blink Labs Software
// SPDX-License-Identifier: Apache-2.0

package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestExampleProcess(t *testing.T) {
	if os.Getenv("ADDER_TEST_EXAMPLE") == "1" {
		main()
	}
}

func TestStartupFailureExitStatus(t *testing.T) {
	dir, err := os.MkdirTemp("", "adder-start-")
	require.NoError(t, err)
	t.Cleanup(func() { require.NoError(t, os.RemoveAll(dir)) })
	command := exec.Command(os.Args[0], "-test.run=^TestExampleProcess$")
	command.Env = []string{
		"ADDER_TEST_EXAMPLE=1",
		"CARDANO_NODE_SOCKET_PATH=" + filepath.Join(dir, "missing.sock"),
		"CARDANO_NODE_MAGIC=764824073",
	}
	output, err := command.CombinedOutput()
	var exitErr *exec.ExitError
	require.ErrorAs(t, err, &exitErr, "startup failure returned success: %s", output)
	require.Equal(t, 1, exitErr.ExitCode(), "%s", output)
	require.Contains(t, string(output), "failed to start pipeline")
}
