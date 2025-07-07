"use client";

import React, { useState, useEffect } from "react";

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  highlight?: string;
}

const Tutorial: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "🌍 Welcome to the Global CO2 Accountability System",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            This system demonstrates how to solve the{" "}
            <strong>tragedy of the commons</strong> for global climate action.
          </p>
          <div className="bg-blue-900/30 p-4 rounded border border-blue-700/50">
            <h4 className="font-semibold text-blue-300 mb-2">
              🎯 The Problem:
            </h4>
            <p className="text-slate-300">
              The global atmosphere is shared by all, owned by none. Without
              accountability, each country has incentive to pollute while hoping
              others won't - leading to collective destruction.
            </p>
          </div>
          <div className="bg-green-900/30 p-4 rounded border border-green-700/50">
            <h4 className="font-semibold text-green-300 mb-2">
              💡 Our Solution:
            </h4>
            <p className="text-slate-300">
              Make CO2 emissions as transparent as Bitcoin transactions, with
              satellites acting as "blockchain validators" to create unstoppable
              accountability.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "🛰️ How Satellites Work Like Bitcoin Validators",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="font-semibold text-yellow-300 mb-2">
                Bitcoin Blockchain
              </h4>
              <ul className="space-y-1 text-slate-300">
                <li>• Miners validate transactions</li>
                <li>• 51% consensus required</li>
                <li>• Rewards for honesty</li>
                <li>• Immutable transaction history</li>
              </ul>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="font-semibold text-blue-300 mb-2">
                CO2 Transparency System
              </h4>
              <ul className="space-y-1 text-slate-300">
                <li>• Satellites validate emissions</li>
                <li>• 66% country consensus required</li>
                <li>• Bitcoin rewards for detection</li>
                <li>• Permanent emission records</li>
              </ul>
            </div>
          </div>
          <p className="text-slate-300">
            Just like Bitcoin's blockchain prevents financial fraud, our
            satellite network prevents environmental fraud!
          </p>
        </div>
      ),
    },
    {
      title: "🎮 Interactive Demo: Detection → Verification → Enforcement",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            This system has a sophisticated 3-step process:
          </p>
          <div className="space-y-3">
            <div className="bg-purple-900/30 p-3 rounded border border-purple-700/50">
              <h4 className="font-semibold text-purple-300">1. 🔍 Detection</h4>
              <p className="text-slate-300 text-sm">
                Satellites continuously monitor all countries. When a country
                exceeds its CO2 allowance, the violation is automatically
                detected and reported.
              </p>
            </div>
            <div className="bg-orange-900/30 p-3 rounded border border-orange-700/50">
              <h4 className="font-semibold text-orange-300">
                2. 🗳️ Verification
              </h4>
              <p className="text-slate-300 text-sm">
                Other countries vote anonymously: "Trust Satellites" vs
                "Question Data". 66% consensus is required to confirm the
                violation.
              </p>
            </div>
            <div className="bg-red-900/30 p-3 rounded border border-red-700/50">
              <h4 className="font-semibold text-red-300">3. ⚖️ Enforcement</h4>
              <p className="text-slate-300 text-sm">
                Violating countries must buy CO2 certificates or face Bitcoin
                seizure. Countries that "wait out" enforcement face automatic
                seizure.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "🚀 Try It Yourself!",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            Here's what you can do to explore the system:
          </p>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="font-semibold text-blue-300 mb-1">
                1. 🎯 Test Violation Detection
              </h4>
              <p className="text-slate-400">
                Select a country and increase its emissions above allowance
                using the slider
              </p>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="font-semibold text-green-300 mb-1">
                2. 🗳️ Experience Democratic Voting
              </h4>
              <p className="text-slate-400">
                Vote on satellite detection data with other countries
              </p>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="font-semibold text-yellow-300 mb-1">
                3. 🚀 Launch More Satellites
              </h4>
              <p className="text-slate-400">
                Expand global monitoring coverage using the satellite panel
              </p>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="font-semibold text-purple-300 mb-1">
                4. 💰 Test Economic Enforcement
              </h4>
              <p className="text-slate-400">
                See what happens when countries refuse to buy CO2 certificates
              </p>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="font-semibold text-red-300 mb-1">
                5. ⏰ Fast-Forward Time
              </h4>
              <p className="text-slate-400">
                Observe system dynamics as CO2 budgets shrink over years
              </p>
            </div>
          </div>
          <div className="bg-teal-900/30 p-3 rounded border border-teal-700/50">
            <p className="text-teal-200 font-semibold text-center">
              🌍 Ready to solve the tragedy of the commons? Let's explore! 🛰️
            </p>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    // Check if user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem("hasSeenCO2Tutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    localStorage.setItem("hasSeenCO2Tutorial", "true");
    setShowTutorial(false);
  };

  const completeTutorial = () => {
    localStorage.setItem("hasSeenCO2Tutorial", "true");
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    setCurrentStep(0);
    setShowTutorial(true);
  };

  // Add a small button in the top right to restart tutorial for returning users
  useEffect(() => {
    const addTutorialButton = () => {
      const hasSeenTutorial = localStorage.getItem("hasSeenCO2Tutorial");
      if (hasSeenTutorial && !showTutorial) {
        // This will be handled by the main app component
      }
    };
    addTutorialButton();
  }, [showTutorial]);

  if (!showTutorial) {
    return (
      <button
        onClick={resetTutorial}
        className="fixed top-4 right-4 z-40 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg"
        title="Restart Tutorial"
      >
        🎓 Tutorial
      </button>
    );
  }

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-teal-200">
              {currentTutorialStep.title}
            </h2>
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? "bg-blue-400" : "bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={skipTutorial}
            className="text-slate-400 hover:text-white text-sm"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{currentTutorialStep.content}</div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              currentStep === 0
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-slate-600 hover:bg-slate-500 text-white"
            }`}
          >
            Previous
          </button>

          <span className="text-sm text-slate-400">
            Step {currentStep + 1} of {tutorialSteps.length}
          </span>

          <button
            onClick={nextStep}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {currentStep === tutorialSteps.length - 1
              ? "Start Exploring!"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
