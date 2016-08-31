'use strict'

/*
* japa
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const _ = require('lodash')
const jsyaml = require('js-yaml')
const nunjucks = require('nunjucks')
const path = require('path')
const asciidoctor = require('asciidoctor.js')()

const config = require('../../lib/config')
const reader = require('../../lib/reader')
const writer = require('../../lib/writer')

const opal = asciidoctor.Opal
const processor = asciidoctor.Asciidoctor(true)
const asciiConfig = opal.hash({
  doctype: 'article',
  attributes: ['skip-front-matter', 'doctitle', 'preface-title']
})

/**
 *
 *
 * @class Docs
 */
class Docs {

  /**
   * Creates an instance of Docs.
   *
   * @param {any} sourceDir
   * @param {any} buildDir
   * @param {any} options
   * @param {any} data
   * @param {any} logger
   */
  constructor (sourceDir, buildDir, options, data, logger) {
    this.config = config.merge(options)
    this.data = data
    this.paths = config.makePaths(sourceDir, this.config.paths)
    this.nunjucks = nunjucks.configure(sourceDir)
    this.docsDestination = config.getDocsPath(buildDir, this.config.docs.namespace)
  }

  /**
   * Read contents for all the docs.
   *
   * @param {Array} - An array of fs.walk
   *
   * @returns {Array} - An array of docs content
   */
  readAll (docs) {
    return Promise.all(_.map(docs, (doc) => {
      return reader
        .getContents(doc.path, 'utf8')
        .then((contents) => {
          return {path: doc.path, contents}
        })
    }))
  }

  /**
   * Write compiled html to the destination path
   *
   * @param {Array} docs - An array of docs with their content
   *
   * @returns {Array} - An array of response or errors
   */
  writeAll (docs) {
    return Promise.all(_.map(docs, (doc) => {
      const compiledDoc = this.compileDoc(doc.contents)
      const compiledView = this.compileView(compiledDoc.html, compiledDoc.meta)
      const writeToPath = this.makeDestinationPath(doc.path, compiledDoc.meta.permalink)
      return writer.writeContents(writeToPath, compiledView)
    }))
  }

  /**
   * Makes destination path for a given doc. It also considers
   * the permalink inside the front matter.
   *
   * @param {String} docPath
   * @param {String} permalink
   *
   * @returns {String} - To be used as the final destination for writing contents
   */
  makeDestinationPath (docPath, permalink) {
    const pathToBuild = docPath.replace(this.paths.content, this.docsDestination)
    if (!permalink) {
      return pathToBuild.replace('adoc', 'html')
    }
    if (permalink.startsWith('/')) {
      return path.join(this.docsDestination, `${permalink}.html`)
    }
    return pathToBuild.replace(path.basename(pathToBuild), `${permalink}.html`)
  }

  /**
   * Compiles the docs view with the given content and
   * yaml front matter meta information
   *
   * @param {String} content
   * @param {Object} meta - Yaml front matter
   * @returns
   */
  compileView (content, meta) {
    content = this.nunjucks.filters.safe(content)
    const viewOptions = _.merge({}, meta, {content}, {$data: this.data})
    return this.nunjucks.render(this.config.docs.page, viewOptions)
  }

  /**
   * Compiles an ascii doc into html and also parses
   * yaml front matter.
   *
   * @param {String} contents - Ascii doc string
   *
   * @returns {Object} - Html and front matter
   */
  compileDoc (contents) {
    const doc = processor.$load(contents, asciiConfig)
    const frontMatter = doc.$attr('front-matter')
    const meta = typeof (frontMatter) === 'string' ? jsyaml.load(frontMatter) : {}
    meta.doctitle = doc.$attr('doctitle')
    return {meta: meta, html: doc.$content()}
  }

  /**
   * Process all the docs using the given
   * configuration.
   *
   * @returns
   */
  process () {
    return reader
      .walk(this.paths.content, (file) => {
        return file.stats.isFile() && file.path.endsWith('adoc')
      })
      .then(this.readAll.bind(this))
      .then(this.writeAll.bind(this))
  }
}

module.exports = Docs
