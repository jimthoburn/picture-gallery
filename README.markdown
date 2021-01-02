
# Picture Gallery _beta_

This is a work in progress 🚧 

I’m using it to practice with new tools and to share photos with friends 🦊 🐶

* See [an example gallery](https://pictures.tobbi.co)
* Here’s a [visualization of the gallery’s state machine](https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0)
* [Project goals](#goals)
* Helpful [resources](#resources)

## How to make your own gallery

* [Quick start](#quick-start)
* [Creating a gallery](#creating-a-gallery)
* [Editing a gallery](#editing-a-gallery)
* [How to add a new album](#how-to-add-a-new-album)
* [How to publish your gallery](#how-to-publish-your-gallery)
* [Secret albums](#secret-albums)
* [Group albums](#group-albums)
* [Social sharing image](#social-sharing-image)
* [How to add a story about an album](#how-to-add-a-story-about-an-album)
* [Image file storage](#image-file-storage)

### Quick start

You can [remix this Glitch project](https://glitch.com/edit/#!/picture-gallery?path=glitch_README.markdown) to make your own gallery 🎏

### Creating a gallery

If you’d like to work locally instead of using Glitch–you can follow these steps to create images and data for your albums.

_NOTE: Some of these tools may only be available on macOS (in particular, ImageOptim and cavif)_

1. Install Node 14.15.3 LTS or newer
https://nodejs.org

2. Install ImageOptim
https://imageoptim.com

3. Install ImageMagick
https://imagemagick.org

4. [Clone this project](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) with Git (or download it)

5. Add your pictures to the `_pictures` folder, grouped by album name

```
_pictures/
    your-album/
        original/
            1.jpg
            2.jpg
            3.jpg
    your-other-album/
        original/
            1.jpg
            2.jpg
            3.jpg
```

You may also want to delete the example albums, and the LICENSE file:

```
japan
LICENSE
northern-lights
secret-recipes
wildflowers
```

_You can also make [groups of albums](#group-albums)._

6. Add information about your gallery and featured albums to `_api/index.json`

```
{
  "title": "A name for your gallery",
  "date": "2019 to 2020",
  "albums": [
    "your-album",
    "your-other-album"
  ]
}
```

You may also want to remove the `japan` and `wildflowers` examples from the list of albums.

7. Open your project folder in a terminal and install dependencies:

```
npm install
```

8. Create data and [responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

```
npm run create
```

9. Start the server

```
npm start
```

10. Visit `http://localhost:4000`

To stop the server, press “control C”

### Editing a gallery

You can edit the [JSON](https://www.json.org/json-en.html) files that were created for you in the `_api` folder:

```
_api/
    index.json
    your-album.json
    your-other-album.json
```

For example, you may want to change the `title` and add a `date` for each album:

```
"title": "A name for your album",
"date": "February & March, 2020",
```

To see your changes, you may need to stop the server (press “control C”) and then restart the server (`npm start`).

It’s okay to commit the generated files in these folders:

```
_api
_archives
_pictures
```

These files are your data and will only change if you re-run the `npm run create` script or edit them yourself.

### How to add a new album

1. Add your pictures to the `_pictures` folder:

```
_pictures/
    your-new-album/
        original/
            1.jpg
            2.jpg
            3.jpg
```

2. Create data for your new album:

```
npm run create
```

3. Edit the data file for your album (optional):

```
_api/
    your-new-album.json
```

3. Add your album to the `index.json` file to feature it on your gallery’s home page (optional):

```
{
  "title": "A name for your gallery",
  "date": "2019 to 2020",
  "albums": [
    "your-new-album"
  ]
}
```

### How to publish your gallery

The `build` command will create a `_site` folder that can be published on any web server.

```
npm run build
```

You can browse the static site locally with this command:

```
npm run serve
```

And then visit `http://localhost:4000`

You can publish your copy of this project to a static host like [Netlify](https://www.netlify.com/) using these settings:

Build command  
`npm run build`

Publish directory  
`_site/`

This will [automatically rebuild and publish your site](https://docs.netlify.com/site-deploys/create-deploys/#deploy-with-git) as you push changes to your copy of this GitHub repository.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jimthoburn/picture-gallery)

### Secret albums

If you want to publish an album to share with friends without making it public,
you can leave it out of the `api/index.json` file. That way, it won’t appear on the home page of your picture gallery site.

To make the album name hard to guess, you may want to include a [UUID](https://duckduckgo.com/?q=UUID+generator&t=ffab&ia=answer) as part of the name. For example:

```
your-secret-album-0c64f7ea-ad3d-4101-b379-fb5098aed301
```

You can also ask search engines not to index your album by setting `askSearchEnginesNotToIndex` to `true` in the `JSON` file for your album.

```
{
  "uri": "your-secret-album-0c64f7ea-ad3d-4101-b379-fb5098aed301",
  "title": "A name of your secret album",
  "date": "February & March, 2019",
  "askSearchEnginesNotToIndex": true,
}
```

This will add a [noindex](https://support.google.com/webmasters/answer/93710?hl=en) meta element to your page.

And you can ask search engines not to index your entire gallery (including the home page) by setting `askSearchEnginesNotToIndex` to `true` in the [_config.js](https://github.com/jimthoburn/picture-gallery/blob/master/_config.js) file:

```
"askSearchEnginesNotToIndex": true
```

If your gallery is stored in a public place like GitHub, it may also be a good idea to [make your repository private](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/about-repositories).

### Group albums

To group several albums together and show them on a single web page, create a
new folder using the name of your group–and place the albums inside it.

```
_pictures/
    your-group-of-related-albums/
        related-album/
            original/
                1.jpg
                2.jpg
                3.jpg
        another-related-album/
            original/
                1.jpg
                2.jpg
                3.jpg
```

And then visit `http://localhost:4000/your-group-of-related-albums/`

### Social sharing image

To make an [open graph image](https://ogp.me/) available for each page in your gallery, add your domain name to the [_config.js](https://github.com/jimthoburn/picture-gallery/blob/master/_config.js) file:

```
"host": "https://your-domain-name.com"
```

### How to add a story about an album

If you’d like to include some words about your album, create a [markdown](https://guides.github.com/features/mastering-markdown/) file with the same name as your album’s `.json` file and place it in the `_api` folder. For example:

```
_api/
    your-album.json
    your-album.markdown
```

Your story will appear along with the images, on the page for your album.

### Image file storage

You may want to use Git LFS, if your repository is getting close to 1 GB in size. See [GitHub disk quota](https://help.github.com/en/github/managing-large-files/what-is-my-disk-quota)

* https://git-lfs.github.com/  
* https://www.netlify.com/products/large-media/


#### How to move existing files into Git LFS

Here are some commands that I used to migrate large files to Git LFS, when they were already in my Git commit history.

```
$ git lfs migrate import --everything --include="*.jpg,*.jpeg,*.png,*.zip"
$ git status
$ git push --force-with-lease
```

## Snowpack

This project was originally created with _Snowpack 1_, and hasn’t yet been
migrated to [Snowpack 2](https://www.snowpack.dev/posts/2020-05-26-snowpack-2-0-release).

In the mean time, you can run this command to update the `web_modules` folder:

```
sh web_modules_build.sh
```

## State machine visualization

https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0

<a href="https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0" rel="nofollow"><img width="544" alt="xstate" src="https://user-images.githubusercontent.com/926616/68066254-8bd83b80-fcf2-11e9-8c77-6427061b98a9.png">
</a>

## <span id="goals"></span> Project goals

This project is an experiment to see how easily the following goals can be achieved in a [reactive](https://en.wikipedia.org/wiki/Reactive_programming) single-page application on the web…

User experience
- [x] Essential content/features are available in any web browser
- [x] Browser features (like forward/back and bookmarks) are supported
- [x] Site is just as accessible as it would be with static HTML and page refreshes
- [x] Site is just as findable by search engines and [archivable](https://archive.org/) as it would be if it were made of static HTML pages
- [x] First page renders as quickly as static HTML
- [x] The application works well on a slow network
- [x] The application has cues that are equivalent to a normal browsing experience, like a page loading indicator
- [x] The application is still usable when things go wrong, like if a CSS file doesn’t load or a JavaScript error happens
- [x] Gesture-driven animations and transitions between pages can be added

Editor experience
- [x] Content can be created with a simple language like markdown
- [x] Content can be added, edited and removed using a simple mechanism like files and folders
- [x] The gallery can be hosted anywhere and kept private, if desired

Developer experience
- [x] The application’s logic is easy to understand and reason about ([Thanks XState!](https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0))
- [x] Large features can be broken up into smaller components and modules
- [x] Code for templates and logic can be used on the client or server side
- [x] The application can be continuously deployed in a way that is reliable, scalable and secure
- [ ] New features can be added with confidence that things won’t break
- [ ] The code is easy to read
- [ ] The app can be ported to another framework without too much rework

## <span id="resources"></span> Helpful resources

These projects and guides have been super helpful to me, while working on the gallery…

* https://barrgroup.com/Embedded-Systems/How-To/State-Machines-Event-Driven-Systems
* https://barrgroup.com/Embedded-Systems/How-To/Introduction-Hierarchical-State-Machines
* https://xstate.js.org
* https://overreacted.io/a-complete-guide-to-useeffect/
* https://developers.google.com/web/fundamentals/web-components/
* https://hacks.mozilla.org/category/es6-in-depth/
* https://github.com/developit/htm
* https://www.pika.dev/

## <span id="license"></span> License

The code for this project is available under an [open source license](LICENSE).

The example photos and recipes are available under a [creative commons license](https://creativecommons.org/licenses/by-sa/4.0/).
