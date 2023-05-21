import { createAlbums } from "./albums.js";

const env = globalThis.process.env;
createAlbums({ env });
