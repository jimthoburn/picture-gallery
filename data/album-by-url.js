
import { getCombinedAlbumJSON, getAlbumURI } from "../helpers/album.js";
import { fetchText, fetchJSON } from "../helpers/fetch.js";


async function getAlbumJSON({ albumURI, fetch }) {

  // TODO: Send these requests in parallel
  const album             = await fetchJSON({url: `/api/${albumURI}.json`, fetch});
  const generatedPictures = await fetchJSON({url: `/pictures/${albumURI}/data.json`, fetch});

  return getCombinedAlbumJSON({ album, generatedPictures });
}

async function getAlbumStory({ albumURI, fetch }) {
  return await fetchText({url: `/api/${albumURI}.markdown`, fetch});
}

function __getAlbumData({ albumURI, urlArray, parentUrlLength, fetch, parent }) {
  return new Promise(async (resolve, reject) => {
    if (!parent && urlArray.length >= parentUrlLength) {
      parent = await fetchJSON({ url: `/api/${urlArray[0]}/index.json`, fetch });
    }

    Promise.all([
      getAlbumJSON({ albumURI, fetch }),
      getAlbumStory({ albumURI, fetch })
    ]).then((values) => {
      const [album, story] = values;
      if (!album) reject(new Error(`Couldn’t find data for album: ${albumURI}`));

      if (story) {
        album.story = story;
      }
      if (parent) {
        album.uri = `${parent.uri}/${album.uri}`;
        album.parent = parent;
      }

      resolve(album);
    });
  });
}

function getAlbumData({ albumURI, urlArray, parentUrlLength, testNumber, fetch }) {
  console.log("getAlbumData: " + albumURI);
  return new Promise(async (resolve, reject) => {
    console.log(`Testing: /api/${albumURI}.json`)
    let testResult = await fetchJSON({url: `/api/${albumURI}.json`, fetch});
    if (testResult) {
      console.log("Test passed: " + testNumber);
      __getAlbumData({ albumURI, urlArray, parentUrlLength, fetch })
        .then(resolve);
    } else {
      const groupAlbum = await fetchJSON({url: `/api/${albumURI}/index.json`, fetch});
      if (groupAlbum) {
        const children = await Promise.all(groupAlbum.albums.map(
          async (childAlbumURI) => {
            //getAlbumJSON({ albumURI: `${groupAlbumURI}/${childAlbumURI}`});
            return await __getAlbumData({
              albumURI: `${groupAlbum.uri}/${childAlbumURI}`,
              urlArray,
              parentUrlLength,
              fetch,
              parent: groupAlbum
            });
          }
        ));
        resolve({
          ...groupAlbum,
          albums: children
        });
      } else {
        console.log("Test did not pass: " + testNumber);
        reject();
      }
    }
  });
}

function getURLArray(url) {
  console.log("getURLArray: " + url);
  let urlArray;
  // /wildflowers/7/                     ==>  ["example.com", "wildflowers", "7"]
  // /baking/a/3/                        ==>  ["example.com", "baking", "a", "3"]
  // /baking/a/                          ==>  ["example.com", "baking", "a"]
  if (url.indexOf("://") < 0) {
    urlArray = url.split("?").shift().split("/").filter(bit => bit !== "");
  }
  // https://example.com/wildflowers/7/  ==>  ["example.com", "wildflowers", "7"]
  // https://example.com/baking/a/3/     ==>  ["example.com", "baking", "a", "3"]
  // https://example.com/baking/a/       ==>  ["example.com", "baking", "a"]
  else {
    urlArray = url.split("://").pop().split("?").shift().split("/").filter(bit => bit !== "");
    urlArray.shift(); // Remove the domain and port
  }
  // console.log(urlArray);
  return urlArray;
}

function __getAlbumByURL({ url, fetch }) {
  return new Promise((resolve, reject) => {
    const urlArray = getURLArray(url);
    const urlArrayWithoutLastItem = urlArray.slice(0, urlArray.length - 1);
    let testNumber = 1;

    console.log("albumURI: " + urlArray.join("/"));

    // The whole URL might match an album
    // baking   ==> baking.json
    // baking/a ==> baking/a.json
    getAlbumData({
      albumURI: urlArray.join("/"),
      urlArray,
      parentUrlLength: 2,
      testNumber: testNumber++,
      fetch
    })
    .then(resolve)

    // Or part of the URL might match an album (picture details page)
    // baking/3   ==> baking.json
    // baking/a/3 ==> baking/a.json
    .catch(() => {
      if (urlArray.length >= 2) {
        getAlbumData({
          albumURI: urlArrayWithoutLastItem.join("/"),
          urlArray,
          parentUrlLength: 3,
          testNumber: testNumber++,
          fetch
        })
        .then(resolve)
        .catch(() => {
          console.error("Couldn’t find data for album");
        });
      }
    });
  })
}

async function getAlbumByURL({ url, fetch }) {
  console.log("getAlbumByURL: " + url);
  return await __getAlbumByURL({ url, fetch });
}


export {
  getAlbumByURL
}
