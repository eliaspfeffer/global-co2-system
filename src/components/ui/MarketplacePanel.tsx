"use client";

import React, { useState } from "react";
import { useAppStore, MarketOffer } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

const MarketplacePanel: React.FC = () => {
  const {
    countries,
    marketOffers,
    selectedCountryId,
    postOffer,
    removeOffer,
    acceptTrade,
  } = useAppStore(
    useShallow((state) => ({
      countries: state.countries,
      marketOffers: state.marketOffers,
      selectedCountryId: state.selectedCountryId,
      postOffer: state.postOffer,
      removeOffer: state.removeOffer,
      acceptTrade: state.acceptTrade,
    }))
  );

  const [offerAmount, setOfferAmount] = useState<number>(100);
  const [offerPrice, setOfferPrice] = useState<number>(10);

  const selectedCountry = countries.find((c) => c.id === selectedCountryId);
  const potentialBuyers = countries.filter(
    (c) => c.currentCo2Emissions - c.initialCo2Allowance > 0
  );

  const handlePostOffer = () => {
    if (selectedCountry) {
      const surplus =
        selectedCountry.initialCo2Allowance -
        selectedCountry.currentCo2Emissions;
      if (surplus <= 0) {
        alert(`${selectedCountry.name} has no surplus CO2 to sell.`);
        return;
      }
      if (offerAmount <= 0 || offerPrice <= 0) {
        alert("Offer amount and price must be positive.");
        return;
      }
      const actualOfferAmount = Math.min(offerAmount, surplus); // Ensure not offering more than surplus
      if (offerAmount > surplus) {
        alert(
          `Cannot offer more than available surplus (${surplus} tons). Adjusting offer to ${actualOfferAmount} tons.`
        );
      }
      postOffer(selectedCountry.id, actualOfferAmount, offerPrice);
      setOfferAmount(100); // Reset for next offer
      setOfferPrice(10); // Reset for next offer
    } else {
      alert("Select your country first to post an offer.");
    }
  };

  const handleAcceptTrade = (offer: MarketOffer) => {
    if (selectedCountry) {
      if (
        selectedCountry.currentCo2Emissions -
          selectedCountry.initialCo2Allowance <=
        0
      ) {
        alert(
          `${selectedCountry.name} is not in deficit and cannot buy allowances.`
        );
        return;
      }
      acceptTrade(selectedCountry.id, offer);
    } else {
      alert("Select your country first to accept a trade.");
    }
  };

  const getCountryName = (id: string) =>
    countries.find((c) => c.id === id)?.name || "Unknown";

  const canSelectedCountryOffer =
    selectedCountry &&
    selectedCountry.initialCo2Allowance - selectedCountry.currentCo2Emissions >
      0 &&
    !selectedCountry.co2ForSale;
  const isSelectedCountrySelling =
    selectedCountry && selectedCountry.co2ForSale;
  const canSelectedCountryBuy =
    selectedCountry &&
    selectedCountry.currentCo2Emissions - selectedCountry.initialCo2Allowance >
      0;

  return (
    <div className="bg-slate-700 p-4 rounded-xl shadow-lg mt-3 text-white space-y-5">
      {" "}
      {/* Consistent panel styling */}
      <h2 className="text-2xl font-bold text-emerald-300 border-b-2 border-emerald-500/50 pb-3 mb-3">
        {" "}
        {/* Accent color for marketplace */}
        CO2 Allowance Market
      </h2>
      {/* Section for selected country to post an offer */}
      {canSelectedCountryOffer && (
        <div className="p-3.5 bg-slate-600 rounded-lg space-y-3 shadow">
          <h3 className="text-lg font-semibold text-emerald-200">
            Offer Your Surplus (as {selectedCountry.name})
          </h3>
          <div>
            <label
              htmlFor="offer-amount"
              className="text-sm text-slate-200 block mb-0.5"
            >
              Amount (tons):
            </label>
            <input
              type="number"
              id="offer-amount"
              value={offerAmount}
              onChange={(e) =>
                setOfferAmount(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-full p-2 rounded-md bg-slate-800 border border-slate-500 focus:ring-2 focus:ring-emerald-500 transition-colors"
              max={
                selectedCountry.initialCo2Allowance -
                selectedCountry.currentCo2Emissions
              }
            />
          </div>
          <div>
            <label
              htmlFor="offer-price"
              className="text-sm text-slate-200 block mb-0.5"
            >
              Price per Ton (Conceptual BTC):
            </label>
            <input
              type="number"
              id="offer-price"
              value={offerPrice}
              onChange={(e) =>
                setOfferPrice(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-full p-2 rounded-md bg-slate-800 border border-slate-500 focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <button
            onClick={handlePostOffer}
            className="w-full bg-emerald-600 hover:bg-emerald-500 font-semibold py-2.5 px-3 rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all"
          >
            Post Offer
          </button>
        </div>
      )}
      {isSelectedCountrySelling &&
        selectedCountry.co2ForSale && ( // Ensure co2ForSale is defined
          <div className="p-3.5 bg-slate-600 rounded-lg space-y-2 shadow">
            <p className="text-sm text-emerald-200 text-center">
              {selectedCountry.name} is offering{" "}
              <span className="font-bold">
                {selectedCountry.co2ForSale.amount.toLocaleString("en-US")} tons
              </span>{" "}
              at{" "}
              <span className="font-bold">
                {selectedCountry.co2ForSale.pricePerTon.toLocaleString("en-US")}{" "}
                BTC units/ton
              </span>
              .
            </p>
            <button
              onClick={() => removeOffer(selectedCountry.id)}
              className="w-full bg-red-600 hover:bg-red-500 font-semibold py-2 px-3 rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all"
            >
              Remove Your Offer
            </button>
          </div>
        )}
      {/* List of available offers */}
      <div className="space-y-3 pt-2">
        <h3 className="text-lg font-semibold text-slate-100">
          Available Allowances:
        </h3>
        {marketOffers.length === 0 && (
          <p className="text-sm text-slate-400 italic">
            No CO2 allowances currently offered.
          </p>
        )}
        {marketOffers
          .sort((a, b) => a.pricePerTon - b.pricePerTon)
          .map((offer, index) => (
            <div
              key={`${offer.sellerId}-${index}`}
              className="p-3 bg-slate-800 rounded-lg shadow-md flex justify-between items-center hover:bg-slate-700/60 transition-colors"
            >
              <div>
                <p className="font-semibold text-sky-300">
                  {getCountryName(offer.sellerId)}
                </p>
                <p className="text-sm text-slate-200">
                  Offers:{" "}
                  <span className="font-bold text-white">
                    {offer.amount.toLocaleString("en-US")} tons
                  </span>
                </p>
                <p className="text-sm text-slate-200">
                  Price:{" "}
                  <span className="font-bold text-yellow-400">
                    {offer.pricePerTon.toLocaleString("en-US")} BTC units/ton
                  </span>
                </p>
              </div>
              {canSelectedCountryBuy &&
                selectedCountry &&
                selectedCountry.id !== offer.sellerId && (
                  <button
                    onClick={() => handleAcceptTrade(offer)}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md text-sm shadow hover:shadow-md transform hover:scale-105 transition-all"
                  >
                    Buy
                  </button>
                )}
            </div>
          ))}
      </div>
      {/* List of countries in deficit (Potential Buyers) - Informational */}
      <div className="space-y-2 pt-4 border-t-2 border-slate-600/50">
        <h3 className="text-lg font-semibold text-slate-100">
          Countries in Deficit:
        </h3>
        {potentialBuyers.length === 0 && (
          <p className="text-sm text-slate-400 italic">
            No countries are currently in CO2 deficit.
          </p>
        )}
        {potentialBuyers.map((country) => (
          <div
            key={country.id}
            className="p-2.5 bg-red-700/40 rounded-md text-sm"
          >
            <span className="font-medium text-red-200">{country.name}</span>{" "}
            needs{" "}
            <span className="font-bold text-red-100">
              {(
                country.currentCo2Emissions - country.initialCo2Allowance
              ).toLocaleString("en-US")}{" "}
              tons
            </span>
            .
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePanel;
