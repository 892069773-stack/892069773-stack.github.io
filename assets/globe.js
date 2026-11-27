import * as THREE from "./vendor/three.module.min.js";
import { worldCountries, worldLand } from "./geo/world-110m.js";

const countries = [
  { name: "日本", code: "JP", lat: 36.2, lon: 138.3 },
  { name: "美国", code: "US", lat: 39.5, lon: -98.3 },
  { name: "新加坡", code: "SG", lat: 1.35, lon: 103.8 },
  { name: "马来西亚", code: "MY", lat: 4.2, lon: 102 },
  { name: "迪拜", code: "DXB", lat: 25.2, lon: 55.3 },
  { name: "英国", code: "UK", lat: 55.4, lon: -3.4 },
  { name: "墨西哥", code: "MX", lat: 23.6, lon: -102.6 },
  { name: "加拿大", code: "CA", lat: 56.1, lon: -106.3 },
  { name: "柬埔寨", code: "KH", lat: 12.6, lon: 105 },
];

const origin = { name: "深圳", label: "SZ", lat: 22.54, lon: 114.06 };
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const supportsWebGL = () => {
  try {
    const testCanvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
};

const toXY = (lon, lat, width, height) => ({
  x: ((lon + 180) / 360) * width,
  y: ((90 - lat) / 180) * height,
});

const geometryCollection = (geojson) => (geojson.type === "FeatureCollection" ? geojson.features : [geojson]);

const drawGeoRing = (ctx, ring, width, height) => {
  let isOpen = false;
  let lastPoint = null;
  ring.forEach(([lon, lat]) => {
    const point = toXY(lon, lat, width, height);
    if (!isOpen || (lastPoint && Math.abs(point.x - lastPoint.x) > width * 0.5)) {
      ctx.moveTo(point.x, point.y);
      isOpen = true;
    } else {
      ctx.lineTo(point.x, point.y);
    }
    lastPoint = point;
  });
  ctx.closePath();
};

const drawGeometry = (ctx, geometry, width, height) => {
  if (!geometry) return;
  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => drawGeoRing(ctx, ring, width, height));
  }
  if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => drawGeoRing(ctx, ring, width, height));
    });
  }
};

const drawGeoJson = (ctx, geojson, width, height, { fill, stroke, lineWidth = 1, fillRule = "evenodd" }) => {
  ctx.beginPath();
  geometryCollection(geojson).forEach((feature) => drawGeometry(ctx, feature.geometry || feature, width, height));
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill(fillRule);
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
};

const createEarthTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  const ocean = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  ocean.addColorStop(0, "#020816");
  ocean.addColorStop(0.42, "#06213d");
  ocean.addColorStop(0.72, "#073e68");
  ocean.addColorStop(1, "#08101f");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.strokeStyle = "rgba(75, 219, 255, 0.18)";
  ctx.lineWidth = 1.4;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = toXY(lon, 0, canvas.width, canvas.height).x;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = toXY(0, lat, canvas.width, canvas.height).y;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.shadowColor = "rgba(67, 226, 255, 0.35)";
  ctx.shadowBlur = 18;
  ctx.lineJoin = "round";
  drawGeoJson(ctx, worldLand, canvas.width, canvas.height, {
    fill: "#0d3656",
    stroke: "rgba(99, 231, 255, 0.66)",
    lineWidth: 3.2,
  });
  ctx.shadowBlur = 0;
  drawGeoJson(ctx, worldCountries, canvas.width, canvas.height, {
    stroke: "rgba(99, 231, 255, 0.2)",
    lineWidth: 1.1,
  });

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(186, 230, 255, 0.12)";
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.5, 44, canvas.width * 0.46, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.5, canvas.height - 42, canvas.width * 0.42, 46, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(98, 232, 255, 0.16)";
  countries.forEach((country) => {
    const point = toXY(country.lon, country.lat, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const drawStar = (ctx, cx, cy, outerRadius, innerRadius, points = 5, rotation = -Math.PI / 2) => {
  ctx.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = rotation + (Math.PI * index) / points;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

const drawCrescent = (ctx, cx, cy, radius, color, cutoutColor, offset) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cutoutColor;
  ctx.beginPath();
  ctx.arc(cx + offset, cy, radius * 0.86, 0, Math.PI * 2);
  ctx.fill();
};

const drawFlagBody = (ctx, country, x, y, width, height) => {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 10);
  ctx.clip();

  if (country.code === "JP") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#bc002d";
    ctx.beginPath();
    ctx.arc(x + width * 0.5, y + height * 0.5, height * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else if (country.code === "US") {
    const stripe = height / 13;
    for (let index = 0; index < 13; index += 1) {
      ctx.fillStyle = index % 2 === 0 ? "#b22234" : "#ffffff";
      ctx.fillRect(x, y + index * stripe, width, stripe + 0.5);
    }
    ctx.fillStyle = "#3c3b6e";
    ctx.fillRect(x, y, width * 0.46, stripe * 7);
    ctx.fillStyle = "#ffffff";
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        drawStar(ctx, x + width * 0.055 + col * width * 0.065, y + stripe * 0.7 + row * stripe * 1.18, 2.2, 0.9);
        ctx.fill();
      }
    }
  } else if (country.code === "SG") {
    ctx.fillStyle = "#ef3340";
    ctx.fillRect(x, y, width, height / 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y + height / 2, width, height / 2);
    drawCrescent(ctx, x + width * 0.22, y + height * 0.25, height * 0.17, "#ffffff", "#ef3340", height * 0.07);
    ctx.fillStyle = "#ffffff";
    for (let index = 0; index < 5; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
      drawStar(ctx, x + width * 0.32 + Math.cos(angle) * height * 0.12, y + height * 0.25 + Math.sin(angle) * height * 0.12, 3.1, 1.3);
      ctx.fill();
    }
  } else if (country.code === "MY") {
    const stripe = height / 14;
    for (let index = 0; index < 14; index += 1) {
      ctx.fillStyle = index % 2 === 0 ? "#cc0001" : "#ffffff";
      ctx.fillRect(x, y + index * stripe, width, stripe + 0.5);
    }
    ctx.fillStyle = "#010066";
    ctx.fillRect(x, y, width * 0.52, stripe * 8);
    drawCrescent(ctx, x + width * 0.2, y + height * 0.28, height * 0.18, "#ffcc00", "#010066", height * 0.07);
    drawStar(ctx, x + width * 0.35, y + height * 0.28, height * 0.13, height * 0.055, 14);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
  } else if (country.code === "DXB") {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(x, y, width * 0.27, height);
    ctx.fillStyle = "#009739";
    ctx.fillRect(x + width * 0.27, y, width * 0.73, height / 3);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + width * 0.27, y + height / 3, width * 0.73, height / 3);
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + width * 0.27, y + (height * 2) / 3, width * 0.73, height / 3);
  } else if (country.code === "UK") {
    ctx.fillStyle = "#012169";
    ctx.fillRect(x, y, width, height);
    ctx.lineCap = "butt";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = height * 0.22;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y + height);
    ctx.moveTo(x + width, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();
    ctx.strokeStyle = "#c8102e";
    ctx.lineWidth = height * 0.09;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y + height);
    ctx.moveTo(x + width, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = height * 0.26;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y + height);
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.stroke();
    ctx.strokeStyle = "#c8102e";
    ctx.lineWidth = height * 0.14;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y + height);
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.stroke();
  } else if (country.code === "MX") {
    ctx.fillStyle = "#006847";
    ctx.fillRect(x, y, width / 3, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + width / 3, y, width / 3, height);
    ctx.fillStyle = "#ce1126";
    ctx.fillRect(x + (width * 2) / 3, y, width / 3, height);
    ctx.fillStyle = "#9c6b2f";
    ctx.beginPath();
    ctx.arc(x + width * 0.5, y + height * 0.5, height * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#006847";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + width * 0.5, y + height * 0.5, height * 0.17, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  } else if (country.code === "CA") {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(x, y, width * 0.25, height);
    ctx.fillRect(x + width * 0.75, y, width * 0.25, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + width * 0.25, y, width * 0.5, height);
    ctx.fillStyle = "#ff0000";
    const cx = x + width * 0.5;
    const cy = y + height * 0.48;
    const scale = height * 0.42;
    ctx.beginPath();
    [
      [0, -0.44], [0.08, -0.2], [0.22, -0.27], [0.16, -0.08], [0.36, -0.08],
      [0.18, 0.06], [0.28, 0.24], [0.06, 0.17], [0.04, 0.4], [-0.04, 0.4],
      [-0.06, 0.17], [-0.28, 0.24], [-0.18, 0.06], [-0.36, -0.08], [-0.16, -0.08],
      [-0.22, -0.27], [-0.08, -0.2],
    ].forEach(([px, py], index) => {
      const pointX = cx + px * scale;
      const pointY = cy + py * scale;
      if (index === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    });
    ctx.closePath();
    ctx.fill();
  } else if (country.code === "KH") {
    ctx.fillStyle = "#032ea1";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#e00025";
    ctx.fillRect(x, y + height * 0.25, width, height * 0.5);
    ctx.fillStyle = "#ffffff";
    const baseY = y + height * 0.64;
    ctx.fillRect(x + width * 0.33, baseY, width * 0.34, height * 0.08);
    ctx.fillRect(x + width * 0.37, y + height * 0.52, width * 0.26, height * 0.12);
    ctx.fillRect(x + width * 0.43, y + height * 0.42, width * 0.14, height * 0.1);
    ctx.beginPath();
    ctx.moveTo(x + width * 0.5, y + height * 0.31);
    ctx.lineTo(x + width * 0.58, y + height * 0.43);
    ctx.lineTo(x + width * 0.42, y + height * 0.43);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
  ctx.strokeStyle = "rgba(223, 251, 255, 0.75)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 10);
  ctx.stroke();
};

const createFlagTexture = (country) => {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 132;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(4, 18, 36, 0.9)";
  ctx.strokeStyle = "rgba(92, 230, 255, 0.72)";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(73, 225, 255, 0.5)";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.roundRect(14, 12, 164, 108, 26);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  drawFlagBody(ctx, country, 30, 24, 132, 70);
  ctx.fillStyle = "#dffbff";
  ctx.font = "900 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(country.name, 96, 110);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createOriginTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 112;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(3, 16, 32, 0.92)";
  ctx.strokeStyle = "rgba(111, 244, 255, 0.88)";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(73, 225, 255, 0.62)";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(20, 22, 120, 68, 24);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#dffbff";
  ctx.font = "800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("深圳", 80, 44);
  ctx.fillStyle = "rgba(123, 236, 255, 0.72)";
  ctx.font = "900 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(origin.label, 80, 70);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const latLonToVector = (lat, lon, radius) => {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
};

const createRoutePoints = (from, to, radius = 2.46) => {
  const start = latLonToVector(from.lat, from.lon, radius);
  const end = latLonToVector(to.lat, to.lon, radius);
  const distance = start.angleTo(end);
  const lift = THREE.MathUtils.clamp(distance * 0.34, 0.28, 0.92);
  const points = [];
  for (let index = 0; index <= 72; index += 1) {
    const t = index / 72;
    const point = start.clone().lerp(end, t).normalize().multiplyScalar(radius + Math.sin(Math.PI * t) * lift);
    points.push(point);
  }
  return points;
};

const normalizeLon = (lon) => ((((lon + 180) % 360) + 360) % 360) - 180;

const latLonToUnit = (lat, lon) => {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(lon);
  const cosPhi = Math.cos(phi);
  return { x: cosPhi * Math.cos(lambda), y: Math.sin(phi), z: cosPhi * Math.sin(lambda) };
};

const unitToLatLon = (point) => ({
  lat: THREE.MathUtils.radToDeg(Math.asin(clamp(point.y, -1, 1))),
  lon: THREE.MathUtils.radToDeg(Math.atan2(point.z, point.x)),
});

const interpolateLatLon = (from, to, progress) => {
  const start = latLonToUnit(from.lat, from.lon);
  const end = latLonToUnit(to.lat, to.lon);
  const dot = clamp(start.x * end.x + start.y * end.y + start.z * end.z, -1, 1);
  const omega = Math.acos(dot);
  if (omega < 0.0001) return { lat: from.lat, lon: from.lon };
  const sinOmega = Math.sin(omega);
  const a = Math.sin((1 - progress) * omega) / sinOmega;
  const b = Math.sin(progress * omega) / sinOmega;
  const point = {
    x: start.x * a + end.x * b,
    y: start.y * a + end.y * b,
    z: start.z * a + end.z * b,
  };
  const length = Math.hypot(point.x, point.y, point.z) || 1;
  return unitToLatLon({ x: point.x / length, y: point.y / length, z: point.z / length });
};

const projectFallbackPoint = (lat, lon, centerLon, centerLat, cx, cy, radius) => {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(normalizeLon(lon - centerLon));
  const phi0 = THREE.MathUtils.degToRad(centerLat);
  const cosPhi = Math.cos(phi);
  const cosLambda = Math.cos(lambda);
  const visible = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * cosPhi * cosLambda;
  return {
    x: cx + radius * cosPhi * Math.sin(lambda),
    y: cy - radius * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * cosPhi * cosLambda),
    visible,
  };
};

const drawProjectedLine = (ctx, points, project, minVisibility = -0.02) => {
  let drawing = false;
  let count = 0;
  points.forEach(([lon, lat]) => {
    const point = project(lat, lon);
    if (point.visible > minVisibility) {
      if (!drawing) {
        ctx.moveTo(point.x, point.y);
        drawing = true;
      } else {
        ctx.lineTo(point.x, point.y);
      }
      count += 1;
    } else {
      drawing = false;
    }
  });
  return count;
};

const drawFallbackGeoJson = (ctx, geojson, project, { fill, stroke, lineWidth = 1 }) => {
  ctx.beginPath();
  geometryCollection(geojson).forEach((feature) => {
    const geometry = feature.geometry || feature;
    if (!geometry) return;
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        if (drawProjectedLine(ctx, ring, project, -0.06) > 2) ctx.closePath();
      });
    });
  });
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill("evenodd");
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
};

const drawFallbackGrid = (ctx, project) => {
  ctx.save();
  ctx.strokeStyle = "rgba(98, 232, 255, 0.18)";
  ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) {
    const points = [];
    for (let lon = -180; lon <= 180; lon += 3) points.push([lon, lat]);
    ctx.beginPath();
    drawProjectedLine(ctx, points, project);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const points = [];
    for (let lat = -84; lat <= 84; lat += 3) points.push([lon, lat]);
    ctx.beginPath();
    drawProjectedLine(ctx, points, project);
    ctx.stroke();
  }
  ctx.restore();
};

const drawFallbackRoute = (ctx, from, to, project, time, index) => {
  const projected = [];
  for (let step = 0; step <= 72; step += 1) {
    const geo = interpolateLatLon(from, to, step / 72);
    const point = project(geo.lat, geo.lon);
    projected.push(point);
  }

  ctx.save();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(101, 239, 255, 0.38)";
  ctx.shadowColor = "rgba(101, 239, 255, 0.4)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  let drawing = false;
  projected.forEach((point) => {
    if (point.visible > -0.02) {
      if (!drawing) {
        ctx.moveTo(point.x, point.y);
        drawing = true;
      } else {
        ctx.lineTo(point.x, point.y);
      }
    } else {
      drawing = false;
    }
  });
  ctx.stroke();

  const markerIndex = Math.floor(((time * 0.00016 + index * 0.11) % 1) * (projected.length - 1));
  const marker = projected[markerIndex];
  if (marker && marker.visible > 0.02) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const drawFallbackBadge = (ctx, point, country, width, height, compact = false) => {
  const badgeWidth = compact ? 58 : 76;
  const badgeHeight = compact ? 34 : 42;
  const x = clamp(point.x + (point.x > width * 0.55 ? -badgeWidth - 7 : 7), 10, width - badgeWidth - 10);
  const y = clamp(point.y - badgeHeight / 2, 10, height - badgeHeight - 10);
  ctx.save();
  ctx.shadowColor = "rgba(80, 226, 255, 0.34)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "rgba(3, 16, 32, 0.9)";
  ctx.strokeStyle = "rgba(111, 244, 255, 0.7)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x, y, badgeWidth, badgeHeight, 13);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  drawFlagBody(ctx, country, x + 7, y + 7, compact ? 28 : 34, compact ? 16 : 19);
  ctx.fillStyle = "#dffbff";
  ctx.font = `800 ${compact ? 9 : 11}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(country.name, x + (compact ? 40 : 47), y + badgeHeight / 2);
  ctx.restore();
};

const drawFallbackOrigin = (ctx, point, width, height, compact = false) => {
  const badgeWidth = compact ? 60 : 76;
  const badgeHeight = compact ? 32 : 38;
  const x = clamp(point.x - badgeWidth / 2, 10, width - badgeWidth - 10);
  const y = clamp(point.y - badgeHeight - 11, 10, height - badgeHeight - 10);
  ctx.save();
  ctx.shadowColor = "rgba(101, 239, 255, 0.75)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(point.x, point.y, compact ? 4 : 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(3, 16, 32, 0.94)";
  ctx.strokeStyle = "rgba(111, 244, 255, 0.88)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(x, y, badgeWidth, badgeHeight, 13);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#dffbff";
  ctx.font = `900 ${compact ? 12 : 14}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("深圳", x + badgeWidth / 2, y + badgeHeight * 0.4);
  ctx.fillStyle = "rgba(123, 236, 255, 0.76)";
  ctx.font = `900 ${compact ? 9 : 10}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillText(origin.label, x + badgeWidth / 2, y + badgeHeight * 0.72);
  ctx.restore();
};

const initFallbackGlobe = (stage, canvas) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    stage.classList.add("is-fallback");
    return;
  }

  stage.classList.add("is-fallback", "is-canvas-fallback");
  const target = { lon: 106, lat: 18 };
  const current = { lon: target.lon, lat: target.lat };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLon = 0;
  let startLat = 0;
  let lastTime = 0;

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    width = Math.max(280, Math.round(rect.width || stage.clientWidth || 360));
    height = clamp(Math.round(width * 0.92), 330, 470);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    stage.style.height = `${height}px`;
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    }
  };

  const beginDrag = (clientX, clientY) => {
    dragging = true;
    startX = clientX;
    startY = clientY;
    startLon = target.lon;
    startLat = target.lat;
    stage.classList.add("is-dragging");
  };

  const updateDrag = (clientX, clientY) => {
    if (!dragging) return;
    target.lon = startLon - (clientX - startX) * 0.42;
    target.lat = clamp(startLat + (clientY - startY) * 0.16, -42, 54);
  };

  const endDrag = () => {
    dragging = false;
    stage.classList.remove("is-dragging");
  };

  stage.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    beginDrag(event.clientX, event.clientY);
    stage.setPointerCapture?.(event.pointerId);
  });
  window.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    event.preventDefault();
    updateDrag(event.clientX, event.clientY);
  }, { passive: false });
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  const draw = (time = 0) => {
    resize();
    const delta = lastTime ? Math.min(64, time - lastTime) : 16;
    lastTime = time;
    if (!dragging && !prefersReducedMotion && !document.hidden) target.lon += delta * 0.004;
    const diff = normalizeLon(target.lon - current.lon);
    current.lon += diff * 0.08;
    current.lat += (target.lat - current.lat) * 0.08;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height * 0.48;
    const radius = Math.min(width, height) * 0.38;
    const compact = width < 460;
    const project = (lat, lon) => projectFallbackPoint(lat, lon, current.lon, current.lat, cx, cy, radius);

    const bg = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.18);
    bg.addColorStop(0, "rgba(29, 107, 166, 0.72)");
    bg.addColorStop(0.62, "rgba(5, 39, 76, 0.96)");
    bg.addColorStop(1, "rgba(1, 10, 24, 0)");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.shadowColor = "rgba(101, 239, 255, 0.78)";
    ctx.shadowBlur = 28;
    const ocean = ctx.createRadialGradient(cx - radius * 0.28, cy - radius * 0.28, radius * 0.08, cx, cy, radius);
    ocean.addColorStop(0, "#0d4c78");
    ocean.addColorStop(0.52, "#062747");
    ocean.addColorStop(1, "#020816");
    ctx.fillStyle = ocean;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.clip();

    drawFallbackGrid(ctx, project);
    drawFallbackGeoJson(ctx, worldLand, project, {
      fill: "rgba(16, 91, 122, 0.78)",
      stroke: "rgba(111, 244, 255, 0.62)",
      lineWidth: 1.15,
    });
    drawFallbackGeoJson(ctx, worldCountries, project, {
      stroke: "rgba(111, 244, 255, 0.18)",
      lineWidth: 0.7,
    });
    countries.forEach((country, index) => drawFallbackRoute(ctx, origin, country, project, time, index));
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(156, 246, 255, 0.86)";
    ctx.lineWidth = 1.6;
    ctx.shadowColor = "rgba(101, 239, 255, 0.6)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(156, 246, 255, 0.18)";
    ctx.lineWidth = 1;
    for (let index = 0; index < 3; index += 1) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * (1.08 + index * 0.08), radius * (0.2 + index * 0.06), 0.4 + index * 0.36, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    const originPoint = project(origin.lat, origin.lon);
    countries.forEach((country) => {
      const point = project(country.lat, country.lon);
      if (point.visible <= 0.03) return;
      ctx.save();
      ctx.fillStyle = "#65efff";
      ctx.shadowColor = "rgba(101, 239, 255, 0.8)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawFallbackBadge(ctx, point, country, width, height, compact);
    });
    if (originPoint.visible > 0.02) drawFallbackOrigin(ctx, originPoint, width, height, compact);

    requestAnimationFrame(draw);
  };

  new ResizeObserver(resize).observe(stage);
  resize();
  requestAnimationFrame(draw);
};

const initGlobe = (stage) => {
  const canvas = stage.querySelector("canvas");
  if (!canvas) return;

  if (!supportsWebGL()) {
    initFallbackGlobe(stage, canvas);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.18, 8.8);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch {
    initFallbackGlobe(stage, canvas);
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const globe = new THREE.Group();
  scene.add(globe);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2.35, 96, 96),
    new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.64,
      metalness: 0.08,
      emissive: new THREE.Color(0x062747),
      emissiveIntensity: 0.42,
    }),
  );
  globe.add(earth);

  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(2.365, 36, 24),
    new THREE.MeshBasicMaterial({
      color: 0x63e7ff,
      transparent: true,
      opacity: 0.16,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    }),
  );
  globe.add(wire);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x63e7ff,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const orbitA = new THREE.Mesh(new THREE.TorusGeometry(2.78, 0.008, 8, 160), ringMaterial);
  orbitA.rotation.set(Math.PI / 2.18, 0.14, 0.18);
  globe.add(orbitA);

  const orbitB = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.006, 8, 160), ringMaterial.clone());
  orbitB.material.opacity = 0.12;
  orbitB.rotation.set(Math.PI / 2.72, -0.52, 0.82);
  globe.add(orbitB);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.58, 96, 96),
    new THREE.MeshBasicMaterial({
      color: 0x63e7ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(atmosphere);

  const routeMarkers = [];
  const destinationItems = [];
  const originSurface = latLonToVector(origin.lat, origin.lon, 2.42);
  const originPosition = latLonToVector(origin.lat, origin.lon, 2.84);

  const originDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  originDot.position.copy(originSurface);
  globe.add(originDot);

  const originGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x65efff,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  originGlow.position.copy(originSurface);
  globe.add(originGlow);

  const originLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([originSurface, originPosition]),
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
    }),
  );
  globe.add(originLine);

  const originSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createOriginTexture(),
      transparent: true,
      depthTest: true,
      depthWrite: false,
    }),
  );
  originSprite.position.copy(originPosition);
  originSprite.scale.set(0.62, 0.44, 0.44);
  globe.add(originSprite);

  const routeMaterial = new THREE.MeshBasicMaterial({
    color: 0x65efff,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  countries.forEach((country) => {
    const surface = latLonToVector(country.lat, country.lon, 2.39);
    const position = latLonToVector(country.lat, country.lon, 2.67);
    const routePoints = createRoutePoints(origin, country);
    const route = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(routePoints), 72, 0.008, 8, false),
      routeMaterial.clone(),
    );
    route.userData.baseOpacity = country.lon < 0 ? 0.2 : 0.34;
    route.material.opacity = route.userData.baseOpacity;
    globe.add(route);

    const routeMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    routeMarker.userData.points = routePoints;
    routeMarker.userData.offset = Math.random();
    routeMarkers.push(routeMarker);
    globe.add(routeMarker);

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.046, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0x65efff,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      }),
    );
    dot.position.copy(surface);
    globe.add(dot);

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([surface, position]),
      new THREE.LineBasicMaterial({
        color: 0x65efff,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
      }),
    );
    globe.add(line);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createFlagTexture(country),
        transparent: true,
        depthTest: true,
        depthWrite: false,
      }),
    );
    sprite.position.copy(position);
    sprite.scale.set(0.58, 0.41, 1);
    sprite.userData.country = country.name;
    globe.add(sprite);

    destinationItems.push({ surface: dot, line, sprite, route, marker: routeMarker, baseRouteOpacity: route.userData.baseOpacity });
  });

  scene.add(new THREE.AmbientLight(0x7ddfff, 1.05));
  const key = new THREE.DirectionalLight(0xdffbff, 2.7);
  key.position.set(3.2, 3.4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x3a7dff, 1.1);
  fill.position.set(-4, -1, 3);
  scene.add(fill);

  const target = { x: -0.12, y: -4.55 };
  const current = { x: target.x, y: target.y };
  let dragging = false;
  let compactGlobe = false;
  let startX = 0;
  let startY = 0;
  let startRotX = 0;
  let startRotY = 0;
  let usingPointerEvents = false;

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(280, Math.round(rect.width || stage.clientWidth || 360));
    const height = Math.max(280, Math.round(rect.height || stage.clientHeight || 360));
    compactGlobe = width < 560;
    camera.position.z = width < 520 ? 10.8 : 9.45;
    const flagWidth = compactGlobe ? 0.42 : 0.58;
    const flagHeight = compactGlobe ? 0.3 : 0.41;
    const originScale = compactGlobe ? [0.48, 0.34, 0.34] : [0.62, 0.44, 0.44];
    originSprite.scale.set(...originScale);
    destinationItems.forEach((item) => item.sprite.scale.set(flagWidth, flagHeight, 1));
    if (canvas.width !== Math.round(width * renderer.getPixelRatio()) || canvas.height !== Math.round(height * renderer.getPixelRatio())) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  const beginDrag = (clientX, clientY) => {
    dragging = true;
    startX = clientX;
    startY = clientY;
    startRotX = target.x;
    startRotY = target.y;
    stage.classList.add("is-dragging");
  };

  const updateDrag = (clientX, clientY) => {
    if (!dragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    target.y = startRotY + dx * 0.011;
    target.x = THREE.MathUtils.clamp(startRotX + dy * 0.008, -0.72, 0.72);
  };

  const endDrag = () => {
    dragging = false;
    stage.classList.remove("is-dragging");
  };

  const onPointerDown = (event) => {
    usingPointerEvents = true;
    event.preventDefault();
    event.stopPropagation();
    beginDrag(event.clientX, event.clientY);
    stage.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    event.preventDefault();
    updateDrag(event.clientX, event.clientY);
  };

  const onPointerUp = (event) => {
    try {
      if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    } catch {
      // Some browsers throw if capture was already released by the canvas/window.
    }
    endDrag();
    window.setTimeout(() => {
      usingPointerEvents = false;
    }, 80);
  };

  const onMouseDown = (event) => {
    if (usingPointerEvents || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    beginDrag(event.clientX, event.clientY);
  };

  const onMouseMove = (event) => {
    if (usingPointerEvents || !dragging) return;
    event.preventDefault();
    updateDrag(event.clientX, event.clientY);
  };

  const onMouseUp = () => {
    if (usingPointerEvents) return;
    endDrag();
  };

  const onTouchStart = (event) => {
    if (usingPointerEvents || !event.touches.length) return;
    event.stopPropagation();
    const touch = event.touches[0];
    beginDrag(touch.clientX, touch.clientY);
  };

  const onTouchMove = (event) => {
    if (usingPointerEvents || !dragging || !event.touches.length) return;
    event.preventDefault();
    const touch = event.touches[0];
    updateDrag(touch.clientX, touch.clientY);
  };

  const onTouchEnd = () => {
    if (usingPointerEvents) return;
    endDrag();
  };

  [stage, canvas].forEach((element) => {
    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    element.addEventListener("touchend", onTouchEnd);
    element.addEventListener("touchcancel", onTouchEnd);
    element.addEventListener("mousedown", onMouseDown);
  });
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  const clock = new THREE.Clock();
  const cameraWorld = new THREE.Vector3();
  const itemWorld = new THREE.Vector3();
  const cameraNormal = new THREE.Vector3();
  const projected = new THREE.Vector3();

  const setMaterialOpacity = (material, opacity) => {
    if (!material) return;
    material.opacity = THREE.MathUtils.clamp(opacity, 0, 1);
    material.transparent = true;
  };

  const surfaceVisibility = (object) => {
    object.getWorldPosition(itemWorld);
    return THREE.MathUtils.smoothstep(itemWorld.normalize().dot(cameraNormal), -0.02, 0.2);
  };

  const edgeVisibility = (object) => {
    object.getWorldPosition(projected);
    projected.project(camera);
    const edge = Math.max(Math.abs(projected.x), Math.abs(projected.y));
    const fadeStart = compactGlobe ? 0.58 : 0.9;
    const fadeEnd = compactGlobe ? 0.76 : 1.05;
    return 1 - THREE.MathUtils.smoothstep(edge, fadeStart, fadeEnd);
  };

  const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    resize();
    if (!dragging && !prefersReducedMotion && !document.hidden) {
      target.y += delta * 0.055;
    }
    current.x += (target.x - current.x) * 0.08;
    current.y += (target.y - current.y) * 0.08;
    globe.rotation.x = current.x;
    globe.rotation.y = current.y;
    atmosphere.rotation.x = current.x;
    atmosphere.rotation.y = current.y;
    orbitA.rotation.z += delta * 0.12;
    orbitB.rotation.z -= delta * 0.09;
    camera.getWorldPosition(cameraWorld);
    cameraNormal.copy(cameraWorld).normalize();
    const originVisibility = surfaceVisibility(originDot);
    const originEdgeVisibility = edgeVisibility(originSprite);
    setMaterialOpacity(originDot.material, 0.18 + originVisibility * 0.82);
    setMaterialOpacity(originGlow.material, originVisibility * 0.42);
    setMaterialOpacity(originLine.material, originVisibility * 0.72);
    setMaterialOpacity(originSprite.material, originVisibility * originEdgeVisibility);
    originSprite.visible = originVisibility * originEdgeVisibility > 0.08;

    destinationItems.forEach((item) => {
      const visibility = surfaceVisibility(item.surface);
      const labelVisibility = visibility * edgeVisibility(item.sprite);
      setMaterialOpacity(item.surface.material, 0.12 + visibility * 0.88);
      setMaterialOpacity(item.line.material, visibility * 0.42);
      setMaterialOpacity(item.sprite.material, labelVisibility);
      setMaterialOpacity(item.route.material, item.baseRouteOpacity * (0.06 + visibility * 0.94));
      setMaterialOpacity(item.marker.material, visibility > 0.12 ? 0.85 : 0);
      item.sprite.visible = labelVisibility > 0.08;
      item.line.visible = visibility > 0.05;
      item.marker.visible = visibility > 0.12;
    });

    routeMarkers.forEach((marker, index) => {
      const points = marker.userData.points;
      const speed = prefersReducedMotion ? 0 : 0.055 + index * 0.002;
      marker.userData.offset = (marker.userData.offset + delta * speed) % 1;
      const point = points[Math.floor(marker.userData.offset * (points.length - 1))];
      if (point) marker.position.copy(point);
      if (marker.visible) {
        marker.getWorldPosition(itemWorld);
        const markerVisibility = THREE.MathUtils.smoothstep(itemWorld.normalize().dot(cameraNormal), -0.04, 0.16);
        marker.visible = markerVisibility > 0.08;
        setMaterialOpacity(marker.material, 0.85 * markerVisibility);
      }
    });
    renderer.render(scene, camera);
  };
  animate();
};

document.querySelectorAll("[data-travel-globe]").forEach(initGlobe);
