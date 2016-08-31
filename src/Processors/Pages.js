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
const nunjucks = require('nunjucks')
const config = require('../../lib/config')
const reader = require('../../lib/reader')
const writer = require('../../lib/writer')

/**
 * Pages processor for Japa. It converts a bunch of
 * static pages into compiled html views.
 *
 * @class Pages
 */
class Pages {

  constructor (sourceDir, buildDir, options, data, logger) {
    this.config = config.merge(options)
    this.data = data
    this.paths = config.makePaths(sourceDir, this.config.paths)
    this.nunjucks = nunjucks.configure(sourceDir)
    this.sourceDir = sourceDir
    this.buildDir = buildDir
  }

  /**
   * Writes all docs to the buildDir
   *
   * @param {Array} pages
   *
   * @returns {Array} - An array of write statuses
   */
  writeAll (pages) {
    return Promise.all(_.map(pages, (page) => {
      const compiledView = this.compileView(page.path, {})
      const writeToPath = this.makeDestinationPath(page.path)
      return writer.writeContents(writeToPath, compiledView)
    }))
  }

  /**
   * Compiles a view and returns html.
   *
   * @param {String} viewPath
   * @param {Object} meta
   *
   * @returns
   */
  compileView (viewPath, meta) {
    const viewOptions = _.merge({}, meta, {$data: this.data})
    const relativePath = viewPath.replace(`${this.config.sourceDir}/`, '')
    return this.nunjucks.render(relativePath, viewOptions)
  }

  /**
   * Makes destination path for a given page.
   *
   * @param {String} pagePath
   *
   * @returns {String}
   */
  makeDestinationPath (pagePath) {
    const pathToBuild = pagePath.replace(this.paths.pages, this.buildDir)
    return pathToBuild.replace('njk', 'html')
  }

  /**
   * Process a bunch of nunjucks views into
   * static html pages.
   *
   * @returns
   */
  process () {
    return reader
      .walk(this.paths.pages, (file) => {
        return file.stats.isFile() && !file.path.endsWith(this.config.docs.page)
      })
      .then(this.writeAll.bind(this))
  }
}

module.exports = Pages
