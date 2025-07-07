"use client";

import React, { useState } from "react";
import { useAppStore, selectCurrentGlobalEmissions } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

const GlobalStatsPanel: React.FC = () => {
  const [showFundExplanation, setShowFundExplanation] = useState(false);

  const { currentGlobalBudget, currentYear, satelliteNetworkFund } =
    useAppStore(
      useShallow((state) => ({
        currentGlobalBudget: state.currentGlobalBudget,
        currentYear: state.currentYear,
        satelliteNetworkFund: state.satelliteNetworkFund,
      }))
    );
  const currentGlobalEmissions = useAppStore(selectCurrentGlobalEmissions);

  // The concept of 'budgetDifference' and 'isOverBudget' now refers to the annually shrinking budget.
  const budgetDifference = currentGlobalBudget - currentGlobalEmissions;
  const isOverBudget = currentGlobalEmissions > currentGlobalBudget;

  return (
    <div className="bg-slate-700 p-4 rounded-xl shadow-lg mt-3 text-white">
      <h2 className="text-2xl font-bold text-teal-300 border-b-2 border-teal-500/50 pb-3 mb-4">
        Global CO₂ Status - Year:{" "}
        <span className="text-yellow-300">{currentYear}</span>
      </h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-200">
            Current Global CO₂ Allotment:
          </span>{" "}
          {/* Changed label */}
          <span className="font-mono text-slate-100">
            {currentGlobalBudget.toLocaleString("en-US")} tons
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-200">
            Current Total Global Emissions:
          </span>
          <span
            className={`font-mono font-bold ${
              isOverBudget ? "text-red-400" : "text-green-400"
            }`}
          >
            {currentGlobalEmissions.toLocaleString("en-US")} tons
          </span>
        </div>
        <div
          className={`p-2.5 rounded-md mt-1 ${
            isOverBudget
              ? "bg-red-700/40 text-red-200"
              : "bg-green-700/40 text-green-200"
          }`}
        >
          {isOverBudget ? (
            <p className="font-semibold">
              <span className="font-bold">
                {(currentGlobalEmissions - currentGlobalBudget).toLocaleString(
                  "en-US"
                )}{" "}
                tons OVER
              </span>{" "}
              current global allotment!
            </p>
          ) : (
            <p className="font-semibold">
              <span className="font-bold">
                {budgetDifference.toLocaleString("en-US")} tons REMAINING
              </span>{" "}
              in current global allotment.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-slate-600/50">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-semibold text-teal-200">
            Satellite Network Fund
          </h3>
          <button
            onClick={() => setShowFundExplanation(true)}
            className="ml-2 w-5 h-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold flex items-center justify-center transition-colors"
            title="Learn about the Satellite Network Fund"
          >
            ?
          </button>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <span className="text-xl mr-1.5 text-yellow-400">₿</span>
            <span className="font-semibold text-slate-200">Bitcoin:</span>
          </div>
          <span className="font-mono text-slate-100">
            {satelliteNetworkFund.bitcoin.toLocaleString("en-US")}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <div className="flex items-center">
            <span className="text-xl mr-1.5 text-amber-400">♛</span>
            <span className="font-semibold text-slate-200">Gold:</span>
          </div>
          <span className="font-mono text-slate-100">
            {satelliteNetworkFund.gold.toLocaleString("en-US")} oz
          </span>
        </div>
      </div>

      {/* Satellite Network Fund Explanation Modal */}
      {showFundExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto text-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-teal-200">
                🛰️ Satellite Network Fund
              </h2>
              <button
                onClick={() => setShowFundExplanation(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <p className="text-slate-200">
                The <strong>Satellite Network Fund</strong> is the economic
                backbone that powers transparent global CO2 monitoring - like a
                "public goods fund" specifically designed to expand satellite
                coverage.
              </p>

              <div className="bg-slate-700 p-3 rounded">
                <h3 className="font-semibold text-blue-300 mb-2">
                  💰 How It Gets Funded:
                </h3>
                <ul className="space-y-1 text-slate-300">
                  <li>
                    • <strong>🚨 Bitcoin Seizures:</strong> 70% of violating
                    countries' Bitcoin
                  </li>
                  <li>
                    • <strong>⚖️ Penalty Distributions:</strong> 30% of excess
                    emission penalties
                  </li>
                  <li>
                    • <strong>🎯 Detection Rewards:</strong> 10% of satellite
                    rewards
                  </li>
                </ul>
              </div>

              <div className="bg-slate-700 p-3 rounded">
                <h3 className="font-semibold text-green-300 mb-2">
                  🚀 What It Funds:
                </h3>
                <ul className="space-y-1 text-slate-300">
                  <li>
                    • <strong>₿15 per satellite launch</strong> for any
                    satellite company
                  </li>
                  <li>
                    • <strong>Network expansion</strong> across 5 companies:
                    SkyNet, NASA, SpaceX, Orbit Monitor, Pi Watch
                  </li>
                  <li>
                    • <strong>Better global coverage</strong> = Higher detection
                    accuracy
                  </li>
                </ul>
              </div>

              <div className="bg-blue-900/30 p-3 rounded border border-blue-700/50">
                <h3 className="font-semibold text-yellow-300 mb-2">
                  🔄 Self-Sustaining Loop:
                </h3>
                <p className="text-slate-300 text-xs">
                  More Violations Detected → Higher Penalties → Larger Fund →
                  More Satellites → Better Coverage → More Violations Detected
                </p>
              </div>

              <div className="bg-purple-900/30 p-3 rounded border border-purple-700/50">
                <h3 className="font-semibold text-purple-300 mb-2">
                  🎯 Strategic Purpose:
                </h3>
                <p className="text-slate-300">
                  <strong>Problem:</strong> Countries won't fund monitoring that
                  might catch them
                  <br />
                  <strong>Solution:</strong> Violators fund their own detection
                  through seizures
                </p>
              </div>

              <p className="text-slate-400 text-xs italic">
                💡 The fund grows stronger with each violation, creating a
                positive feedback loop for global climate accountability!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalStatsPanel;
