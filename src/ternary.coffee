path = undefined

d3.ternary = {}

line = (interpolator) ->
  if !interpolator
    interpolator = 'linear'
  path = d3.svg.line()
    .x (d) -> d[0]
    .y (d) -> d[1]
    .interpolate interpolator

angles = [0,120,240]

d3.ternary.graticule = ->
  majorInterval = 0.1
  minorInterval = null

  majorTicks = ->
    ticks = []
    int = majorInterval
    start = int
    while start < 1
      ticks.push start
      start += int
    ticks

  minorTicks = ->
    ticks = []
    return ticks unless minorInterval?
    start = minorInterval
    while start < 1
      if start%majorInterval != 0
        ticks.push start
      start += minorInterval
    ticks

  gratAxis = d3.svg.axis()
    .tickValues majorTicks()


  graticule = (plot)->
    # Can currently only be called against plot.
    # Should be able to call against axis as well.
    gratAxis.scale plot.scale

    axisGraticule = (axis,i)->

      container = d3.select @

      sel = container.selectAll "path.minor"
        .data minorTicks()
      sel.enter()
        .append "path"
          .attr
            class: "minor"
            d: plot.rule(i)

      sel = container.selectAll "path.major"
        .data majorTicks()
      sel.enter()
        .append "path"
          .attr
            class: "major"
            d: plot.rule(i)

    plot.axes().selectAll ".graticule"
      .data [gratAxis,gratAxis,gratAxis]
      .enter()
        .append "g"
          .attr class: "graticule"
          .each axisGraticule

  graticule.axis = -> gratAxis

  graticule.majorInterval = (d)->
    return majorInterval unless d
    majorInterval = d
    return graticule

  graticule.minorInterval = (d)->
    return minorInterval unless d
    minorInterval = d
    return graticule

  graticule

d3.ternary.scalebars = ->
  baryAxis = d3.svg.axis()
    .tickSize 10
    .tickFormat d3.format("%")
    .tickValues [.2,.4,.6,.8]
    .orient "top"

  adjustText = (d,i)->
    return unless i==1
    d3.select @
      .selectAll "text"
        .attr transform: (d)->
          y = d3.select(@).attr "y"
          "translate(0 #{-y}) rotate(-180 0 #{2*y})"

  scalebar = (plot)->
    # Can currently only be called against plot.
    # Should allow to call against single axis as well.
    baryAxis.scale plot.scale
    r = plot.radius()

    offs = plot.center()
    b_axes = plot.axes().selectAll ".bary-axis"
      .data angles
      .enter()
        .append "g"
        .attr
          class: "bary-axis"
          transform: (d,i)->
            x = offs[0]
            y = offs[1]
            "rotate(#{60+i*120} #{x} #{y}) translate(0 #{r/2})"
        .call baryAxis
        .each adjustText

  scalebar

d3.ternary.vertexLabels = (labels)->
  # Builds labels at corners
  # Currently implemented only for apex vertices of triangle.
  sel = null
  rotate = [0,60,-60]
  pad = 20

  labels = (plot)->
    # Provide three lables, clockwise from top
    sel = plot.axes()
      .selectAll ".vertex-label"

    offs = plot.center()
    radius = plot.radius()

    data = labels.map (l,i)->
      {label: l, angle: angles[i]}
    sel
      .data data
      .enter()
        .append "text"
          .text (d) -> d.label
          .attr
            dy: ".35em"
            "text-anchor": "middle"
            class: "vertex-label"
            transform: (d,i)->
              a = -d.angle*Math.PI/180
              console.log a
              x = offs[0]+Math.sin(a)*(radius+pad)
              y = offs[1]-Math.cos(a)*(radius+pad)
              "translate(#{x},#{y})rotate(#{rotate[i]})"
    sel
  labels

d3.ternary.neatline = ->

  createPoint = (i)->
    a = [0,0,0]
    a[i] = 1
    a
  neatline = (plot)->
    el = plot.node().append "polygon"
    el.datum (createPoint(i) for i in [0..2])
      .attr
        class: "neatline"
        points: (d)->
          di = d.map (c)->
            i = plot.point c
            i.join(",")
          di.join(" ")

  neatline

d3.ternary.plot = ->

  outerWidth = 500
  outerHeight = 500
  margin =
    top: 50
    bottom: 50
    left: 50
    right: 50
  radius = null

  height = null
  width = null
  svg = null
  axes = null
  plot = null

  callOnCreate = []

  scale = d3.scale.linear()
    .domain [0,1]
    .range [0,1]

  rescaleView = ->
    width = outerWidth-margin.left-margin.right
    height = outerHeight-margin.top-margin.bottom
    radius = width/Math.sqrt(3)
    center = [width/2,radius]
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

    axes = svg.append('g').attr 'id', 'axes'
    plot = svg.append('g').attr 'id', 'plot'

    rescaleView()

    callOnCreate.forEach (f)-> f(T)
    callOnCreate = []

  T.node = -> svg
  T.axes = -> axes
  T.plot = -> plot
  T.call = (f)->
    if svg?
      f(T)
    else
      callOnCreate.push f
    T

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
      pos[1] = scale(Math.sqrt(3)/2 * (normalized[0] + normalized[1]))
    pos

  T.path = (coordsList, accessor, interpolator) =>
    #path generator wrapper
    line interpolator
    if !accessor
      accessor = (d) -> d

    positions = coordsList.map (d) =>
      T.point accessor(d)

    path(positions)+"Z"

  T.rule = (axis) ->
    (value)->
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
      T.path ends
  # this inverse of point i.e. take an x,y positon and get the ternary coordinate

  T.getValues = (pos)->
    #NOTE! haven't checked if this works yet
    pos = pos.map(scale.inverse)
    c = 1 - pos[1]
    b = pos[0] - c / 2
    a = y - b
    [a,b,c]

  T.range = (range) -> T
  T.radius = (r) ->
    return radius unless r?
    T
  T.center = -> [width/2,radius]

  T
