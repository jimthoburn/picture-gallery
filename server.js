
import chalk                from "chalk";

import { config }           from "./_config.js";

import { getAlbumsByURL,
         getAlbum }         from "./data-file-system/albums-by-url.js";
import { getSourceByURL }   from "./get-source/by-url.js";
import { getError404HTML,
         getError500HTML }  from "./get-source/error.js";


const port = !isNaN(Number(config.serverPort)) ? Number(config.serverPort) : 4000;
const hostname = config.serverHostname;

const handlers = {};

function withoutTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

// https://deno.land/manual@v1.35.1/examples/file_server
async function getStaticFile ({ filepath, request }) {
  console.log({ filepath });

  // Try opening the file
  let file;
  try {
    // If it's a file, open it
    if (new RegExp(/\.[a-zA-Z]+$/).test(filepath)) {
      file = await Deno.open(filepath, { read: true });
    } else {
      // If it's a directory, look for an index.html file
      file = await Deno.open(withoutTrailingSlash(filepath) + "/index.html", { read: true });

      // Add trailing slashes to URLs: /wildflowers => /wildflowers/
      const url = new URL(request.url);
      if (!url.pathname.endsWith("/")) {
        return Response.redirect(url.origin + url.pathname + "/" + url.search + url.hash, 302);
      }
    }
  } catch {
    // If the file cannot be opened, return a "404 Not Found" response
    return handlers["/404/"]({ request });
  }

  // Build a readable stream so the file doesn't have to be fully loaded into
  // memory while we send it
  const readableStream = file.readable;

  const headers = {};

  if (filepath.endsWith(".html")) {
    headers["content-type"] = "text/html; charset=utf-8";
  } else if (filepath.endsWith(".txt")) {
    headers["content-type"] = "text/plain; charset=utf-8";
  } else if (filepath.endsWith(".xml")) {
    headers["content-type"] = "text/xml; charset=utf-8";
  } else if (filepath.endsWith(".css")) {
    headers["content-type"] = "text/css; charset=utf-8";
  } else if (filepath.endsWith(".js") || filepath.endsWith(".mjs")) {
    headers["content-type"] = "application/javascript; charset=utf-8";
  } else if (filepath.endsWith(".json")) {
    headers["content-type"] = "application/json; charset=utf-8";
  } else if (filepath.endsWith(".jpg") || filepath.endsWith(".jpeg")) {
    headers["content-type"] = "image/jpeg";
  } else if (filepath.endsWith(".webp")) {
    headers["content-type"] = "image/webp";
  } else if (filepath.endsWith(".avif")) {
    headers["content-type"] = "image/avif";
  } else if (filepath.endsWith(".png")) {
    headers["content-type"] = "image/png";
  } else if (filepath.endsWith(".svg")) {
    headers["content-type"] = "image/svg+xml";
  }

  // Build and send the response
  return new Response(readableStream, {
    headers: headers,
  });
}

function getStaticFileHandler ({ folder, pathPrefix }) {
  return ({ request }) => {
    // Use the request pathname as filepath
    const url = new URL(request.url);
    const filepath = folder + decodeURIComponent(url.pathname).replace(pathPrefix, "");

    return getStaticFile({ filepath, request });
  }
}

function serveStaticFiles() {
  console.log(`📂 Preparing static files`);
  for (let folder of config.staticFolders) {
    const folderWithoutLeadingUnderscore = folder.replace(/^_/, "");
    handlers[`/${folderWithoutLeadingUnderscore}/*`]
      = getStaticFileHandler({
        folder: `./${folder}`,
        pathPrefix: `/${folderWithoutLeadingUnderscore}`,
      });
  }

  // _public is a general folder for any static file to be served from “/”
  handlers["/*"] = getStaticFileHandler({ folder: "./_public", pathPrefix: "" });

  handlers["/client.js"] = function ({ request }) {
    const filepath = "./client.js";
    return getStaticFile({ filepath, request });
  }
}

function serveGallery(urls) {
  console.log(`📗 Preparing albums`);
  for (let url of urls) {
    handlers[encodeURI(url)] = async function ({ request }) {
      try {
        const html = await getSourceByURL(url);
  
        return new Response(html, {
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        });
      } catch(error) {
        handlers["/500/"]({ request, error })
      }
    };
  }
}

function serveRobotsText() {
  console.log(`🤖 Preparing robots.txt`);
  const url = "/robots.txt";
  handlers[url] = async function ({ request }) {
    try {
      const text = await getSourceByURL(url);

      return new Response(text, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
        },
      });
    } catch(error) {
      handlers["/500/"]({ request, error })
    }
  };
}

function serveSiteMap() {
  console.log(`🗺  Preparing sitemap.xml`);
  const url = "/sitemap.xml";
  handlers[url] = async function ({ request }) {
    try {
      const xml = await getSourceByURL(url);

      return new Response(xml, {
        headers: {
          "content-type": "text/xml; charset=utf-8",
        },
      });
    } catch(error) {
      handlers["/500/"]({ request, error })
    }
  };
}

function serveError404Page() {
  console.log(`🚥 Preparing 404 "not found" page`);
  handlers["/404/"] = function ({ request }) {
    const html = getError404HTML();
    return new Response(html, {
      status: 404,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  };
}

function serveError500Page() {
  console.log(`🚥 Preparing 500 "server error" page`);
  handlers["/500/"] = function ({ request, error }) {
    const html = getError500HTML(error);
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  };
}

function removeTrailingSlash(url) {
  if (url === "/") return url;
  return url.replace(/\/$/, "");
}

function findPictureDetailRedirect(pathname) {
  // Extract path segments: /japan/37 => ["japan", "37"]
  const segments = pathname.split("/").filter(segment => segment !== "");
  
  if (segments.length !== 2) {
    return null; // Only handle 2-segment paths like /album/number
  }
  
  const [albumURI, possibleNumber] = segments;
  
  // Check if the second segment is numeric
  if (!/^\d+$/.test(possibleNumber)) {
    return null;
  }
  
  // Look for an album with this URI
  const albumURL = `/${albumURI}/`;
  const album = getAlbum(albumURL);
  
  if (!album || !album.pictures) {
    return null;
  }
  
  // Find a picture whose filename starts with this number
  const targetNumber = possibleNumber;
  const matchingPicture = album.pictures.find(picture => 
    picture.filename.startsWith(targetNumber + ".")
  );
  
  if (matchingPicture) {
    return `/${albumURI}/${matchingPicture.uri}/`;
  }
  
  return null;
}

async function serve() {
  console.log("");
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("⏱️ ", chalk.cyan("Starting server"));
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("");
  
  const albumURLs = await getAlbumsByURL();
  const urls = ["/", ...albumURLs];

  serveGallery(urls);
  serveStaticFiles();

  if (config.askSearchEnginesNotToIndex !== true && config.host) {
    serveRobotsText();
    serveSiteMap();
  } else {
    if (config.askSearchEnginesNotToIndex === true) console.log("⚠️ ", chalk.italic("askSearchEnginesNotToIndex"), "is set to", chalk.italic(true), "in", chalk.italic("_config.js"));
    if (!config.host) console.log("⚠️ ", chalk.italic("host"), "is not set in", chalk.italic("_config.js"));
    console.log("⚠️  Skipping sitemap.xml");
    console.log("⚠️  Skipping robots.txt");
  }

  serveError404Page();
  serveError500Page();

  const server = Deno.serve({ port, hostname }, async (request) => {
    const url = new URL(request.url);
    console.log({ url, pathname: url.pathname });

    for (const redirect of config.redirects) {
      try {

        // A) Simple redirect
        if (removeTrailingSlash(url.pathname) === removeTrailingSlash(redirect.from)) {
          const redirectTo =
            redirect.to.startsWith("http")
              ? redirect.to
              : url.origin + redirect.to;
          return Response.redirect(redirectTo, 302);
        }

        // B) Wildcard redirect (splat)
        if (
          redirect.from.startsWith("http") &&
          redirect.from.endsWith("/*") &&
          redirect.to.startsWith("http") &&
          redirect.to.endsWith("/:splat")
        ) {
          // request.url:   https://www.example.com/ahoy/there/

          // redirect.from: https://www.example.com/*
          // redirect.to:   https://example.com/:splat

          const fromURL = new URL(redirect.from);
          // { hostname: "www.example.com", ... }

          const to = redirect.to.replace(/\/:splat$/, "");
          // https://example.com

          if (url.hostname === fromURL.hostname) {
            return Response.redirect(to + url.pathname + url.search + url.hash, 302);
            // "https://example.com/ahoy/there"
          }
        };
      } catch(e) {
        console.error(e);
      }
    }

    // Add trailing slashes to URLs: /wildflowers => /wildflowers/
    if (handlers[url.pathname + "/"]) {
      return Response.redirect(url.origin + url.pathname + "/" + url.search + url.hash, 302);
    } else if (handlers[url.pathname]) {
      return handlers[url.pathname]({ request });
    } else {
      // Check for incomplete picture detail URLs (e.g., /japan/37 -> /japan/37-tenryū-ji-temple/)
      // const redirectURL = findPictureDetailRedirect(url.pathname);
      // if (redirectURL) {
      //   return Response.redirect(url.origin + redirectURL + url.search + url.hash, 302);
      // }
      
      for (let key in handlers) {
        if (key.endsWith("*") === false) continue;
        const path = key.replace(/\*$/, "");
        if (url.pathname.startsWith(path)) {
          return handlers[key]({ request });
        }
      }
      return handlers["/404/"]({ request });
    }
  });

  // If we’re not in development mode (using --watch)
  if (!Deno.args.includes("--dev")) {
    // Shutdown the server gracefully when the process is interrupted.
    Deno.addSignalListener("SIGINT", () => {
      console.log("");
      console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
      console.log("💁", chalk.cyan(`Received "SIGINT". Server shutting down...`));
      console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
      console.log("");

      server.shutdown();
    });
  }

  console.log("");
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("💁", chalk.cyan(`Server ready on`), chalk.italic(`http://${hostname}:${port}`));
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("");
}

serve();
