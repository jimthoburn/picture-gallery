#!/bin/sh

# This project was originally created with “Snowpack 1”, and hasn’t yet been
# migrated to [Snowpack 2](https://www.snowpack.dev/posts/2020-05-26-snowpack-2-0-release).

# This workaround is meant to configure “Snowpack 2” so it will only process
# the `install` files in package.json
# (by running it in a folder without any project files)

# The `exclude` option might be the best way solve this:
# https://www.snowpack.dev/#all-config-options
# Maybe with something like this? "exclude": ["*"]
# This didn’t seem to work out in Snowpack 2.9.0

mkdir temp_for_snowpack_2
mv node_modules temp_for_snowpack_2
mv web_modules temp_for_snowpack_2
mv package.json temp_for_snowpack_2
cd temp_for_snowpack_2
npm run snowpack
mv node_modules ../
mv web_modules ../
mv package.json ../
cd ../
rmdir temp_for_snowpack_2
