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

const writer = exports = module.exports = {}
writer.writeContents = pify(fs.outputFile)
