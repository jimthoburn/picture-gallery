// 1) Update this map to match layouts/default.js
// 2) Paste this script into a browser console
// 3) Use the response to update layouts/default.js
const importMap = {
  "htm": "https://esm.sh/htm@3.1.1",
  "lit": "https://esm.sh/lit@3.3.3",
  "markdown-it": "https://esm.sh/markdown-it@15.0.3",
  "markdown-it-deflist": "https://esm.sh/markdown-it-deflist@3.0.1",
  "preact": "https://esm.sh/preact@11.0.2",
  "preact/": "https://esm.sh/preact@11.0.2/",
  "react": "https://esm.sh/preact@11.0.2/compat",
  "preact-render-to-string": "https://esm.sh/preact-render-to-string@6.8.1?external=preact",
  "xstate": "https://esm.sh/xstate@5.33.3",
  "@xstate/react": "https://esm.sh/@xstate/react@6.1.0?external=react,xstate"
}

async function sri(url) {
  const res = await fetch(url);
  if (res.type === "opaque") {
    throw new Error("Cross-origin response without CORS — body is unreadable");
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const bytes = await res.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-512", bytes);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));

  return `sha512-${base64}`;
}

const integrityMap = {};

for (const url of Object.values(importMap)) {
  integrityMap[url] = await sri(url);
}

console.log(JSON.stringify(integrityMap));
