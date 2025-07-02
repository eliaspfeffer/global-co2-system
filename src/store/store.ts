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
      id: "cosmos",
      name: "Cosmos Watch",
      satelliteCount: 1,
      totalEarnings: 0,
      recentDetections: [],
      investmentCost: SATELLITE_LAUNCH_COST,
    },
    {
      id: "orbit",
      name: "Orbit Guard",
      satelliteCount: 1,
      totalEarnings: 0,
      recentDetections: [],
      investmentCost: SATELLITE_LAUNCH_COST,
    },
    {
      id: "space",
      name: "Space Monitor Co",
      satelliteCount: 1,
      totalEarnings: 0,
      recentDetections: [],
      investmentCost: SATELLITE_LAUNCH_COST,
    },
    {
      id: "earth",
      name: "Earth Watch Ltd",
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

      // If country exceeded allowance, trigger satellite rewards
      if (isNowOverAllowance) {
        const excessEmissions = newEmissions - allowance;
        get().distributeSatelliteRewards(countryId, excessEmissions);
        get().calculateSatelliteCoverage(); // Update coverage dynamics

        const coverage = get().satelliteCoverage.find(
          (c) => c.countryId === countryId
        );
        if (coverage && coverage.monitoringSatellites.length > 0) {
          alert(
            `🛰️ Satellite network detected ${
              country.name
            } exceeded CO2 allowance by ${excessEmissions.toLocaleString()} tons! Rewards distributed to ${
              coverage.monitoringSatellites.length
            } monitoring satellites.`
          );
        }
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

    removeOffer: (sellerId) => {
      set((state) => ({
        marketOffers: state.marketOffers.filter(
          (offer) => offer.sellerId !== sellerId
        ),
        countries: state.countries.map((c) =>
          c.id === sellerId ? { ...c, co2ForSale: undefined } : c
        ),
      }));
    },

    acceptTrade: (buyerId, acceptedOffer) => {
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

    initiatePenaltyVote: (targetCountryId) => {
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
      };
      set((state) => ({
        activeVoteProposals: [...state.activeVoteProposals, newProposal],
        countries: state.countries.map((c) =>
          c.id === targetCountryId ? { ...c, isPenalized: false } : c
        ),
      }));
    },

    castVote: (voterCountryId, targetCountryId, voteChoice) => {
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
          updatedProposal.status = "passed"; // Intermediate status
          updatedProposal.voteTalliedAt = Date.now();
          const target = newCountriesState.find(
            (c) => c.id === targetCountryId
          );
          if (target) {
            const btcPenalty = Math.floor(
              target.conceptualBitcoinDeposit * 0.5
            ); // Use floor for whole numbers
            const goldPenalty = Math.floor(target.conceptualGoldDeposit * 0.5);

            newSatelliteFund.bitcoin += Math.floor(
              btcPenalty * SATELLITE_FUND_PERCENTAGE
            );
            newSatelliteFund.gold += Math.floor(
              goldPenalty * SATELLITE_FUND_PERCENTAGE
            );

            newCountriesState = newCountriesState.map((c) =>
              c.id === targetCountryId
                ? {
                    ...c,
                    conceptualBitcoinDeposit:
                      target.conceptualBitcoinDeposit - btcPenalty,
                    conceptualGoldDeposit:
                      target.conceptualGoldDeposit - goldPenalty,
                    isPenalized: true,
                  }
                : c
            );
            updatedProposal.status = "executed"; // Final status
            alert(
              `Penalty executed against ${target.name}! Deposits reduced by 50%. Satellite fund credited.`
            );
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

      // Recalculate satellite coverage and distribute rewards for countries over limits
      get().calculateSatelliteCoverage();
      const state = get();
      state.countries.forEach((country) => {
        if (country.currentCo2Emissions > country.initialCo2Allowance) {
          const excessEmissions =
            country.currentCo2Emissions - country.initialCo2Allowance;
          get().distributeSatelliteRewards(country.id, excessEmissions);
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
          id: "cosmos",
          name: "Cosmos Watch",
          satelliteCount: 1,
          totalEarnings: 0,
          recentDetections: [],
          investmentCost: SATELLITE_LAUNCH_COST,
        },
        {
          id: "orbit",
          name: "Orbit Guard",
          satelliteCount: 1,
          totalEarnings: 0,
          recentDetections: [],
          investmentCost: SATELLITE_LAUNCH_COST,
        },
        {
          id: "space",
          name: "Space Monitor Co",
          satelliteCount: 1,
          totalEarnings: 0,
          recentDetections: [],
          investmentCost: SATELLITE_LAUNCH_COST,
        },
        {
          id: "earth",
          name: "Earth Watch Ltd",
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

    launchSatellite: (companyId) => {
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

    distributeSatelliteRewards: (countryId, excessEmissions) => {
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
