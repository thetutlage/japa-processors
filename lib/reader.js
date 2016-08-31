'use strict'

/*
 * japa
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const fs = require('fs-extra')
const pify = require('pify')

const reader = exports = module.exports = {}

reader.walk = function (onPath, accept) {
  accept = accept || function () { return true }
  return new Promise((resolve, reject) => {
    const files = []
    fs.walk(onPath)
      .on('data', (item) => {
        if (accept(item)) files.push(item)
      })
      .on('end', () => resolve(files))
      .on('error', reject)
  })
}

reader.getContents = pify(fs.readFile)
