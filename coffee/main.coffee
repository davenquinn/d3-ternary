grat = d3.ternary.graticule()
    .majorInterval 0.2
    .minorInterval 0.05


ternary = d3.ternary.plot()
  .call d3.ternary.scalebars()
  .call d3.ternary.vertexLabels ["Clay","Sand","Silt"]
  .call d3.ternary.neatline()
  .call grat
  
d3.select 'body'
  .call ternary

gotData = (d) ->
  data = d3.entries(d).map (d)->
    v = d.value.map (c)->
      [c.sand,c.silt,c.clay]
    {type: d.key, value: v}

  paths = ternary.plot()
    .selectAll "path"
      .data data

  paths.enter()
    .append 'path'
      .attr
        d: (d)-> ternary.path d.value
        class: 'ternary-line'
        id: (d)->d.type.replace '-', ' '
      .on 'click', (d) ->
        console.log @id

d3.json 'data.json', gotData

