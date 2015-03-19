path = undefined

line = (interpolator) ->
  if !interpolator
    interpolator = 'linear'
  path = d3.svg.line()
    .x (d) -> d[0]
    .y (d) -> d[1]
    .interpolate interpolator


class TernaryPlot
  constructor: ->
    @height = Math.sqrt(3)/2
    @rescale [0,400]
    @svg = null

  create: (el)=>
    svg = el
      .selectAll "svg"
      .data [null]
    @svg = svg.enter()
      .append "svg"
      .append "g"

  margin: (m)=>
    return @margin unless m?
    @margin = m
    return @

  point: (coords) =>
    pos = [0,0]
    sum = d3.sum coords
    if sum != 0
      normalized = coords.map (d) -> d / sum
      pos[0] = @scale(normalized[1] + normalized[2] / 2)
      pos[1] = @scale(@height * (normalized[0] + normalized[1]))
    pos

  line: (coordsList, accessor, interpolator) =>
    #path generator wrapper
    line interpolator
    if !accessor
      accessor = (d) -> d

    positions = coordsList.map (d) =>
      @point accessor(d)

    path positions

  rescale: (range) =>
    if !range.length
      range = [0,1]
    @scale = d3.scale.linear()
      .domain [0,1]
      .range range

  rule: (value, axis) =>
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

    @line ends

  # this inverse of point i.e. take an x,y positon and get the ternary coordinate

  getValues: (pos) =>
    #NOTE! haven't checked if this works yet
    pos = pos.map(@scale.inverse)
    c = 1 - pos[1]
    b = pos[0] - c / 2
    a = y - b
    [a,b,c]

  range: (range) => @
  margin: (margin) => @
  radius: (radius) => @

ternaryPlot = ->

  ternary = new TernaryPlot
  ternary

