import { createAlbums } from "./albums.js";

import fetch, {
  fileFromSync,
} from "node-fetch";

const readFile = async (filePath) => {
  const mimetype = "image/jpeg";
  const blob = fileFromSync(filePath, mimetype);
  return blob;
}

const env = globalThis.process.env;
createAlbums({ env, fetch, readFile });
