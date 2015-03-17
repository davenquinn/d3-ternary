var svg = d3.select('body').append('svg').attr({ width:500, height:500 });
var axes = svg.append('g').attr('id','axes');
var plot = svg.append('g').attr('id','plot');

var myTernary = ternaryPlot().range([0,400]);

var myAxes = ternaryAxes(myTernary);

myAxes.ticks().minorTicks([d3.range(0,101,5)]).draw('#axes');

d3.json('data.json', gotData);

function gotData(d){
	for (var type in d){
		var f = function (){
			return type
		}
		plot.append('path').attr(
		{
			d:function(){ 
				return myTernary.line(d[type], function(d){ return [d.sand, d.silt, d.clay]; }) + "Z";
			},
			'class':'ternary-line',
			'id':type.replace(' ','-')
		})
		.on('click', function(d){
			console.log(this.id);
		});
	}
}
