'use strict'

/*
 * japa
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const config = require('../lib/config')
const chai = require('chai')
const assert = chai.assert

describe('Config', function () {
  it('should return default config when user config is empty', function () {
    const options = config.merge({})
    assert.deepEqual(options, {
      theme: 'default',
      docs: {
        namespace: 'docs',
        page: 'pages/docs.njk'
      },
      paths: {
        pages: 'pages',
        content: 'content'
      }
    })
  })

  it('should merge user config with default config', function () {
    const options = config.merge({theme: 'ocean'})
    assert.deepEqual(options, {
      theme: 'ocean',
      docs: {
        namespace: 'docs',
        page: 'pages/docs.njk'
      },
      paths: {
        pages: 'pages',
        content: 'content'
      }
    })
  })

  it('should merge deep properties from user config with default config', function () {
    const options = config.merge({paths: { pages: 'views' }})
    assert.deepEqual(options, {
      theme: 'default',
      docs: {
        namespace: 'docs',
        page: 'pages/docs.njk'
      },
      paths: {
        pages: 'views',
        content: 'content'
      }
    })
  })

  it('should return docs output dir based on the namespace', function () {
    const outputDir = config.getDocsPath('./build', 'docs')
    assert.equal(outputDir, 'build/docs')
  })
})
