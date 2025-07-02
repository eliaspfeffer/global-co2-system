"use client";

import React from "react";
import { useAppStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

const VotingPanel: React.FC = () => {
  const { countries, selectedCountryId, activeVoteProposals, castVote } =
    useAppStore(
      useShallow((state) => ({
        countries: state.countries,
        selectedCountryId: state.selectedCountryId,
        activeVoteProposals: state.activeVoteProposals,
        castVote: state.castVote,
      }))
    );

  const getCountryName = (id: string) =>
    countries.find((c) => c.id === id)?.name || "Unknown Country";
  const getCountryData = (id: string) => countries.find((c) => c.id === id);

  const handleVote = (targetCountryId: string, voteChoice: "yes" | "no") => {
    if (!selectedCountryId) {
      alert("Please select your country (as voter) first.");
      return;
    }
    if (selectedCountryId === targetCountryId) {
      alert("Your country cannot vote on its own penalty proposal.");
      return;
    }
    castVote(selectedCountryId, targetCountryId, voteChoice);
  };

  const proposalsForDisplay = [...activeVoteProposals].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  if (proposalsForDisplay.length === 0) {
    return (
      <div className="bg-slate-700 p-4 rounded-xl shadow-lg mt-3">
        <h2 className="text-xl font-semibold text-orange-300 border-b-2 border-orange-500/50 pb-3">
          Penalty Voting
        </h2>
        <p className="text-slate-300 text-sm mt-2 italic">
          No penalty votes initiated yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-700 p-4 rounded-xl shadow-lg mt-3 text-white space-y-5">
      <h2 className="text-2xl font-bold text-orange-300 border-b-2 border-orange-500/50 pb-3 mb-3">
        Voting Proposals
      </h2>

      {proposalsForDisplay.map((proposal) => {
        const targetCountry = getCountryData(proposal.targetCountryId);
        const targetCountryName = targetCountry?.name || "Unknown Country";
        const deficitAmount = targetCountry
          ? targetCountry.currentCo2Emissions -
            targetCountry.initialCo2Allowance
          : 0;

        const yesVotes = Object.values(proposal.votes).filter(
          (v) => v === "yes"
        ).length;
        const noVotes = Object.values(proposal.votes).filter(
          (v) => v === "no"
        ).length;
        const totalVotes = yesVotes + noVotes;
        const voterHasVoted =
          selectedCountryId && proposal.votes[selectedCountryId];
        const isTargetCountrySelected =
          selectedCountryId === proposal.targetCountryId;

        let statusMessage = "";
        let statusColor = "text-yellow-300";
        let bgColor = "bg-slate-800";
        let voteTypeLabel = "";
        let voteTypeIcon = "";

        // Determine vote type display
        if (proposal.type === "satellite_detection") {
          voteTypeLabel = "Satellite Detection Verification";
          voteTypeIcon = "🛰️";
        } else if (proposal.type === "bitcoin_seizure") {
          voteTypeLabel = "Bitcoin Seizure Vote";
          voteTypeIcon = "⚖️";
        } else {
          voteTypeLabel = "Legacy Penalty Vote";
          voteTypeIcon = "⚠️";
        }

        if (proposal.status === "active") {
          statusMessage = "Voting Active";
        } else if (proposal.status === "passed") {
          statusMessage = "Vote Passed (Pending Execution)";
          statusColor = "text-green-300";
          bgColor = "bg-green-800/30";
        } else if (proposal.status === "executed") {
          statusMessage =
            proposal.type === "satellite_detection"
              ? "Detection Confirmed!"
              : proposal.type === "bitcoin_seizure"
              ? "Bitcoin Seized!"
              : "Penalty Executed!";
          statusColor = "text-red-300";
          bgColor = "bg-purple-800/50";
        } else if (proposal.status === "failed") {
          statusMessage = "Vote Failed";
          statusColor = "text-orange-400";
          bgColor = "bg-orange-800/30";
        }

        return (
          <div
            key={proposal.targetCountryId + proposal.createdAt}
            className={`p-3.5 rounded-lg shadow ${bgColor} hover:shadow-md transition-shadow`}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold mb-1">
                {voteTypeIcon} {voteTypeLabel}
              </h3>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor} ${
                  bgColor === "bg-slate-800" ? "bg-slate-700" : ""
                }`}
              >
                {statusMessage.toUpperCase()}
              </span>
            </div>
            <p className="text-md font-semibold text-red-400 mb-2">
              Target: {targetCountryName}
            </p>

            {proposal.type === "satellite_detection" &&
              proposal.satelliteData && (
                <div className="text-xs text-slate-300 mb-2 space-y-1 bg-slate-600/50 p-2 rounded">
                  <p>
                    <strong>Detected Emissions:</strong>{" "}
                    {proposal.satelliteData.detectedEmissions.toLocaleString()}{" "}
                    tons CO₂
                  </p>
                  <p>
                    <strong>Excess Amount:</strong>{" "}
                    {proposal.satelliteData.excessAmount.toLocaleString()} tons
                  </p>
                  <p>
                    <strong>Satellite Coverage:</strong>{" "}
                    {Math.round(proposal.satelliteData.coverageLevel * 100)}%
                  </p>
                  <p>
                    <strong>Detecting Satellites:</strong>{" "}
                    {proposal.satelliteData.detectingSatellites.length} active
                  </p>
                  <p className="italic text-amber-300">
                    Countries must vote whether to trust this satellite data.
                  </p>
                </div>
              )}

            {proposal.type === "bitcoin_seizure" && (
              <div className="text-xs text-slate-300 mb-2 bg-red-900/30 p-2 rounded">
                <p className="italic text-red-300">
                  This country refused to purchase CO₂ reserves to cover excess
                  emissions. Vote to authorize Bitcoin seizure via
                  multisignature wallet for carbon offset purchases.
                </p>
              </div>
            )}

            {!proposal.type && (
              <p className="text-xs text-slate-300 mb-1 italic">
                Reason: Exceeded CO₂ allowance by{" "}
                {deficitAmount > 0
                  ? deficitAmount.toLocaleString("en-US")
                  : "N/A"}{" "}
                tons and did not settle via market.
              </p>
            )}
            <p className="text-xs text-slate-400 mb-2">
              Initiated: {new Date(proposal.createdAt).toLocaleTimeString()}{" "}
              {new Date(proposal.createdAt).toLocaleDateString()}
            </p>

            <div className="my-2 text-sm">
              <p>
                Votes:{" "}
                <span className="font-bold text-green-400">
                  Yes: {yesVotes}
                </span>{" "}
                / <span className="font-bold text-red-400">No: {noVotes}</span>{" "}
                (Total: {totalVotes})
              </p>
              <div className="w-full bg-slate-600 rounded-full h-2.5 mt-1">
                <div
                  className="bg-green-500 h-2.5 rounded-l-full"
                  style={{
                    width: `${(yesVotes / (countries.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Needed for 2/3 majority:{" "}
                {Math.ceil((countries.length - 1) * (2 / 3))} 'Yes' votes.
              </p>
            </div>

            {proposal.status === "active" &&
              selectedCountryId &&
              !isTargetCountrySelected &&
              !voterHasVoted && (
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleVote(proposal.targetCountryId, "yes")}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-3 rounded-md shadow hover:shadow-md transform hover:scale-105 transition-all"
                  >
                    {proposal.type === "satellite_detection"
                      ? "Trust Satellites"
                      : proposal.type === "bitcoin_seizure"
                      ? "Authorize Seizure"
                      : "Vote Yes (Punish)"}
                  </button>
                  <button
                    onClick={() => handleVote(proposal.targetCountryId, "no")}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded-md shadow hover:shadow-md transform hover:scale-105 transition-all"
                  >
                    {proposal.type === "satellite_detection"
                      ? "Question Data"
                      : proposal.type === "bitcoin_seizure"
                      ? "Reject Seizure"
                      : "Vote No (Spare)"}
                  </button>
                </div>
              )}
            {proposal.status === "active" &&
              selectedCountryId &&
              !isTargetCountrySelected &&
              voterHasVoted && (
                <p className="text-sm text-sky-300 mt-2 italic">
                  You voted: {proposal.votes[selectedCountryId]?.toUpperCase()}
                </p>
              )}
            {proposal.status === "active" && isTargetCountrySelected && (
              <p className="text-sm text-slate-400 mt-2 italic">
                Your country is the subject of this vote.
              </p>
            )}
            {proposal.status === "active" && !selectedCountryId && (
              <p className="text-sm text-slate-400 mt-2 italic">
                Select your country to participate in voting.
              </p>
            )}
            {(proposal.status === "failed" || proposal.status === "executed") &&
              proposal.voteTalliedAt && (
                <p className="text-xs text-slate-400 mt-2">
                  Concluded:{" "}
                  {new Date(proposal.voteTalliedAt).toLocaleTimeString()}{" "}
                  {new Date(proposal.voteTalliedAt).toLocaleDateString()}
                </p>
              )}
          </div>
        );
      })}
    </div>
  );
};

export default VotingPanel;
