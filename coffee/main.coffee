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
          myTernary.path d[type], (d) ->
            [d.sand,d.silt,d.clay]
        class: 'ternary-line'
        id: type.replace(' ', '-')
      .on 'click', (d) ->
        console.log @id

radius = width/Math.sqrt(3)
pad = 20
offs = [width/2,radius]
angles = [0,120,240]
anchors = ["middle","end","start"]
rotate = [0,60,-60]


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


myTernary
  .call d3.ternary.scalebars()
  .call d3.ternary.vertexLabels ["Clay","Sand","Silt"]
  .call d3.ternary.neatline()


d3.json 'data.json', gotData

