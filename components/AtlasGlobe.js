"use client";
// components/AtlasGlobe.js — REVISION 3
//
// CHANGES vs REV2:
//   • Yellow halo bloom shader REMOVED. The globe is now a clean dark
//     sphere with brass meridians only. No outer glow, no atmospheric ring.
//   • Camera offset reduced — globe is now positioned so that ≥ 60% of
//     the sphere is visible even when cropped from the right.
//   • Hotspot embers retained (markers indicating conflict zones).
//   • Visitor beacon retained (tiny champagne dot).
//   • Mobile: full sphere centred, smaller scale, never overflows.
//   • Surface darkening at the rim simulates depth without using a glow.

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
 * @param {Object?}  props.userLocation  - { lat, lng } visitor coords
 * @param {string}   props.crop          - "right" | "left" | "none"
 * @param {number}   props.height        - container height (px)
 * @param {number}   props.scale         - radius multiplier
 */
export default function AtlasGlobe({
  userLocation = null,
  crop = "right",
  height = 720,
  scale = 1.4,
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

      const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);

      // Camera shift — tuned for HomeHero's viewport-edge container.
      // The globe canvas is anchored to right:0 of the section, so its
      // right edge IS the viewport edge. With shift -0.30, globe centre
      // sits roughly 70% across the canvas — ~65% of the sphere visible,
      // right ~35% spills off the actual screen edge.
      const horizontalShift = isMobile ? 0 : (crop === "right" ? -0.30 : crop === "left" ? 0.30 : 0);
      const cameraDistance = isMobile ? 5.0 : 4.4;
      camera.position.set(horizontalShift * cameraDistance, 0.25, cameraDistance);
      camera.lookAt(horizontalShift * cameraDistance, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const root = new THREE.Group();
      root.rotation.x = 0.32;
      const effectiveScale = isMobile ? Math.min(scale, 1.0) : scale;
      root.scale.setScalar(effectiveScale);
      scene.add(root);

      // Globe core — pure dark sphere. No glow, no halo.
      const coreGeo = new THREE.SphereGeometry(1, 64, 64);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x0c0c10 });
      root.add(new THREE.Mesh(coreGeo, coreMat));

      // Brass meridian wireframe — slightly more present (was 0.085 opacity, now 0.10)
      // since we removed the halo and need the structure to read.
      const wireGeo = new THREE.SphereGeometry(1.001, 36, 24);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xb8965e, wireframe: true, transparent: true, opacity: 0.11,
      });
      root.add(new THREE.Mesh(wireGeo, wireMat));

      // Anchor lines — equator + prime meridian
      const ringMat = new THREE.LineBasicMaterial({ color: 0xc4a265, transparent: true, opacity: 0.34 });
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

      // Subtle rim darkening — uses BackSide rendering with a flat dark shader
      // to fake the limb of a planet without producing a yellow glow. The rim
      // appears slightly darker than the core, which reads as depth.
      const rimGeo = new THREE.SphereGeometry(1.012, 48, 48);
      const rimMat = new THREE.ShaderMaterial({
        uniforms: { c: { value: new THREE.Color(0x05050a) } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.55 - dot(vN, vec3(0,0,1.0)), 2.0); gl_FragColor = vec4(c, i * 0.6); }`,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      });
      root.add(new THREE.Mesh(rimGeo, rimMat));

      // Hotspot embers — these are intentionally warm/red so the globe still
      // has accent points, just not a halo.
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
      });

      // Visitor beacon (champagne — kept restrained, not yellow)
      let beacon = null;
      if (userLocation && typeof userLocation.lat === "number" && typeof userLocation.lng === "number") {
        const v = latLngToVec3(THREE, userLocation.lat, userLocation.lng, 1.012);
        const bGeo = new THREE.SphereGeometry(0.022, 16, 16);
        const bMat = new THREE.MeshBasicMaterial({ color: 0xe8d5a8, transparent: true, opacity: 1 });
        beacon = new THREE.Mesh(bGeo, bMat);
        beacon.position.copy(v);
        markerGroup.add(beacon);
      }

      // Animate
      let raf = 0;
      const start = performance.now();
      const tick = (now) => {
        const t = (now - start) / 1000;
        root.rotation.y = t * (Math.PI * 2 / 90) - 1.6;
        markerGroup.children.forEach((m, i) => {
          if (m.geometry?.type === "SphereGeometry") {
            const pulse = 0.7 + 0.3 * Math.sin(t * 1.4 + (m.userData.basePulse || i));
            m.material.opacity = (m === beacon ? 1 : 0.65 * pulse + 0.25);
            m.scale.setScalar(m === beacon ? 0.9 + 0.2 * Math.sin(t * 1.8) : pulse);
          }
        });
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
        rimGeo.dispose(); rimMat.dispose();
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
        overflow: "hidden",
        background: "transparent",
      }}
    />
  );
}
