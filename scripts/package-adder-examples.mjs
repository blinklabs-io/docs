import { cpSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL(
  "../public/downloads/adder/library-examples/source/", import.meta.url,
));
const archivePath = fileURLToPath(new URL(
  "../public/downloads/adder/library-examples/adder-library-examples.tar.gz", import.meta.url,
));
const staging = mkdtempSync(join(tmpdir(), "adder-examples-"));
try {
  mkdirSync(dirname(archivePath), { recursive: true });
  cpSync(sourceRoot, join(staging, "adder-library-examples"), { recursive: true });
  rmSync(archivePath, { force: true });
  const result = spawnSync("tar", [
    "-czf", archivePath, "-C", staging, "adder-library-examples",
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`tar exited with status ${result.status}`);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
