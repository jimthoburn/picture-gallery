
function fetchText({url, fetch}) {
  return new Promise((resolve, reject) => {
    let response;
    fetch(url)
      .then(r => {
        response = r;
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(resolve)
      .catch(error => {
        console.error(error);
        console.log({ url });
        if (response) {
          console.log({ responseStatus: response.status });
        }
        resolve(null);
      });
  });
}

function fetchJSON({url, fetch}) {
  return new Promise(async (resolve, reject) => {
    const text = await fetchText({url, fetch});
    try {
      const json = JSON.parse(text);
      resolve(json);
    } catch(error) {
      console.error(error);
      resolve(null);
    }
  });
}


export {
  fetchJSON,
  fetchText
}
