
import { fetchJSON } from "../helpers/fetch.js";

async function getConfigData({ fetch }) {
  const config = await fetchJSON({url: `/api/config.json`, fetch});
  return config;
}

export {
  getConfigData,
}
