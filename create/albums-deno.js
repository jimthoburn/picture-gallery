import { load } from "dotenv/mod.ts";
import { createAlbums } from "./albums.js";

const readFile = async (filePath) => {
  const blob = await Deno.readFile(filePath);
  return blob;
};

// https://deno.land/std/dotenv/mod.ts
const env = await load();
createAlbums({ env, fetch, readFile });
