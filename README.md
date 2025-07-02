# CO2 Emissions Conceptual Visualization

This project is a gamified, interactive visualization designed to explain a conceptual system for managing global CO2 emissions. It demonstrates how a cap-and-trade system, combined with pre-deposited funds (like Bitcoin or Gold) and a transparent voting mechanism for penalties, could potentially address the CO2 dilemma.

The project aims for a **cartoonish and clear visual style** to make the complex concept easily understandable.

## Project Goal

The primary goal is to educate users about a novel approach to CO2 regulation by allowing them to:
*   Visualize Earth and CO2 emissions per country (simulated).
*   Adjust emission levels for different countries.
*   Observe a conceptual cap-and-trade system where countries can buy/sell CO2 allowances.
*   Understand the role of pre-deposited "security funds."
*   See a simulated 2/3rd majority voting system for penalizing non-compliant countries by accessing their deposits.
*   Explore different scenarios and their outcomes using time progression (with shrinking allowances) and reset controls.
*   Understand the concept of a total global CO2 budget.

## Key Features Implemented

*   **Interactive 3D Earth:** Displays a stylized Earth with layered graphics for oceans, continents, and clouds. Includes a dynamic atmosphere and orbiting satellites.
*   **Country Representation:** Selected countries are highlighted with a dynamic marker on the globe, changing color based on CO2 emission status.
*   **CO2 Emission Controls:** Users can select countries and adjust their simulated CO2 emissions.
*   **Allowance & Deficit Tracking:**
    *   Visual feedback in UI panels and on the 3D marker for CO2 surplus/deficit.
    *   **Shrinking Allowances:** Individual country CO2 allowances (and thus the total global budget) decrease annually with "Fast-Forward Time".
*   **Global CO2 Budget Display:** A dedicated panel shows the current total global CO2 allotment and current total global emissions, highlighting any overshoot.
*   **Conceptual Marketplace:**
    *   Countries with surplus CO2 can offer allowances for sale.
    *   Countries in deficit can buy available allowances using conceptual Bitcoin deposits.
    *   Transactions affect CO2 allowances and Bitcoin deposit balances.
*   **Conceptual Voting System with Enhanced Clarity:**
    *   Countries can "refuse to settle" deficits, triggering a penalty vote. UI provides clearer warnings about this action.
    *   Other countries can vote "Yes" or "No" to penalize.
    *   Voting panel clearly states the reason for the vote.
    *   A 2/3 majority "Yes" vote results in the target country's conceptual deposits (Bitcoin & Gold) being reduced.
*   **Satellite Provider Incentive:** A percentage of seized penalty funds is allocated to a "Satellite Network Fund," displayed in the UI.
*   **Scenario Controls:**
    *   "Fast-Forward Time": Advances the simulation year, automatically increasing emissions for all countries and shrinking CO2 allowances.
    *   "Reset Scenario": Reverts the simulation to its initial state.
*   **Styled UI:** User interface panels with a cohesive dark theme, aiming for clarity and ease of use, featuring custom scrollbars.

## Technology Stack

*   **Frontend**: Next.js (React v18) - App Router
*   **3D Graphics**: Three.js (r160+)
*   **State Management**: Zustand (v4+)
*   **Styling**: Tailwind CSS (v3+)
*   **Deployment**: Vercel

## Getting Started
(No changes from previous version)

### Prerequisites
*   Node.js (e.g., v18.x or v20.x)
*   npm or yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <directory-name>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

*   `src/app/`: Main application pages (`page.tsx`, `layout.tsx`, `globals.css`).
*   `src/components/`: Reusable React components.
    *   `src/components/visualization/`: Three.js related components (`Scene.tsx`, `Earth.tsx`).
    *   `src/components/ui/`: UI elements (`Controls.tsx`, `CountryPanel.tsx`, `MarketplacePanel.tsx`, `VotingPanel.tsx`, `GlobalStatsPanel.tsx`).
*   `src/store/store.ts`: Zustand global state management.
*   `src/data/countries.json`: Mock data for initial country states.
*   `public/`: Static assets (currently unused for images/textures).
*   `AGENTS.md`: Instructions for AI developers.
*   `.gitignore`, `next.config.mjs`, `package.json`, `tailwind.config.ts`, `tsconfig.json`.

## Contributing
Currently, development is primarily AI-driven based on user prompts.

## License
(To be determined)
