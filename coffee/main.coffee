svg = d3.select('body').append('svg').attr(
  width: 500
  height: 500)
axes = svg.append('g').attr('id', 'axes')
plot = svg.append('g').attr('id', 'plot')
myTernary = ternaryPlot().range([
  0
  400
])
myAxes = ternaryAxes(myTernary)

gotData = (d) ->
  for type of d

    f = ->
      type

    plot.append('path').attr(
      d: ->
        myTernary.line(d[type], (d) ->
          [
            d.sand
            d.silt
            d.clay
          ]
        ) + 'Z'
      'class': 'ternary-line'
      'id': type.replace(' ', '-')).on 'click', (d) ->
      console.log @id
      return
  return

myAxes.ticks().minorTicks([ d3.range(0, 101, 5) ]).draw '#axes'
d3.json 'data.json', gotData
