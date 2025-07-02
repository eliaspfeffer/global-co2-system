"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createEarthMesh, EARTH_RADIUS } from './Earth'; // createEarthMesh now returns a group
import { useAppStore } from '@/store/store';

const latLonToVector3 = (lat: number, lon: number, radius: number, target?: THREE.Vector3): THREE.Vector3 => {
  const vec = target || new THREE.Vector3();
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  // Y-up coordinate system:
  // x = R * cos(lat) * sin(lon)
  // y = R * sin(lat)
  // z = R * cos(lat) * cos(lon)
  vec.set(
    radius * Math.cos(latRad) * Math.sin(lonRad),
    radius * Math.sin(latRad),
    radius * Math.cos(latRad) * Math.cos(lonRad)
  );
  return vec;
};

const Scene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const selectedCountryMarkerRef = useRef<THREE.Mesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const earthGroupRef = useRef<THREE.Mesh | null>(null); // Earth mesh itself (oceans)
  const cloudGroupRef = useRef<THREE.Group | null>(null); // Cloud group for independent rotation

  const selectedCountryId = useAppStore((state) => state.selectedCountryId);
  const countries = useAppStore((state) => state.countries);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, EARTH_RADIUS * 0.8, EARTH_RADIUS * 3.5); // Adjusted camera
    camera.lookAt(0,0,0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = EARTH_RADIUS + 0.5;
    controls.maxDistance = EARTH_RADIUS * 7;
    controls.autoRotate = false; // Disable autoRotate on controls, we'll rotate Earth itself
    controls.target.set(0,0,0);

    // Earth group (oceans, land, clouds, atmosphere)
    const earthSystem = createEarthMesh(); // This is the main ocean sphere with children
    scene.add(earthSystem);
    earthGroupRef.current = earthSystem; // Store the main Earth mesh (oceans) for its rotation

    // Find the cloud group if we want to rotate it independently
    const clouds = earthSystem.getObjectByName("Clouds") as THREE.Group;
    if (clouds) {
        cloudGroupRef.current = clouds;
    }


    const satellites: THREE.Mesh[] = []; // ... (satellite setup remains largely the same)
    const satelliteColors = [0xffcc00, 0x00ccff, 0xcc00ff, 0x00ffcc, 0xff00cc];
    for (let i = 0; i < 5; i++) {
      const satelliteGeometry = new THREE.SphereGeometry(0.04 * EARTH_RADIUS, 10, 10);
      const satelliteMaterial = new THREE.MeshToonMaterial({
        color: satelliteColors[i % satelliteColors.length],
        emissive: satelliteColors[i % satelliteColors.length],
        emissiveIntensity: 0.3
      });
      const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
      const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
      const distance = EARTH_RADIUS * 1.4 + Math.random() * EARTH_RADIUS * 0.3;
      const yOffset = (Math.random() - 0.5) * EARTH_RADIUS * 0.5;
      satellite.userData = { angle, distance, speed: 0.004 + Math.random() * 0.006, yOffset, orbitPlaneRotation: Math.random() * Math.PI };
      satellites.push(satellite);
      scene.add(satellite);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(EARTH_RADIUS * 2.5, EARTH_RADIUS * 1.5, EARTH_RADIUS * 2);
    scene.add(directionalLight);

    const markerGeometry = new THREE.SphereGeometry(0.06 * EARTH_RADIUS, 16, 16);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffeb3b, emissive: 0x000000, emissiveIntensity: 0.8,
      transparent: true, opacity: 0.95, depthTest: false,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.renderOrder = 10; // Ensure marker is rendered on top
    marker.visible = false;
    // Add marker to the Earth group so it rotates with the Earth
    earthSystem.add(marker);
    selectedCountryMarkerRef.current = marker;

    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotate Earth (oceans, land, atmosphere)
      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.y += 0.0005 + delta * 0.02; // Slow rotation
      }
      // Rotate clouds independently and slightly faster/slower or different direction
      if (cloudGroupRef.current) {
        cloudGroupRef.current.rotation.y += 0.0002 + delta * 0.01;
        cloudGroupRef.current.rotation.x += delta * 0.005; // Slight wobble for clouds
      }

      satellites.forEach(s => { /* ... (satellite animation, no change) ... */
        s.userData.angle += s.userData.speed;
        const x = Math.cos(s.userData.angle) * s.userData.distance;
        const z = Math.sin(s.userData.angle) * s.userData.distance;
        const finalX = x * Math.cos(s.userData.orbitPlaneRotation) - z * Math.sin(s.userData.orbitPlaneRotation);
        const finalZ = x * Math.sin(s.userData.orbitPlaneRotation) + z * Math.cos(s.userData.orbitPlaneRotation);
        s.position.set(finalX, s.userData.yOffset + Math.sin(s.userData.angle * 2.5) * EARTH_RADIUS * 0.05, finalZ);
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => { /* ... (no change) ... */
        if (currentMount) {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        }
    };
    window.addEventListener('resize', handleResize);

    return () => { /* ... (cleanup, no change) ... */
        window.removeEventListener('resize', handleResize);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        controls.dispose();
        scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) object.material.dispose();
            else if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
            }
        });
        if (currentMount && renderer.domElement) {
            try { currentMount.removeChild(renderer.domElement); } catch (e) { /* ignore */ }
        }
        renderer.dispose();
        sceneRef.current = null;
        earthGroupRef.current = null;
        cloudGroupRef.current = null;
    };
  }, []);

  // Update marker position: Now relative to the earthSystem group
  useEffect(() => {
    const marker = selectedCountryMarkerRef.current;
    // const earth = earthGroupRef.current; // Not strictly needed for marker position if it's child
    if (!marker || !sceneRef.current ) return;

    const selectedCountry = countries.find(c => c.id === selectedCountryId);

    if (selectedCountry && selectedCountry.position) {
      const { lat, lon, currentCo2Emissions, initialCo2Allowance } = selectedCountry;

      // Marker position is now local to the earthSystem if it's a child.
      // The latLonToVector3 should still calculate position on a sphere of EARTH_RADIUS.
      const markerPositionOnSphere = latLonToVector3(lat, lon, EARTH_RADIUS + 0.03);
      marker.position.copy(markerPositionOnSphere);
      // No need to adjust for Earth's rotation if marker is a child of earthSystem.

      marker.visible = true;
      const emissionRatio = currentCo2Emissions / initialCo2Allowance;
      let newColorHex = 0xffeb3b;
      if (emissionRatio < 0.8) newColorHex = 0x4caf50;
      else if (emissionRatio <= 1.0) newColorHex = 0xffeb3b;
      else if (emissionRatio <= 1.2) newColorHex = 0xff9800;
      else newColorHex = 0xf44336;
      if (marker.material instanceof THREE.MeshStandardMaterial) {
        marker.material.color.setHex(newColorHex);
        marker.material.emissive.setHex(newColorHex);
      }
    } else {
      marker.visible = false;
    }
  }, [selectedCountryId, countries]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Scene;
