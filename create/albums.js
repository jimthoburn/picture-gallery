import { load } from "@std/dotenv";
import { createAlbums } from "./albums-create.js";

const readFile = async (filePath) => {
  const blob = await Deno.readFile(filePath);
  return blob;
};

// https://jsr.io/@std/dotenv/doc
const env = await load();
createAlbums({ env, fetch, readFile });
