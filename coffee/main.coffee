margin =
  top: 50
  bottom: 50
  left: 50
  right: 50

outerWidth = 500
outerHeight = 500

width = outerWidth-margin.left-margin.right
height = outerHeight-margin.top-margin.bottom

svg = d3.select 'body'
  .append 'svg'
  .attr
    width: outerWidth
    height: outerHeight
  .append "g"
    .attr
      transform: "translate(#{margin.left},#{margin.top})"
      width: width
      height: height

axes = svg.append('g').attr('id', 'axes')
plot = svg.append('g').attr('id', 'plot')

myTernary = ternaryPlot()
  .range [0,width]
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

labels = ["Clay","Sand","Silt"]

radius = width/Math.sqrt(3)
pad = 20
offs = [width/2,width/Math.sqrt(3)]
angles = [0,120,240]
anchors = ["middle","end","start"]
rotate = [0,60,-60]

baryAxis = d3.svg.axis()
  .scale myTernary.scale
  .tickSize 5
  .tickFormat d3.format("%")
  .tickValues [.2,.4,.6,.8]
  .orient "top"

b_axes = axes.selectAll ".bary-axis"
  .data angles
  .enter()
    .append "g"
    .attr
      class: "bary-axis"
      transform: (d,i)->
        x = offs[0]
        y = offs[1]
        "rotate(#{60+i*120} #{x} #{y}) translate(0 #{Math.sqrt(3)/2*width-radius})"
    .call baryAxis
    .each (d,i)->
      return unless i==1
      d3.select @
        .selectAll "text"
          .attr transform: (d)->
            y = d3.select(@).attr "y"
            "rotate(-180 0 #{2*y})"

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

axes.selectAll ".graticule"
  .data [gratAxis,gratAxis,gratAxis]
  .enter()
    .append "g"
      .attr
        class: "graticule"
      .each (d,i)->
        console.log d.tickValues()
        d3.select @
          .selectAll "path"
            .data d.tickValues()
            .enter()
              .append "path"
                .attr
                  d: (d)->
                    a = myTernary.rule d,i
                    console.log a
                    a+"Z"

axes.selectAll ".vertex-label"
  .data labels
  .enter()
    .append "text"
      .text (d) -> d
      .attr
        dy: ".35em"
        "text-anchor": "middle"
        class: "vertex-label"
        transform: (d,i)->
          a = -angles[i]*Math.PI/180
          x = offs[0]+Math.sin(a)*(radius+pad)
          y = offs[1]-Math.cos(a)*(radius+pad)
          "translate(#{x},#{y})rotate(#{rotate[i]})"



d3.json 'data.json', gotData
