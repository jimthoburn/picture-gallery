
# Picture Gallery _beta_

This is an experimental work in progress 🚧 

I’m using it to practice with new tools and to share photos with friends 🦊 🐶

* [Project goals](#goals)
* See [an example gallery](https://picture-gallery.glitch.me)
* Here’s a [visualization of the gallery’s state machine](https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0)
* Helpful [resources](#resources)

## How to make your own gallery

### Quick start

You can [remix this Glitch](https://glitch.com/edit/#!/picture-gallery) to make your own gallery 🎏

### Automation

If you have a lot of images, you can use this GitHub project to automatically generate different image sizes and data for your albums and then publish them as a static web site.

Here are the basic steps:

1. Install Node 12.13.0 LTS or newer  
https://nodejs.org

2. Clone this project with Git (or download it)

3. Add your pictures to the `/pictures/` folder, grouped by album name

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

4. Add information about your gallery and featured albums to `_data/index.json`

```
{
  "title": "Travel pictures",
  "date": "2016 to 2019",
  "albums": [
    "japan",
    "wildflowers"
  ]
}
```

5. Open your project folder in a terminal and install dependencies:

```
npm install
```

6. Create data and images files

```
npm run create
```

7. Start the server

```
npm start
```

7. Visit `http://localhost:5000`

To stop the server, press “control C”

### Editing

You can edit the `.json` files that were created for you in the `_data` folder.
For example, you may want to change the album names and add dates.

```
"title": "Japan in Winter",
"date": "February & March, 2016",
```

After you make changes, you may need to stop (press “control C”) and restart the server `npm start`.

It’s okay to commit the generated files in these folders:

```
_data
archives
pictures
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

This will automatically rebuild and publish your site as you push changes to your copy of this GitHub repository.

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
- [ ] Site is just as findable by search engines and [archivable](https://archive.org/) as it would be if it were made of static HTML pages
- [ ] First page renders as quickly as static HTML
- [ ] The application works well on a slow network
- [ ] The application has cues that are equivalent to a normal browsing experience, like a page loading indicator
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
