margin =
  top: 50
  bottom: 50
  left: 50
  right: 50

outerWidth = 500
outerHeight = 500

width = outerWidth-margin.left-margin.right
height = outerHeight-margin.top-margin.bottom

myTernary = d3.ternary.plot()
  .range [0,width]

d3.select 'body'
  .call myTernary

svg = myTernary.node()

gotData = (d) ->
  for type of d

    myTernary.plot()
      .append 'path'
      .attr
        d: ->
          myTernary.line d[type], (d) ->
            [d.sand,d.silt,d.clay]
        class: 'ternary-line'
        id: type.replace(' ', '-')
      .on 'click', (d) ->
        console.log @id

labels = ["Clay","Sand","Silt"]
myTernary.vertexLabels labels

radius = width/Math.sqrt(3)
pad = 20
offs = [width/2,radius]
angles = [0,120,240]
anchors = ["middle","end","start"]
rotate = [0,60,-60]

baryAxis = d3.svg.axis()
  .scale myTernary.scale
  .tickSize 10
  .tickFormat d3.format("%")
  .tickValues [.2,.4,.6,.8]
  .orient "top"

b_axes = myTernary.axes().selectAll ".bary-axis"
  .data angles
  .enter()
    .append "g"
    .attr
      class: "bary-axis"
      transform: (d,i)->
        x = offs[0]
        y = offs[1]
        "rotate(#{60+i*120} #{x} #{y}) translate(0 #{radius/2})"
    .call baryAxis
    .each (d,i)->
      return unless i==1
      d3.select @
        .selectAll "text"
          .attr transform: (d)->
            y = d3.select(@).attr "y"
            "translate(0 #{-y}) rotate(-180 0 #{2*y})"

ticks = baryAxis.tickValues()

ticks = []
int = 0.05
start = int
while start < 1
  ticks.push start
  start += int

gratAxis = d3.svg.axis()
  .scale myTernary.scale
  .tickValues ticks

myTernary.axes().selectAll ".graticule"
  .data [gratAxis,gratAxis,gratAxis]
  .enter()
    .append "g"
      .attr
        class: "graticule"
      .each (d,i)->
        d3.select @
          .selectAll "path"
            .data d.tickValues()
            .enter()
              .append "path"
                .attr
                  class: (d)->
                    if d*100%20 < 0.00001 then "major" else "minor"
                  d: (d)->
                    a = myTernary.rule d,i
                    a+"Z"



svg.append "polygon"
  .call myTernary.neatline

d3.json 'data.json', gotData

