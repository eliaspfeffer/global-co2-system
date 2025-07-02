import { create } from "zustand";
import initialCountriesData from "@/data/countries.json";

// Helper to deep copy initial country data and add original allowance tracking
const deepCopyAndPrepareInitialCountries = (): Country[] => {
  return (
    JSON.parse(JSON.stringify(initialCountriesData)) as Omit<
      Country,
      "originalInitialAllowance"
    >[]
  ).map((country) => ({
    ...country,
    isPenalized: false,
    originalInitialAllowance: country.initialCo2Allowance, // Store the pristine initial allowance
  }));
};

// Calculates the sum of current initialCo2Allowances (which can shrink)
const calculateCurrentSumOfAllowances = (countries: Country[]): number => {
  return countries.reduce(
    (sum, country) => sum + country.initialCo2Allowance,
    0
  );
};

export interface Country {
  id: string;
  name: string;
  initialCo2Allowance: number; // This country's current (potentially shrunk) share/cap
  originalInitialAllowance: number; // The country's allowance at the start of the simulation (or last reset)
  currentCo2Emissions: number;
  conceptualBitcoinDeposit: number;
  conceptualGoldDeposit: number;
  position: { lat: number; lon: number };
  co2ForSale?: { amount: number; pricePerTon: number };
  isPenalized?: boolean;
  refusedCompliance?: boolean; // Country refused to buy CO2 certificates
  refusalTimestamp?: number; // When they refused compliance
  excessAtRefusal?: number; // Excess emissions at time of refusal
  automaticEnforcementTriggered?: boolean; // Whether automatic enforcement was triggered
}

export interface MarketOffer {
  sellerId: string;
  amount: number;
  pricePerTon: number;
}

export interface VoteProposal {
  targetCountryId: string;
  votes: Record<string, "yes" | "no">;
  status: "active" | "passed" | "failed" | "executed";
  createdAt: number;
  voteTalliedAt?: number;
  type: "satellite_detection" | "bitcoin_seizure";
  satelliteData?: {
    detectedEmissions: number;
    excessAmount: number;
    detectingSatellites: string[];
    coverageLevel: number;
  };
}

export interface SatelliteCompany {
  id: string;
  name: string;
  satelliteCount: number;
  totalEarnings: number;
  recentDetections: {
    countryId: string;
    amount: number;
    timestamp: number;
    reward: number;
  }[];
  investmentCost: number; // Cost to launch each satellite
}

export interface SatelliteCoverage {
  countryId: string;
  monitoringSatellites: string[]; // Array of satellite company IDs currently monitoring this country
  coverageLevel: number; // 0-1 scale representing monitoring transparency
}

interface AppState {
  countries: Country[];
  selectedCountryId: string | null;
  marketOffers: MarketOffer[];
  activeVoteProposals: VoteProposal[];
  currentYear: number;
  currentGlobalBudget: number;
  satelliteNetworkFund: { bitcoin: number; gold: number };
  satelliteCompanies: SatelliteCompany[];
  satelliteCoverage: SatelliteCoverage[];

  selectCountry: (countryId: string | null) => void;
  adjustEmissions: (countryId: string, newEmissionLevel: number) => void;
  postOffer: (sellerId: string, amount: number, pricePerTon: number) => void;
  removeOffer: (sellerId: string) => void;
  acceptTrade: (buyerId: string, offer: MarketOffer) => void;
  initiatePenaltyVote: (targetCountryId: string) => void;
  castVote: (
    voterCountryId: string,
    targetCountryId: string,
    voteChoice: "yes" | "no"
  ) => void;
  fastForwardTime: () => void;
  resetScenario: () => void;
  launchSatellite: (companyId: string) => void;
  calculateSatelliteCoverage: () => void;
  distributeSatelliteRewards: (
    countryId: string,
    excessEmissions: number
  ) => void;
  initiateSatelliteDetectionVote: (
    targetCountryId: string,
    excessEmissions: number
  ) => void;
  initiateBitcoinSeizureVote: (targetCountryId: string) => void;
  processSatelliteDetectionVote: (targetCountryId: string) => void;
  checkAutomaticEnforcement: () => void;
}

export const selectCurrentGlobalEmissions = (state: AppState) =>
  state.countries.reduce(
    (sum, country) => sum + country.currentCo2Emissions,
    0
  );

const MAJORITY_THRESHOLD = 2 / 3;
const SATELLITE_FUND_PERCENTAGE = 0.1;
const ANNUAL_ALLOWANCE_REDUCTION_PERCENTAGE = 0.01; // 1% reduction of current allowance per year
const MIN_ALLOWANCE_FLOOR_PERCENTAGE_OF_ORIGINAL = 0.2;
const SATELLITE_LAUNCH_COST = 15; // Bitcoin cost to launch one satellite
const PENALTY_PERCENTAGE_TO_SATELLITES = 0.3; // 30% of excess emission penalties go to satellite companies

export const useAppStore = create<AppState>((set, get) => {
  const initialCountries = deepCopyAndPrepareInitialCountries();
  const initialGlobalBudgetValue =
    calculateCurrentSumOfAllowances(initialCountries);

  // Initialize satellite companies
  const initialSatelliteCompanies: SatelliteCompany[] = [
    {
      id: "skynet",
      name: "SkyNet Monitoring",
      satelliteCount: 1,
      totalEarnings: 0,
      recentDetections: [],
      investmentCost: SATELLITE_LAUNCH_COST,
    },
    {
      id: "nasa",
      name: "Nasa Watch",
      satelliteCount: 1,
      totalEarnings: 0,
      recentDetections: [],
      investmentCost: SATELLITE_LAUNCH_COST,
    },
    {
      id: "spaceX",
      name: "SpaceX Climate Guard",
      satelliteCount: 1,
      totalEarnings: 0,
      recentDetections: [],
      investmentCost: SATELLITE_LAUNCH_COST,
    },
    {
      id: "orbit",
      name: "Orbit Monitor Co",
      satelliteCount: 1,
      totalEarnings: 0,
      recentDetections: [],
      investmentCost: SATELLITE_LAUNCH_COST,
    },
    {
      id: "pi",
      name: "Pi Watch Ltd",
      satelliteCount: 1,
      totalEarnings: 0,
      recentDetections: [],
      investmentCost: SATELLITE_LAUNCH_COST,
    },
  ];

  // Initialize satellite coverage for each country
  const initialSatelliteCoverage: SatelliteCoverage[] = initialCountries.map(
    (country) => ({
      countryId: country.id,
      monitoringSatellites: [], // Will be calculated dynamically
      coverageLevel: 0.5, // Initial 50% coverage
    })
  );

  const store = {
    countries: initialCountries,
    selectedCountryId: null,
    marketOffers: [],
    activeVoteProposals: [],
    currentYear: 2024,
    currentGlobalBudget: initialGlobalBudgetValue,
    satelliteNetworkFund: { bitcoin: 0, gold: 0 },
    satelliteCompanies: initialSatelliteCompanies,
    satelliteCoverage: initialSatelliteCoverage,

    selectCountry: (countryId: string | null) =>
      set({ selectedCountryId: countryId }),

    adjustEmissions: (countryId: string, newEmissionLevel: number) => {
      const state = get();
      const country = state.countries.find((c) => c.id === countryId);
      if (!country) return;

      const oldEmissions = country.currentCo2Emissions;
      const newEmissions = Math.max(0, newEmissionLevel);
      const allowance = country.initialCo2Allowance;

      // Check if country went from under allowance to over allowance
      const wasUnderAllowance = oldEmissions <= allowance;
      const isNowOverAllowance = newEmissions > allowance;

      set((state) => ({
        countries: state.countries.map((c) =>
          c.id === countryId ? { ...c, currentCo2Emissions: newEmissions } : c
        ),
      }));

      // If country exceeded allowance, trigger satellite detection vote system
      if (isNowOverAllowance) {
        const excessEmissions = newEmissions - allowance;
        get().calculateSatelliteCoverage(); // Update coverage dynamics first

        // Initiate satellite detection vote instead of immediate rewards
        get().initiateSatelliteDetectionVote(countryId, excessEmissions);
      }
    },

    postOffer: (sellerId: string, amount: number, pricePerTon: number) => {
      const seller = get().countries.find((c) => c.id === sellerId);
      if (!seller) {
        console.error("Seller not found for posting offer.");
        return;
      }
      const surplus = seller.initialCo2Allowance - seller.currentCo2Emissions;
      if (amount <= 0 || pricePerTon <= 0) {
        alert("Offer amount and price must be positive.");
        return;
      }
      if (amount > surplus) {
        alert(
          `Cannot offer more than available surplus (${surplus.toLocaleString(
            "en-US"
          )} tons).`
        );
        return;
      }

      set((state) => ({
        marketOffers: state.marketOffers
          .filter((offer) => offer.sellerId !== sellerId)
          .concat([{ sellerId, amount, pricePerTon }]),
        countries: state.countries.map((c) =>
          c.id === sellerId ? { ...c, co2ForSale: { amount, pricePerTon } } : c
        ),
      }));
    },

    removeOffer: (sellerId: string) => {
      set((state) => ({
        marketOffers: state.marketOffers.filter(
          (offer) => offer.sellerId !== sellerId
        ),
        countries: state.countries.map((c) =>
          c.id === sellerId ? { ...c, co2ForSale: undefined } : c
        ),
      }));
    },

    acceptTrade: (buyerId: string, acceptedOffer: MarketOffer) => {
      const buyer = get().countries.find((c) => c.id === buyerId);
      const seller = get().countries.find(
        (c) => c.id === acceptedOffer.sellerId
      );

      if (!buyer || !seller) {
        console.error("Buyer or Seller not found for trade.");
        return;
      }

      const buyerDeficit =
        buyer.currentCo2Emissions - buyer.initialCo2Allowance;
      if (buyerDeficit <= 0) {
        alert(`${buyer.name} has no deficit to cover.`);
        return;
      }

      const amountToTrade = Math.min(acceptedOffer.amount, buyerDeficit);
      if (amountToTrade <= 0) {
        alert("No amount to trade.");
        return;
      } // Should not happen if deficit > 0

      const totalCost = amountToTrade * acceptedOffer.pricePerTon;
      if (buyer.conceptualBitcoinDeposit < totalCost) {
        alert(
          `${
            buyer.name
          } cannot afford this trade (Cost: ${totalCost.toLocaleString(
            "en-US"
          )}, Available: ${buyer.conceptualBitcoinDeposit.toLocaleString(
            "en-US"
          )}).`
        );
        return;
      }

      set((state) => {
        const updatedCountries = state.countries.map((c) => {
          if (c.id === buyerId)
            return {
              ...c,
              initialCo2Allowance: c.initialCo2Allowance + amountToTrade,
              conceptualBitcoinDeposit: c.conceptualBitcoinDeposit - totalCost,
            };
          if (c.id === acceptedOffer.sellerId) {
            const newSellerCo2ForSale =
              c.co2ForSale && c.co2ForSale.amount - amountToTrade > 0
                ? {
                    ...c.co2ForSale,
                    amount: c.co2ForSale.amount - amountToTrade,
                  }
                : undefined;
            return {
              ...c,
              initialCo2Allowance: c.initialCo2Allowance - amountToTrade,
              conceptualBitcoinDeposit: c.conceptualBitcoinDeposit + totalCost,
              co2ForSale: newSellerCo2ForSale,
            };
          }
          return c;
        });
        const updatedMarketOffers = state.marketOffers
          .map((offer) =>
            offer.sellerId === acceptedOffer.sellerId
              ? { ...offer, amount: offer.amount - amountToTrade }
              : offer
          )
          .filter((offer) => offer.amount > 0);

        const newGlobalBudget =
          calculateCurrentSumOfAllowances(updatedCountries);
        return {
          countries: updatedCountries,
          marketOffers: updatedMarketOffers,
          currentGlobalBudget: newGlobalBudget,
        };
      });
    },

    initiatePenaltyVote: (targetCountryId: string) => {
      const targetCountry = get().countries.find(
        (c) => c.id === targetCountryId
      );
      if (!targetCountry) {
        console.error("Target country for vote not found.");
        return;
      }
      if (
        get().activeVoteProposals.some(
          (p) => p.targetCountryId === targetCountryId && p.status === "active"
        )
      ) {
        alert(`A penalty vote for ${targetCountry.name} is already active.`);
        return;
      }
      if (
        targetCountry.currentCo2Emissions <= targetCountry.initialCo2Allowance
      ) {
        alert(
          `${targetCountry.name} is not in deficit, no penalty vote needed.`
        );
        return;
      }

      const newProposal: VoteProposal = {
        targetCountryId,
        votes: {},
        status: "active",
        createdAt: Date.now(),
        type: "satellite_detection",
      };
      set((state) => ({
        activeVoteProposals: [...state.activeVoteProposals, newProposal],
        countries: state.countries.map((c) =>
          c.id === targetCountryId ? { ...c, isPenalized: false } : c
        ),
      }));
    },

    castVote: (
      voterCountryId: string,
      targetCountryId: string,
      voteChoice: "yes" | "no"
    ) => {
      set((state) => {
        const proposalIndex = state.activeVoteProposals.findIndex(
          (p) => p.targetCountryId === targetCountryId && p.status === "active"
        );
        if (proposalIndex === -1) {
          console.warn("Vote is closed or proposal not found.");
          return state;
        }

        const proposal = state.activeVoteProposals[proposalIndex];
        if (voterCountryId === targetCountryId) {
          alert("The target country cannot vote on its own penalty.");
          return state;
        }
        if (proposal.votes[voterCountryId]) {
          alert("You have already voted on this proposal.");
          return state;
        }

        const updatedVotes = {
          ...proposal.votes,
          [voterCountryId]: voteChoice,
        };
        let updatedProposal = { ...proposal, votes: updatedVotes };

        const eligibleVoters = state.countries.length - 1;
        const yesVotes = Object.values(updatedVotes).filter(
          (v) => v === "yes"
        ).length;
        const totalVotesCast = Object.keys(updatedVotes).length;

        let newCountriesState = [...state.countries];
        let newSatelliteFund = { ...state.satelliteNetworkFund };

        if (yesVotes / eligibleVoters >= MAJORITY_THRESHOLD) {
          updatedProposal.status = "passed";
          updatedProposal.voteTalliedAt = Date.now();
          const target = newCountriesState.find(
            (c) => c.id === targetCountryId
          );

          if (target) {
            if (proposal.type === "satellite_detection") {
              // Handle satellite detection vote - burn CO2 reserves and reward satellites
              const excessEmissions = proposal.satelliteData?.excessAmount || 0;
              const detectingSatellites =
                proposal.satelliteData?.detectingSatellites || [];

              // Calculate reward for satellites (from the excess amount)
              const totalSatelliteReward =
                excessEmissions * PENALTY_PERCENTAGE_TO_SATELLITES;
              const rewardPerSatellite =
                detectingSatellites.length > 0
                  ? totalSatelliteReward / detectingSatellites.length
                  : 0;

              // Update satellite companies with rewards
              state.satelliteCompanies.forEach((company) => {
                if (detectingSatellites.includes(company.id)) {
                  const detection = {
                    countryId: targetCountryId,
                    amount: excessEmissions,
                    timestamp: Date.now(),
                    reward: rewardPerSatellite,
                  };

                  company.totalEarnings += rewardPerSatellite;
                  company.recentDetections = [
                    ...company.recentDetections.slice(-4),
                    detection,
                  ];
                }
              });

              // Add some satellite fund credits
              newSatelliteFund.bitcoin += Math.floor(rewardPerSatellite * 0.1);

              updatedProposal.status = "executed";
              alert(
                `✅ Satellite Detection Confirmed!\n\n` +
                  `Countries voted to trust the satellite data. ` +
                  `${
                    target.name
                  } has been caught exceeding CO2 allowance by ${excessEmissions.toLocaleString()} tons.\n\n` +
                  `${
                    detectingSatellites.length
                  } satellites rewarded with ${rewardPerSatellite.toFixed(
                    1
                  )} Bitcoin each.\n\n` +
                  `Proceeding to enforcement...`
              );

              // Trigger enforcement process
              setTimeout(() => {
                get().processSatelliteDetectionVote(targetCountryId);
              }, 1000);
            } else if (proposal.type === "bitcoin_seizure") {
              // Handle Bitcoin seizure vote - seize Bitcoin for carbon offset purchases
              const bitcoinSeized = Math.floor(
                target.conceptualBitcoinDeposit * 0.7
              ); // Seize 70%

              newSatelliteFund.bitcoin += bitcoinSeized;
              newCountriesState = newCountriesState.map((c) =>
                c.id === targetCountryId
                  ? {
                      ...c,
                      conceptualBitcoinDeposit:
                        target.conceptualBitcoinDeposit - bitcoinSeized,
                      isPenalized: true,
                    }
                  : c
              );

              updatedProposal.status = "executed";
              alert(
                `⚖️ Bitcoin Seizure Executed!\n\n` +
                  `Countries voted via multisignature to seize ${bitcoinSeized.toLocaleString()} Bitcoin ` +
                  `from ${target.name} to fund carbon offset purchases.\n\n` +
                  `Funds transferred to satellite network for carbon offset acquisition.`
              );
            }
          }
        } else if (totalVotesCast === eligibleVoters) {
          // All voted, but majority not reached
          updatedProposal.status = "failed";
          updatedProposal.voteTalliedAt = Date.now();
          const targetName =
            get().countries.find((c) => c.id === targetCountryId)?.name ||
            "Unknown";
          alert(
            `Penalty vote against ${targetName} failed. Majority not reached.`
          );
        }

        const newProposals = [...state.activeVoteProposals];
        newProposals[proposalIndex] = updatedProposal;
        return {
          ...state,
          countries: newCountriesState,
          activeVoteProposals: newProposals,
          satelliteNetworkFund: newSatelliteFund,
        };
      });
    },

    fastForwardTime: () => {
      set((state) => {
        const updatedCountries = state.countries.map((country) => {
          // Emission increase based on original allowance to represent fixed industrial output baseline
          const emissionIncrease = Math.round(
            country.originalInitialAllowance * 0.02
          );
          let newEmissions = country.currentCo2Emissions + emissionIncrease;
          // Cap emissions at 3x original allowance
          newEmissions = Math.min(
            newEmissions,
            country.originalInitialAllowance * 3
          );

          const minAllowance = Math.round(
            country.originalInitialAllowance *
              MIN_ALLOWANCE_FLOOR_PERCENTAGE_OF_ORIGINAL
          );
          let newAllowance = Math.round(
            country.initialCo2Allowance *
              (1 - ANNUAL_ALLOWANCE_REDUCTION_PERCENTAGE)
          );
          newAllowance = Math.max(newAllowance, minAllowance);

          return {
            ...country,
            currentCo2Emissions: newEmissions,
            initialCo2Allowance: newAllowance,
          };
        });

        const newGlobalBudget =
          calculateCurrentSumOfAllowances(updatedCountries);

        return {
          countries: updatedCountries,
          currentYear: state.currentYear + 1,
          currentGlobalBudget: newGlobalBudget,
        };
      });

      // Recalculate satellite coverage and trigger detection votes for countries over limits
      get().calculateSatelliteCoverage();
      const state = get();

      // Check for automatic enforcement first (for countries waiting things out)
      get().checkAutomaticEnforcement();

      // Then handle new violations
      state.countries.forEach((country) => {
        if (country.currentCo2Emissions > country.initialCo2Allowance) {
          const excessEmissions =
            country.currentCo2Emissions - country.initialCo2Allowance;
          get().initiateSatelliteDetectionVote(country.id, excessEmissions);
        }
      });
    },

    resetScenario: () => {
      const freshCountries = deepCopyAndPrepareInitialCountries();
      const freshInitialGlobalBudget =
        calculateCurrentSumOfAllowances(freshCountries);
      const freshSatelliteCompanies: SatelliteCompany[] = [
        {
          id: "skynet",
          name: "SkyNet Monitoring",
          satelliteCount: 1,
          totalEarnings: 0,
          recentDetections: [],
          investmentCost: SATELLITE_LAUNCH_COST,
        },
        {
          id: "nasa",
          name: "Nasa Watch",
          satelliteCount: 1,
          totalEarnings: 0,
          recentDetections: [],
          investmentCost: SATELLITE_LAUNCH_COST,
        },
        {
          id: "spaceX",
          name: "SpaceX Climate Guard",
          satelliteCount: 1,
          totalEarnings: 0,
          recentDetections: [],
          investmentCost: SATELLITE_LAUNCH_COST,
        },
        {
          id: "orbit",
          name: "Orbit Monitor Co",
          satelliteCount: 1,
          totalEarnings: 0,
          recentDetections: [],
          investmentCost: SATELLITE_LAUNCH_COST,
        },
        {
          id: "pi",
          name: "Pi Watch Ltd",
          satelliteCount: 1,
          totalEarnings: 0,
          recentDetections: [],
          investmentCost: SATELLITE_LAUNCH_COST,
        },
      ];
      const freshSatelliteCoverage: SatelliteCoverage[] = freshCountries.map(
        (country) => ({
          countryId: country.id,
          monitoringSatellites: [],
          coverageLevel: 0.5,
        })
      );
      set({
        countries: freshCountries,
        selectedCountryId: null,
        marketOffers: [],
        activeVoteProposals: [],
        currentYear: 2024,
        currentGlobalBudget: freshInitialGlobalBudget,
        satelliteNetworkFund: { bitcoin: 0, gold: 0 },
        satelliteCompanies: freshSatelliteCompanies,
        satelliteCoverage: freshSatelliteCoverage,
      });
      alert("Scenario has been reset to initial conditions.");
    },

    launchSatellite: (companyId: string) => {
      const state = get();
      const company = state.satelliteCompanies.find((c) => c.id === companyId);
      if (!company) return;

      // Check if satellite fund has enough bitcoins
      if (state.satelliteNetworkFund.bitcoin < SATELLITE_LAUNCH_COST) {
        alert(
          `Insufficient funds in satellite network fund. Need ${SATELLITE_LAUNCH_COST} Bitcoin, have ${state.satelliteNetworkFund.bitcoin}`
        );
        return;
      }

      set((state) => ({
        satelliteCompanies: state.satelliteCompanies.map((c) =>
          c.id === companyId
            ? { ...c, satelliteCount: c.satelliteCount + 1 }
            : c
        ),
        satelliteNetworkFund: {
          ...state.satelliteNetworkFund,
          bitcoin: state.satelliteNetworkFund.bitcoin - SATELLITE_LAUNCH_COST,
        },
      }));

      // Recalculate coverage after new satellite launch
      get().calculateSatelliteCoverage();
      alert(
        `${company.name} launched a new satellite! Total satellites: ${
          company.satelliteCount + 1
        }`
      );
    },

    calculateSatelliteCoverage: () => {
      const state = get();
      const totalSatellites = state.satelliteCompanies.reduce(
        (sum, company) => sum + company.satelliteCount,
        0
      );

      set((state) => ({
        satelliteCoverage: state.satelliteCoverage.map((coverage) => {
          // Simulate which satellites are monitoring this country
          // More satellites = higher chance each company is monitoring
          const monitoringSatellites = state.satelliteCompanies
            .filter(
              (company) =>
                Math.random() < company.satelliteCount / totalSatellites
            )
            .map((company) => company.id);

          // Coverage level increases with more monitoring satellites
          const coverageLevel = Math.min(
            0.95,
            0.3 + monitoringSatellites.length * 0.15
          );

          return {
            ...coverage,
            monitoringSatellites,
            coverageLevel,
          };
        }),
      }));
    },

    distributeSatelliteRewards: (
      countryId: string,
      excessEmissions: number
    ) => {
      const state = get();
      const coverage = state.satelliteCoverage.find(
        (c) => c.countryId === countryId
      );
      if (!coverage || coverage.monitoringSatellites.length === 0) return;

      // Calculate penalty amount (simplified: $1 per ton of excess emissions)
      const totalPenalty = excessEmissions * PENALTY_PERCENTAGE_TO_SATELLITES;
      const rewardPerSatellite =
        totalPenalty / coverage.monitoringSatellites.length;

      set((state) => ({
        satelliteCompanies: state.satelliteCompanies.map((company) => {
          if (coverage.monitoringSatellites.includes(company.id)) {
            const detection = {
              countryId,
              amount: excessEmissions,
              timestamp: Date.now(),
              reward: rewardPerSatellite,
            };

            return {
              ...company,
              totalEarnings: company.totalEarnings + rewardPerSatellite,
              recentDetections: [
                ...company.recentDetections.slice(-4),
                detection,
              ], // Keep last 5 detections
            };
          }
          return company;
        }),
      }));
    },

    initiateSatelliteDetectionVote: (
      targetCountryId: string,
      excessEmissions: number
    ) => {
      const state = get();
      const targetCountry = state.countries.find(
        (c) => c.id === targetCountryId
      );
      const coverage = state.satelliteCoverage.find(
        (c) => c.countryId === targetCountryId
      );

      if (
        !targetCountry ||
        !coverage ||
        coverage.monitoringSatellites.length === 0
      ) {
        return;
      }

      // Check if there's already an active satellite detection vote for this country
      const existingVote = state.activeVoteProposals.find(
        (p) =>
          p.targetCountryId === targetCountryId &&
          p.status === "active" &&
          p.type === "satellite_detection"
      );

      if (existingVote) {
        return; // Vote already in progress
      }

      const newProposal: VoteProposal = {
        targetCountryId,
        votes: {},
        status: "active",
        createdAt: Date.now(),
        type: "satellite_detection",
        satelliteData: {
          detectedEmissions: targetCountry.currentCo2Emissions,
          excessAmount: excessEmissions,
          detectingSatellites: coverage.monitoringSatellites,
          coverageLevel: coverage.coverageLevel,
        },
      };

      set((state) => ({
        activeVoteProposals: [...state.activeVoteProposals, newProposal],
      }));

      const satelliteNames = coverage.monitoringSatellites
        .map((id) => state.satelliteCompanies.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");

      alert(
        `🛰️ Satellite Detection Report!\n\n` +
          `${
            targetCountry.name
          } has been detected emitting ${targetCountry.currentCo2Emissions.toLocaleString()} tons CO2 ` +
          `(${excessEmissions.toLocaleString()} tons over allowance).\n\n` +
          `Detecting satellites: ${satelliteNames}\n` +
          `Coverage level: ${Math.round(coverage.coverageLevel * 100)}%\n\n` +
          `Other countries can now vote to verify this detection. ` +
          `If 66% trust the satellite data, enforcement will proceed.`
      );
    },

    initiateBitcoinSeizureVote: (targetCountryId: string) => {
      const state = get();
      const targetCountry = state.countries.find(
        (c) => c.id === targetCountryId
      );

      if (!targetCountry) return;

      // Check if there's already an active Bitcoin seizure vote for this country
      const existingVote = state.activeVoteProposals.find(
        (p) =>
          p.targetCountryId === targetCountryId &&
          p.status === "active" &&
          p.type === "bitcoin_seizure"
      );

      if (existingVote) {
        alert(
          `A Bitcoin seizure vote for ${targetCountry.name} is already active.`
        );
        return;
      }

      const newProposal: VoteProposal = {
        targetCountryId,
        votes: {},
        status: "active",
        createdAt: Date.now(),
        type: "bitcoin_seizure",
      };

      set((state) => ({
        activeVoteProposals: [...state.activeVoteProposals, newProposal],
      }));

      alert(
        `⚖️ Bitcoin Seizure Vote Initiated!\n\n` +
          `${targetCountry.name} has refused to buy CO2 reserves to cover their excess emissions.\n` +
          `Countries can now vote via multisignature to seize Bitcoin from ${targetCountry.name} ` +
          `to fund carbon offset purchases.`
      );
    },

    processSatelliteDetectionVote: (targetCountryId: string) => {
      const state = get();
      const targetCountry = state.countries.find(
        (c) => c.id === targetCountryId
      );

      if (!targetCountry) return;

      const currentCo2Reserves =
        targetCountry.initialCo2Allowance - targetCountry.currentCo2Emissions;
      const excessEmissions =
        targetCountry.currentCo2Emissions - targetCountry.initialCo2Allowance;

      if (currentCo2Reserves >= 0) {
        alert(
          `${targetCountry.name} has sufficient CO2 reserves. No enforcement needed.`
        );
        return;
      }

      // Show clear enforcement options to the country
      const availableMarketOffers = state.marketOffers.filter(
        (offer) => offer.sellerId !== targetCountryId
      );
      const totalAvailableReserves = availableMarketOffers.reduce(
        (sum, offer) => sum + offer.amount,
        0
      );

      if (totalAvailableReserves >= Math.abs(excessEmissions)) {
        // Calculate cheapest purchase option
        const sortedOffers = [...availableMarketOffers].sort(
          (a, b) => a.pricePerTon - b.pricePerTon
        );
        let neededAmount = Math.abs(excessEmissions);
        let totalCost = 0;

        for (const offer of sortedOffers) {
          if (neededAmount <= 0) break;
          const amountFromThisOffer = Math.min(neededAmount, offer.amount);
          totalCost += amountFromThisOffer * offer.pricePerTon;
          neededAmount -= amountFromThisOffer;
        }

        // Present clear choice dialog
        const choiceMessage = `
🚨 ENFORCEMENT REQUIRED: ${targetCountry.name}

You have been caught exceeding your CO2 allowance by ${Math.abs(
          excessEmissions
        ).toLocaleString()} tons.

CHOOSE YOUR RESPONSE:

Option 1: BUY CO2 CERTIFICATES
• Cost: ${totalCost.toLocaleString()} Bitcoin
• Your balance: ${targetCountry.conceptualBitcoinDeposit.toLocaleString()} Bitcoin
• Status: ${
          targetCountry.conceptualBitcoinDeposit >= totalCost
            ? "✅ AFFORDABLE"
            : "❌ INSUFFICIENT FUNDS"
        }

Option 2: REFUSE TO BUY
• Consequence: Other countries can vote to seize your Bitcoin
• Risk: Up to 70% of your Bitcoin (${Math.floor(
          targetCountry.conceptualBitcoinDeposit * 0.7
        ).toLocaleString()} Bitcoin) may be seized

⚠️ WARNING: If you continue emitting without action, automatic seizure will occur when:
Accumulated excess emissions value + Bitcoin seized ≥ Offset purchase costs

Do you want to buy CO2 certificates now?`;

        const userChoice = confirm(choiceMessage);

        if (userChoice && targetCountry.conceptualBitcoinDeposit >= totalCost) {
          // Execute automatic purchase
          let remainingToBuy = Math.abs(excessEmissions);
          const updatedOffers = [...state.marketOffers];
          const updatedCountries = [...state.countries];

          for (let i = 0; i < sortedOffers.length && remainingToBuy > 0; i++) {
            const offer = sortedOffers[i];
            const amountToBuy = Math.min(remainingToBuy, offer.amount);
            const cost = amountToBuy * offer.pricePerTon;

            // Update buyer
            const buyerIndex = updatedCountries.findIndex(
              (c) => c.id === targetCountryId
            );
            updatedCountries[buyerIndex] = {
              ...updatedCountries[buyerIndex],
              initialCo2Allowance:
                updatedCountries[buyerIndex].initialCo2Allowance + amountToBuy,
              conceptualBitcoinDeposit:
                updatedCountries[buyerIndex].conceptualBitcoinDeposit - cost,
            };

            // Update seller
            const sellerIndex = updatedCountries.findIndex(
              (c) => c.id === offer.sellerId
            );
            updatedCountries[sellerIndex] = {
              ...updatedCountries[sellerIndex],
              initialCo2Allowance:
                updatedCountries[sellerIndex].initialCo2Allowance - amountToBuy,
              conceptualBitcoinDeposit:
                updatedCountries[sellerIndex].conceptualBitcoinDeposit + cost,
            };

            // Update offer
            const offerIndex = updatedOffers.findIndex(
              (o) => o.sellerId === offer.sellerId
            );
            if (offer.amount - amountToBuy > 0) {
              updatedOffers[offerIndex] = {
                ...offer,
                amount: offer.amount - amountToBuy,
              };
            } else {
              updatedOffers.splice(offerIndex, 1);
            }

            remainingToBuy -= amountToBuy;
          }

          set((state) => ({
            countries: updatedCountries,
            marketOffers: updatedOffers,
            currentGlobalBudget:
              calculateCurrentSumOfAllowances(updatedCountries),
          }));

          alert(
            `✅ PURCHASE SUCCESSFUL!\n\n` +
              `${targetCountry.name} purchased ${Math.abs(
                excessEmissions
              ).toLocaleString()} tons of CO2 certificates ` +
              `for ${totalCost.toLocaleString()} Bitcoin.\n\n` +
              `You are now in compliance! 🌱`
          );
          return;
        } else if (
          userChoice &&
          targetCountry.conceptualBitcoinDeposit < totalCost
        ) {
          alert(
            `❌ INSUFFICIENT FUNDS!\n\n` +
              `You cannot afford the required CO2 certificates.\n` +
              `Proceeding to Bitcoin seizure vote...`
          );
          get().initiateBitcoinSeizureVote(targetCountryId);
          return;
        } else {
          // Country refused to buy
          alert(
            `⚠️ COMPLIANCE REFUSED!\n\n` +
              `${targetCountry.name} has refused to purchase CO2 certificates.\n\n` +
              `⚖️ Initiating Bitcoin seizure vote among other countries.\n\n` +
              `WARNING: Continued emissions will trigger automatic seizure ` +
              `when accumulated costs justify intervention.`
          );

          // Mark country as non-compliant for tracking
          set((state) => ({
            countries: state.countries.map((c) =>
              c.id === targetCountryId
                ? {
                    ...c,
                    isPenalized: true,
                    refusedCompliance: true,
                    refusalTimestamp: Date.now(),
                    excessAtRefusal: excessEmissions,
                  }
                : c
            ),
          }));

          get().initiateBitcoinSeizureVote(targetCountryId);
          return;
        }
      } else {
        // No market supply available
        alert(
          `🚫 NO MARKET SUPPLY!\n\n` +
            `${targetCountry.name} cannot purchase CO2 certificates as ` +
            `there are insufficient reserves available in the market.\n\n` +
            `Proceeding directly to Bitcoin seizure enforcement...`
        );
        get().initiateBitcoinSeizureVote(targetCountryId);
      }
    },

    checkAutomaticEnforcement: () => {
      const state = get();

      state.countries.forEach((country) => {
        // Check if country refused compliance and is still emitting
        if (
          country.refusedCompliance &&
          country.refusalTimestamp &&
          country.excessAtRefusal
        ) {
          const currentExcess = Math.max(
            0,
            country.currentCo2Emissions - country.initialCo2Allowance
          );
          const additionalExcess = currentExcess - country.excessAtRefusal;

          // Only proceed if they've continued emitting beyond their refusal point
          if (additionalExcess > 0) {
            // Calculate the value of accumulated excess emissions (at $100/ton)
            const CO2_PENALTY_RATE = 100; // $100 per ton of CO2
            const accumulatedValue = additionalExcess * CO2_PENALTY_RATE;

            // Calculate potential Bitcoin seizure value (70% of their current balance)
            const potentialSeizure = Math.floor(
              country.conceptualBitcoinDeposit * 0.7
            );
            const BITCOIN_TO_USD_RATE = 50000; // Assume $50k per Bitcoin
            const seizureValue = potentialSeizure * BITCOIN_TO_USD_RATE;

            // If accumulated damage + seizure value is enough to cover significant offset costs
            const minimumOffsetCost = 500000; // $500k minimum for automatic action

            if (accumulatedValue + seizureValue >= minimumOffsetCost) {
              // Check if there's not already an active seizure vote
              const existingSeizureVote = state.activeVoteProposals.find(
                (p) =>
                  p.targetCountryId === country.id &&
                  p.type === "bitcoin_seizure" &&
                  p.status === "active"
              );

              if (!existingSeizureVote) {
                alert(
                  `🚨 AUTOMATIC ENFORCEMENT TRIGGERED!\n\n` +
                    `${
                      country.name
                    } has continued emitting ${additionalExcess.toLocaleString()} tons ` +
                    `of excess CO2 since refusing compliance.\n\n` +
                    `📊 Economic Justification:\n` +
                    `• Additional emissions damage: $${accumulatedValue.toLocaleString()}\n` +
                    `• Available Bitcoin for seizure: $${seizureValue.toLocaleString()}\n` +
                    `• Total value: $${(
                      accumulatedValue + seizureValue
                    ).toLocaleString()}\n\n` +
                    `⚖️ Automatic Bitcoin seizure vote initiated to fund carbon offsets.`
                );

                // Reset refusal status to prevent repeated automatic triggers
                set((state) => ({
                  countries: state.countries.map((c) =>
                    c.id === country.id
                      ? {
                          ...c,
                          refusedCompliance: false,
                          automaticEnforcementTriggered: true,
                        }
                      : c
                  ),
                }));

                get().initiateBitcoinSeizureVote(country.id);
              }
            }
          }
        }
      });
    },
  };

  // Initialize satellite coverage on store creation
  setTimeout(() => {
    const state = get();
    if (state.calculateSatelliteCoverage) {
      state.calculateSatelliteCoverage();
    }
  }, 0);

  return store;
});
