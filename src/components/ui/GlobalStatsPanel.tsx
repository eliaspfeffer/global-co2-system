"use client";

import React from "react";
import { useAppStore, selectCurrentGlobalEmissions } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

const GlobalStatsPanel: React.FC = () => {
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
        <h3 className="text-lg font-semibold text-teal-200 mb-2">
          Satellite Network Fund
        </h3>
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
    </div>
  );
};

export default GlobalStatsPanel;
