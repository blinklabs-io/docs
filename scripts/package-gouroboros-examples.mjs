import { existsSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = join(
  repositoryRoot,
  "public/downloads/gouroboros/dev-guides/source/v0.211.0",
);
const sourceDirectory = join(sourceRoot, "examples");
const archivePath = join(
  repositoryRoot,
  "public/downloads/gouroboros/dev-guides/gouroboros-examples-v0.211.0.tar.gz",
);

if (
  !existsSync(join(sourceRoot, "README.md")) ||
  !existsSync(join(sourceDirectory, "chain-sync/main.go"))
) {
  throw new Error(`gOuroboros example sources not found in ${sourceRoot}`);
}

mkdirSync(dirname(archivePath), { recursive: true });
rmSync(archivePath, { force: true });

const result = spawnSync(
  "tar",
  ["-czf", archivePath, "-C", sourceRoot, "examples", "README.md"],
  { stdio: "inherit" },
);

if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(`tar exited with status ${result.status}`);
}
