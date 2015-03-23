# D3 Ternary Plot

![Soil types example](https://gist.github.com/davenquinn/988167471993bc2ece29/raw/f5c0239dc4e35559751e0ccce9eabbc67b2075a7/thumbnail.png)

An extensible charting library focused on producing accurate
and pleasing ternary diagrams for all manner of barycentric
coordinate systems. It depends only on `d3`.
Here are some examples:

- [Soil types](http://bl.ocks.org/988167471993bc2ece29)

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
