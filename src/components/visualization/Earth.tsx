"use client";

import React from 'react';
import * as THREE from 'three';

export const EARTH_RADIUS = 2;

// Helper to create a simple, irregular patch (flattened sphere)
const createPatch = (color: THREE.ColorRepresentation, radius: number, position: THREE.Vector3, name: string): THREE.Mesh => {
    const patchGeometry = new THREE.SphereGeometry(radius, 12, 8); // Low poly
    patchGeometry.scale(1.5, 0.2, 1); // Flatten it and make it somewhat elliptical
    const patchMaterial = new THREE.MeshToonMaterial({ color: color, transparent: true, opacity: 0.9 });
    const patchMesh = new THREE.Mesh(patchGeometry, patchMaterial);
    patchMesh.position.copy(position);
    // Orient the patch to roughly follow the curvature of the Earth at its position
    patchMesh.lookAt(new THREE.Vector3(0,0,0));
    // Adjust rotation if needed so the "flat" side is outwards. This depends on initial geometry orientation.
    // Typically, a sphere's "top" is Y+, so if we flatten along Y, we might need to rotate X by 90 deg.
    // After scaling, the local Y axis is short. We want this local Y to point roughly towards Earth's center.
    // So, if patch is child of Earth, its default orientation might be fine, or need minor tweaks.
    // For now, let's assume lookAt(0,0,0) and manual rotation/positioning is enough.
    patchMesh.name = name;
    return patchMesh;
};

// Helper to create a cloud puff
const createCloudPuff = (radius: number, position: THREE.Vector3): THREE.Mesh => {
    const puffGeometry = new THREE.SphereGeometry(radius, 8, 6); // Very low poly
    const puffMaterial = new THREE.MeshToonMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4 + Math.random() * 0.2, // Random opacity
        depthWrite: false, // Clouds shouldn't obscure each other too much if overlapping
    });
    const puffMesh = new THREE.Mesh(puffGeometry, puffMaterial);
    puffMesh.position.copy(position);
    return puffMesh;
};


export const createEarthMesh = (): THREE.Mesh => {
  // 1. Base Earth Sphere (Oceans)
  const oceanGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 48, 48);
  const oceanMaterial = new THREE.MeshToonMaterial({ color: 0x3b82f6 }); // Vibrant blue
  const earthMesh = new THREE.Mesh(oceanGeometry, oceanMaterial);
  earthMesh.name = "EarthOceans";
  earthMesh.rotation.z = THREE.MathUtils.degToRad(23.5); // Axial tilt

  // 2. Stylized Landmasses (using simple patches)
  const landMaterial = new THREE.MeshToonMaterial({ color: 0x22c55e }); // Tailwind green-500
  const landGroup = new THREE.Group();
  landGroup.name = "Landmasses";

  // Positions are approximate on a sphere of EARTH_RADIUS + 0.01 (slightly above ocean)
  const landRadius = EARTH_RADIUS + 0.02;

  // Patch 1 (Africa-ish)
  const p1 = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 0.5, 12, 8), landMaterial);
  p1.scale.set(1.2, 1.4, 0.3); // x, y, depth (relative to sphere surface)
  p1.position.setFromSphericalCoords(landRadius, THREE.MathUtils.degToRad(10), THREE.MathUtils.degToRad(20));
  p1.lookAt(0,0,0); // Point "thin" dimension towards center
  landGroup.add(p1);

  // Patch 2 (Americas-ish)
  const p2 = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 0.6, 12, 8), landMaterial);
  p2.scale.set(0.8, 1.8, 0.3);
  p2.position.setFromSphericalCoords(landRadius, THREE.MathUtils.degToRad(20), THREE.MathUtils.degToRad(-100));
  p2.lookAt(0,0,0);
  landGroup.add(p2);

  // Patch 3 (Eurasia-ish)
  const p3 = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 0.7, 12, 8), landMaterial);
  p3.scale.set(2.0, 1.5, 0.3);
  p3.position.setFromSphericalCoords(landRadius, THREE.MathUtils.degToRad(50), THREE.MathUtils.degToRad(70));
  p3.lookAt(0,0,0);
  landGroup.add(p3);

  // Patch 4 (Australia-ish)
  const p4 = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 0.3, 12, 8), landMaterial);
  p4.scale.set(1.2, 1.0, 0.3);
  p4.position.setFromSphericalCoords(landRadius, THREE.MathUtils.degToRad(-25), THREE.MathUtils.degToRad(135));
  p4.lookAt(0,0,0);
  landGroup.add(p4);

  earthMesh.add(landGroup);


  // 3. Stylized Cloud Layer
  const cloudGroup = new THREE.Group();
  cloudGroup.name = "Clouds";
  const cloudMaterial = new THREE.MeshToonMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });

  const numCloudPatches = 15;
  const cloudRadius = EARTH_RADIUS * 1.05; // Clouds float above land/sea

  for (let i = 0; i < numCloudPatches; i++) {
    const puffRadius = EARTH_RADIUS * (0.1 + Math.random() * 0.25); // Varying cloud patch sizes
    const puff = new THREE.Mesh(new THREE.SphereGeometry(puffRadius, 8, 6), cloudMaterial);
    puff.scale.set(1.0 + Math.random()*0.5, 0.2 + Math.random()*0.2 , 1.0 + Math.random()*0.5); // make them irregular blobs

    // Random spherical coordinates
    const phi = Math.acos(-1 + (2 * i) / numCloudPatches); // Distribute somewhat evenly in latitude
    const theta = Math.sqrt(numCloudPatches * Math.PI) * phi + (Math.random() * 0.5 - 0.25) * Math.PI; // Add some randomness to longitude

    puff.position.setFromSphericalCoords(cloudRadius, phi, theta);
    puff.lookAt(earthMesh.position); // Orient towards center of Earth
    cloudGroup.add(puff);
  }
  earthMesh.add(cloudGroup);

  // Animate clouds slowly (can be done in Scene.tsx if preferred)
  // For now, let cloudGroup rotate with Earth. If independent rotation is needed:
  // In Scene.tsx's animate loop: cloudGroup.rotation.y += 0.0001;

  // --- Atmosphere (outer glow) ---
  const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.08, 48, 48); // Make it slightly larger than clouds
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec3 vNormal; void main() { float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5); gl_FragColor = vec4(0.5, 0.75, 1.0, 0.35) * intensity; }`,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  atmosphere.name = "AtmosphereGlow"
  earthMesh.add(atmosphere);

  return earthMesh;
};

const Earth: React.FC = () => null;
export default Earth;
