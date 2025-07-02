"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAppStore } from "@/store/store";

// Cesium imports
import * as Cesium from "cesium";

const Scene: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const cesiumViewerRef = useRef<Cesium.Viewer | null>(null);
  const entitiesRef = useRef<Map<string, Cesium.Entity>>(new Map());
  const satellitesRef = useRef<Cesium.Entity[]>([]);
  const animationRef = useRef<number | null>(null);
  const [isGlobeLoaded, setIsGlobeLoaded] = useState(false);

  const selectedCountryId = useAppStore((state) => state.selectedCountryId);
  const countries = useAppStore((state) => state.countries);
  const selectCountry = useAppStore((state) => state.selectCountry);

  // Initialize Cesium 3D Globe
  useEffect(() => {
    if (!viewerRef.current) return;

    try {
      // Set Cesium's base URL for assets
      (window as any).CESIUM_BASE_URL = "/cesium/";

      // Create the Cesium viewer with basic configuration
      const viewer = new Cesium.Viewer(viewerRef.current, {
        baseLayerPicker: false,
        geocoder: false,
        homeButton: true,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: true,
        vrButton: false,
        selectionIndicator: true,
        infoBox: true,
        shouldAnimate: true,
      });

      // Use default Cesium satellite imagery (Bing Maps)
      // This avoids the configuration complexity and provides good satellite imagery

      // Enable lighting based on sun/moon positions for realistic day/night
      viewer.scene.globe.enableLighting = true;

      // Set initial camera position to show the whole globe
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000), // View from above equator
        orientation: {
          heading: 0,
          pitch: -Math.PI / 2, // Look down
          roll: 0,
        },
      });

      cesiumViewerRef.current = viewer;
      setIsGlobeLoaded(true);

      // Add flying satellites
      const satelliteColors = [
        Cesium.Color.GOLD,
        Cesium.Color.CYAN,
        Cesium.Color.MAGENTA,
        Cesium.Color.LIME,
        Cesium.Color.ORANGE,
      ];

      // Create 5 orbiting satellites
      for (let i = 0; i < 5; i++) {
        const satellite = viewer.entities.add({
          name: `Satellite-${i + 1}`,
          position: Cesium.Cartesian3.fromDegrees(0, 0, 8000000 + i * 1000000), // Initial position
          point: {
            pixelSize: 8,
            color: satelliteColors[i],
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.NONE,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: `SAT-${i + 1}`,
            font: "10pt monospace",
            fillColor: satelliteColors[i],
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15),
            scale: 0.8,
          },
          description: `
            <div style="font-family: monospace;">
              <h3>Satellite ${i + 1}</h3>
              <p>Monitoring global CO2 emissions</p>
              <p>Orbital Speed: ${(0.5 + i * 0.3).toFixed(1)} rev/min</p>
              <p>Status: Active</p>
            </div>
          `,
        });

        satellitesRef.current.push(satellite);
      }

      // Start animation loop for smooth satellite movement
      const animate = () => {
        if (cesiumViewerRef.current && !cesiumViewerRef.current.isDestroyed()) {
          const time = Date.now() * 0.001; // Current time in seconds

          // Update satellite positions
          satellitesRef.current.forEach((satellite, index) => {
            const speed = 0.5 + index * 0.3; // Different speeds for each satellite
            const radius = 8000000 + index * 1000000; // Different orbital radii (8-12 million meters)
            const angle = time * speed + (index * Math.PI * 2) / 5; // Offset each satellite
            const inclination = (index - 2) * 0.3; // Different orbital inclinations

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.sin(angle * 2) * radius * 0.1 * inclination; // Slight vertical oscillation

            (satellite.position as any) = new Cesium.ConstantProperty(
              Cesium.Cartesian3.fromElements(x, y, z)
            );
          });

          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animate();

      // Handle clicks on empty space to deselect
      viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
        (event: any) => {
          const pickedObject = viewer.scene.pick(event.position);
          if (!pickedObject) {
            selectCountry(null);
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
    } catch (error) {
      console.error("Error initializing Cesium:", error);
      // Fallback message
      if (viewerRef.current) {
        viewerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-900 text-white">
            <div class="text-center p-8">
              <h2 class="text-2xl font-bold mb-4">3D Globe Loading Error</h2>
              <p class="mb-4">There was an issue loading the 3D globe. Please try refreshing the page.</p>
              <p class="text-sm text-gray-400">Error: ${error}</p>
              <p class="text-xs text-gray-500 mt-2">Using Cesium.js for 3D visualization</p>
            </div>
          </div>
        `;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (cesiumViewerRef.current && !cesiumViewerRef.current.isDestroyed()) {
        cesiumViewerRef.current.destroy();
        cesiumViewerRef.current = null;
      }
      satellitesRef.current = [];
    };
  }, [selectCountry]);

  // Get marker color based on country's CO2 status
  const getMarkerColor = (country: any): Cesium.Color => {
    const emissionRatio =
      country.currentCo2Emissions / country.initialCo2Allowance;

    if (emissionRatio < 0.8) return Cesium.Color.LIME; // Green - well under allowance
    if (emissionRatio <= 1.0) return Cesium.Color.YELLOW; // Yellow - close to allowance
    if (emissionRatio <= 1.2) return Cesium.Color.ORANGE; // Orange - slightly over
    return Cesium.Color.RED; // Red - significantly over
  };

  // Create or update country markers
  useEffect(() => {
    if (!isGlobeLoaded || !cesiumViewerRef.current) return;

    const viewer = cesiumViewerRef.current;

    // Clear existing entities
    entitiesRef.current.forEach((entity) => {
      viewer.entities.remove(entity);
    });
    entitiesRef.current.clear();

    // Create markers for each country
    countries.forEach((country) => {
      const emissionRatio =
        country.currentCo2Emissions / country.initialCo2Allowance;
      const statusText =
        emissionRatio > 1 ? "OVER ALLOWANCE" : "WITHIN ALLOWANCE";
      const isSelected = country.id === selectedCountryId;

      const entity = viewer.entities.add({
        id: country.id,
        name: country.name,
        position: Cesium.Cartesian3.fromDegrees(
          country.position.lon,
          country.position.lat,
          10000
        ),
        point: {
          pixelSize: new Cesium.ConstantProperty(isSelected ? 20 : 15),
          color: new Cesium.ConstantProperty(getMarkerColor(country)),
          outlineColor: new Cesium.ConstantProperty(
            isSelected ? Cesium.Color.WHITE : Cesium.Color.BLACK
          ),
          outlineWidth: new Cesium.ConstantProperty(isSelected ? 3 : 2),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: new Cesium.ConstantProperty(country.name),
          font: new Cesium.ConstantProperty("12pt sans-serif"),
          fillColor: new Cesium.ConstantProperty(Cesium.Color.WHITE),
          outlineColor: new Cesium.ConstantProperty(Cesium.Color.BLACK),
          outlineWidth: new Cesium.ConstantProperty(2),
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.ConstantProperty(
            new Cesium.Cartesian2(0, -30)
          ),
          show: new Cesium.ConstantProperty(isSelected),
        },
        description: new Cesium.ConstantProperty(`
          <div style="font-family: sans-serif; max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${country.name}</h3>
            <p style="margin: 5px 0;"><strong>Current Emissions:</strong> ${country.currentCo2Emissions.toLocaleString()} tons</p>
            <p style="margin: 5px 0;"><strong>Allowance:</strong> ${country.initialCo2Allowance.toLocaleString()} tons</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${
              emissionRatio > 1 ? "#f44336" : "#4caf50"
            }; font-weight: bold;">${statusText}</span></p>
            <p style="margin: 5px 0;"><strong>Ratio:</strong> ${(
              emissionRatio * 100
            ).toFixed(1)}%</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Click to select this country</p>
          </div>
        `),
      });

      entitiesRef.current.set(country.id, entity);
    });

    // Handle entity selection
    viewer.selectedEntityChanged.addEventListener(() => {
      const selectedEntity = viewer.selectedEntity;
      if (selectedEntity && selectedEntity.id) {
        selectCountry(selectedEntity.id as string);
      }
    });
  }, [countries, isGlobeLoaded, selectedCountryId, selectCountry]);

  // Update markers when selection changes
  useEffect(() => {
    if (!isGlobeLoaded || !cesiumViewerRef.current) return;

    const viewer = cesiumViewerRef.current;

    entitiesRef.current.forEach((entity, countryId) => {
      const country = countries.find((c) => c.id === countryId);
      if (country && entity.point && entity.label) {
        const isSelected = countryId === selectedCountryId;

        // Update point properties
        (entity.point.pixelSize as any) = new Cesium.ConstantProperty(
          isSelected ? 20 : 15
        );
        (entity.point.outlineWidth as any) = new Cesium.ConstantProperty(
          isSelected ? 3 : 2
        );
        (entity.point.outlineColor as any) = new Cesium.ConstantProperty(
          isSelected ? Cesium.Color.WHITE : Cesium.Color.BLACK
        );

        // Show/hide label
        (entity.label.show as any) = new Cesium.ConstantProperty(isSelected);
      }
    });

    // Fly to selected country
    if (selectedCountryId) {
      const selectedCountry = countries.find((c) => c.id === selectedCountryId);
      if (selectedCountry) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            selectedCountry.position.lon,
            selectedCountry.position.lat,
            5000000 // 5000km altitude for country view
          ),
          duration: 2.0,
        });
      }
    }
  }, [selectedCountryId, countries, isGlobeLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={viewerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-sm mb-2">CO2 Emission Status</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-lime-500"></div>
            <span>Under allowance (&lt;80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Near allowance (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Slightly over (100-120%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Significantly over (&gt;120%)</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-black/80 text-white rounded-lg p-3 shadow-lg max-w-xs">
        <h4 className="font-semibold text-sm mb-1">3D Globe Controls:</h4>
        <ul className="text-xs space-y-1">
          <li>
            • <strong>Rotate:</strong> Left-click + drag
          </li>
          <li>
            • <strong>Zoom:</strong> Mouse wheel or right-click + drag
          </li>
          <li>
            • <strong>Select country:</strong> Click markers
          </li>
          <li>
            • <strong>Click satellites:</strong> See monitoring info
          </li>
          <li>
            • <strong>Home view:</strong> Click home button
          </li>
          <li>
            • <strong>Day/Night:</strong> Realistic lighting
          </li>
        </ul>
        <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300">
          <div>
            🛰️ <strong>5 Satellites</strong> monitor CO2 emissions
          </div>
          <div>📊 Global Fund starts at 0, grows via trades</div>
        </div>
      </div>

      {/* Credits */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white rounded-lg p-2 text-xs">
        <div>
          Powered by <strong>Cesium.js</strong>
        </div>
        <div>Satellite Imagery: Cesium/Bing</div>
        <div className="text-green-400">✓ Completely Free</div>
      </div>
    </div>
  );
};

export default Scene;
