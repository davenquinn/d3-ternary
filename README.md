# D3 Ternary Plot

![Soil
types](https://gist.githubusercontent.com/davenquinn/988167471993bc2ece29/raw/f5c0239dc4e35559751e0ccce9eabbc67b2075a7/thumbnail.png)

![Modal
Mineralogy](https://raw.githubusercontent.com/davenquinn/crystal-knob-modal-mineralogy/master/preview.png)


An extensible charting library focused on producing accurate
and pleasing ternary diagrams for all manner of barycentric
coordinate systems. It depends only on `d3`.
Here are some examples:

- [Soil types](http://bl.ocks.org/988167471993bc2ece29)

## Usage

Get the code, either by downloading `lib/ternary.js` from this
repository, cloning the module, or installing via `npm`
from this repository url
(`npm install git+https://github.com/davenquinn/d3-ternary.git`).

Simply include the script after `d3` as such
```html
<script charset="UTF-8" src="http://d3js.org/d3.v3.min.js"></script>
<script type="text/javascript" src="<module-url>/lib/ternary.js"></script>
```
and you're off to the races.

The API  makes extensive use of `d3` shorthands:
```javascript

function resize(t) {
  t.fit(window.innerWidth,window.innerHeight);
};

var ternary = d3.ternary.plot()
  .call(resize)
  .call(d3.ternary.scalebars())
  .call(d3.ternary.vertexLabels(["Wo", "Fs", "En"]))
  .call(d3.ternary.neatline())
  .call(d3.ternary.graticule());

d3.select('body').call(ternary);
```
I am *very* happy to receive ideas for API improvement.

## Future work

- Clean up and generalize graticule API
- Add an option to install via `bower`
- List package on `npm` if desired
- Add support for different scales per-axis (i.e. a zoomed view of part
  of the barycentric coordinate space)
- Add support for partial coordinate systems (e.g. [the pyroxene
  quadrilateral](http://en.wikipedia.org/wiki/Pyroxene#/media/File:Pyrox_names.svg))

## Credits

Several projects have served as a starting point for this
work. Thanks especially to:

- *Tom Pearson* for the basic axis representation
  and sample data
  ([tomgp/d3-ternary](https://github.com/tomgp/d3-ternary))
- *Seth Brown* for his engaging project [*Ski It If You
  Can*](http://www.drbunsen.org/projects/ski-it-if-you-can/)

## Contributing

The source code is currently written in `coffeescript`. The
only development dependency is the `coffee` CLI program,
which can be installed using `npm install -g coffee-script`.
After this setup, the library can be compiled from source
using `make`, or `make watch` for continuous re-compilation.
