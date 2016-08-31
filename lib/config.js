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
const path = require('path')

const defaultConfig = {
  theme: 'default',
  docs: {
    namespace: 'docs',
    page: 'pages/docs.njk'
  },
  paths: {
    pages: 'pages',
    content: 'content'
  }
}

const config = exports = module.exports = {}

config.merge = function (userConfig) {
  return _.merge({}, defaultConfig, userConfig)
}

config.makePaths = function (sourceDir, dirs) {
  return _.transform(dirs, (result, dir, key) => {
    result[key] = path.join(sourceDir, dir)
    return result
  }, {})
}

config.getDocsPath = function (buildDir, namespace) {
  return path.join(buildDir, namespace)
}
