import { useAppStore } from "../../store/store";

const CountriesOverviewPanel = () => {
  const { countries, selectCountry } = useAppStore();

  const getBarColor = (usagePercentage: number) => {
    if (usagePercentage > 100) return "bg-red-400";
    if (usagePercentage > 90) return "bg-orange-400";
    if (usagePercentage > 80) return "bg-yellow-400";
    return "bg-green-400";
  };

  const sortedCountries = [...countries].sort((a, b) => {
    const aUsage = (a.currentCo2Emissions / a.initialCo2Allowance) * 100;
    const bUsage = (b.currentCo2Emissions / b.initialCo2Allowance) * 100;
    return bUsage - aUsage;
  });

  return (
    <div className="bg-slate-700 p-3 rounded-lg text-white">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">
        📊 CO₂ Usage Overview
      </h3>

      <div className="flex justify-between items-end space-x-1">
        {sortedCountries.map((country) => {
          const usagePercentage =
            (country.currentCo2Emissions / country.initialCo2Allowance) * 100;
          const barHeight = Math.min(Math.max(usagePercentage, 5), 100); // Min 5%, max 100% for visual purposes
          const isExceeding = usagePercentage > 100;

          return (
            <div
              key={country.id}
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => selectCountry(country.id)}
              title={`${country.name}: ${usagePercentage.toFixed(
                1
              )}% (${country.currentCo2Emissions.toLocaleString()}t / ${country.initialCo2Allowance.toLocaleString()}t)`}
            >
              {/* Country Label */}
              <div className="text-xs text-slate-300 mb-1 h-8 flex items-end">
                <span className="transform -rotate-45 origin-bottom-left whitespace-nowrap">
                  {country.name.split(" ")[0].substring(0, 5)}
                </span>
              </div>

              {/* Bar Container */}
              <div className="relative h-16 w-6 bg-slate-600 rounded-sm flex flex-col justify-end">
                {/* Main Bar */}
                <div
                  className={`${getBarColor(
                    usagePercentage
                  )} rounded-sm transition-all duration-300`}
                  style={{ height: `${Math.min(barHeight, 100)}%` }}
                />

                {/* Overflow Indicator */}
                {isExceeding && (
                  <div
                    className="absolute top-0 left-0 w-full bg-red-600 rounded-sm animate-pulse"
                    style={{ height: "3px" }}
                  />
                )}
              </div>

              {/* Percentage */}
              <div
                className={`text-xs mt-1 font-medium ${
                  usagePercentage > 100
                    ? "text-red-300"
                    : usagePercentage > 90
                    ? "text-orange-300"
                    : usagePercentage > 80
                    ? "text-yellow-300"
                    : "text-green-300"
                }`}
              >
                {usagePercentage.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Legend */}
      <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded"></div>
            <span>&lt;80%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded"></div>
            <span>80-90%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded"></div>
            <span>90-100%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded"></div>
            <span>&gt;100%</span>
          </div>
        </div>
        <span>Click bars to select</span>
      </div>
    </div>
  );
};

export default CountriesOverviewPanel;
