import { useAppStore } from "../../store/store";

const SatellitePanel = () => {
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
      <h3 className="text-sm font-semibold text-slate-200 mb-3">
        🛰️ Satellite Network
      </h3>

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
    </div>
  );
};

export default SatellitePanel;
