path = undefined

d3.ternary = {}
cos30 = Math.sqrt(3)/2

randomid = ->
    # random UID for namespaced event listeners
    text = ""
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    for i in [0..3]
      pos = Math.floor Math.random()*possible.length
      text += possible.charAt pos
    return text

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

  graticule = (plot)->
    # Can currently only be called against plot.
    # Should be able to call against axis as well.

    gratAxes = [0..2].map ->
      d3.svg.axis().tickValues majorTicks()

    axisGraticule = (axis,i)->

      container = d3.select @

      selA = container.selectAll "path.minor"
        .data minorTicks()
      selA.enter()
        .append "path"
          .attr class: "minor"

      selB = container.selectAll "path.major"
        .data majorTicks()
      selB.enter()
        .append "path"
          .attr class: "major"

      draw = ->
        axis.scale plot.scales[i]
        selA.attr d: plot.rule(i)
        selB.attr d: plot.rule(i)

      plot.on "resize.#{randomid()}", draw
      draw()

    plot.axes().selectAll ".graticule"
      .data gratAxes
      .enter()
        .append "g"
          .attr
            class: "graticule"
            'clip-path': "url(#axesClip)"
          .each axisGraticule

  graticule.axes = -> gratAxes

  graticule.majorInterval = (d)->
    return majorInterval unless d
    majorInterval = d
    return graticule

  graticule.minorInterval = (d)->
    return minorInterval unless d
    minorInterval = d
    return graticule

  graticule

d3.ternary.scalebars = (opts={})->
  console.log "Calling scalebar"
  plot = null
  labels = opts.labels or null
  axes = [0..2].map (i)->
    d3.svg.axis()
      .tickSize 10
      .tickFormat d3.format("%")
      .tickValues [.2,.4,.6,.8]
      .orient "top"

  adjustText = (d,i)->
    return unless i==2
    d3.select @
      .selectAll "text"
        .attr transform: (d)->
          y = d3.select(@).attr "y"
          "translate(0 #{-y}) rotate(-180 0 #{2*y})"

  formatLabel = (d,i)->
    console.log "Adding label "+d
    width = plot.width()
    dy = -30
    t = "translate(#{width/2})"
    if i == 2
      dy = 42
      t = " rotate(-180 0 0) translate(#{-width/2})"

    d3.select @
      .attr
        class: 'label'
        transform: t
        y: dy
        'text-anchor': 'middle'
      .text d


  scalebar = (p)->
    console.log "Adding scalebar to plot"
    plot = p
    # Can currently only be called against plot.
    # Should allow to call against single axis as well.

    b_axes = plot.axes().selectAll ".bary-axis"
      .data angles
      .enter()
        .append "g"
        .attr class: (d,i)->
            d = "bary-axis"
            if i == 2
              d += ' bottom'
            return d

    b_axes.each ->
      d3.select @
        .append 'text'
        .attr class: 'label'

    draw = ->
      axes.forEach (ax,i)->
        s = plot.scales[i].copy()
        if i == 2
          d = s.domain()
          s.domain d.reverse()
        ax.scale s

      r = plot.radius()
      offs = plot.center()

      b_axes
        .each (d,i)->
          el = d3.select @
          axes[i](el)
        .attr
          transform: (d,i)->
            x = offs[0]
            y = offs[1]
            "rotate(#{-60+i*120} #{x} #{y}) translate(0 #{r/2})"
        .each adjustText

      labelSel = plot.axes().selectAll '.bary-axis .label'
        .data labels
        .each formatLabel

    plot.on "resize.#{randomid()}", draw
    draw()

  scalebar.labels = (l)->
    return labels if not l?
    labels = l
    return scalebar

  scalebar.axes = axes

  scalebar


d3.ternary.vertexLabels = (labels)->
  # Builds labels at corners
  # Currently implemented only for apex vertices of triangle.
  sel = null
  rotate = [0,-60,60]
  pad = 20

  L = (plot)->
    # Provide three lables, clockwise from top

    verts = plot.vertices(pad)
    data = labels.map (l,i)->
      {label: l, vertex: verts[i]}

    sel = plot.axes()
      .selectAll ".vertex-label"
        .data data

    sel.enter()
      .append "text"
        .text (d) -> d.label
        .attr
          dy: ".35em"
          "text-anchor": "middle"
          class: "vertex-label"

    draw = ->
      sel.attr
        transform: (d,i)->
          [x,y] = d.vertex
          "translate(#{x},#{y})rotate(#{rotate[i]})"

    plot.on "resize.#{randomid()}", draw
    draw()
    sel
  L

d3.ternary.neatline = ->
  neatline = (plot)->
    el = plot.node().append "use"
      .attr
         class: 'neatline'
         "xlink:href":"#bounds"

  neatline

_plotBounds = (plot)->
  domains = plot.scales.map (s)->s.domain()
  console.log domains

  points = []

  for i in [0..2]
    v = i - 1
    v = 2 if v == -1

    a = domains.map (d)->d[0]
    a[v] = domains[v][1]
    points.push a

    a = domains.map (d)->d[0]
    a[i] = domains[i][1]
    points.push a

  _ = d3.select @
  el = _.select("#bounds")
  if not el.node()?
    el = _.append "polygon"

  el.datum points
    .attr id: 'bounds'

  draw = ->
    el.attr points: (d)->
      di = d.map (c)->
        i = plot.rawPoint c
        i.join(",")
      di.join(" ")

  plot.on "resize.#{randomid()}", draw
  draw()

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
  defs = null
  shouldClip = false

  callOnCreate = []

  # Create three identical scales
  scales = [0..2].map ->
    d3.scale.linear()
      .domain [0,1]
      .range [0,1]

  events = d3.dispatch "resize"

  innerWidth = (w)->
    w-margin.left-margin.right

  innerHeight = (h)->
    h-margin.top-margin.bottom

  rescaleView = ->
    width = innerWidth outerWidth unless width?
    height = innerHeight outerHeight unless height?
    radius = width/Math.sqrt(3) unless radius?

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
    for s in scales
      s.range [0,width]

    _plotBounds.call defs.node(), T
    if shouldClip
      plot.attr 'clip-path': "url(#axesClip)"

    events.resize()

  T = (el)->
    svg = el.append "g"

    defs = svg.append 'defs'
    axes = svg.append('g').attr 'id', 'axes'
    plot = svg.append('g').attr 'id', 'plot'

    rescaleView()

    defs.append 'clipPath'
      .attr id: 'axesClip'
      .append 'use'
        .attr 'xlink:href':"#bounds"

    console.log "Calling plot functions"
    callOnCreate.forEach (f)-> f(T)
    callOnCreate = []

  T.on = (n,f)->
    events.on n,f

  T.fit = (w,h)->
    if arguments.length == 2
      nw = innerWidth w
      nh = innerHeight h

      if nh <= cos30*nw
        r = nh*2/3
      else
        r = nw/Math.sqrt(3)

    else
      r = nw/Math.sqrt(3)
    T.radius r
    T

  T.node = -> svg
  T.axes = -> axes
  T.plot = -> plot
  T.call = (f)->
    if svg?
      f(T)
    else
      callOnCreate.push f
    T

  T.scales = scales

  T.margin = (m)->
    return margin unless m?
    if m.left?
      margin = m
    else
      margin =
        left: m
        right: m
        top: m
        bottom: m
    rescaleView()
    return T

  T.point = (coords) ->
    sum = d3.sum coords
    if sum != 0
      coords = coords.map (d) -> d / sum
    T.rawPoint coords

  T.rawPoint = (d)->
    return [0,0] if d3.sum(d) == 0
    [A,B,C] = scales
    [a,b,c] = d
    x = A(a)/2+B(b)
    y = B((1-a)*cos30)
    [x,y]

  T.value = ([x,y])->
    # Get barycentric coordinates from x,y location
    [A,B,C] = scales
    a = 1-B.invert(y)/cos30
    b = B.invert(x - A(a)/2)
    c = 1-a-b
    [a,b,c]

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
          [0, 1 - value, value]
          [1 - value, 0, value]
        ]
      else if axis == 1
        ends = [
          [0, value, 1 - value]
          [1 - value, value, 0]
        ]
      else if axis == 2
        ends = [
          [value, 0, 1 - value]
          [value, 1 - value, 0]
        ]
      T.path ends

  T.vertices = (pad=0)->
    # Method to get vertices
    # Currently only a getter
    rotate = [0,120,-120]
    rotate.map (d)->
      a = d*Math.PI/180
      x = width/2+Math.sin(a)*(radius+pad)
      y = radius-Math.cos(a)*(radius+pad)
      [x,y]

  T.range = (range) -> T
  T.radius = (r) ->
    # Changes the radius of the ternary diagram,
    # also adjusting inner and outer widths as needed.
    if r?
      radius = r
      height = r*3/2
      width = r*Math.sqrt(3)
      outerHeight = height+margin.top+margin.bottom
      outerWidth = width+margin.left+margin.right
      rescaleView()
    else
      return radius
    T
  T.center = -> [width/2,radius]
  T.height = ->
    return height
  T.width = ->
    return width
  T.clip = (c)->
    return shouldClip unless c?
    shouldClip = c
    return T
  T
