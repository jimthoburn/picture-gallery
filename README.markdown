
# Picture Gallery

1. Install Node 12.13.0 LTS  
https://nodejs.org/en/

2. Add albums and pictures to the `/pictures/` folder

```
| /pictures/
|-- /your-album-name/
|--|-- /original/
|--|--|-- /1.jpg
|--|--|-- /2.jpg
|--|--|-- /3.jpg
|-- /your-other-album-name/
|--|-- /original/
|--|--|-- /1.jpg
|--|--|-- /2.jpg
|--|--|-- /3.jpg
```

3. Add your album names to `albums.js`

```
export const albums = [
  "your-album-name",
  "your-other-album-name"
];
```

4. Repeat step 3 with `albums-cjs.js`

```
module.exports = [
  "your-album-name",
  "your-other-album-name"
]
```

5. Open a terminal and install dependencies:

```
$ npm install
```

6. Generate responsive images

```
$ npm run create:images
```

You may see some some an error message like this one:

```
[] The following tasks did not complete: default
[] Did you forget to signal async completion?
```

_This is okay._

7. Generate gallery files and start the server

```
npm start
```

8. Visit `http://localhost:5000/your-album-name/`



## How to move existing files into Git LFS

```
$ git lfs migrate import --everything --include="*.jpg,*.png,*.zip"
$ git status
$ git push --force-with-lease
```
