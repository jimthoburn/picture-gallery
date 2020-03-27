
import fs from "fs";

// Get files from the file system with the same API as fetch
function fetchFromFileSystem(url) {
  return new Promise((resolve, reject) => {
    const filePath = url.replace(/^\/api/,      "./_api")
                        .replace(/^\/pictures/, "./_pictures");

    if (!fs.existsSync(filePath)) {
      reject(new Error(`URL could not be resolved to a file path: ${filePath}`));
    }

    try {
      const text = fs.readFileSync(filePath, "utf8");

      resolve({
        text: () => text,
        ok: true,
        status: "File was found (file system)"
      });

    } catch(err) {
      reject(err);
    }
  });
}

export {
  fetchFromFileSystem
}
