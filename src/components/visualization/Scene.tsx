"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createEarthMesh, EARTH_RADIUS } from "./Earth";
import { useAppStore } from "@/store/store";

const latLonToVector3 = (
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 => {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);
  return new THREE.Vector3(x, y, z);
};

const Scene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const selectedCountryMarkerRef = useRef<THREE.Mesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const selectedCountryId = useAppStore((state) => state.selectedCountryId);
  const selectedCountry = useAppStore((state) =>
    state.selectedCountryId
      ? state.countries.find((c) => c.id === state.selectedCountryId)
      : null
  );

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Changed to black for better contrast with Earth
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, EARTH_RADIUS * 0.5, EARTH_RADIUS * 3.0); // Slightly adjusted camera for better view
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = EARTH_RADIUS + 0.5; // Min zoom slightly above surface
    controls.maxDistance = EARTH_RADIUS * 7; // Increased max zoom slightly
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25; // Slightly slower auto-rotation
    controls.target.set(0, 0, 0);

    const earthMesh = createEarthMesh();
    scene.add(earthMesh);

    // Satellites
    const satellites: THREE.Mesh[] = [];
    const satelliteColors = [0xffcc00, 0x00ccff, 0xcc00ff, 0x00ffcc, 0xff00cc]; // More varied colors
    for (let i = 0; i < 5; i++) {
      const satelliteGeometry = new THREE.SphereGeometry(
        0.04 * EARTH_RADIUS,
        10,
        10
      ); // Slightly smaller, simpler
      const satelliteMaterial = new THREE.MeshToonMaterial({
        color: satelliteColors[i % satelliteColors.length],
        emissive: satelliteColors[i % satelliteColors.length], // Make them glow slightly
        emissiveIntensity: 0.3,
      });
      const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
      const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.5; // Add randomness to initial angle
      const distance = EARTH_RADIUS * 1.4 + Math.random() * EARTH_RADIUS * 0.3; // Varied orbit distance
      const yOffset = (Math.random() - 0.5) * EARTH_RADIUS * 0.5; // Random y-offset for inclined orbits
      satellite.userData = {
        angle,
        distance,
        speed: 0.004 + Math.random() * 0.006,
        yOffset,
        orbitPlaneRotation: Math.random() * Math.PI,
      };
      satellites.push(satellite);
      scene.add(satellite);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Slightly brighter ambient
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7); // Slightly softer directional
    directionalLight.position.set(
      EARTH_RADIUS * 2.5,
      EARTH_RADIUS * 1.5,
      EARTH_RADIUS * 2
    );
    scene.add(directionalLight);

    // Selected Country Marker
    const markerGeometry = new THREE.SphereGeometry(
      0.06 * EARTH_RADIUS,
      16,
      16
    );
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffeb3b,
      emissive: 0x000000,
      emissiveIntensity: 0.8, // Stronger emissive for glow
      transparent: true,
      opacity: 0.95, // Slightly more opaque
      depthTest: false, // Ensure it's visible through atmosphere (use with care)
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.renderOrder = 1; // Render after atmosphere (if depthTest is true for atmosphere)
    marker.visible = false;
    scene.add(marker);
    selectedCountryMarkerRef.current = marker;

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      satellites.forEach((s) => {
        s.userData.angle += s.userData.speed;
        // More complex orbit to make them look less flat
        const x = Math.cos(s.userData.angle) * s.userData.distance;
        const z = Math.sin(s.userData.angle) * s.userData.distance;
        // Apply orbit plane rotation
        const finalX =
          x * Math.cos(s.userData.orbitPlaneRotation) -
          z * Math.sin(s.userData.orbitPlaneRotation);
        const finalZ =
          x * Math.sin(s.userData.orbitPlaneRotation) +
          z * Math.cos(s.userData.orbitPlaneRotation);
        s.position.set(
          finalX,
          s.userData.yOffset +
            Math.sin(s.userData.angle * 2.5) * EARTH_RADIUS * 0.05,
          finalZ
        );
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      /* ... (no change) ... */
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      /* ... (no change) ... */
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material)
            object.material.dispose();
          else if (Array.isArray(object.material))
            object.material.forEach((m) => m.dispose());
        }
      });
      if (currentMount && renderer.domElement) {
        try {
          currentMount.removeChild(renderer.domElement);
        } catch (e) {
          /* ignore */
        }
      }
      renderer.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const marker = selectedCountryMarkerRef.current;
    if (!marker || !sceneRef.current) return;

    if (selectedCountry && selectedCountry.position) {
      const { lat, lon } = selectedCountry.position;
      const { currentCo2Emissions, initialCo2Allowance } = selectedCountry;
      const markerPosition = latLonToVector3(lat, lon, EARTH_RADIUS + 0.03); // Slightly closer to surface
      marker.position.copy(markerPosition);
      marker.visible = true;
      const emissionRatio = currentCo2Emissions / initialCo2Allowance;
      let newColorHex = 0xffeb3b; // Default yellow
      if (emissionRatio < 0.8) newColorHex = 0x4caf50; // Green
      else if (emissionRatio <= 1.0) newColorHex = 0xffeb3b; // Yellow
      else if (emissionRatio <= 1.2) newColorHex = 0xff9800; // Orange
      else newColorHex = 0xf44336; // Red
      if (marker.material instanceof THREE.MeshStandardMaterial) {
        marker.material.color.setHex(newColorHex);
        marker.material.emissive.setHex(newColorHex);
      }
    } else {
      marker.visible = false;
    }
  }, [selectedCountry]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Scene;
