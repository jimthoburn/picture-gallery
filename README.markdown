
# Picture Gallery

This project is an experiment to see if it’s possible to achieve the following goals in a modern web app–providing a good experience for users, editors and developers…

User experience
- [x] Essential content/features are available in any web browser
- [x] Browser features (like forward/back and bookmarks) are supported
- [x] Site is just as accessible as it would be with static HTML and page refreshes
- [x] Site is just as findable by search engines and the web archive as it would be if was made of static HTML pages
- [x] First page renders as quickly as static HTML
- [x] Templates can be used on the client or server side
- [x] Large features can be broken up into smaller components and modules
- [x] Gesture-driven animations and transitions between pages can be added

Editor experience
- [ ] Content can be created with a simple language like markdown
- [ ] Content can be added, edited and removed using a simple mechanism like files and folders
- [x] The gallery can be hosted anywhere and kept private, if desired

Developer experience
- [x] The application’s logic is easy to understand and reason about (thanks to the [XState Visualizer](
https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0)!)
- [x] The application can be easily deployed in a way that is reliable, scalable and secure
- [ ] New features can be added with confidence that things won’t break
- [ ] The code is easy to read
- [ ] The app can be ported to another framework without too much rework


## How to create a gallery

1. Install Node 12.13.0 LTS or newer
https://nodejs.org/en/

2. Add albums and pictures to the `/pictures/` folder

```
/pictures/
    /your-album-name/
        /original/
            /1.jpg
            /2.jpg
            /3.jpg
    /your-other-album-name/
        /original/
            /1.jpg
            /2.jpg
            /3.jpg
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

You may see an error message like this one:

```
[] The following tasks did not complete: default
[] Did you forget to signal async completion?
```

This is _probably_ okay. The images should still be generated.

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

## State machine visualization

https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0

<a href="https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0" rel="nofollow"><img src="https://user-images.githubusercontent.com/926616/68065699-40ba2a80-fcea-11e9-889f-3fee08ea35a0.png" alt="xstate" width="400"></a>
