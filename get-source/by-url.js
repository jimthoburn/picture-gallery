
import jsBeautify            from "js-beautify";

import { config }            from "../_config.js";

import { render }            from "../web_modules/preact-render-to-string.js";
import { getInitialPageTitle,
         getOpenGraphImage } from "../components/picture-gallery.js";

import { fetchFromFileSystem as fetch }
                             from "../helpers/fetch-from-file-system.js";

import { getGalleryData }    from "../data/gallery.js";
import { getPublicURLs,
         getPublicAlbums,
         isGroupAlbum,
         isAlbum,
         getAlbum }          from "../data-from-files-and-fetch/album-urls.js";

import { DefaultLayout }     from "../layouts/default.js";
import { RobotsText }        from "../layouts/robots.txt.js";
import { SiteMapXML }        from "../layouts/sitemap.xml.js";
import { IndexPage }         from "../pages/index.js";
import { AlbumPage }         from "../pages/album.js";
import { ParentAlbumPage }   from "../pages/parent-album.js";


function getAlbumHTML(url) {
  return new Promise((resolve, reject) => {
    const album = getAlbum(url);

    const getPageURL = () => url;

    const title   = getInitialPageTitle({
      getPageURL,
      pictures: album.pictures,
      album
    });
    const content = render(AlbumPage({
      getPageURL,
      pictures: album.pictures,
      story: album.story,
      album
    }));
    const openGraphImage = getOpenGraphImage({
      getPageURL,
      pictures: album.pictures,
      album
    });

    const html = DefaultLayout({
      title,
      content,
      askSearchEnginesNotToIndex:
         album.askSearchEnginesNotToIndex || 
        (album.parent && album.parent.askSearchEnginesNotToIndex),
      openGraphImage:
        openGraphImage && (openGraphImage.indexOf("http") === 0 || config.host) ?
          openGraphImage.indexOf("http") != 0 && config.host
            ? `${config.host}${openGraphImage}`
            : openGraphImage
          : null
    });

    resolve(jsBeautify.html_beautify(html));
  });
}

function getGroupAlbumHTML(url) {
  return new Promise((resolve, reject) => {
    // console.log("getGroupAlbumHTML");
    // console.log(url);
    const album = getAlbum(url);
    // console.log(album);
    const { title, askSearchEnginesNotToIndex } = album;
    const content = render(ParentAlbumPage({ parent: album, children: album.albums }));
    const openGraphImage = getOpenGraphImage({
      getPageURL: () => url,
      pictures: album.albums[0].pictures,
      album: album.albums[0],
      parent: album
    });

    const renderedHTML = DefaultLayout({
      title,
      content,
      askSearchEnginesNotToIndex,
      includeClientJS: false,
      openGraphImage:
        openGraphImage && (openGraphImage.indexOf("http") === 0 || config.host) ?
          openGraphImage.indexOf("http") != 0 && config.host
            ? `${config.host}${openGraphImage}`
            : openGraphImage
          : null
    });
    const beautifiedHTML = jsBeautify.html_beautify(renderedHTML);

    resolve(beautifiedHTML);
  });
}

function getIndexHTML() {
  
  return new Promise(async (resolve, reject) => {
    
    const gallery = await getGalleryData({ fetch });
    const albums = gallery.albums.map(albumURI => getAlbum(`/${albumURI}/`));

    const { title, askSearchEnginesNotToIndex } = gallery;
    const content = render(IndexPage({ ...gallery, albums }));

    const firstAlbum = 
      albums[0].albums
        ? albums[0].albums[0] // The first album might be a group album
        : albums[0];

    const openGraphImage = getOpenGraphImage({
      getPageURL: () => "/",
      pictures: firstAlbum.pictures,
      album: firstAlbum
    });

    const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
      title,
      content,
      askSearchEnginesNotToIndex,
      includeClientJS: false,
      openGraphImage:
        openGraphImage && (openGraphImage.indexOf("http") === 0 || config.host) ?
          openGraphImage.indexOf("http") != 0 && config.host
            ? `${config.host}${openGraphImage}`
            : openGraphImage
          : null
    }));

    resolve(beautifiedHTML);
  })
  
}

function getRobotsText() {
  return new Promise((resolve, reject) => {
    const text = RobotsText({
      host: config.host
    });
    resolve(text);
  });
}

function getSiteMapXML() {
  return new Promise((resolve, reject) => {
    const publicURLs = getPublicURLs();
    const xml = SiteMapXML({
      host: config.host,
      urls: publicURLs
    });
    resolve(xml);
  });
}


function getSourceByURL(url) {
  return new Promise(async (resolve, reject) => {
    if (url === "/") {
      getIndexHTML()
        .then(resolve);
    } else if (url === "/sitemap.xml") {
      getSiteMapXML()
        .then(resolve);
    } else if (url === "/robots.txt") {
      getRobotsText()
        .then(resolve);
    } else if (isGroupAlbum(url)) {
      getGroupAlbumHTML(url)
        .then(resolve);
    } else if (isAlbum(url)) {
      getAlbumHTML(url)
        .then(resolve);
    } else {
      throw new Error(`An unexpected URL was passed to getSourceByURL: ${url}`);
    }
  });
}


export {
  getSourceByURL
}

