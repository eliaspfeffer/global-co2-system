"use client";

import React from "react";
import { useAppStore } from "@/store/store"; // Removed VoteProposal as it's inferred

const VotingPanel: React.FC = () => {
  const countries = useAppStore((state) => state.countries);
  const selectedCountryId = useAppStore((state) => state.selectedCountryId);
  const activeVoteProposals = useAppStore((state) => state.activeVoteProposals);
  const castVote = useAppStore((state) => state.castVote);

  const getCountryName = (id: string) =>
    countries.find((c) => c.id === id)?.name || "Unknown Country";

  const handleVote = (targetCountryId: string, voteChoice: "yes" | "no") => {
    if (!selectedCountryId) {
      alert("Please select your country (as voter) first.");
      return;
    }
    // This check is also in store, but good for immediate UI feedback
    if (selectedCountryId === targetCountryId) {
      alert("Your country cannot vote on its own penalty proposal.");
      return;
    }
    castVote(selectedCountryId, targetCountryId, voteChoice);
  };

  // Show all proposals, not just active, to see history
  const proposalsForDisplay = [...activeVoteProposals].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  if (proposalsForDisplay.length === 0) {
    return (
      <div className="bg-slate-700 p-4 rounded-xl shadow-lg mt-3">
        {" "}
        {/* Consistent panel styling */}
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
      {" "}
      {/* Consistent panel styling */}
      <h2 className="text-2xl font-bold text-orange-300 border-b-2 border-orange-500/50 pb-3 mb-3">
        {" "}
        {/* Accent color for voting */}
        Penalty Voting Proposals
      </h2>
      {proposalsForDisplay.map((proposal) => {
        const targetCountryName = getCountryName(proposal.targetCountryId);
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
        let statusColor = "text-yellow-300"; // Default for active
        let bgColor = "bg-slate-800";

        if (proposal.status === "active") {
          statusMessage = "Voting Active";
        } else if (proposal.status === "passed") {
          statusMessage = "Vote Passed (Pending Execution)";
          statusColor = "text-green-300";
          bgColor = "bg-green-800/30";
        } else if (proposal.status === "executed") {
          statusMessage = "Penalty Executed!";
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
                Against:{" "}
                <span className="font-bold text-red-400">
                  {targetCountryName}
                </span>
              </h3>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor} ${
                  bgColor === "bg-slate-800" ? "bg-slate-700" : ""
                }`}
              >
                {statusMessage.toUpperCase()}
              </span>
            </div>
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
              {/* Basic progress bar concept */}
              <div className="w-full bg-slate-600 rounded-full h-2.5 mt-1">
                <div
                  className="bg-green-500 h-2.5 rounded-l-full"
                  style={{
                    width: `${(yesVotes / (countries.length - 1)) * 100}%`,
                  }}
                ></div>
                {/* No direct way to stack red from other side easily without more divs or complex CSS */}
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
                    Vote Yes (Punish)
                  </button>
                  <button
                    onClick={() => handleVote(proposal.targetCountryId, "no")}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded-md shadow hover:shadow-md transform hover:scale-105 transition-all"
                  >
                    Vote No (Spare)
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
