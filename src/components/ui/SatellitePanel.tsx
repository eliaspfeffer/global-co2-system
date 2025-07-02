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
          <div className="text-slate-300">Total</div>
          <div className="font-bold">{totalSatellites}</div>
        </div>
        <div className="bg-slate-600 p-2 rounded text-center">
          <div className="text-slate-300">Fund</div>
          <div className="font-bold">₿{satelliteNetworkFund.bitcoin}</div>
        </div>
        <div className="bg-slate-600 p-2 rounded text-center">
          <div className="text-slate-300">Cost</div>
          <div className="font-bold">₿15</div>
        </div>
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
      <div className="space-y-1 text-xs">
        {satelliteCompanies.map((company) => (
          <div
            key={company.id}
            className="flex items-center justify-between bg-slate-600 p-2 rounded"
          >
            <div className="flex-1">
              <div className="font-medium">{company.name.split(" ")[0]}</div>
              <div className="text-slate-300">
                {company.satelliteCount} sats | ₿
                {company.totalEarnings.toFixed(1)}
              </div>
            </div>
            <button
              onClick={() => launchSatellite(company.id)}
              disabled={satelliteNetworkFund.bitcoin < 15}
              className={`px-2 py-1 rounded text-xs ${
                satelliteNetworkFund.bitcoin >= 15
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-500 text-slate-400 cursor-not-allowed"
              }`}
            >
              +🛰️
            </button>
          </div>
        ))}
      </div>

      {/* Mini Economics Note */}
      <div className="mt-3 text-xs text-slate-400">
        💡 Rewards split among monitoring satellites
      </div>
    </div>
  );
};

export default SatellitePanel;
