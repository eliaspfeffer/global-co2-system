import { useAppStore } from "../../store/store";
import { useState } from "react";

const SatellitePanel = () => {
  const [showSatelliteHelp, setShowSatelliteHelp] = useState(false);

  const {
    satelliteCompanies,
    satelliteCoverage,
    satelliteNetworkFund,
    launchSatellite,
    selectedCountryId,
  } = useAppStore();

  const totalSatellites = satelliteCompanies.reduce(
    (sum, company) => sum + company.satelliteCount,
    0
  );

  const selectedCountryCoverage = selectedCountryId
    ? satelliteCoverage.find((c) => c.countryId === selectedCountryId)
    : null;

  return (
    <div className="bg-slate-700 p-3 rounded-lg text-white">
      <div className="flex items-center mb-3">
        <h3 className="text-sm font-semibold text-slate-200">
          🛰️ Satellite Network
        </h3>
        <button
          onClick={() => setShowSatelliteHelp(true)}
          className="ml-2 w-4 h-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold flex items-center justify-center transition-colors"
          title="Learn about the Satellite Network"
        >
          ?
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-slate-600 p-2 rounded text-center">
          <div className="text-slate-300">Total Satellites</div>
          <div className="font-bold text-blue-300">{totalSatellites}</div>
        </div>
        <div className="bg-slate-600 p-2 rounded text-center">
          <div className="text-slate-300">Network Fund</div>
          <div className="font-bold text-yellow-300">
            ₿{satelliteNetworkFund.bitcoin}
          </div>
        </div>
        <div className="bg-slate-600 p-2 rounded text-center">
          <div className="text-slate-300">Launch Cost</div>
          <div className="font-bold text-orange-300">₿15</div>
        </div>
      </div>

      {/* Launch More Satellites Section */}
      <div className="bg-blue-900/30 p-2 rounded mb-3 border border-blue-700/50">
        <div className="text-xs text-blue-200 mb-2 flex items-center">
          🚀 <span className="ml-1 font-semibold">Expand Global Coverage</span>
        </div>
        <div className="text-xs text-slate-300 mb-2">
          Launch more satellites to improve detection accuracy and earn more
          rewards from violations.
        </div>
        {satelliteNetworkFund.bitcoin < 15 && (
          <div className="text-xs text-red-300 italic">
            ⚠️ Insufficient funds for launches. Need more Bitcoin from
            penalties.
          </div>
        )}
      </div>

      {/* Selected Country Coverage */}
      {selectedCountryCoverage && (
        <div className="bg-slate-600 p-2 rounded mb-3 text-xs">
          <div className="flex justify-between">
            <span>Coverage:</span>
            <span
              className={`font-medium ${
                selectedCountryCoverage.coverageLevel > 0.8
                  ? "text-green-300"
                  : selectedCountryCoverage.coverageLevel > 0.5
                  ? "text-yellow-300"
                  : "text-red-300"
              }`}
            >
              {(selectedCountryCoverage.coverageLevel * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Monitoring:</span>
            <span>
              {selectedCountryCoverage.monitoringSatellites.length} satellites
            </span>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      <div className="space-y-2 text-xs">
        {satelliteCompanies.map((company) => (
          <div
            key={company.id}
            className="bg-slate-600 p-2 rounded border-l-4 border-blue-500/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="font-medium text-white">{company.name}</div>
                <div className="text-slate-300">
                  🛰️ {company.satelliteCount} satellites | 💰 ₿
                  {company.totalEarnings.toFixed(1)} earned
                </div>
              </div>
              <button
                onClick={() => launchSatellite(company.id)}
                disabled={satelliteNetworkFund.bitcoin < 15}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  satelliteNetworkFund.bitcoin >= 15
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                    : "bg-slate-500 text-slate-400 cursor-not-allowed"
                }`}
                title={
                  satelliteNetworkFund.bitcoin >= 15
                    ? `Launch new satellite for ${company.name} (Cost: ₿15)`
                    : "Insufficient funds for launch"
                }
              >
                {satelliteNetworkFund.bitcoin >= 15
                  ? "🚀 Launch"
                  : "🚫 No Funds"}
              </button>
            </div>

            {/* Recent detections for this company */}
            {company.recentDetections.length > 0 && (
              <div className="text-xs text-slate-400 bg-slate-700 p-1 rounded">
                Last detection:{" "}
                {
                  company.recentDetections[company.recentDetections.length - 1]
                    .amount
                }{" "}
                tons CO2 → +₿
                {company.recentDetections[
                  company.recentDetections.length - 1
                ].reward.toFixed(1)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mini Economics Note */}
      <div className="mt-3 text-xs text-slate-400 space-y-1">
        <div>
          💡 More satellites = Better coverage = Higher detection accuracy
        </div>
        <div>
          🎯 Rewards are split among satellites monitoring each violation
        </div>
        <div>📈 Launch costs funded by penalty seizures from violations</div>
      </div>

      {/* Satellite Network Help Modal */}
      {showSatelliteHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto text-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-blue-200">
                🛰️ Satellite Network
              </h2>
              <button
                onClick={() => setShowSatelliteHelp(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <p className="text-slate-200">
                The <strong>Satellite Network</strong> acts as the "blockchain
                validators" of our CO2 transparency system, continuously
                monitoring all countries for emission violations.
              </p>

              <div className="bg-slate-700 p-3 rounded">
                <h3 className="font-semibold text-green-300 mb-2">
                  🏢 5 Satellite Companies:
                </h3>
                <ul className="space-y-1 text-slate-300">
                  <li>
                    • <strong>SkyNet Monitoring</strong> - Global coverage
                    specialist
                  </li>
                  <li>
                    • <strong>NASA Watch</strong> - Government monitoring
                    division
                  </li>
                  <li>
                    • <strong>SpaceX Climate Guard</strong> - Private sector
                    innovation
                  </li>
                  <li>
                    • <strong>Orbit Monitor Co</strong> - Commercial detection
                    services
                  </li>
                  <li>
                    • <strong>Pi Watch Ltd</strong> - Precision monitoring
                    technology
                  </li>
                </ul>
              </div>

              <div className="bg-slate-700 p-3 rounded">
                <h3 className="font-semibold text-yellow-300 mb-2">
                  🚀 How Satellite Launches Work:
                </h3>
                <ul className="space-y-1 text-slate-300">
                  <li>
                    • <strong>Cost:</strong> ₿15 per satellite launch
                  </li>
                  <li>
                    • <strong>Funding:</strong> Comes from Satellite Network
                    Fund
                  </li>
                  <li>
                    • <strong>Effect:</strong> Higher coverage = Better
                    detection accuracy
                  </li>
                  <li>
                    • <strong>Rewards:</strong> More satellites = More violation
                    detections = More Bitcoin earnings
                  </li>
                </ul>
              </div>

              <div className="bg-blue-900/30 p-3 rounded border border-blue-700/50">
                <h3 className="font-semibold text-blue-300 mb-2">
                  📊 Coverage System:
                </h3>
                <p className="text-slate-300">
                  <strong>Low Coverage (30-50%):</strong> Some violations might
                  be missed
                  <br />
                  <strong>Medium Coverage (50-80%):</strong> Most violations
                  detected
                  <br />
                  <strong>High Coverage (80-95%):</strong> Nearly all violations
                  caught
                </p>
              </div>

              <div className="bg-purple-900/30 p-3 rounded border border-purple-700/50">
                <h3 className="font-semibold text-purple-300 mb-2">
                  💰 Economic Incentives:
                </h3>
                <p className="text-slate-300">
                  When violations are detected, satellites that monitored that
                  country get Bitcoin rewards. This creates a self-sustaining
                  system where better monitoring is rewarded.
                </p>
              </div>

              <p className="text-slate-400 text-xs italic">
                💡 Try launching satellites to see how coverage improves and
                more violations get detected!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatellitePanel;
