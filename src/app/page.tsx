"use client";

import Head from "next/head";
import Scene from "@/components/visualization/Scene";
import GlobalStatsPanel from "@/components/ui/GlobalStatsPanel"; // Import new panel
import Controls from "@/components/ui/Controls";
import CountryPanel from "@/components/ui/CountryPanel";
import MarketplacePanel from "@/components/ui/MarketplacePanel";
import VotingPanel from "@/components/ui/VotingPanel";
import SatellitePanel from "@/components/ui/SatellitePanel";
import CountriesOverviewPanel from "@/components/ui/CountriesOverviewPanel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-slate-800">
      <Head>
        <title>CO2 Emissions Visualization</title>
        <meta
          name="description"
          content="Conceptual CO2 emissions cap-and-trade system."
        />
      </Head>

      <header className="bg-slate-900 p-3 text-center shadow-lg z-10">
        <h1 className="text-3xl font-bold text-sky-400">
          CO₂ World: A Conceptual Model
        </h1>
      </header>

      <main className="flex-grow flex flex-col md:flex-row relative overflow-hidden">
        <div className="flex-grow h-2/5 md:h-full md:w-3/5 lg:w-2/3 order-1 md:order-1 bg-black">
          <Scene />
        </div>

        <aside className="bg-slate-800 p-3 space-y-3 h-3/5 md:h-full md:w-2/5 lg:w-1/3 shadow-2xl overflow-y-auto order-2 md:order-2 custom-scrollbar">
          <GlobalStatsPanel /> {/* Add Global Stats Panel at the top */}
          <Controls />
          <CountriesOverviewPanel />
          <CountryPanel />
          <MarketplacePanel />
          <VotingPanel />
          <SatellitePanel />
        </aside>
      </main>

      <footer className="bg-slate-900 p-2 text-center text-xs text-slate-400 z-10 border-t border-slate-700">
        <p>
          Explore scenarios and understand the global CO2 challenge. (Conceptual
          simulation)
        </p>
      </footer>
    </div>
  );
}
