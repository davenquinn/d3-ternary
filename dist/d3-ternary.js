// https://github.com/davenquinn/d3-ternary#readme v2.0.0 Copyright 2020 Jules Blom
// import { scaleLinear } from "d3-scale";
const epsilon = 1e-6;
function ternaryPlot(ternary) {
  let radius = 500,
      k = 1,
      // scale
  tx = 0,
      // translate
  ty = 0;
  const vertices = ternary.vertices();
  const [vA, vB, vC] = vertices; // boundary conditions for transform
  // 🚨 these should update when
  // 1. domains are reversed
  // 2. vertices are moved

  let slopeAB = slope(vA, vB),
      slopeAC = slope(vA, vC);
  let solveAB = solveX(slopeAB, vA[1]),
      solveAC = solveX(slopeAC, vA[1]);
  let [svA, svB, svC] = vertices.map(([x, y]) => [x * radius, y * radius]); // scaled vertices for drawing gridlines and axis labels
  // axes configurations
  // from vC (angle: 30°) to vA (angle: -90°)

  const A = {
    label: "A",
    labelAngle: 0,
    labelOffset: 30,
    gridLine: lineBetween(svC, svA),
    gridLineCount: 20,
    scale: d3.scaleLinear().domain([0, 100]),
    tickAngle: 0,
    tickCount: 15,
    tickSize: 6,
    tickTextAnchor: "start",
    vertex: vertices[0]
  }; // from svA (angle: -90°) to svB (angle: 150°)

  const B = {
    label: "B",
    labelAngle: 60,
    labelOffset: 30,
    gridLine: lineBetween(svA, svB),
    gridLineCount: 20,
    scale: d3.scaleLinear().domain([0, 100]),
    tickAngle: 60,
    tickCount: 15,
    tickSize: 6,
    tickTextAnchor: "end",
    vertex: vertices[1]
  }; //  from vB (angle: 150°) to vC (angle: 30°)

  const C = {
    label: "C",
    labelAngle: -60,
    labelOffset: 30,
    gridLine: lineBetween(svB, svC),
    gridLineCount: 20,
    scale: d3.scaleLinear().domain([0, 100]),
    tickAngle: -60,
    tickCount: 15,
    tickSize: 6,
    tickTextAnchor: "end",
    vertex: vertices[2]
  }; // just a nicety for the gridlines function

  A.conjugate = B;
  B.conjugate = C;
  C.conjugate = A; // returns array of object with coords, rotation and label text for plot
  // 🚨 TODO: option for labels at center of line

  ternaryPlot.axisLabels = function () {
    return [A, B, C].map(d => ({
      position: [d.vertex[0] * (radius + d.labelOffset), d.vertex[1] * (radius + d.labelOffset)],
      label: d.label,
      labelAngle: d.labelAngle
    }));
  }; // set domains without transforming


  ternaryPlot.setDomains = function (_) {
    const [domainA, domainB, domainC] = _;
    A.scale.domain(domainA);
    B.scale.domain(domainB);
    C.scale.domain(domainC);
    return ternaryPlot;
  }; // set domains AND applies appropriate transform


  ternaryPlot.domains = function (_) {
    if (!arguments.length) return [A.scale.domain(), B.scale.domain(), C.scale.domain()];
    ternaryPlot.setDomains(_); // Get transform corresponding to this domain

    const domainTransform = ternaryPlot.transformFromDomains(_); // Apply transfrom (ie update barycentric coord system)

    ternaryPlot.transform(domainTransform);
    return ternaryPlot;
  };

  ternaryPlot.gridLines = function () {
    return [A, B, C].map(axis => {
      const gridValues = axis.scale.ticks(axis.gridLineCount - 1);
      return gridValues.map(d => [axis.gridLine(axis.scale(d)), axis.conjugate.gridLine(1 - axis.scale(d))]);
    });
  };

  ternaryPlot.gridLineCounts = function (_) {
    return arguments.length ? (A.gridLineCount = _[0], B.gridLineCount = _[1], C.gridLineCount = _[2], ternaryPlot) : [A.gridLineCount, B.gridLineCount, C.gridLineCount];
  };

  ternaryPlot.ticks = function () {
    return [A, B, C].map(axis => {
      const tickValues = axis.scale.ticks(axis.tickCount);
      return tickValues.map(tick => ({
        tick,
        position: axis.gridLine(axis.scale(tick)),
        angle: axis.tickAngle,
        size: axis.tickSize,
        textAnchor: axis.tickTextAnchor
      }));
    });
  };

  ternaryPlot.tickAngles = function (_) {
    return arguments.length ? (A.tickAngle = _[0], B.tickAngle = _[1], C.tickAngle = _[2], ternaryPlot) : [A.tickAngle, B.tickAngle, C.tickAngle];
  };

  ternaryPlot.tickCounts = function (_) {
    return arguments.length ? !Array.isArray(_) ? (A.tickCount = B.tickCount = C.tickCount = +_, ternaryPlot) : (A.tickCount = _[0], B.tickCount = _[1], C.tickCount = _[2], ternaryPlot) : [A.tickCount, B.tickCount, C.tickCount];
  };

  ternaryPlot.tickSize = function (_) {
    return arguments.length ? !Array.isArray(_) ? (A.tickSize = B.tickSize = C.tickSize = +_, ternaryPlot) : (A.tickSize = _[0], B.tickSize = _[1], C.tickSize = _[2], ternaryPlot) : [A.tickSize, B.tickSize, C.tickSize];
  };

  ternaryPlot.tickTextAnchors = function (_) {
    return arguments.length ? (A.tickTextAnchor = _[0], B.tickTextAnchor = _[1], C.tickTextAnchor = _[2], ternaryPlot) : [A.tickTextAnchor, B.tickTextAnchor, C.tickTextAnchor];
  };

  ternaryPlot.labels = function (_) {
    return arguments.length ? (A.label = _[0], B.label = _[1], C.label = _[2], ternaryPlot) : [A.label, B.label, C.label];
  };

  ternaryPlot.labelAngles = function (_) {
    return arguments.length ? (A.labelAngle = _[0], B.labelAngle = _[1], C.labelAngle = _[2], ternaryPlot) : [A.labelAngle, B.labelAngle, C.labelAngle];
  };

  ternaryPlot.triangle = function () {
    // 🚨 todo: use d3-path or d3-line for canvas support
    // const [svA, svB, svC] = scaledVertices;
    return `M${svA}L${svB}L${svC}Z`;
  };

  ternaryPlot.radius = function (_) {
    if (!arguments.length) return radius;
    radius = +_;
    [svA, svB, svC] = vertices.map(([x, y]) => [x * radius, y * radius]); // scaled vertices for drawing gridlines and axis labels
    // 🤔💭 Make a function for this?

    A.gridLine = lineBetween(svC, svA);
    B.gridLine = lineBetween(svA, svB);
    C.gridLine = lineBetween(svB, svC);
    return ternaryPlot;
  }; // sets the scale


  ternaryPlot.scale = function (_) {
    return arguments.length ? (k = +_, ternaryPlot.transform(), ternaryPlot) : k;
  }; // sets x and y translation


  ternaryPlot.translate = function (_) {
    return arguments.length ? (tx = _[0], ty = _[1], ternaryPlot.transform(), ternaryPlot) : [tx, ty];
  }; // apply scale and translate to vertices
  // if a transform object is passed, set its values first


  ternaryPlot.transform = function (transform) {
    if (transform) {
      tx = transform.x;
      ty = transform.y;
      k = transform.k;
    }

    const [vA, vB] = vertices;
    const [newvA, newvB] = vertices.map(([vx, vy]) => [vx * k + tx, vy * k + ty]); // these are the vertices BEFORE checking if they within bounds of original triangle
    // first check wether new vertices are within original triangle
    // boundary condition for y

    if (newvB[1] < vB[1] + epsilon) {
      // if below vertex B (and C)
      ty += vB[1] - newvB[1]; // shift up to match y of vA
    } else if (newvA[1] > vA[1]) {
      // if above top vertex (vA)
      ty -= newvA[1] - vA[1]; // shift down to match y of top vertex (vA)
    } // boundary condition for x
    // 🚨🕷 BUG! These become too great sometimes allowing panning to exceed bounds


    const xB = solveAB(newvA[1]),
          xC = solveAC(newvA[1]);

    if (newvA[0] > xB + epsilon) {
      tx -= newvA[0] - xB;
    } else if (newvA[0] < xC - epsilon) {
      tx += xC - newvA[0];
    }

    const transformedVertices = vertices.map(([vx, vy]) => [vx * k + tx, vy * k + ty]); // apply scale & translate
    // update barycentic coordinates

    ternary.vertices(transformedVertices);
    return ternaryPlot;
  }; // returns transforms that matches given domains


  ternaryPlot.transformFromDomains = function (domains) {
    const [domainA, domainB, domainC] = domains;
    const domainLengths = new Set(domains.map(domain => Math.abs(domain[1] - domain[0]))); // 🚨 TODO should give it a margin of error

    const domainLength = [...domainLengths][0]; // !Just taking the first one of the set is stupid!

    const transform = {};
    transform.k = 100 / domainLength;
    const untranslatedDomainStart = domainStartFromScale(k);
    const shiftA = untranslatedDomainStart - domainA[0],
          shiftB = untranslatedDomainStart - domainB[0],
          shiftC = untranslatedDomainStart - domainC[0];
    const [vA, vB, vC] = vertices;
    const [shiftX, shiftY] = [vA[0] * shiftA + vB[0] * shiftB + vC[0] * shiftC, vA[1] * shiftA + vB[1] * shiftB + vC[1] * shiftC].map(d => d / 100 * transform.k);
    transform.x = shiftX;
    transform.y = shiftY;
    return transform;
  }; // get barycentric/ternary values of initial vertices to updated vertices


  ternaryPlot.domainsFromVertices = function (ternary) {
    // 'vertices' is an array the original unscaled, untranslated vertices here
    // find their barycentric values in the transformed barycentric coordinate system
    // assumes barycentic coord system is already transformed
    const [bA, bB, bC] = vertices.map(ternary.invert);
    const newADomain = [bB[0], bA[0]].map(insideDomain),
          newBDomain = [bC[1], bB[1]].map(insideDomain),
          newCDomain = [bA[2], bC[2]].map(insideDomain); // setDomains here or let user handle that?

    return [newADomain, newBDomain, newCDomain];
  };

  return ternaryPlot;
}

function insideDomain(n) {
  return (n > 0.999999 ? 1 : n < 0.000001 ? 0 : n) * 100;
} // find start value of centered, untranslated domain for this scale


function domainStartFromScale(k) {
  return (k - 1) / (k * 3) * 100;
}

function lineBetween([x1, y1], [x2, y2]) {
  return function (t) {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  };
}

function slope([x1, y1], [x2, y2]) {
  return (y2 - y1) / (x2 - x1);
}

function solveX(m, b) {
  return function (y) {
    return (y - b) / m;
  };
}

// import { sum } from "d3-array";
function ternary () {
  const {
    sin,
    cos,
    PI
  } = Math,
        rad = PI / 180; // accessors

  let a = d => d[0];

  let b = d => d[1];

  let c = d => d[2];

  const angles = [-90, 150, 30]; // angles for equilateral triangle

  let [vA, vB, vC] = angles.map(d => [cos(d * rad), sin(d * rad)]); // default vertices

  function normalize(_) {
    const values = [a(_), b(_), c(_)];
    const total = d3.sum(values);
    if (total === 0) return [0, 0, 0];
    return values.map(d => d / total);
  }

  function ternary(d) {
    const [normA, normB, normC] = normalize(d);
    return [vA[0] * normA + vB[0] * normB + vC[0] * normC, vA[1] * normA + vB[1] * normB + vC[1] * normC];
  } // en.wikipedia.org/wiki/Barycentric_coordinate_system#Conversion_between_barycentric_and_Cartesian_coordinates


  ternary.invert = function ([x, y]) {
    const [xA, yA] = vA,
          [xB, yB] = vB,
          [xC, yC] = vC;
    const yByC = yB - yC,
          xCxB = xC - xB,
          xAxC = xA - xC,
          yAyC = yA - yC,
          yCyA = yC - yA,
          xxC = x - xC,
          yyC = y - yC;
    const d = yByC * xAxC + xCxB * yAyC,
          lambda1 = (yByC * xxC + xCxB * yyC) / d,
          lambda2 = (yCyA * xxC + xAxC * yyC) / d,
          lambda3 = 1 - lambda1 - lambda2;
    return [lambda1, lambda2, lambda3];
  };

  ternary.a = function (fn) {
    return arguments.length ? (a = fn, ternary) : a;
  };

  ternary.b = function (fn) {
    return arguments.length ? (b = fn, ternary) : b;
  };

  ternary.c = function (fn) {
    return arguments.length ? (c = fn, ternary) : c;
  };

  ternary.normalize = normalize;

  ternary.vertices = function (ABC) {
    return arguments.length ? (vA = ABC[0], vB = ABC[1], vC = ABC[2], ternary) : [vA, vB, vC];
  };

  return ternary;
}

export { ternary, ternaryPlot };
