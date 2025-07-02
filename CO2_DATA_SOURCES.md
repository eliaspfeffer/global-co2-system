# CO2 Emissions Data Sources

## Overview

The CO2 emissions data in this application has been updated with real-world 2023 data to provide realistic simulation parameters based on actual climate science and carbon budget research.

## Data Sources

### Current Emissions Data (2023)

- **Source**: EDGAR v9.0 database (Emissions Database for Global Atmospheric Research)
- **Reference**: [Our World in Data CO2 emissions](https://ourworldindata.org/co2-emissions)
- **Additional sources**: UNEP Emissions Gap Report 2024, World Population Review

### Global Carbon Budget Constraints

- **Source**: Climate Change Tracker - Indicators of Global Climate Change (IGCC)
- **URL**: https://climatechangetracker.org/igcc/current-remaining-carbon-budget-and-trajectory-till-exhaustion
- **Key Metrics**:
  - Remaining carbon budget (50% chance 1.5°C): 130 gigatonnes CO2
  - Remaining carbon budget (83% chance 1.5°C): 30 gigatonnes CO2
  - Current global emission rate: ~40 gigatonnes CO2/year
  - Estimated exhaustion: 2028 (50% scenario)

## Real-World Context

### Global Emissions 2023

- **Total**: ~39,000 million tonnes CO2
- **Top Emitters**:
  - China: 13,260 Mt (34% of global total)
  - USA: 4,682 Mt (12% of global total)
  - India: 2,955 Mt (7.6% of global total)
  - Russia: 2,070 Mt (5.3% of global total)
  - Germany: 583 Mt (1.5% of global total)
  - Brazil: 480 Mt (fossil fuels only)

### Implementation in Simulation

#### Current Emissions (in countries.json)

All `currentCo2Emissions` values are based on actual 2023 data in million tonnes CO2 equivalent.

#### CO2 Allowances

The `initialCo2Allowance` values represent a fair distribution of the remaining carbon budget, considering:

- Current emission levels
- Population size
- Development needs
- Historical contributions
- The Paris Agreement goals (well below 2°C, pursuing 1.5°C)

#### Calculation Rationale

- **Total allowances**: ~63,200 Mt across 6 entities
- **Current emissions**: ~23,160 Mt (from these entities)
- **Remaining headroom**: ~40,040 Mt
- This represents a portion of the global remaining budget of 130,000 Mt

## References

1. **EDGAR v9.0**: Crippa et al. (2024) - Emissions Database for Global Atmospheric Research
2. **Climate Change Tracker**: IGCC 2024 - Indicators of Global Climate Change
3. **Our World in Data**: Ritchie, H. & Roser, M. (2020) - "CO₂ emissions"
4. **UNEP Gap Report 2024**: Chapter 2 - Global greenhouse gas emissions trends
5. **Global Carbon Budget 2024**: Friedlingstein et al. - Annual update of key climate indicators

## Notes

- All values are in million tonnes (Mt) CO2 equivalent
- Data represents fossil fuel emissions (excludes land use change for most entries)
- Africa is represented as an aggregate due to the simulation's scope
- Bitcoin and gold deposits remain conceptual for demonstration purposes
