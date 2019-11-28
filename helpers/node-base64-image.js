/*

The MIT License (MIT)

Copyright (c) 2016 Riyadh Al Nur <riyadhalnur@verticalaxisbd.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// The original NPM package is available at:
// https://www.npmjs.com/package/node-base64-image
// (Not using due to lodash security vulnerability)
// "node-base64-image": "^1.0.6",

// 1) Copied from: https://github.com/riyadhalnur/node-base64-image/blob/master/src/node-base64-image.js
// 2) Converted to JS by https://www.typescriptlang.org/play/?target=6

/* @flow */
import request from 'request';
import _ from 'lodash';
import { readFile as read, writeFile as write } from 'fs';
/**
 *  Encodes a remote or local image to Base64 encoded string or Buffer
 *
 *  @name encode
 *  @param {string} url - URL of remote image or local path to image
 *  @param {Object} [options={}] - Options object for extra configuration
 *  @param {boolean} options.string - Returns a Base64 encoded string. Defaults to Buffer object
 *  @param {boolean} options.local - Encode a local image file instead of a remote image
 *  @param {fnCallback} callback - Callback function
 *  @todo Option to wrap string every 76 characters for strings larger than 76 characters
 *  @return {fnCallback} - Returns the callback
 */
export function encode(url, options = { string: false, local: false }, callback) {
    if (_.isUndefined(url) || _.isNull(url) || !_.isString(url)) {
        return callback(new Error('URL is undefined or not properly formatted'));
    }
    if (options.local) {
        read(url, (err, body) => {
            if (err) {
                return callback(err);
            }
            /**
             * @todo Handle this better.
             */
            let result = options.string ? body.toString('base64') : new Buffer(body, 'base64');
            return callback(null, result);
        });
    }
    else {
        request({ url: url, encoding: null }, (err, response, body) => {
            if (err) {
                return callback(err);
            }
            if (!body) {
                return callback(new Error('Error retrieving image - Empty Body!'));
            }
            if (body && response.statusCode === 200) {
                /**
                 * @todo Handle this better.
                 */
                let result = options.string ? body.toString('base64') : new Buffer(body, 'base64');
                return callback(null, result);
            }
            return callback(new Error('Error retrieving image - Status Code ' + response.statusCode));
        });
    }
}
/**
 *  Decodes an base64 encoded image buffer and saves it to disk
 *
 *  @name decode
 *  @param {Buffer} imageBuffer - Image Buffer object
 *  @param {Object} [options={}] - Options object for extra configuration
 *  @param {string} options.filename - Filename for the final image file
 *  @param {fnCallback} callback - Callback function
 *  @return {fnCallback} - Returns the callback
 */
export function decode(imageBuffer, options = { filename: 'saved-image' }, callback) {
    if (!_.isBuffer(imageBuffer)) {
        return callback(new Error('The image is not a Buffer object type'));
    }
    write(options.filename + '.jpg', imageBuffer, 'base64', (err) => {
        if (err) {
            return callback(err);
        }
        return callback(null, 'Image saved successfully to disk!');
    });
}
const base64 = {
    encode: encode,
    decode: decode
};
export default base64;
