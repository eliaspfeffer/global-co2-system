## Agent Instructions for CO2 Visualization Project

This document provides guidance for AI agents working on this project.

### Project Overview
The goal is to create a gamified visualization of a global CO2 emissions cap-and-trade system. Users can simulate scenarios, adjust country emissions, see conceptual financial transactions, and a voting mechanism. Key concepts include a shrinking global CO2 budget over time and incentives for compliance/monitoring. The visual style is cartoonish and clear. Built with Next.js, Three.js, Zustand, and Tailwind CSS for Vercel deployment.

### Key Technologies
- **Next.js (React)**: App Router.
- **Three.js**: For 3D visualization (Earth, satellites, markers).
- **Zustand**: Global state management.
- **Tailwind CSS**: Styling.
- **Vercel**: Deployment.

### Development Guidelines
1.  **Component Structure**:
    *   `src/components/visualization/`: `Scene.tsx`, `Earth.tsx` (layered Earth with procedural continents/clouds).
    *   `src/components/ui/`: `Controls.tsx`, `CountryPanel.tsx`, `MarketplacePanel.tsx`, `VotingPanel.tsx`, `GlobalStatsPanel.tsx`.
    *   `src/app/`: Next.js App Router structure.
    *   `src/store/store.ts`: Zustand store, including state interfaces and actions.
    *   `src/data/countries.json`: Initial country data.
2.  **State Management (Zustand - `store.ts`)**:
    *   **Key State Slices**:
        *   `countries: Country[]`: Includes `originalInitialAllowance` for tracking base allowance before annual reductions.
        *   `selectedCountryId: string | null`.
        *   `marketOffers: MarketOffer[]`.
        *   `activeVoteProposals: VoteProposal[]`.
        *   `currentYear: number`.
        *   `currentGlobalBudget: number`: Sum of all countries' current (potentially shrunk) `initialCo2Allowance`. Updated annually and after trades.
        *   `satelliteNetworkFund: { bitcoin: number, gold: number }`: Accumulates a percentage of seized penalties.
    *   **Key Actions**:
        *   `adjustEmissions`: Updates country emissions.
        *   `postOffer`, `acceptTrade`: Manage CO2 allowance market. `acceptTrade` now also updates `currentGlobalBudget`.
        *   `initiatePenaltyVote`: Triggers vote if country in deficit doesn't settle.
        *   `castVote`: Records votes, tallies, executes penalties (reducing target's deposits and crediting `satelliteNetworkFund`).
        *   `fastForwardTime`: Increments year, increases all countries' emissions, shrinks each country's `initialCo2Allowance` (with a floor), and recalculates `currentGlobalBudget`.
        *   `resetScenario`: Resets all relevant state to initial conditions, including `originalInitialAllowance` and `currentGlobalBudget`.
3.  **Styling (Tailwind CSS)**: Maintain cohesive dark theme (`slate` with accents). Emphasize clarity, good contrast, and interactive elements (hover effects, rounded corners). Custom scrollbar in `globals.css`.
4.  **3D Visualization (Three.js)**:
    *   `Earth.tsx`: Creates a layered Earth (oceans, procedural stylized continents, procedural stylized clouds) using `MeshToonMaterial`. Includes atmosphere glow.
    *   `Scene.tsx`: Manages Earth rotation, independent cloud rotation, satellite orbits, and dynamic country marker.
5.  **Clarity and User Feedback**:
    *   `GlobalStatsPanel.tsx` provides an overview of the global CO2 situation and satellite fund.
    *   `CountryPanel.tsx` has enhanced warnings for deficit countries at risk of voting (pulsing button, informational text) and visual state for active votes.
    *   `VotingPanel.tsx` clearly states the reason for vote proposals.
    *   `alert()` is used for important notifications; consider a toast system for future polish.
6.  **Conceptual Nature**: All financial/blockchain aspects are simulated.

### Specific Instructions for Future Development
*   When adding new features, ensure state changes are managed through Zustand actions.
*   Maintain the "cartoonish and clear" visual style.
*   Prioritize user understanding of the simulation's mechanics.
*   If adding complex visual assets (textures, models), provide clear instructions on how they should be integrated.
*   Update this document and `README.md` with any significant changes.
