var test_data = [
	{a:100,b:0,c:0,color:'#F00'},
	{a:0,b:100,c:0,color:'#0F0'},
	{a:0,b:0,c:100,color:'#00F'},
	{a:33,b:33,c:33,color:'#999'}
];


function ternaryPlot(){
	var ternary = {};
	var height = Math.sqrt( 1*1 - (1/2)*(1/2));
	var path;

	function rescale(range){
		if(!range.length) range = [0, 1];
		ternary.scale = d3.scale.linear().domain([0, 1]).range(range);
	}

	function line(interpolator){
		if(!interpolator) interpolator = 'linear'
		path = d3.svg.line()
			.x(function(d) { return d[0]; })
			.y(function(d) { return d[1]; })
			.interpolate(interpolator);
	}

	rescale([0, 400]);
	line();

	ternary.range = function(range){
		rescale(range);
		return ternary; 
	};

	//map teranry coordinate [a, b, c] to an [x, y] position
	ternary.point = function(coords){
		var pos = [0,0];
		var sum = d3.sum(coords);
		if(sum !== 0) {
			var normalized = coords.map( function(d){ return d/sum; } );
			pos[0] = ternary.scale ( normalized[1] + normalized[2] / 2 );
			pos[1] = ternary.scale ( height * normalized[0] + height * normalized[1] );
		}
		return pos;
	};

	//create an SVG path from a set of points
	ternary.line = function(coordsList, accessor, interpolator){ //path generator wrapper
		if(interpolator) line(interpolator)
		if(!accessor) accessor = function(d){ return d; }
		var positions = coordsList.map( function(d){
			return ternary.point( accessor(d) );
		});
		return path(positions);
	};

	ternary.rule = function(value, axis){
		console.log(value, axis);
		var ends = [];
		if(axis == 0){
			ends = [
				[value, 0, 100-value],
				[value, 100-value, 0]
			];
		}else if(axis == 1){
			ends = [
				[0, value, 100-value],
				[100-value, value, 0]
			];
		}else if(axis == 2){
			ends = [
				[0, 100-value, value],
				[100-value, 0, value]
			];
		}
		return ternary.line(ends);
	}

	// this inverse of point i.e. take an x,y positon and get the ternary coordinate
	ternary.getValues = function(pos){ //NOTE! haven't checked if this works yet
		pos = pos.map(ternary.scale.inverse);
		var c = 1 - pos[1];
		var b = pos[0] - c/2;
		var a = y - b;
		return [a, b, c];
	};

	return ternary;
}
////
function ternaryAxes(plot){
	var axes = {};
	var parent = d3.select('svg');
	var defaultTicks = d3.range(0,101,25);
	var ticks = [defaultTicks, defaultTicks, defaultTicks];
	var minorTicks = [[],[],[]];

	axes.draw = function(parentSelector){
		if(parentSelector) parent = d3.select(parentSelector);
		var minor = parent.append('g').attr('id','minor-ticks');
		var major = parent.append('g').attr('id','major-ticks')

		//minor ticks
		for (i = 0; i<minorTicks.length; i++){
			for (j = 0; j<minorTicks[i].length; j++){
				minor.append('path').attr({
					'class':'ternary-tick minor',
					'd':plot.rule(minorTicks[i][j], i)
				}) 
			}
		}

		//major ticks
		for (var i=0; i<ticks.length; i++){
			for (var j=0; j<ticks[i].length; j++){
				major.append('path').attr({
					'class':'ternary-tick',
					'd':plot.rule(ticks[i][j], i)
				}) 
			}
		}
		
	}

	axes.ticks = function(tickArrays){ // an array containing 1 - 3 three arrays the first array will be copied over empty spaces at the end
		if(!tickArrays) tickArrays = [defaultTicks,defaultTicks,defaultTicks];
		if(!tickArrays[1]) tickArrays[1] = tickArrays[0];
		if(!tickArrays[2]) tickArrays[2] = tickArrays[0];
		ticks = tickArrays;
		return axes;
	}

	axes.minorTicks = function(tickArrays){
		if(!tickArrays) tickArrays = [[],[],[]];
		if(!tickArrays[1]) tickArrays[1] = tickArrays[0];
		if(!tickArrays[2]) tickArrays[2] = tickArrays[0];
		minorTicks = tickArrays;
		return axes;
	}

	return axes;
}
