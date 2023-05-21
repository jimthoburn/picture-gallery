import { load } from "dotenv/mod.ts";
import { createAlbums } from "./albums.js";

// https://deno.land/std/dotenv/mod.ts
const env = await load();
createAlbums({ env });
