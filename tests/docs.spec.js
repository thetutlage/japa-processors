'use strict'

/*
 * japa
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Docs = require('../src/Processors/Docs')
const reader = require('../lib/reader')
const chai = require('chai')
const path = require('path')
const fs = require('fs-extra')
const pify = require('pify')
const fileExists = pify(fs.stat)
const assert = chai.assert
require('co-mocha')

describe('Docs Processor', function () {
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
    const docs = new Docs(sourceDir, buildDir, {}, {})
    assert.deepEqual(docs.paths, {
      pages: path.join(sourceDir, 'pages'),
      content: path.join(sourceDir, 'content')
    })
  })

  it('should setup correct docs output path based on namespace', function () {
    const sourceDir = path.join(__dirname, './source')
    const buildDir = path.join(__dirname, './build')
    const docs = new Docs(sourceDir, buildDir, {}, {})
    assert.deepEqual(docs.docsDestination, path.join(buildDir, 'docs'))
  })

  it('should read all docs content and return an array of hash', function * () {
    const sourceDir = path.join(__dirname, './source')
    const buildDir = path.join(__dirname, './build')
    const docs = new Docs(sourceDir, buildDir, {}, {})
    const paths = [{path: path.join(__dirname, './sample/sample.adoc')}]
    const docsContent = yield docs.readAll(paths)
    assert.property(docsContent[0], 'path')
    assert.property(docsContent[0], 'contents')
    assert.equal(docsContent[0].path, paths[0].path)
  })

  it('should be able to compile an asciidoc', function * () {
    const sourceDir = path.join(__dirname, './source')
    const buildDir = path.join(__dirname, './build')
    const docs = new Docs(sourceDir, buildDir, {}, {})
    const doc = docs.compileDoc('http://asciidoctor.org[Asciidoctor]')
    assert.match(doc.html, /http:\/\/asciidoctor.org/)
    assert.match(doc.html, /Asciidoctor/)
  })

  it('should be able to compile an asciidoc with yaml front mater', function * () {
    const sourceDir = path.join(__dirname, './source')
    const buildDir = path.join(__dirname, './build')
    const docs = new Docs(sourceDir, buildDir, {}, {})
    const contents = yield reader.getContents(path.join(__dirname, './sample/sample.adoc'), 'utf-8')
    const doc = docs.compileDoc(contents)
    assert.deepEqual(doc.meta, {title: 'Firt Doc', doctitle: 'Hello World'})
  })

  it('should process a directory of files from source dir to build dir', function * () {
    const sourceDir = path.join(__dirname, './source')
    const buildDir = path.join(__dirname, './build')
    const docs = new Docs(sourceDir, buildDir, {}, {})
    yield docs.process()
    yield fileExists(path.join(buildDir, 'docs/hello.html'))
    yield fileExists(path.join(buildDir, 'docs/nested/overview.html'))
    yield fileExists(path.join(buildDir, 'docs/database.html'))
    yield fileExists(path.join(buildDir, 'docs/admin.html'))
  })
})
