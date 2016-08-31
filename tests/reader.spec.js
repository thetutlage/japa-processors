'use strict'

/*
 * japa
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const reader = require('../lib/reader')
const chai = require('chai')
const path = require('path')
const assert = chai.assert
require('co-mocha')

describe('Reader', function () {
  it('should return an array of files from a given dir', function * () {
    const files = yield reader.walk(path.join(__dirname, './sample'))
    assert.lengthOf(files, 3)
  })

  it('should be able to pass a callback to filter the files', function * () {
    const files = yield reader.walk(path.join(__dirname, './sample'), function (file) {
      return file.path.endsWith('adoc')
    })
    assert.lengthOf(files, 1)
  })
})
