
# Picture Gallery

## How to create a gallery

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


## How to publish a gallery

The above steps will create a `_site` folder that can be published on any server.

For example, you can auto-deploy a GitHub repo to Netlify and use these deploy settings:

Build command  
`npm run build`

Publish directory  
`_site/`

You may also want to use Git LFS:  
https://git-lfs.github.com/  
https://www.netlify.com/products/large-media/


## How to move existing files into Git LFS

```
$ git lfs migrate import --everything --include="*.jpg,*.png,*.zip"
$ git status
$ git push --force-with-lease
```
