myTernary = d3.ternary.plot()
  .range [0,400]

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

myTernary
  .call d3.ternary.scalebars()
  .call d3.ternary.vertexLabels ["Clay","Sand","Silt"]
  .call d3.ternary.neatline()
  .call d3.ternary.graticule()

d3.json 'data.json', gotData

