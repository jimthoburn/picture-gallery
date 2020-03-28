
import { fetchJSON } from "../helpers/fetch.js";


async function getGalleryData({ fetch }) {
  return await fetchJSON({url: `/api/index.json`, fetch});
}


export {
  getGalleryData
}
