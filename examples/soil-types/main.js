var gotData, grat, ternary;

grat = d3.ternary.graticule().majorInterval(0.2).minorInterval(0.05);

ternary = d3.ternary.plot().call(d3.ternary.scalebars()).call(d3.ternary.vertexLabels(["Clay", "Sand", "Silt"])).call(d3.ternary.neatline()).call(grat);

d3.select('body').call(ternary);

gotData = function(d) {
  var data, paths;
  data = d3.entries(d).map(function(d) {
    var v;
    v = d.value.map(function(c) {
      return [c.sand, c.silt, c.clay];
    });
    return {
      type: d.key,
      value: v
    };
  });
  paths = ternary.plot().selectAll("path").data(data);
  return paths.enter().append('path').attr({
    d: function(d) {
      return ternary.path(d.value);
    },
    "class": 'ternary-line',
    id: function(d) {
      return d.type.replace('-', ' ');
    }
  }).on('click', function(d) {
    return console.log(this.id);
  });
};

d3.json('data.json', gotData);


