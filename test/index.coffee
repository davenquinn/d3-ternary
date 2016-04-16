_ = require 'underscore'
{assert} = require 'chai'

global.d3 = require 'd3'
require '../src/ternary'

describe 'testing suite', ->
  it 'is alive', -> assert true

describe 'ternary', ->

  ternary = d3.ternary.plot()
  ternary.scales[0].domain [0.4,1]
  ternary.scales[1].domain [0,0.6]
  ternary.scales[2].domain [0.6,0]
  ternary.fit 500,500

  it "has a width", ->
    assert ternary.width() > 0

  coords = [0.1,0.5,0.4]
  pt = ternary.rawPoint coords

  describe ".point", ->
    res = ternary.point coords

    it "is two-member array",->
      assert res.length == 2

    it "should return the same value
        as rawPoint for coordinates
        summing to 1", ->
      assert.deepEqual res, pt

  describe ".value", ->

    it "should return the
        correct barycentric
        coordinates", ->
      res = ternary.value pt
      for [a,b] in _.zip coords,res
        assert a-b < 0.0001

