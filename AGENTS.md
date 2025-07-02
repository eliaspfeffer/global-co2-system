## Agent Instructions for CO2 Visualization Project

This document provides guidance for AI agents working on this project.

### Project Overview
The goal is to create a gamified visualization of a global CO2 emissions cap-and-trade system. Users can simulate scenarios, adjust country emissions, and see conceptual financial transactions (deposits, payments, penalties) and a voting mechanism. The visual style should be cartoonish and clear, emphasizing the educational aspect of the concept. The project is built with Next.js, Three.js, Zustand, and Tailwind CSS, for deployment on Vercel.

### Key Technologies
- **Next.js (React)**: Frontend framework (App Router).
- **Three.js**: For 3D visualization of Earth, satellites, and country markers.
- **Zustand**: State management for all dynamic application data.
- **Tailwind CSS**: Styling, aiming for a clear, dark, and somewhat cartoonish theme.
- **Vercel**: Target deployment platform.

### Development Guidelines
1.  **Follow the Plan**: Adhere to the established development plan. If deviations are necessary, update the plan and inform the user.
2.  **Component Structure**:
    *   `src/components/visualization/`: Three.js related components (`Scene.tsx`, `Earth.tsx`). `Scene.tsx` is the main entry point for the 3D view.
    *   `src/components/ui/`: React UI components for controls and information display (`Controls.tsx`, `CountryPanel.tsx`, `MarketplacePanel.tsx`, `VotingPanel.tsx`).
    *   `src/app/`: Next.js App Router structure (`page.tsx`, `layout.tsx`, `globals.css`).
    *   `src/store/store.ts`: Zustand store definition, including state interfaces and actions.
    *   `src/data/countries.json`: Mock data for initial country states.
    *   `public/assets/`: Intended for static assets like icons or textures (currently unused).
3.  **State Management (Zustand)**:
    *   The store (`store.ts`) is the single source of truth for countries' data, market offers, vote proposals, selected country, and current simulation year.
    *   Actions are defined within the store to manipulate state predictably.
    *   Ensure UI components correctly subscribe to relevant parts of the store and use actions for updates.
4.  **Styling (Tailwind CSS)**:
    *   Utilize Tailwind CSS utility classes for all styling.
    *   Maintain a consistent dark theme (primarily `slate` grays) with accent colors (e.g., `sky`, `emerald`, `orange`, `red`, `purple`) for different UI sections or states.
    *   Aim for clarity, good contrast, and a slightly playful/cartoonish feel (e.g., rounded corners, subtle hover effects).
    *   Custom scrollbar styles are defined in `globals.css`.
5.  **3D Visualization (Three.js)**:
    *   Earth model uses `MeshToonMaterial` for a non-realistic, cartoonish look. Includes a shader-based atmosphere.
    *   Satellites are simple colored spheres with `MeshToonMaterial` and randomized orbits.
    *   A dynamic marker on the Earth indicates the selected country, changing color based on CO2 emission status.
    *   Ensure 3D scene interactions (camera controls) are smooth.
6.  **Data Flow**:
    *   Initial country data from `countries.json`.
    *   User interactions in UI panels call Zustand actions.
    *   Zustand updates its state.
    *   UI components and the 3D scene reactively update based on the new state.
7.  **Conceptual Nature**: The blockchain/crypto aspects (deposits, payments, penalties) are purely conceptual and simulated within the application's logic. No actual blockchain integration. Focus on visualizing the *idea* of these mechanisms.
8.  **Commits**: Make small, logical commits. Write clear and concise commit messages. (Managed by the controlling agent/user).
9.  **Testing**: Manual testing of all features across different scenarios is crucial. Check for logical consistency and visual correctness. (Primarily user's responsibility after deployment).
10. **Vercel Deployment**: The project is set up as a standard Next.js app, which Vercel can typically build and deploy automatically.

### Specific Instructions & Key State Variables
*   **`countries.json` fields**: `id`, `name`, `initialCo2Allowance`, `currentCo2Emissions`, `conceptualBitcoinDeposit`, `conceptualGoldDeposit`, `position: { lat, lon }`.
*   **`store.ts` - Key State Slices**:
    *   `countries: Country[]`: Array of country objects, including their dynamic states.
    *   `selectedCountryId: string | null`: ID of the currently selected country.
    *   `marketOffers: MarketOffer[]`: List of active CO2 allowance offers.
    *   `activeVoteProposals: VoteProposal[]`: List of ongoing or concluded penalty votes.
    *   `currentYear: number`: The current year in the simulation.
*   **`store.ts` - Key Actions**:
    *   `adjustEmissions`: Updates a country's CO2 emissions.
    *   `postOffer`, `acceptTrade`: Manage marketplace transactions.
    *   `initiatePenaltyVote`, `castVote`: Manage the voting process and penalty execution.
    *   `fastForwardTime`, `resetScenario`: Control the simulation flow.

Remember to always ask for clarification if any part of the task or these guidelines is unclear. Prioritize clarity and the educational goal of the simulation.
