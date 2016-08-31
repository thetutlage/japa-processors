'use strict'

/*
 * japa
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Pages = require('../src/Processors/Pages')
const chai = require('chai')
const path = require('path')
const fs = require('fs-extra')
const pify = require('pify')
const fileExists = pify(fs.stat)
const assert = chai.assert
require('co-mocha')

describe('Pages', function () {
  before(function * () {
    const ensureDir = pify(fs.ensureDir)
    yield ensureDir(path.join(__dirname, './build'))
  })

  after(function * () {
    const emptyDir = pify(fs.emptyDir)
    yield emptyDir(path.join(__dirname, './build'))
  })

  it('should setup correct paths on initialization', function () {
    const sourceDir = path.join(__dirname, './source')
    const buildDir = path.join(__dirname, './build')
    const pages = new Pages(sourceDir, buildDir, {}, {})
    assert.deepEqual(pages.paths, {
      pages: path.join(sourceDir, 'pages'),
      content: path.join(sourceDir, 'content')
    })
  })

  it('should process a directory of files from source dir to build dir', function * () {
    const sourceDir = path.join(__dirname, './source')
    const buildDir = path.join(__dirname, './build')
    const pages = new Pages(sourceDir, buildDir, {}, {})
    yield pages.process()
    yield fileExists(path.join(buildDir, 'home.html'))
  })
})
