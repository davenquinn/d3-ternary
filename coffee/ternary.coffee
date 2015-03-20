path = undefined

d3.ternary = {}

line = (interpolator) ->
  if !interpolator
    interpolator = 'linear'
  path = d3.svg.line()
    .x (d) -> d[0]
    .y (d) -> d[1]
    .interpolate interpolator

d3.ternary.plot = ->

  outerWidth = 500
  outerHeight = 500
  margin =
    top: 50
    bottom: 50
    left: 50
    right: 50

  height = Math.sqrt(3)/2
  svg = null

  scale = d3.scale.linear()
    .domain [0,1]
    .range [0,1]

  rescaleView = ->
    return unless svg?
    svg.attr
      transform: "translate(#{margin.left},#{margin.top})"
      width: width
      height: height

    d3.select svg.node().parentElement
      .attr
        width: outerWidth
        height: outerHeight

    scale.range [0,400]

  T = (el)->
    svg_ = el
      .selectAll "svg"
      .data [null]
    svg = svg_.enter()
      .append "svg"
      .append "g"

    rescaleView()

  T.node = -> svg

  T.scale = scale

  T.margin = (m)->
    return margin unless m?
    margin = m
    return T

  T.point = (coords) ->
    pos = [0,0]
    sum = d3.sum coords
    if sum != 0
      normalized = coords.map (d) -> d / sum
      pos[0] = scale(normalized[1] + normalized[2] / 2)
      pos[1] = scale(height * (normalized[0] + normalized[1]))
    pos

  T.line = (coordsList, accessor, interpolator) =>
    #path generator wrapper
    line interpolator
    if !accessor
      accessor = (d) -> d

    positions = coordsList.map (d) =>
      T.point accessor(d)

    path positions

  T.rule = (value, axis) =>
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

    T.line ends

  # this inverse of point i.e. take an x,y positon and get the ternary coordinate

  T.getValues = (pos)->
    #NOTE! haven't checked if this works yet
    pos = pos.map(scale.inverse)
    c = 1 - pos[1]
    b = pos[0] - c / 2
    a = y - b
    [a,b,c]

  T.range = (range) -> T
  T.radius = (radius) -> T

  T.neatline = (el)->

    createPoint = (i)->
      a = [0,0,0]
      a[i] = 1
      a

    el.datum (createPoint(i) for i in [0..2])
      .attr
        class: "neatline"
        points: (d)->
          console.log d
          di = d.map (c)->
            i = myTernary.point c
            i.join(",")
          di.join(" ")
    el

  T
