
# Picture Gallery _beta_

This is a work in progress 🚧 

I’m using it to practice with new tools and to share photos with friends 🦊 🐶

* See [an example gallery](https://pictures.tobbi.co)
* Here’s a [visualization of the gallery’s state machine](https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0)
* [Project goals](#goals)
* Helpful [resources](#resources)

## How to make your own gallery

### Quick start

You can [remix this Glitch](https://glitch.com/edit/#!/picture-gallery) to make your own gallery 🎏

### Automation

If you have a lot of images, you can use this GitHub project to automatically generate different image sizes and data for your albums and then publish them as a static web site.

Here are the basic steps:

1. Install Node 12.13.1 LTS or newer  
https://nodejs.org

2. Install GraphicsMagick  
http://www.graphicsmagick.org

3. Install ImageOptim  
https://imageoptim.com

4. [Clone this project](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) with Git (or download it)

5. Add your pictures to the `_pictures` folder, grouped by album name

```
_pictures/
    your-album-name/
        original/
            1.jpg
            2.jpg
            3.jpg
    your-other-album-name/
        original/
            1.jpg
            2.jpg
            3.jpg
```

6. Add information about your gallery and featured albums to `_api/index.json`

```
{
  "title": "Travel pictures",
  "date": "2016 to 2019",
  "albums": [
    "your-album-name",
    "your-other-album-name"
  ]
}
```

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

10. Visit `http://localhost:5000`

To stop the server, press “control C”

### Editing

You can edit the `.json` files that were created for you in the `_api` folder.
For example, you may want to change the album names and add dates.

```
"title": "Japan in Winter",
"date": "February & March, 2016",
```

After you make changes, you may need to stop (press “control C”) and restart the server `npm start`.

It’s okay to commit the generated files in these folders:

```
_api
_archives
_pictures
```

These files are your data and will only change if you re-run the `npm run create` script or edit them yourself.

### How to publish your gallery

The `build` command will create a `_site` folder that can be published on any web server.

```
npm run build
```

You can browse the static site with this command:

```
npm run serve
```

And then visit `http://localhost:5000`

You can publish your copy of this project to a static host like [Netlify](https://www.netlify.com/) using these settings:

Build command  
`npm run build`

Publish directory  
`_site/`

This will [automatically rebuild and publish your site](https://docs.netlify.com/site-deploys/create-deploys/#deploy-with-git) as you push changes to your copy of this GitHub repository.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jimthoburn/picture-gallery)

### Secret albums

If you want to publish an album to share with friends without making it public,
create a file called `_secret_albums.json` and add your album name to it (instead of adding it to the `index.json` file). That way, it won’t appear on the home page of your picture gallery site.

```
[
  "my-secret-album-name"
]
```

To make the album name hard to guess, you may want to include a [UUID](https://duckduckgo.com/?q=UUID+generator&t=ffab&ia=answer) as part of the name. For example:

```
[
  "my-secret-album-name-0c64f7ea-ad3d-4101-b379-fb5098aed301"
]
```

You can also ask search engines not to index your album by setting `hideFromSearchEngines` to `true` in the `JSON` file for your album.

```
{
  "uri": "my-secret-album-name-0c64f7ea-ad3d-4101-b379-fb5098aed301",
  "title": "My Secret Album",
  "date": "February & March, 2016",
  "hideFromSearchEngines": true,
}
```

This will add a [noindex](https://support.google.com/webmasters/answer/93710?hl=en) meta element to your page.

You may also want to make your repository [private](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/about-repositories), if your gallery is stored in a public place like GitHub.

### Image file storage

You may also want to use Git LFS, if your repository is getting close to 1 GB in size. See [GitHub disk quota](https://help.github.com/en/github/managing-large-files/what-is-my-disk-quota)

* https://git-lfs.github.com/  
* https://www.netlify.com/products/large-media/


#### How to move existing files into Git LFS

Here are some commands that I used to migrate large files to Git LFS, when they were already in my Git commit history.

```
$ git lfs migrate import --everything --include="*.jpg,*.png,*.zip"
$ git status
$ git push --force-with-lease
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
- [ ] Content can be created with a simple language like markdown
- [ ] Content can be added, edited and removed using a simple mechanism like files and folders
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

These projects and guides were super helpful to me while working on the gallery…

* https://barrgroup.com/Embedded-Systems/How-To/State-Machines-Event-Driven-Systems
* https://barrgroup.com/Embedded-Systems/How-To/Introduction-Hierarchical-State-Machines
* https://xstate.js.org
* https://overreacted.io/a-complete-guide-to-useeffect/
* https://developers.google.com/web/fundamentals/web-components/
* https://hacks.mozilla.org/category/es6-in-depth/
* https://github.com/developit/htm
* https://www.pika.dev/
