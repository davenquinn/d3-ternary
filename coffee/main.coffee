svg = d3.select 'body'
  .append 'svg'
  .attr
    width: 500
    height: 500

axes = svg.append('g').attr('id', 'axes')
plot = svg.append('g').attr('id', 'plot')

myTernary = ternaryPlot().range [0,400]
myAxes = ternaryAxes(myTernary)

gotData = (d) ->
  for type of d

    plot.append('path')
      .attr
        d: ->
          l = myTernary.line d[type], (d) ->
            [d.sand,d.silt,d.clay]
          l+'Z'
        class: 'ternary-line'
        id: type.replace(' ', '-')
      .on 'click', (d) ->
        console.log @id

myAxes
  .ticks()
  .minorTicks [ d3.range(0, 101, 5) ]
  .draw '#axes'

labels = ["Clay","Sand","Silt"]

width = 500
radius = width/Math.sqrt(3)
margin = 10
rad = radius + margin
offs = width/2+margin
angles = (a*Math.PI/180 for a in [0,-120,-240])

placeLabel = (d,i)->
  a = angles[i]
  d3.select @
    .attr
      x: offs+Math.sin(a)*rad
      y: offs-Math.cos(a)*rad

axes.selectAll ".vertexLabel"
  .data labels
  .enter()
    .append "text"
      .text (d) -> d
      .each placeLabel

d3.json 'data.json', gotData
