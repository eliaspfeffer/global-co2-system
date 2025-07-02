import { create } from 'zustand';
import initialCountriesData from '@/data/countries.json'; // Ensure this is the raw JSON import

// Deep copy function for resetting state
const deepCopyCountries = () => JSON.parse(JSON.stringify(initialCountriesData)) as Country[];

export interface Country {
  id: string;
  name: string;
  initialCo2Allowance: number;
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
  votes: Record<string, 'yes' | 'no'>;
  status: 'active' | 'passed' | 'failed' | 'executed';
  createdAt: number;
  voteTalliedAt?: number;
}

interface AppState {
  countries: Country[];
  selectedCountryId: string | null;
  marketOffers: MarketOffer[];
  activeVoteProposals: VoteProposal[];
  currentYear: number; // For fast-forward simulation

  // --- Actions ---
  selectCountry: (countryId: string | null) => void;
  adjustEmissions: (countryId: string, newEmissionLevel: number) => void;

  postOffer: (sellerId: string, amount: number, pricePerTon: number) => void;
  removeOffer: (sellerId: string) => void;
  acceptTrade: (buyerId: string, offer: MarketOffer) => void;

  initiatePenaltyVote: (targetCountryId: string) => void;
  castVote: (voterCountryId: string, targetCountryId: string, voteChoice: 'yes' | 'no') => void;

  fastForwardTime: () => void;
  resetScenario: () => void;
}

const MAJORITY_THRESHOLD = 2 / 3;

export const useAppStore = create<AppState>((set, get) => ({
  countries: deepCopyCountries().map(country => ({ ...country, isPenalized: false })),
  selectedCountryId: null,
  marketOffers: [],
  activeVoteProposals: [],
  currentYear: 2024,

  selectCountry: (countryId) => set({ selectedCountryId: countryId }),

  adjustEmissions: (countryId, newEmissionLevel) =>
    set((state) => ({
      countries: state.countries.map((c) =>
        c.id === countryId ? { ...c, currentCo2Emissions: newEmissionLevel } : c
      ),
    })),

  postOffer: (sellerId, amount, pricePerTon) => {
    const seller = get().countries.find(c => c.id === sellerId);
    if (!seller) return;
    const surplus = seller.initialCo2Allowance - seller.currentCo2Emissions;
    if (amount <= 0 || amount > surplus) {
      alert("Invalid amount for offer or not enough surplus.");
      return;
    }
    set((state) => ({
      marketOffers: state.marketOffers.filter(offer => offer.sellerId !== sellerId).concat([{ sellerId, amount, pricePerTon }]),
      countries: state.countries.map(c => c.id === sellerId ? {...c, co2ForSale: {amount, pricePerTon}} : c)
    }));
  },

  removeOffer: (sellerId) => {
    set(state => ({
      marketOffers: state.marketOffers.filter(offer => offer.sellerId !== sellerId),
      countries: state.countries.map(c => c.id === sellerId ? {...c, co2ForSale: undefined} : c)
    }))
  },

  acceptTrade: (buyerId, acceptedOffer) => {
    const { sellerId, amount: offerAmount, pricePerTon } = acceptedOffer;
    const buyer = get().countries.find(c => c.id === buyerId);
    const seller = get().countries.find(c => c.id === sellerId);
    if (!buyer || !seller) return;
    const buyerDeficit = buyer.currentCo2Emissions - buyer.initialCo2Allowance;
    if (buyerDeficit <= 0) {
      alert("Buyer has no deficit to cover.");
      return;
    }
    const amountToTrade = Math.min(offerAmount, buyerDeficit);
    const totalCost = amountToTrade * pricePerTon;
    if (buyer.conceptualBitcoinDeposit < totalCost) {
      alert(`${buyer.name} does not have enough conceptual Bitcoin for this purchase.`);
      return;
    }
    set((state) => {
      const updatedCountries = state.countries.map(c => {
        if (c.id === buyerId) return { ...c, initialCo2Allowance: c.initialCo2Allowance + amountToTrade, conceptualBitcoinDeposit: c.conceptualBitcoinDeposit - totalCost };
        if (c.id === sellerId) return { ...c, initialCo2Allowance: c.initialCo2Allowance - amountToTrade, conceptualBitcoinDeposit: c.conceptualBitcoinDeposit + totalCost, co2ForSale: seller.co2ForSale && (seller.co2ForSale.amount - amountToTrade > 0) ? { ...seller.co2ForSale, amount: seller.co2ForSale.amount - amountToTrade } : undefined };
        return c;
      });
      const updatedMarketOffers = state.marketOffers.map(offer => offer.sellerId === sellerId ? { ...offer, amount: offer.amount - amountToTrade } : offer).filter(offer => offer.amount > 0);
      return { countries: updatedCountries, marketOffers: updatedMarketOffers };
    });
  },

  initiatePenaltyVote: (targetCountryId) => {
    const targetCountry = get().countries.find(c => c.id === targetCountryId);
    if (!targetCountry) return;
    const existingVote = get().activeVoteProposals.find(p => p.targetCountryId === targetCountryId && p.status === 'active');
    if (existingVote) {
      alert(`A penalty vote for ${targetCountry.name} is already active.`);
      return;
    }
    if (targetCountry.currentCo2Emissions <= targetCountry.initialCo2Allowance) {
        alert(`${targetCountry.name} is not in deficit, no penalty vote needed.`);
        return;
    }
    const newProposal: VoteProposal = { targetCountryId, votes: {}, status: 'active', createdAt: Date.now() };
    set(state => ({
      activeVoteProposals: [...state.activeVoteProposals, newProposal],
      countries: state.countries.map(c => c.id === targetCountryId ? { ...c, isPenalized: false } : c)
    }));
  },

  castVote: (voterCountryId, targetCountryId, voteChoice) => { /* ... (same as before, ensure alerts are present) ... */
    set(state => {
      const proposalIndex = state.activeVoteProposals.findIndex(p => p.targetCountryId === targetCountryId && p.status === 'active');
      if (proposalIndex === -1) return state;
      const proposal = state.activeVoteProposals[proposalIndex];
      if (voterCountryId === targetCountryId) { alert("The target country cannot vote on its own penalty."); return state; }

      const updatedVotes = { ...proposal.votes, [voterCountryId]: voteChoice };
      let updatedProposal = { ...proposal, votes: updatedVotes };
      const totalCountries = state.countries.length;
      const eligibleVoters = totalCountries - 1;
      const yesVotes = Object.values(updatedVotes).filter(v => v === 'yes').length;

      let newCountriesState = [...state.countries]; // Prepare for potential modification

      if (yesVotes / eligibleVoters >= MAJORITY_THRESHOLD) {
        updatedProposal.status = 'passed';
        updatedProposal.voteTalliedAt = Date.now();
        const target = newCountriesState.find(c => c.id === targetCountryId);
        if (target) {
          const penaltyAmountBtc = target.conceptualBitcoinDeposit * 0.5;
          const penaltyAmountGold = target.conceptualGoldDeposit * 0.5;
          newCountriesState = newCountriesState.map(c => c.id === targetCountryId ? { ...c, conceptualBitcoinDeposit: c.conceptualBitcoinDeposit - penaltyAmountBtc, conceptualGoldDeposit: c.conceptualGoldDeposit - penaltyAmountGold, isPenalized: true } : c);
          updatedProposal.status = 'executed';
          alert(`Penalty executed against ${target.name}! Deposits reduced.`);
        }
      } else {
        const totalVotesCast = Object.keys(updatedVotes).length;
        if (totalVotesCast === eligibleVoters) {
          updatedProposal.status = 'failed';
          updatedProposal.voteTalliedAt = Date.now();
          const targetName = get().countries.find(c => c.id === targetCountryId)?.name || 'Unknown';
          alert(`Penalty vote against ${targetName} failed.`);
        }
      }
      const newProposals = [...state.activeVoteProposals];
      newProposals[proposalIndex] = updatedProposal;
      return { ...state, countries: newCountriesState, activeVoteProposals: newProposals };
    });
  },

  fastForwardTime: () => {
    set(state => {
      const updatedCountries = state.countries.map(country => {
        // Increase emissions by a small fixed amount (e.g., 10 tons) or a percentage
        const emissionIncrease = Math.round(country.initialCo2Allowance * 0.02); // Example: 2% of allowance
        let newEmissions = country.currentCo2Emissions + emissionIncrease;
        // Cap emissions at some reasonable maximum, e.g., 3x initial allowance, to prevent runaway numbers
        newEmissions = Math.min(newEmissions, country.initialCo2Allowance * 3);
        return { ...country, currentCo2Emissions: newEmissions };
      });
      // Expire old 'active' votes that haven't concluded (optional)
      // const now = Date.now();
      // const updatedProposals = state.activeVoteProposals.map(p => {
      //   if (p.status === 'active' && (now - p.createdAt > SOME_TIMEOUT_DURATION)) {
      //     return { ...p, status: 'failed', voteTalliedAt: now }; // Mark as failed due to timeout
      //   }
      //   return p;
      // });

      return {
        countries: updatedCountries,
        currentYear: state.currentYear + 1,
        // activeVoteProposals: updatedProposals // if implementing vote timeout
      };
    });
  },

  resetScenario: () => {
    set({
      countries: deepCopyCountries().map(country => ({ ...country, isPenalized: false })),
      selectedCountryId: null,
      marketOffers: [],
      activeVoteProposals: [],
      currentYear: 2024,
    });
    alert("Scenario has been reset to initial conditions.");
  },

}));
