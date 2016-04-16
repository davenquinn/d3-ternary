_ = require 'underscore'
{assert} = require 'chai'

global.d3 = require 'd3'
require '../src/ternary'

describe 'testing suite', ->
  it 'is alive', -> assert true

describe 'ternary', ->

  [width,height] = [500,500]
  T = d3.ternary.plot()
    .margin 0
    .fit width,height
  T.scales[0].domain [0.4,1]
  T.scales[1].domain [0,0.6]
  T.scales[2].domain [0.6,0]

  it "has the correct width", ->
    assert.equal T.width(),500

  describe ".vertices", ->
    it "maps vertices to the expected positions", ->
      cos30 = Math.sqrt(3)/2
      expected = [
        [width/2,0]
        [width,height*cos30]
        [0,height*cos30]
      ]
      verts = T.vertices()
      delta = 0.0001
      for [ex,v] in _.zip(expected,verts)
        assert.closeTo ex[0],v[0],delta
        assert.closeTo ex[1],v[1],delta

  coords = [0.1,0.5,0.4]
  pt = T.rawPoint coords

  describe ".point", ->
    res = T.point coords

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
      res = T.value pt
      for [a,b] in _.zip coords,res
        assert a-b < 0.0001

  it "propagates geometry resets", ->
    T.margin 50
    assert.equal T.margin().left, 50
    T.margin 0
    assert.equal T.radius(),500/Math.sqrt(3)

