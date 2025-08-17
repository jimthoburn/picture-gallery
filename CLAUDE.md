# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development server** (with file watching):
```bash
deno task dev
```

**Production server**:
```bash
deno task start
```

**Build static site**:
```bash
deno task build
```

**Serve built static files locally**:
```bash
deno task file-server
```

**Tests** (Playwright):
```bash
npm test
# or
deno task test
```

**Content creation pipeline**:
```bash
deno task create        # Creates images, albums, and archives
deno task create:images # Generate responsive images from originals
deno task create:albums # Generate album data files
deno task create:archives # Create downloadable zip archives
```

## Architecture Overview

This is a **picture gallery web application** built with:
- **Deno runtime** with ES modules and import maps
- **Preact** for reactive UI components with server-side rendering
- **XState** for complex state machine-driven UI interactions
- **wasm-vips** for high-performance image processing

### Core Architecture Patterns

**State Management**: Uses XState finite state machine (`machines/gallery.js`) to handle complex gallery interactions including:
- Picture selection and navigation
- Smooth transitions between list and detail views
- Touch gestures and animations
- Browser history integration

**Server Architecture**: Dual-mode server (`server.js`) that can serve:
- Dynamic pages during development (`deno task dev`)
- Static files after build (`deno task file-server`)

**Data Flow**:
- Original images in `_pictures/{album}/original/`
- Generated responsive images and metadata via `deno task create:images`
- Album configurations in `_api/{album}.json`
- Combined data access through `data/album-by-url.js`

### Key Components

**Frontend**:
- `components/picture-gallery.js` - Main gallery state machine wrapper
- `components/picture-list.js` - Grid view of images
- `components/picture-details.js` - Full-screen image view
- `client.js` - Browser hydration entry point

**Backend**:
- `server.js` - Development server with dynamic routing
- `build.js` - Static site generator
- `get-source/by-url.js` - URL-to-content routing
- `data-file-system/albums-by-url.js` - File system data access

**Content Processing**:
- `create/images.js` - Generate responsive images using wasm-vips
- `create/albums.js` - Generate album data files (with optional AI descriptions)
- `create/archives.js` - Create downloadable zip files

### Configuration

- `_config.js` - Main configuration (server settings, build folders, redirects)
- `deno.jsonc` - Deno configuration with import maps and task definitions

### Picture Data Structure

Albums support:
- Multiple responsive image formats (AVIF, WebP, JPEG)
- Multiple sizes (16px to 6000px wide)
- EXIF metadata extraction
- Optional captions and descriptions
- Group albums (nested albums)
- Secret albums (unlisted)