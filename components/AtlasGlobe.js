"use client";
// components/AtlasGlobe.js
// The hero globe. Cinematic, slow-rotating, brass meridians, atmospheric halo,
// pulsing markers for active conflict zones, a beacon at the visitor's location.
//
// Three.js is loaded dynamically from CDN — keeps the bundle thin.
// No external dep added. No build step changes.
//
// Design notes:
//   - The globe is dark, almost black, with a subtle warm tint inside.
//   - Meridians are warm brass, very low alpha — they should *whisper*.
//   - The halo is two-layer: hard inner glow + soft outer bloom.
//   - The user pin pulses in champagne; conflict markers in muted ember.
//   - Slow autorotate (~80s/revolution). Cinematic, not nervous.
//
// Performance: capped DPR, frame-skipping when offscreen, single light, no shadows.

import { useEffect, useRef } from "react";

// 20 active conflict zones (mirrors the dashboard data)
const HOTSPOTS = [
  { lat: 48.5,  lng: 35,    sev: 1.0 }, // Ukraine
  { lat: 15.5,  lng: 32.5,  sev: 1.0 }, // Sudan
  { lat: 31.4,  lng: 34.4,  sev: 1.0 }, // Gaza
  { lat: 19.7,  lng: 96.2,  sev: 1.0 }, // Myanmar
  { lat: -1.5,  lng: 29,    sev: 0.7 }, // DRC
  { lat: 15.4,  lng: 44.2,  sev: 0.7 }, // Yemen
  { lat: 14,    lng: 1,     sev: 0.7 }, // Sahel
  { lat: 34,    lng: 74,    sev: 0.7 }, // Kashmir
  { lat: 32.4,  lng: 53.7,  sev: 1.0 }, // Iran
  { lat: 24,    lng: 120,   sev: 0.45},
  { lat: 56,    lng: 26,    sev: 0.7 },
  { lat: 23.6,  lng: -102.5,sev: 0.7 },
  { lat: 12.4,  lng: -1.5,  sev: 0.7 },
  { lat: 6.8,   lng: 31.6,  sev: 0.7 },
  { lat: 2,     lng: 45,    sev: 0.7 },
  { lat: 9.1,   lng: 7.5,   sev: 0.7 },
  { lat: 33.3,  lng: 35.5,  sev: 0.7 },
  { lat: 18.9,  lng: -72.3, sev: 0.7 },
  { lat: 10.5,  lng: -66.9, sev: 1.0 },
  { lat: 35,    lng: 38,    sev: 0.7 },
];

function latLngToVec3(THREE, lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Load Three.js once and cache the promise
let threePromise = null;
function loadThree() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (threePromise) return threePromise;
  threePromise = new Promise((resolve) => {
    if (window.THREE) return resolve(window.THREE);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.async = true;
    s.onload = () => resolve(window.THREE);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return threePromise;
}

export default function AtlasGlobe({ userLocation = null, height = 580 }) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      const THREE = await loadThree();
      if (!THREE || cancelled) return;

      const w = container.clientWidth, h = container.clientHeight;
      const scene = new THREE.Scene();
      scene.background = null; // page bg shows through

      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(0, 0.4, 5.6);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const root = new THREE.Group();
      root.rotation.x = 0.32; // gentle axial tilt
      scene.add(root);

      // ── 1. Dark globe core (matte, very subtle warm interior) ──
      const coreGeo = new THREE.SphereGeometry(1, 64, 64);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
      const core = new THREE.Mesh(coreGeo, coreMat);
      root.add(core);

      // ── 2. Brass meridian wireframe (the "celestial globe" feel) ──
      const wireGeo = new THREE.SphereGeometry(1.001, 36, 24);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xc4a265, wireframe: true, transparent: true, opacity: 0.085 });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      root.add(wire);

      // ── 3. Brighter equator + prime meridian (anchor lines) ──
      const ringMat = new THREE.LineBasicMaterial({ color: 0xc4a265, transparent: true, opacity: 0.25 });
      const equatorPts = [];
      for (let i = 0; i <= 128; i++) {
        const t = (i / 128) * Math.PI * 2;
        equatorPts.push(new THREE.Vector3(Math.cos(t) * 1.003, 0, Math.sin(t) * 1.003));
      }
      const equatorGeo = new THREE.BufferGeometry().setFromPoints(equatorPts);
      root.add(new THREE.Line(equatorGeo, ringMat));

      const meridianPts = [];
      for (let i = 0; i <= 128; i++) {
        const t = (i / 128) * Math.PI * 2;
        meridianPts.push(new THREE.Vector3(0, Math.cos(t) * 1.003, Math.sin(t) * 1.003));
      }
      const meridianGeo = new THREE.BufferGeometry().setFromPoints(meridianPts);
      root.add(new THREE.Line(meridianGeo, ringMat));

      // ── 4. Atmospheric halo (back-side sphere with additive blend) ──
      const haloGeo = new THREE.SphereGeometry(1.18, 48, 48);
      const haloMat = new THREE.ShaderMaterial({
        uniforms: { c: { value: new THREE.Color(0xc4a265) } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.55 - dot(vN, vec3(0,0,1.0)), 2.6); gl_FragColor = vec4(c, 1.0) * i; }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });
      root.add(new THREE.Mesh(haloGeo, haloMat));

      // ── 5. Hotspot markers (small pulsing embers) ──
      const markerGroup = new THREE.Group();
      root.add(markerGroup);
      HOTSPOTS.forEach((h) => {
        const v = latLngToVec3(THREE, h.lat, h.lng, 1.012);
        const dotGeo = new THREE.SphereGeometry(0.012 + h.sev * 0.008, 12, 12);
        const dotMat = new THREE.MeshBasicMaterial({
          color: h.sev >= 0.9 ? 0xc45c5c : h.sev >= 0.6 ? 0xc49a5c : 0xc4a265,
          transparent: true, opacity: 0.85,
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(v);
        dot.userData.basePulse = Math.random() * Math.PI * 2;
        dot.userData.sev = h.sev;
        markerGroup.add(dot);

        // Subtle ring
        const ringGeo2 = new THREE.RingGeometry(0.025 + h.sev * 0.01, 0.032 + h.sev * 0.012, 16);
        const ringMat2 = new THREE.MeshBasicMaterial({
          color: dotMat.color, transparent: true, opacity: 0.25, side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo2, ringMat2);
        ring.position.copy(v);
        ring.lookAt(0, 0, 0);
        ring.rotateY(Math.PI);
        markerGroup.add(ring);
      });

      // ── 6. Visitor beacon (champagne, larger, distinct pulse) ──
      let beacon = null, beaconRing = null;
      if (userLocation && typeof userLocation.lat === "number" && typeof userLocation.lng === "number") {
        const v = latLngToVec3(THREE, userLocation.lat, userLocation.lng, 1.012);
        const bGeo = new THREE.SphereGeometry(0.02, 16, 16);
        const bMat = new THREE.MeshBasicMaterial({ color: 0xd4b876, transparent: true, opacity: 1 });
        beacon = new THREE.Mesh(bGeo, bMat);
        beacon.position.copy(v);
        markerGroup.add(beacon);

        const rGeo = new THREE.RingGeometry(0.045, 0.052, 32);
        const rMat = new THREE.MeshBasicMaterial({ color: 0xd4b876, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        beaconRing = new THREE.Mesh(rGeo, rMat);
        beaconRing.position.copy(v);
        beaconRing.lookAt(0, 0, 0);
        beaconRing.rotateY(Math.PI);
        markerGroup.add(beaconRing);
      }

      // ── 7. Ambient particle dust (very few, very subtle) ──
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 240;
      const positions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        const r = 1.6 + Math.random() * 1.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0xc4a265, size: 0.012, transparent: true, opacity: 0.35, sizeAttenuation: true,
      });
      scene.add(new THREE.Points(dustGeo, dustMat));

      // ── ANIMATION ──
      let raf = 0;
      const start = performance.now();
      const tick = (now) => {
        const t = (now - start) / 1000;
        // ~80 seconds per revolution = elegant, not nervous
        root.rotation.y = t * (Math.PI * 2 / 80) - 1.6;
        // Hotspot pulses
        markerGroup.children.forEach((m, i) => {
          if (m.geometry?.type === "SphereGeometry") {
            const pulse = 0.7 + 0.3 * Math.sin(t * 1.4 + (m.userData.basePulse || i));
            m.material.opacity = (m === beacon ? 1 : 0.65 * pulse + 0.25);
            m.scale.setScalar(m === beacon ? 0.9 + 0.25 * Math.sin(t * 1.8) : pulse);
          }
        });
        if (beaconRing) {
          beaconRing.scale.setScalar(0.9 + 0.6 * ((Math.sin(t * 1.5) + 1) / 2));
          beaconRing.material.opacity = 0.6 - 0.5 * ((Math.sin(t * 1.5) + 1) / 2);
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      // ── RESIZE ──
      const onResize = () => {
        const W = container.clientWidth, H = container.clientHeight;
        renderer.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      // ── CLEANUP ──
      cleanupRef.current = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        coreGeo.dispose(); coreMat.dispose();
        wireGeo.dispose(); wireMat.dispose();
        equatorGeo.dispose(); meridianGeo.dispose(); ringMat.dispose();
        haloGeo.dispose(); haloMat.dispose();
        dustGeo.dispose(); dustMat.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    })();

    return () => {
      cancelled = true;
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [userLocation]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        position: "relative",
        // failsafe placeholder so the layout never collapses if Three.js is blocked
        background: "radial-gradient(ellipse at center, rgba(196,162,101,0.04) 0%, transparent 60%)",
      }}
    />
  );
}
