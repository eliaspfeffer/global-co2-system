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
*   Explore different scenarios and their outcomes using time progression and reset controls.

## Key Features Implemented

*   **Interactive 3D Earth:** Displays a cartoonish Earth with a dynamic atmosphere and orbiting satellites.
*   **Country Representation:** Selected countries are highlighted with a dynamic marker on the globe, changing color based on CO2 emission status.
*   **CO2 Emission Controls:** Users can select countries and adjust their simulated CO2 emissions.
*   **Allowance & Deficit Tracking:** Visual feedback in UI panels and on the 3D marker for CO2 surplus/deficit.
*   **Conceptual Marketplace:**
    *   Countries with surplus CO2 can offer allowances for sale.
    *   Countries in deficit can buy available allowances using conceptual Bitcoin deposits.
    *   Transactions affect CO2 allowances and Bitcoin deposit balances.
*   **Conceptual Voting System:**
    *   Countries can "refuse to settle" deficits, triggering a penalty vote.
    *   Other countries can vote "Yes" or "No" to penalize.
    *   A 2/3 majority "Yes" vote results in the target country's conceptual deposits (Bitcoin & Gold) being reduced.
    *   UI panel to display active and past vote proposals and allow voting.
*   **Scenario Controls:**
    *   "Fast-Forward Time": Advances the simulation year, automatically increasing emissions for all countries.
    *   "Reset Scenario": Reverts the simulation to its initial state.
*   **Styled UI:** User interface panels with a cohesive dark theme, aiming for clarity and ease of use, featuring custom scrollbars.

## Technology Stack

*   **Frontend**: Next.js (React v18) - App Router
*   **3D Graphics**: Three.js (r160+)
*   **State Management**: Zustand (v4+)
*   **Styling**: Tailwind CSS (v3+)
*   **Deployment**: Vercel

## Getting Started

### Prerequisites

*   Node.js (e.g., v18.x or v20.x)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <directory-name>
    ```
    (Replace `<repository-url>` and `<directory-name>` with actual values)

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running Locally

```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

*   `src/app/`: Main application pages (`page.tsx`, `layout.tsx`, `globals.css`).
*   `src/components/`: Reusable React components.
    *   `src/components/visualization/`: Three.js related components (`Scene.tsx`, `Earth.tsx`).
    *   `src/components/ui/`: UI elements (`Controls.tsx`, `CountryPanel.tsx`, `MarketplacePanel.tsx`, `VotingPanel.tsx`).
*   `src/store/`: Zustand global state management (`store.ts`).
*   `src/data/`: Mock data files (`countries.json`).
*   `public/`: Static assets.
    *   `public/assets/`: (Planned for icons, textures - currently unused).
*   `AGENTS.md`: Instructions for AI developers working on this project.
*   `.gitignore`: Specifies intentionally untracked files.
*   `next.config.mjs`: Next.js configuration file.
*   `package.json`: Lists project dependencies and scripts.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `tsconfig.json`: TypeScript configuration.

## Contributing

Currently, development is primarily AI-driven based on user prompts.

## License

(To be determined - likely MIT or a similar open-source license)
