class TernaryPlot
  constructor: ->

  create: (el)=>
    svg = el
      .selectAll "svg"
      .data [null]
    @svg = svg.enter()
      .append "svg"
      .append "g"

ternaryPlot = ->

  ternary = new TernaryPlot

  height = Math.sqrt(1 * 1 - 1 / 2 * 1 / 2)
  path = undefined

  rescale = (range) ->
    if !range.length
      range = [0,1]
    ternary.scale = d3.scale.linear()
      .domain [0,1]
      .range range

  line = (interpolator) ->
    if !interpolator
      interpolator = 'linear'
    path = d3.svg.line()
      .x (d) -> d[0]
      .y (d) -> d[1]
      .interpolate interpolator

  rescale [0,400]

  ternary.range = (range) ->
    rescale range
    ternary

  ternary.margin = (margin) ->
    ternary

  ternary.radius = (radius) ->
    ternary

  ternary.point = (coords) ->
    pos = [0,0]
    sum = d3.sum coords
    if sum != 0
      normalized = coords.map (d) -> d / sum
      pos[0] = ternary.scale(normalized[1] + normalized[2] / 2)
      pos[1] = ternary.scale(height * normalized[0] + height * normalized[1])
    pos

  #create an SVG path from a set of points

  ternary.line = (coordsList, accessor, interpolator) ->
    #path generator wrapper
    line interpolator
    if !accessor
      accessor = (d) -> d

    positions = coordsList.map (d) ->
      ternary.point accessor(d)

    path positions

  ternary.rule = (value, axis) ->
    ends = []
    if axis == 0
      ends = [
        [value, 0, 1 - value]
        [value, 1 - value, 0]
      ]
    else if axis == 1
      ends = [
        [0, value, 1 - value]
        [1 - value, value, 0]
      ]
    else if axis == 2
      ends = [
        [0, 1 - value, value]
        [1 - value, 0, value]
      ]

    ternary.line ends

  # this inverse of point i.e. take an x,y positon and get the ternary coordinate

  ternary.getValues = (pos) ->
    #NOTE! haven't checked if this works yet
    pos = pos.map(ternary.scale.inverse)
    c = 1 - pos[1]
    b = pos[0] - c / 2
    a = y - b
    [a,b,c]

  ternary

