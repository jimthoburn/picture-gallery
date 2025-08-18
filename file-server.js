import { config } from "./_config.js";

const handlers = {};

function withoutTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

// https://docs.deno.com/runtime/tutorials/file_server
async function getStaticFile ({ filepath, request }) {
  console.log({ filepath });

  // Try opening the file
  let file;
  try {
    // If it's a file (has a file extension), open it
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

function serveStaticFiles({ folder }) {
  console.log(`📂 Preparing static files`);
  handlers["/*"] = getStaticFileHandler({ folder, pathPrefix: "" });
}

function serveError404Page({ folder }) {
  console.log(`🚥 Preparing 404 "not found" page`);
  console.log("");
  handlers["/404/"] = async function ({ request }) {

    // Try returning a 404.html file, if one exists
    try {
      const filepath = `${folder}/404.html`;
      const file = await Deno.open(filepath, { read: true });

      // Build a readable stream so the file doesn't have to be fully loaded into
      // memory while we send it
      const readableStream = file.readable;
  
      return new Response(readableStream, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    } catch {
      // If a 404.html file does’t exist, return a simple message
      return new Response("<html><title>Not found</title><body>Not found</body></html>", {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  };
}

async function getRedirects({ folder, redirectsFilePath }) {

  const redirects = [];
  // Try opening a redirects file, if one exists
  try {
    // https://docs.deno.com/deploy/api/runtime-fs#denoreadtextfile
    const redirectsText = await Deno.readTextFile(`${folder}${redirectsFilePath}`);

    const redirectsLines = redirectsText.split("\n");

    for (const line of redirectsLines) {
      const [from, to] = line.split(/\s+/);
      if (from && to) {
        // handlers[from] = () => Response.redirect(to, 302);
        redirects.push({ from, to });
      }
    }
  } catch {
    console.log(`Something went wrong while getting redirects from: ${folder}${redirectsFilePath}`);
  }

  return redirects;
}

function removeTrailingSlash(url) {
  if (url === "/") return url;
  return url.replace(/\/$/, "");
}

async function findPictureDetailRedirect(pathname, folder) {
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
  
  // Try to load the album data from the API
  try {
    const albumData = await Deno.readTextFile(`./api/${albumURI}.json`);
    const album = JSON.parse(albumData);
    
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
  } catch {
    // Album or picture not found
    return null;
  }
  
  return null;
}

async function serve({ folder, redirectsFilePath, port, hostname }) {
  console.log("");
  console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  console.log("⏱️ ", "Starting server");
  console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  console.log("");

  serveStaticFiles({ folder });
  serveError404Page({ folder });

  const server = Deno.serve({ port, hostname }, async (request) => {
    const url = new URL(request.url);
    console.log({ url, pathname: url.pathname });

    const redirects = await getRedirects({ folder, redirectsFilePath });

    for (const redirect of redirects) {
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
      const redirectURL = await findPictureDetailRedirect(url.pathname, folder);
      if (redirectURL) {
        return Response.redirect(url.origin + redirectURL + url.search + url.hash, 302);
      }
      
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
      console.log("- - - - - - - - - - - - - - - - - - - - - - -");
      console.log("💁", `Received "SIGINT". Server shutting down...`);
      console.log("- - - - - - - - - - - - - - - - - - - - - - -");
      console.log("");

      server.shutdown();
    });
  }

  console.log("");
  console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  console.log("💁", `Server ready on`, `http://${hostname}:${port}`);
  console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  console.log("");
}

const port = !isNaN(Number(config.serverPort)) ? Number(config.serverPort) : 4000;
const hostname = config.serverHostname;
const folder = "."; 
const redirectsFilePath = `/_redirects`;

serve({ folder, redirectsFilePath, port, hostname });
