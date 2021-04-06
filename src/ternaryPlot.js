import { scaleLinear } from "d3-scale";
const { cos, sin, atan, sign } = Math;

const epsilon = 1e-6;

const getDomainLengths = (domains) =>
  new Set(
    domains.map((domain) => {
      // round differences
      // https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
      const d0 = Math.round((domain[0] + Number.EPSILON) * 100) / 100;
      const d1 = Math.round((domain[1] + Number.EPSILON) * 100) / 100;

      return Math.abs(d1 - d0);
    })
  );

const insideDomain = (n) => (n > 0.999999 ? 1 : n < 0.000001 ? 0 : n);
// https://en.wikipedia.org/wiki/Distance_between_two_parallel_lines
const parallelLinesDistance = (b1, b2, m) =>
  ((b2 - b1) * Math.sign(b1)) / Math.sqrt(m ** 2 + 1); // using sign() is hacky tho

const getTranslateCorrections = (m, distance) => {
  // 🌶 distance shouldn't always have negative sign
  if (m === 0) return [0, -distance]; // for horizontal lines

  const inverseSlope = -1 / m;

  return getdXdY(inverseSlope, distance);
};

const lineBetween = ([x1, y1], [x2, y2]) => (t) => [
  x1 + t * (x2 - x1),
  y1 + t * (y2 - y1),
];

const getdXdY = (m, c) => {
  // m = dy/dx = tan(Θ)
  const theta = atan(m); // radians
  const dx = c * cos(theta) * sign(theta);
  const dy = c * sin(theta) * sign(theta);

  return [dx, dy];
};

const getSlope = ([x1, y1], [x2, y2]) => (y2 - y1) / (x2 - x1);

export default function ternaryPlot(barycentric) {
  let radius = 500,
    k = 1, // scale
    tx = 0, // translate
    ty = 0,
    tickFormat = "%",
    reverse = false;

  let unscaledVertices = barycentric.vertices(); // original unscaled vertices

  // return this function, has access to all closed over variables in the parent 'ternaryPlot' function
  function ternaryPlot(_) {
    const [x, y] = barycentric(_);

    return [x * radius, y * radius];
  }

  let [svA, svB, svC] = scaleVertices();

  // axes configurations
  // domain from vC (angle: 30°) to vA (angle: -90°)
  let A = {
    label: "A",
    labelAngle: 0,
    labelOffset: 45, // 🤔💭 or relative to radius? labelOffset: radius / 10
    gridLine: lineBetween(svC, svA),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: 0,
    tickSize: 6,
    tickTextAnchor: "start",
  };

  // domain from svA (angle: -90°) to svB (angle: 150°)
  let B = {
    label: "B",
    labelAngle: 60,
    labelOffset: 45,
    gridLine: lineBetween(svA, svB),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: 60,
    tickSize: 6,
    tickTextAnchor: "end",
  };

  // domain from vB (angle: 150°) to vC (angle: 30°)
  let C = {
    label: "C",
    labelAngle: -60,
    labelOffset: 45,
    gridLine: lineBetween(svB, svC),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: -60,
    tickSize: 6,
    tickTextAnchor: "end",
  };

  // just a nicety for the gridlines function
  A.conjugate = B;
  B.conjugate = C;
  C.conjugate = A;

  ternaryPlot.vertices = scaleVertices;

  function scaleVertices(newScaledVertices) {
    if (newScaledVertices) {
      const newUnscaledVertices = newScaledVertices.map(([x, y]) => [
        x / radius,
        y / radius,
      ]);

      barycentric.vertices(newUnscaledVertices);

      return ternaryPlot;
    }

    const scaledVertices = barycentric
      .vertices()
      .map(([x, y]) => [x * radius, y * radius]);

    return scaledVertices;
  }

  // returns array of objects with coords, rotation and label text for plot
  ternaryPlot.axisLabels = function ({ center = false } = {}) {
    return [A, B, C].map((d) => {
      const { label, labelAngle } = d;
      const [x, y] = d.gridLine(center ? 0.5 : 1);
      const position = [
        (x / radius) * (radius + d.labelOffset),
        (y / radius) * (radius + d.labelOffset),
      ];

      return {
        position,
        label,
        angle: labelAngle,
      };
    });
  };

  // set domains without applying matching transform
  ternaryPlot.setDomains = function (domains) {
    const [domainA, domainB, domainC] = domains;

    A.scale.domain(domainA);
    B.scale.domain(domainB);
    C.scale.domain(domainC);

    return ternaryPlot;
  };

  ternaryPlot.reverseVertices = function () {
    // 'swap' vertices clockwise
    reverse = true;
    const swappedVertices = [svC, svA, svB];
    const [vA, vB, vC] = unscaledVertices;
    unscaledVertices = [vC, vA, vB]; // needed for .transform() and transformFromDomains() & .domainsFromVertices() to work
    ternaryPlot.vertices(swappedVertices);

    // swap gridLines
    A.gridLine = lineBetween(svA, svC);
    B.gridLine = lineBetween(svB, svA);
    C.gridLine = lineBetween(svC, svB);

    return ternaryPlot;
  };

  // set domains checks if domains are reversed and applies appropriate transform
  ternaryPlot.domains = function (domains) {
    if (!arguments.length)
      return [A.scale.domain(), B.scale.domain(), C.scale.domain()];

    const domainLengths = getDomainLengths(domains);
    if (domainLengths.size !== 1) {
      throw new Error("Domains must all be of equal length");
    }

    const isReverseDomain = domains.every((d) => d[0] > d[1]);

    if (isReverseDomain) {
      ternaryPlot.reverseVertices();
    } else {
      reverse = false; // in case domains switch from reverse to normal
    }

    ternaryPlot.setDomains(domains);

    // Get transform corresponding to this domain
    const { x, y, k } = ternaryPlot.transformFromDomains(domains);

    // Set and apply transform ie update barycentric coord system
    ternaryPlot.translate([x, y]);
    ternaryPlot.scale(k);

    return ternaryPlot;
  };

  ternaryPlot.gridLines = function (counts = 20) {
    return [A, B, C].map((axis, i) => {
      const gridCount = Array.isArray(counts) ? +counts[i] : +counts
      const gridValues = axis.scale.ticks(gridCount - 1); // forgot what the -1 was for

      return gridValues.map((d) => [
        axis.gridLine(axis.scale(d)),
        axis.conjugate.gridLine(1 - axis.scale(d)),
      ]);
    });
  };

  ternaryPlot.ticks = function (counts = 10) {
    return [A, B, C].map((axis,i) => {
      const tickCount = Array.isArray(counts) ? +counts[i] : +counts
      const tickValues = axis.scale.ticks(tickCount); //

      const format =
        typeof tickFormat === "function"
          ? tickFormat
          : axis.scale.tickFormat(tickCount, tickFormat);

      return tickValues.map((tick) => {
        const tickPos = reverse ? 1 - axis.scale(tick) : axis.scale(tick); // not a fan of using 'reverse' boolean
        return {
          tick: format(tick),
          position: axis.gridLine(tickPos),
          angle: axis.tickAngle,
          size: axis.tickSize,
          textAnchor: axis.tickTextAnchor,
        };
      });
    });
  };

  ternaryPlot.tickAngles = function (_) {
    return arguments.length
      ? ((A.tickAngle = _[0]),
        (B.tickAngle = _[1]),
        (C.tickAngle = _[2]),
        ternaryPlot)
      : [A.tickAngle, B.tickAngle, C.tickAngle];
  };

  ternaryPlot.tickSizes = function (_) {
    return arguments.length
      ? !Array.isArray(_)
        ? ((A.tickSize = B.tickSize = C.tickSize = +_), ternaryPlot)
        : ((A.tickSize = _[0]),
          (B.tickSize = _[1]),
          (C.tickSize = _[2]),
          ternaryPlot)
      : [A.tickSize, B.tickSize, C.tickSize];
  };

  ternaryPlot.tickFormat = function (_) {
    return arguments.length ? ((tickFormat = _), ternaryPlot) : tickFormat;
  };

  ternaryPlot.tickTextAnchors = function (_) {
    return arguments.length
      ? ((A.tickTextAnchor = _[0]),
        (B.tickTextAnchor = _[1]),
        (C.tickTextAnchor = _[2]),
        ternaryPlot)
      : [A.tickTextAnchor, B.tickTextAnchor, C.tickTextAnchor];
  };

  ternaryPlot.labels = function (_) {
    return arguments.length
      ? ((A.label = _[0]), (B.label = _[1]), (C.label = _[2]), ternaryPlot)
      : [A.label, B.label, C.label];
  };

  ternaryPlot.labelAngles = function (_) {
    return arguments.length
      ? ((A.labelAngle = _[0]),
        (B.labelAngle = _[1]),
        (C.labelAngle = _[2]),
        ternaryPlot)
      : [A.labelAngle, B.labelAngle, C.labelAngle];
  };

  ternaryPlot.labelOffsets = function (_) {
    return arguments.length
      ? ((A.labelOffset = _[0]),
        (B.labelOffset = _[1]),
        (C.labelOffset = _[2]),
        ternaryPlot)
      : [A.labelOffset, B.labelOffset, C.labelOffset];
  };

  ternaryPlot.triangle = function () {
    // 🚨 todo: use d3-path or d3-line for canvas support
    return `M${svA}L${svB}L${svC}Z`;
  };

  ternaryPlot.radius = function (_) {
    if (!arguments.length) return radius;

    radius = +_;

    [svA, svB, svC] = ternaryPlot.vertices(); // scaled vertices for drawing gridlines and axis labels

    // 🤔💭 Make a function for setting gridlines?
    A.gridLine = lineBetween(svC, svA);
    B.gridLine = lineBetween(svA, svB);
    C.gridLine = lineBetween(svB, svC);

    return ternaryPlot;
  };

  // sets the scale
  ternaryPlot.scale = function (_) {
    return arguments.length
      ? ((k = +_), ternaryPlot.transform(), ternaryPlot)
      : k;
  };

  // sets x and y translation
  ternaryPlot.translate = function (_) {
    return arguments.length
      ? ((tx = _[0]), (ty = _[1]), ternaryPlot.transform(), ternaryPlot)
      : [tx, ty];
  };

  ternaryPlot.invert = function (_) {
    const xy = [_[0] / radius, _[1] / radius];
    const inverted = barycentric.invert(xy);

    return inverted;
  };

  // apply scale and translate to vertices
  ternaryPlot.transform = function () {
    if (k === 1) {
      tx = 0;
      ty = 0;
      return ternaryPlot;
    }

    const [vA, vB, vC] = unscaledVertices;
    const [newvA, newvB, newvC] = unscaledVertices.map(([vx, vy]) => [
      vx * k + tx,
      vy * k + ty,
    ]); // these are the newly transformed vertices BEFORE checking if they within bounds of original triangle

    const mAB = getSlope(vA, vB),
      mAC = getSlope(vA, vC),
      mBC = getSlope(vB, vC);

    // y-intercepts of zoomed triangle sides
    const bAB = newvA[1] - mAB * newvA[0],
      bAC = newvA[1] - mAC * newvA[0],
      bBC = newvB[1] - mBC * newvB[0]; // or newvC[0]

    const lineDistanceAC = parallelLinesDistance(vA[1], bAC, mAC),
      lineDistanceAB = reverse // don't like this solution
        ? parallelLinesDistance(vB[1], bAB, mAB)
        : parallelLinesDistance(vA[1], bAB, mAB),
      lineDistanceBC = parallelLinesDistance(vB[1], bBC, mBC);

    if (lineDistanceAB < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mAB,
        lineDistanceAB
      );
      tx += correctionX;
      ty += correctionY;
    }

    if (lineDistanceAC < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mAC,
        lineDistanceAC
      );

      tx += correctionX;
      ty += correctionY;
    }

    if (lineDistanceBC < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mBC,
        lineDistanceBC
      );

      tx += correctionX;
      ty += correctionY;
    }

    // apply scale & adjusted translations
    const transformedVertices = unscaledVertices.map(([vx, vy]) => [
      vx * k + tx,
      vy * k + ty,
    ]);

    barycentric.vertices(transformedVertices); // update barycentic coordinates

    return ternaryPlot;
  };

  // something like a static method
  // or call transform from this function?
  ternaryPlot.transformFromDomains = function (domains) {
    const [domainA, domainB, domainC] = domains;

    const domainLengths = getDomainLengths(domains);
    const domainLength = [...domainLengths][0];

    const [uvA, uvB, uvC] = unscaledVertices;
    const k = 1 / domainLength;

    const domainFromScale = (k) => (k - 1) / (k * 3); // find start value of centered, untranslated domain for this scale

    const untranslatedDomainStart = domainFromScale(k);
    // const untranslatedDomain = [domainFromScale(k), 1 - 2 * domainFromScale(k)]

    const shiftA = untranslatedDomainStart - domainA[0],
      shiftB = untranslatedDomainStart - domainB[0],
      shiftC = untranslatedDomainStart - domainC[0];

    const [tx, ty] = [
      uvA[0] * shiftA + uvB[0] * shiftB + uvC[0] * shiftC,
      uvA[1] * shiftA + uvB[1] * shiftB + uvC[1] * shiftC,
    ].map((d) => d * transform.k);

    return { k, x: tx, y: ty };
  };

  // get barycentric value of initial vertices to updated vertices
  ternaryPlot.domainsFromVertices = function () {
    // 'vertices' is an array the original unscaled, untranslated vertices here
    // find their barycentric values in the transformed barycentric coordinate system
    // assumes barycentic coord system is already transformed
    const [bA, bB, bC] = unscaledVertices.map(barycentric.invert);

    const newADomain = [bB[0], bA[0]].map(insideDomain),
      newBDomain = [bC[1], bB[1]].map(insideDomain),
      newCDomain = [bA[2], bC[2]].map(insideDomain);

    return [newADomain, newBDomain, newCDomain];
  };

  return ternaryPlot;
}
