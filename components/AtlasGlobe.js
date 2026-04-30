"use client";
// components/AtlasGlobe.js — REVISION 2
//
// CHANGES vs v1:
//   • Globe is now MUCH larger (radius 1.45 instead of 1.0, FOV adjusted)
//   • `crop` prop allows showing only a portion: "right" cuts left half off-canvas,
//     creating the "entering from the right" effect requested.
//   • Mobile auto-detects narrow viewports and switches to a constrained centred
//     view at smaller height — never exceeds the viewport edge.
//   • Atmospheric halo bloom is wider (1.32 radius) for the cinematic feel.
//   • Hotspot embers retained; visitor beacon retained.
//
// Three.js still loads from CDN — no new build dep.

import { useEffect, useRef, useState } from "react";

const HOTSPOTS = [
  { lat: 48.5, lng: 35,    sev: 1.0 }, { lat: 15.5, lng: 32.5, sev: 1.0 },
  { lat: 31.4, lng: 34.4,  sev: 1.0 }, { lat: 19.7, lng: 96.2, sev: 1.0 },
  { lat: -1.5, lng: 29,    sev: 0.7 }, { lat: 15.4, lng: 44.2, sev: 0.7 },
  { lat: 14,   lng: 1,     sev: 0.7 }, { lat: 34,   lng: 74,   sev: 0.7 },
  { lat: 32.4, lng: 53.7,  sev: 1.0 }, { lat: 24,   lng: 120,  sev: 0.45 },
  { lat: 56,   lng: 26,    sev: 0.7 }, { lat: 23.6, lng:-102.5,sev: 0.7 },
  { lat: 12.4, lng: -1.5,  sev: 0.7 }, { lat: 6.8,  lng: 31.6, sev: 0.7 },
  { lat: 2,    lng: 45,    sev: 0.7 }, { lat: 9.1,  lng: 7.5,  sev: 0.7 },
  { lat: 33.3, lng: 35.5,  sev: 0.7 }, { lat: 18.9, lng:-72.3, sev: 0.7 },
  { lat: 10.5, lng:-66.9,  sev: 1.0 }, { lat: 35,   lng: 38,   sev: 0.7 },
];

function latLngToVec3(THREE, lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

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

/**
 * @param {Object}   props
 * @param {Object?}  props.userLocation       - { lat, lng } visitor coords
 * @param {string}   props.crop               - "right" | "left" | "none" (desktop only)
 * @param {number}   props.height             - container height (px)
 * @param {number}   props.scale              - radius multiplier (1.0 default; >1 = bigger)
 */
export default function AtlasGlobe({
  userLocation = null,
  crop = "right",
  height = 720,
  scale = 1.45,
}) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 980);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      const THREE = await loadThree();
      if (!THREE || cancelled) return;

      const w = container.clientWidth, h = container.clientHeight;
      const scene = new THREE.Scene();
      scene.background = null;

      // Larger FOV with closer camera = a more dramatic, "looming" globe.
      const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);

      // Camera offset: when crop="right", we shift the camera LEFT so the globe
      // appears to enter from the right side of the canvas.
      // On mobile, we always centre the globe.
      const horizontalShift = isMobile ? 0 : (crop === "right" ? -0.55 : crop === "left" ? 0.55 : 0);
      const cameraDistance = isMobile ? 5.2 : 4.6;
      camera.position.set(horizontalShift * cameraDistance, 0.3, cameraDistance);
      camera.lookAt(horizontalShift * cameraDistance, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const root = new THREE.Group();
      root.rotation.x = 0.34;
      // Apply mobile scale-down so the globe never overflows
      const effectiveScale = isMobile ? Math.min(scale, 1.05) : scale;
      root.scale.setScalar(effectiveScale);
      scene.add(root);

      // Globe core — matte near-black, very subtle warm interior
      const coreGeo = new THREE.SphereGeometry(1, 64, 64);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
      root.add(new THREE.Mesh(coreGeo, coreMat));

      // Brass meridian wireframe
      const wireGeo = new THREE.SphereGeometry(1.001, 36, 24);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xc4a265, wireframe: true, transparent: true, opacity: 0.085 });
      root.add(new THREE.Mesh(wireGeo, wireMat));

      // Anchor lines — equator + prime meridian, slightly brighter
      const ringMat = new THREE.LineBasicMaterial({ color: 0xc4a265, transparent: true, opacity: 0.28 });
      const equatorPts = [];
      for (let i = 0; i <= 128; i++) {
        const t = (i / 128) * Math.PI * 2;
        equatorPts.push(new THREE.Vector3(Math.cos(t) * 1.003, 0, Math.sin(t) * 1.003));
      }
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(equatorPts), ringMat));

      const meridianPts = [];
      for (let i = 0; i <= 128; i++) {
        const t = (i / 128) * Math.PI * 2;
        meridianPts.push(new THREE.Vector3(0, Math.cos(t) * 1.003, Math.sin(t) * 1.003));
      }
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(meridianPts), ringMat));

      // Atmospheric halo — wider for the cinematic bloom
      const haloGeo = new THREE.SphereGeometry(1.32, 48, 48);
      const haloMat = new THREE.ShaderMaterial({
        uniforms: { c: { value: new THREE.Color(0xc4a265) } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0,0,1.0)), 2.4); gl_FragColor = vec4(c, 1.0) * i; }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });
      root.add(new THREE.Mesh(haloGeo, haloMat));

      // Hotspot embers
      const markerGroup = new THREE.Group();
      root.add(markerGroup);
      HOTSPOTS.forEach((pt) => {
        const v = latLngToVec3(THREE, pt.lat, pt.lng, 1.012);
        const dotGeo = new THREE.SphereGeometry(0.012 + pt.sev * 0.008, 12, 12);
        const dotMat = new THREE.MeshBasicMaterial({
          color: pt.sev >= 0.9 ? 0xc45c5c : pt.sev >= 0.6 ? 0xc49a5c : 0xc4a265,
          transparent: true, opacity: 0.85,
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(v);
        dot.userData.basePulse = Math.random() * Math.PI * 2;
        markerGroup.add(dot);

        const r2 = new THREE.RingGeometry(0.025 + pt.sev * 0.01, 0.032 + pt.sev * 0.012, 16);
        const rm = new THREE.MeshBasicMaterial({ color: dotMat.color, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(r2, rm);
        ring.position.copy(v);
        ring.lookAt(0, 0, 0);
        ring.rotateY(Math.PI);
        markerGroup.add(ring);
      });

      // Visitor beacon (champagne)
      let beacon = null, beaconRing = null;
      if (userLocation && typeof userLocation.lat === "number" && typeof userLocation.lng === "number") {
        const v = latLngToVec3(THREE, userLocation.lat, userLocation.lng, 1.012);
        const bGeo = new THREE.SphereGeometry(0.022, 16, 16);
        const bMat = new THREE.MeshBasicMaterial({ color: 0xe8d5a8, transparent: true, opacity: 1 });
        beacon = new THREE.Mesh(bGeo, bMat);
        beacon.position.copy(v);
        markerGroup.add(beacon);
        const rGeo = new THREE.RingGeometry(0.05, 0.058, 32);
        const rMat = new THREE.MeshBasicMaterial({ color: 0xe8d5a8, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        beaconRing = new THREE.Mesh(rGeo, rMat);
        beaconRing.position.copy(v);
        beaconRing.lookAt(0, 0, 0);
        beaconRing.rotateY(Math.PI);
        markerGroup.add(beaconRing);
      }

      // Ambient particles (slightly more, slightly farther out — compensates for larger globe)
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 320;
      const positions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        const r = 1.9 + Math.random() * 1.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0xc4a265, size: 0.012, transparent: true, opacity: 0.32, sizeAttenuation: true,
      });
      scene.add(new THREE.Points(dustGeo, dustMat));

      // Animate
      let raf = 0;
      const start = performance.now();
      const tick = (now) => {
        const t = (now - start) / 1000;
        root.rotation.y = t * (Math.PI * 2 / 90) - 1.6; // slowed slightly to 90s/rev for grandeur
        markerGroup.children.forEach((m, i) => {
          if (m.geometry?.type === "SphereGeometry") {
            const pulse = 0.7 + 0.3 * Math.sin(t * 1.4 + (m.userData.basePulse || i));
            m.material.opacity = (m === beacon ? 1 : 0.65 * pulse + 0.25);
            m.scale.setScalar(m === beacon ? 0.9 + 0.25 * Math.sin(t * 1.8) : pulse);
          }
        });
        if (beaconRing) {
          beaconRing.scale.setScalar(0.9 + 0.7 * ((Math.sin(t * 1.5) + 1) / 2));
          beaconRing.material.opacity = 0.6 - 0.5 * ((Math.sin(t * 1.5) + 1) / 2);
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onResize = () => {
        const W = container.clientWidth, H = container.clientHeight;
        renderer.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      cleanupRef.current = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        coreGeo.dispose(); coreMat.dispose();
        wireGeo.dispose(); wireMat.dispose();
        haloGeo.dispose(); haloMat.dispose();
        dustGeo.dispose(); dustMat.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    })();

    return () => {
      cancelled = true;
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [userLocation, crop, scale, isMobile]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        position: "relative",
        overflow: "hidden",                     // clips the cropped globe at canvas edge
        background: "radial-gradient(ellipse at center, rgba(196,162,101,0.04) 0%, transparent 65%)",
      }}
    />
  );
}
