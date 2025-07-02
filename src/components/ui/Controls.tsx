"use client";

import React from "react";
import { useAppStore } from "@/store/store";

const Controls: React.FC = () => {
  const countries = useAppStore((state) => state.countries);
  const selectedCountryId = useAppStore((state) => state.selectedCountryId);
  const selectCountry = useAppStore((state) => state.selectCountry);
  const adjustEmissions = useAppStore((state) => state.adjustEmissions);
  const fastForwardTime = useAppStore((state) => state.fastForwardTime);
  const resetScenario = useAppStore((state) => state.resetScenario);
  const currentYear = useAppStore((state) => state.currentYear);

  const selectedCountry = countries.find((c) => c.id === selectedCountryId);

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    selectCountry(event.target.value || null);
  };

  const handleEmissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCountryId) {
      const newEmissions = parseInt(event.target.value, 10);
      if (!isNaN(newEmissions)) {
        adjustEmissions(selectedCountryId, Math.max(0, newEmissions));
      }
    }
  };

  return (
    <div className="bg-slate-700 p-4 rounded-xl shadow-lg space-y-5">
      {" "}
      {/* Changed bg, rounded, shadow, spacing */}
      <h2 className="text-2xl font-bold text-sky-300 border-b-2 border-sky-500/50 pb-3 mb-3">
        {" "}
        {/* Larger, accent color, thicker border */}
        Global Controls
      </h2>
      <div>
        <label
          htmlFor="country-select"
          className="block text-sm font-medium text-slate-200 mb-1"
        >
          Select Country:
        </label>
        <select
          id="country-select"
          value={selectedCountryId || ""}
          onChange={handleCountryChange}
          className="w-full p-2.5 rounded-md bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150"
        >
          <option value="">-- Select Country --</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
      {selectedCountry && (
        <div className="space-y-2 pt-2">
          <label
            htmlFor="emission-slider"
            className="block text-sm font-medium text-slate-200"
          >
            Adjust Emissions for{" "}
            <span className="font-semibold text-sky-300">
              {selectedCountry.name}
            </span>
            :
            <span className="text-lg text-sky-200 ml-2">
              {selectedCountry.currentCo2Emissions.toLocaleString()} tons
            </span>
          </label>
          <input
            type="range"
            id="emission-slider"
            min="0"
            max={selectedCountry.initialCo2Allowance * 3}
            value={selectedCountry.currentCo2Emissions}
            onChange={handleEmissionChange}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400" // Styled slider
          />
        </div>
      )}
      <div className="pt-3 space-y-3">
        <button
          onClick={fastForwardTime}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-150 ease-in-out"
        >
          Fast-Forward Time (Next Year)
        </button>
        <button
          onClick={resetScenario}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-150 ease-in-out"
        >
          Reset Scenario
        </button>
      </div>
      <div className="mt-5 p-3 bg-slate-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-sky-200 mb-1">
          Scenario Status:
        </h3>
        <p className="text-base text-slate-300">
          Current Year:{" "}
          <span className="font-bold text-yellow-300 text-xl">
            {currentYear}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Controls;
