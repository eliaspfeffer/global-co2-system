"use client";

import React from 'react';
import * as THREE from 'three';

export const EARTH_RADIUS = 2;

export const createEarthMesh = (): THREE.Mesh => {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 48, 48); // Increased segments for smoother sphere

  const material = new THREE.MeshToonMaterial({
    color: 0x3b82f6, // A more vibrant, friendly blue (Tailwind's blue-500)
    // gradientMap: null, // ToonMaterial uses a gradient map for shading, null gives simple two-tone.
                         // For smoother, create a small 1D gradient texture (e.g., light blue to dark blue)
  });

  const earthMesh = new THREE.Mesh(geometry, material);
  earthMesh.name = "Earth";
  earthMesh.rotation.z = THREE.MathUtils.degToRad(23.5); // Axial tilt

  // --- Atmosphere ---
  const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.035, 48, 48); // Slightly thicker atmosphere
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        // Softer rim lighting effect
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
        gl_FragColor = vec4(0.5, 0.75, 1.0, 0.35) * intensity; // Slightly adjusted color and opacity
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false, // Important for transparency
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  earthMesh.add(atmosphere);

  return earthMesh;
};

// React component placeholder (not directly used in imperative scene)
const Earth: React.FC = () => {
  return null;
};
export default Earth;
