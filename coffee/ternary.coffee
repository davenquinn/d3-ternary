test_data = [
  {
    a: 100
    b: 0
    c: 0
    color: '#F00'
  }
  {
    a: 0
    b: 100
    c: 0
    color: '#0F0'
  }
  {
    a: 0
    b: 0
    c: 100
    color: '#00F'
  }
  {
    a: 33
    b: 33
    c: 33
    color: '#999'
  }
]

ternaryPlot = ->
  ternary = {}
  height = Math.sqrt(1 * 1 - 1 / 2 * 1 / 2)
  path = undefined

  rescale = (range) ->
    if !range.length
      range = [
        0
        1
      ]
    ternary.scale = d3.scale.linear().domain([
      0
      1
    ]).range(range)
    return

  line = (interpolator) ->
    if !interpolator
      interpolator = 'linear'
    path = d3.svg.line().x((d) ->
      d[0]
    ).y((d) ->
      d[1]
    ).interpolate(interpolator)
    return

  rescale [
    0
    400
  ]
  line()

  ternary.range = (range) ->
    rescale range
    ternary

  #map teranry coordinate [a, b, c] to an [x, y] position

  ternary.point = (coords) ->
    pos = [
      0
      0
    ]
    sum = d3.sum(coords)
    if sum != 0
      normalized = coords.map((d) ->
        d / sum
      )
      pos[0] = ternary.scale(normalized[1] + normalized[2] / 2)
      pos[1] = ternary.scale(height * normalized[0] + height * normalized[1])
    pos

  #create an SVG path from a set of points

  ternary.line = (coordsList, accessor, interpolator) ->
    #path generator wrapper
    if interpolator
      line interpolator
    if !accessor

      accessor = (d) ->
        d

    positions = coordsList.map((d) ->
      ternary.point accessor(d)
    )
    path positions

  ternary.rule = (value, axis) ->
    console.log value, axis
    ends = []
    if axis == 0
      ends = [
        [
          value
          0
          100 - value
        ]
        [
          value
          100 - value
          0
        ]
      ]
    else if axis == 1
      ends = [
        [
          0
          value
          100 - value
        ]
        [
          100 - value
          value
          0
        ]
      ]
    else if axis == 2
      ends = [
        [
          0
          100 - value
          value
        ]
        [
          100 - value
          0
          value
        ]
      ]
    ternary.line ends

  # this inverse of point i.e. take an x,y positon and get the ternary coordinate

  ternary.getValues = (pos) ->
    #NOTE! haven't checked if this works yet
    pos = pos.map(ternary.scale.inverse)
    c = 1 - pos[1]
    b = pos[0] - c / 2
    a = y - b
    [
      a
      b
      c
    ]

  ternary

#//

ternaryAxes = (plot) ->
  axes = {}
  parent = d3.select('svg')
  defaultTicks = d3.range(0, 101, 25)
  ticks = [
    defaultTicks
    defaultTicks
    defaultTicks
  ]
  minorTicks = [
    []
    []
    []
  ]

  axes.draw = (parentSelector) ->
    if parentSelector
      parent = d3.select(parentSelector)
    minor = parent.append('g').attr('id', 'minor-ticks')
    major = parent.append('g').attr('id', 'major-ticks')
    #minor ticks
    i = 0
    while i < minorTicks.length
            j = 0
      while j < minorTicks[i].length
        minor.append('path').attr
          'class': 'ternary-tick minor'
          'd': plot.rule(minorTicks[i][j], i)
        j++
      i++
    #major ticks
    i = 0
    while i < ticks.length
            j = 0
      while j < ticks[i].length
        major.append('path').attr
          'class': 'ternary-tick'
          'd': plot.rule(ticks[i][j], i)
        j++
      i++
    return

  axes.ticks = (tickArrays) ->
    # an array containing 1 - 3 three arrays the first array will be copied over empty spaces at the end
    if !tickArrays
      tickArrays = [
        defaultTicks
        defaultTicks
        defaultTicks
      ]
    if !tickArrays[1]
      tickArrays[1] = tickArrays[0]
    if !tickArrays[2]
      tickArrays[2] = tickArrays[0]
    ticks = tickArrays
    axes

  axes.minorTicks = (tickArrays) ->
    if !tickArrays
      tickArrays = [
        []
        []
        []
      ]
    if !tickArrays[1]
      tickArrays[1] = tickArrays[0]
    if !tickArrays[2]
      tickArrays[2] = tickArrays[0]
    minorTicks = tickArrays
    axes

  axes
