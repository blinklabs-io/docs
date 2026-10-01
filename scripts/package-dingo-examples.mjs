import { existsSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = join(
  repositoryRoot,
  "public/downloads/dingo/dev-guides/source/v0.73.4",
);
const sourceDirectory = join(sourceRoot, "dingo-dev-guides");
const archivePath = join(
  repositoryRoot,
  "public/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz",
);

if (!existsSync(join(sourceDirectory, "README.md"))) {
  throw new Error(`Dingo application sources not found in ${sourceDirectory}`);
}

mkdirSync(dirname(archivePath), { recursive: true });
rmSync(archivePath, { force: true });

const result = spawnSync(
  "tar",
  ["-czf", archivePath, "-C", sourceRoot, "dingo-dev-guides"],
  { stdio: "inherit" },
);

if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(`tar exited with status ${result.status}`);
}
