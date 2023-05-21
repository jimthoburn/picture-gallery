import { readFile } from "node:fs/promises";

import { install } from "esinstall";

// KUDOS: https://www.bryanbraun.com/2021/08/27/a-minimalist-development-workflow-using-es-modules-and-esinstall/

const packageFile = await readFile(
  new URL("./package.json", import.meta.url)
);

const packageJson = JSON.parse(packageFile);

const options = {
  "polyfillNode": true,
  "clean": true,
  "optimize": false,
  "sourcemap": true
}

const modules = packageJson["install-web-modules"];

await install(modules, options);
