'use client';

import React, { useState } from 'react';

// Math utility to find coordinate points along a cubic bezier curve
function cubic(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  const x = mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0];
  const y = mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1];
  return [x, y];
}

// Generate circles (beads) along a bezier strand path
function getBeads(p0, p1, p2, p3, count, r, keyPrefix) {
  const beadsArray = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const [x, y] = cubic(t, p0, p1, p2, p3);
    beadsArray.push(
      <circle
        key={`${keyPrefix}-bead-${i}`}
        cx={x.toFixed(1)}
        cy={y.toFixed(1)}
        r={r}
        fill="url(#gold)"
      />
    );
  }
  return beadsArray;
}

// Generate a bezier path representing a metal strand
function getStrand(p0, p1, p2, p3, key) {
  return (
    <path
      key={key}
      d={`M ${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`}
      fill="none"
      stroke="url(#gold)"
      strokeWidth="1.5"
      opacity="0.5"
    />
  );
}

// Generate a vector diamond pendant shape
function getDiamondPendant(cx, topY, size, keyPrefix) {
  const half = size / 2;
  return (
    <g key={`${keyPrefix}-pendant`}>
      <line
        x1={cx}
        y1={topY}
        x2={cx}
        y2={topY + size * 0.55}
        stroke="url(#gold)"
        strokeWidth="2"
      />
      <path
        d={`M${cx} ${topY + size * 0.55} L${cx + half} ${topY + size} L${cx} ${topY + size * 1.45} L${cx - half} ${topY + size} Z`}
        fill="url(#gold)"
      />
      <circle cx={cx} cy={topY + size} r={size * 0.16} fill="#FBF6EC" />
    </g>
  );
}

// Vector Jewel Drawings based on Category
function drawNecklace(seed) {
  const p0 = [42, 72], p1 = [68, 196], p2 = [252, 196], p3 = [278, 72];
  return [
    getStrand(p0, p1, p2, p3, 'str1'),
    ...getBeads(p0, p1, p2, p3, 15, 3, 'neck'),
    getDiamondPendant(160, 196, 52, 'neck')
  ];
}

function drawChoker(seed) {
  const p0 = [72, 92], p1 = [92, 150], p2 = [228, 150], p3 = [248, 92];
  return [
    getStrand(p0, p1, p2, p3, 'str1'),
    ...getBeads(p0, p1, p2, p3, 11, 3, 'choker'),
    getDiamondPendant(160, 148, 34, 'choker')
  ];
}

function drawHaram(seed) {
  const a0 = [32, 60], a1 = [62, 168], a2 = [258, 168], a3 = [288, 60];
  const b0 = [52, 60], b1 = [82, 232], b2 = [238, 232], b3 = [268, 60];
  return [
    getStrand(a0, a1, a2, a3, 'str1'),
    ...getBeads(a0, a1, a2, a3, 16, 2.6, 'haram-a'),
    getStrand(b0, b1, b2, b3, 'str2'),
    ...getBeads(b0, b1, b2, b3, 17, 3, 'haram-b'),
    getDiamondPendant(160, 232, 58, 'haram')
  ];
}

function drawBridal(seed) {
  const a0 = [74, 58], a1 = [92, 108], a2 = [228, 108], a3 = [246, 58];
  const b0 = [52, 58], b1 = [76, 158], b2 = [244, 158], b3 = [268, 58];
  const c0 = [36, 58], c1 = [64, 218], c2 = [256, 218], c3 = [284, 58];
  const tikka = (
    <g key="tikka">
      <line x1="160" y1="16" x2="160" y2="46" stroke="url(#gold)" strokeWidth="2" />
      <circle cx="160" cy="50" r="7" fill="url(#gold)" />
    </g>
  );
  return [
    tikka,
    getStrand(a0, a1, a2, a3, 'str1'),
    ...getBeads(a0, a1, a2, a3, 10, 2.4, 'br-a'),
    getStrand(b0, b1, b2, b3, 'str2'),
    ...getBeads(b0, b1, b2, b3, 13, 2.8, 'br-b'),
    getStrand(c0, c1, c2, c3, 'str3'),
    ...getBeads(c0, c1, c2, c3, 16, 3.2, 'br-c'),
    getDiamondPendant(160, 218, 64, 'br')
  ];
}

function drawBangles(seed) {
  const centers = [[160, 112], [160, 160], [160, 208]];
  const elements = [];
  centers.forEach((c, idx) => {
    elements.push(
      <circle
        key={`bangle-${idx}`}
        cx={c[0]}
        cy={c[1]}
        r="58"
        fill="none"
        stroke="url(#gold)"
        strokeWidth="7"
        opacity={0.55 + idx * 0.15}
      />
    );
    for (let a = 0; a < 360; a += 45) {
      const rad = (a * Math.PI) / 180;
      const x1 = c[0] + Math.cos(rad) * 52;
      const y1 = c[1] + Math.sin(rad) * 52;
      const x2 = c[0] + Math.cos(rad) * 64;
      const y2 = c[1] + Math.sin(rad) * 64;
      elements.push(
        <line
          key={`bangle-ray-${idx}-${a}`}
          x1={x1.toFixed(1)}
          y1={y1.toFixed(1)}
          x2={x2.toFixed(1)}
          y2={y2.toFixed(1)}
          stroke="url(#gold)"
          strokeWidth="2"
          opacity="0.4"
        />
      );
    }
  });
  return elements;
}

function drawEarrings(seed) {
  const elements = [];
  [110, 210].forEach((x, idx) => {
    elements.push(
      <g key={`earring-${idx}`}>
        <circle cx={x} cy="66" r="9" fill="url(#gold)" />
        <line x1={x} y1="75" x2={x} y2="118" stroke="url(#gold)" strokeWidth="2" opacity="0.6" />
        <path d={`M${x - 24} 120 Q${x - 32} 154 ${x} 178 Q${x + 32} 154 ${x + 24} 120 Z`} fill="url(#gold)" opacity="0.92" />
        <circle cx={x} cy="146" r="7" fill="#FBF6EC" />
        <line x1={x - 8} y1="178" x2={x - 10} y2="204" stroke="url(#gold)" strokeWidth="2" />
        <line x1={x} y1="178" x2={x} y2="210" stroke="url(#gold)" strokeWidth="2" />
        <line x1={x + 8} y1="178" x2={x + 10} y2="204" stroke="url(#gold)" strokeWidth="2" />
        <circle cx={x - 10} cy="207" r="2.6" fill="url(#gold)" />
        <circle cx={x} cy="213" r="2.6" fill="url(#gold)" />
        <circle cx={x + 10} cy="207" r="2.6" fill="url(#gold)" />
      </g>
    );
  });
  return elements;
}

export default function JewelSVG({ category, productId, imageUrl, altText = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  // If a valid image is provided and hasn't failed to load, display the image
  if (imageUrl && !imgFailed) {
    return (
      <img
        src={imageUrl}
        alt={altText}
        onError={() => setImgFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    );
  }

  // Fallback procedural SVG generation based on the product
  const seed = productId ? productId.charCodeAt(productId.length - 1) : 65;
  const builders = {
    Necklace: drawNecklace,
    Choker: drawChoker,
    Haram: drawHaram,
    Bridal: drawBridal,
    Bangles: drawBangles,
    Earrings: drawEarrings
  };

  const drawFn = builders[category] || drawNecklace;
  const innerElements = drawFn(seed);

  const hue = seed % 3;
  const bgFrom = ['#6B1A34', '#5C1A2E', '#63213A'][hue];

  return (
    <svg
      viewBox="0 0 320 320"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id="bg" cx="50%" cy="32%" r="80%">
          <stop offset="0%" stopColor={bgFrom} />
          <stop offset="100%" stopColor="#31081A" />
        </radialGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E4CD8F" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" fill="url(#bg)" />
      {innerElements}
    </svg>
  );
}
