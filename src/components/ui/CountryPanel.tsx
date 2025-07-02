"use client";

import React from 'react';
import { useAppStore } from '@/store/store';

const CountryPanel: React.FC = () => {
  const {
    selectedCountryId,
    countries,
    initiatePenaltyVote,
    activeVoteProposals, // To check if a vote is already active for this country
  } = useAppStore(state => ({
    selectedCountryId: state.selectedCountryId,
    countries: state.countries,
    initiatePenaltyVote: state.initiatePenaltyVote,
    activeVoteProposals: state.activeVoteProposals,
  }));

  const selectedCountry = countries.find(c => c.id === selectedCountryId);

  if (!selectedCountry) {
    return (
      <div className="bg-slate-700 p-4 rounded-xl shadow-lg mt-3">
        <h2 className="text-xl font-semibold mb-2 text-sky-300">Country Details</h2>
        <p className="text-slate-300">Select a country to see details.</p>
      </div>
    );
  }

  const {
    id: countryId,
    name,
    initialCo2Allowance,
    currentCo2Emissions,
    conceptualBitcoinDeposit,
    conceptualGoldDeposit,
    isPenalized
  } = selectedCountry;

  const deficit = currentCo2Emissions - initialCo2Allowance;
  const isInDeficit = deficit > 0;
  const isVoteActiveForSelectedCountry = activeVoteProposals.some(p => p.targetCountryId === countryId && p.status === 'active');


  const handleRefuseToSettle = () => {
    if (countryId) {
      initiatePenaltyVote(countryId);
    }
  };

  let panelBgClass = 'bg-slate-600';
  if (isPenalized) {
    panelBgClass = 'bg-purple-700/80';
  } else if (isVoteActiveForSelectedCountry) {
    panelBgClass = 'bg-orange-700/70'; // Different color if vote is active
  } else if (isInDeficit) {
    panelBgClass = 'bg-red-700/70';
  }

  return (
    <div className={`p-5 rounded-xl shadow-lg text-white mt-3 ${panelBgClass} transition-colors duration-300`}>
      <h2 className={`text-2xl font-bold mb-4 pb-3 border-b-2 ${isPenalized ? 'border-purple-400/50 text-purple-200' : isVoteActiveForSelectedCountry ? 'border-orange-400/50 text-orange-200' : isInDeficit ? 'border-red-400/50 text-red-200' : 'border-sky-500/50 text-sky-300'}`}>
        {name}
        {isPenalized ? " (Penalized)" : ""}
        {isVoteActiveForSelectedCountry ? " (Vote Active)" : ""}
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-200">CO2 Allowance:</span>
          <span className="font-mono text-slate-100">{initialCo2Allowance.toLocaleString()} tons</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-200">Current Emissions:</span>
          <span className={`font-mono font-medium ${isInDeficit && !isPenalized && !isVoteActiveForSelectedCountry ? 'text-red-300' : (isPenalized ? 'text-purple-300' : (isVoteActiveForSelectedCountry ? 'text-orange-300' : 'text-green-300'))}`}>
            {currentCo2Emissions.toLocaleString()} tons
          </span>
        </div>

        {isInDeficit && !isPenalized && !isVoteActiveForSelectedCountry && (
          <div className="p-3 bg-red-500/40 rounded-md my-2 text-red-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Deficit:</span>
              <span className="font-bold font-mono">{deficit.toLocaleString()} tons</span>
            </div>
            <p className="text-xs mt-1">This country needs to acquire {deficit.toLocaleString()} tons of CO2 allowances or face penalties.</p>
          </div>
        )}
        {isVoteActiveForSelectedCountry && !isPenalized && (
             <div className="p-3 bg-orange-500/40 rounded-md my-2 text-orange-100">
                <p className="text-base font-semibold text-center">A penalty vote is currently active against {name}!</p>
                <p className="text-xs mt-1 text-center">Other nations are deciding on potential sanctions.</p>
            </div>
        )}
        {!isInDeficit && deficit < 0 && !isPenalized && (
           <div className="p-3 bg-green-500/40 rounded-md my-2 text-green-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Surplus:</span>
              <span className="font-bold font-mono">{Math.abs(deficit).toLocaleString()} tons</span>
            </div>
             <p className="text-xs mt-1">This country has surplus allowances to trade.</p>
          </div>
        )}
         {isPenalized && (
          <div className="p-3 bg-purple-500/50 rounded-md my-2 text-purple-100">
            <p className="text-lg font-semibold text-center">This country has been penalized!</p>
            <p className="text-xs mt-1 text-center">Deposits have been reduced.</p>
          </div>
        )}

        <div className={`pt-4 mt-4 border-t-2 ${isInDeficit && !isPenalized ? 'border-red-400/50' : (isPenalized ? 'border-purple-400/50' : (isVoteActiveForSelectedCountry ? 'border-orange-400/50' : 'border-slate-500/50'))}`}>
          <h3 className={`text-lg font-semibold mb-3 ${isInDeficit && !isPenalized ? 'text-red-200' : (isPenalized ? 'text-purple-200' : (isVoteActiveForSelectedCountry ? 'text-orange-200' : 'text-slate-200'))}`}>
            Conceptual Deposits {isInDeficit && !isPenalized && !isVoteActiveForSelectedCountry ? <span className="text-xs">(At Risk!)</span> : ""}
          </h3>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <span className="text-2xl mr-2 text-yellow-400">₿</span>
              <span className="font-semibold text-slate-200">Bitcoin:</span>
            </div>
            <span className={`font-mono ${(isPenalized || (isVoteActiveForSelectedCountry && isInDeficit)) && conceptualBitcoinDeposit <=0 ? 'line-through text-slate-400' : 'text-slate-100'}`}>{conceptualBitcoinDeposit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
             <div className="flex items-center">
              <span className="text-2xl mr-2 text-amber-400">♛</span>
              <span className="font-semibold text-slate-200">Gold:</span>
            </div>
            <span className={`font-mono ${(isPenalized || (isVoteActiveForSelectedCountry && isInDeficit)) && conceptualGoldDeposit <=0 ? 'line-through text-slate-400' : 'text-slate-100'}`}>{conceptualGoldDeposit.toLocaleString()} oz</span>
          </div>
        </div>
      </div>

      {isInDeficit && !isPenalized && !isVoteActiveForSelectedCountry && (
        <div className="mt-6 space-y-2.5">
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all duration-150"
            // onClick={() => {/* TODO: Link to marketplace panel or scroll to it */}}
          >
            Acquire CO2 Allowances (Market)
          </button>
          <div className="p-2 bg-red-800/50 rounded-md ring-2 ring-red-500 animate-pulse"> {/* Pulsing warning for this button */}
            <button
              onClick={handleRefuseToSettle}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all duration-150"
            >
              Refuse to Settle Deficit (Trigger Global Vote)
            </button>
            <p className="text-xs text-red-200 mt-1.5 text-center">Warning: This may lead to other nations voting on penalties against your country's deposits.</p>
          </div>
        </div>
      )}
       {!isInDeficit && deficit < 0 && !isPenalized && !isVoteActiveForSelectedCountry && ( // Hide if vote active for them
        <div className="mt-6">
          <button
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-4 rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all duration-150"
          >
            Offer Surplus on Market
          </button>
        </div>
      )}
    </div>
  );
};

export default CountryPanel;
