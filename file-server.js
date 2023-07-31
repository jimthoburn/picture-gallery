const port = 4000;
const hostname = "0.0.0.0";

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
  handlers["/*"] = getStaticFileHandler({ folder: ".", pathPrefix: "" });
}

function serveError404Page() {
  console.log(`🚥 Preparing 404 "not found" page`);
  console.log("");
  handlers["/404/"] = async function ({ request }) {

    // Try returning a 404.html file, if one exists
    try {
      const filepath = "./404.html";
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

function serve() {
  serveStaticFiles();
  serveError404Page();

  Deno.serve({ port, hostname }, (request) => {
    const url = new URL(request.url);
    console.log({ url, pathname: url.pathname });

    // Add trailing slashes to URLs: /wildflowers => /wildflowers/
    if (handlers[url.pathname + "/"]) {
      return Response.redirect(url.origin + url.pathname + "/" + url.search + url.hash, 302);
    } else if (handlers[url.pathname]) {
      return handlers[url.pathname]({ request });
    } else {
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

  console.log("");
  console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  console.log("💁", `Server ready on`, `http://${hostname}:${port}`);
  console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  console.log("");
}

console.log("");
console.log("- - - - - - - - - - - - - - - - - - - - - - -");
console.log("⏱️ ", "Starting server");
console.log("- - - - - - - - - - - - - - - - - - - - - - -");
console.log("");

serve();
