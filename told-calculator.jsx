import React, { useMemo, useState, useEffect } from "react";

const AIRCRAFT = {
  F16C: {
    label: "F-16C Viper",
    emptyWeight: 20200,
    fuelMax: 7160,
    maxTakeoff: 42300,
    maxLanding: 35000,
    refTO: 28000,
    refLDG: 26000,
    baseTOGround: 1850,
    baseTO50: 2850,
    baseAccelStop: 3900,
    baseLDG: 2950,
    baseVR: 146,
    baseVAPP: 150,
    milPenalty: 1.38,
  },
  F15E: {
    label: "F-15E Strike Eagle",
    emptyWeight: 37450,
    fuelMax: 23000,
    maxTakeoff: 81000,
    maxLanding: 68000,
    refTO: 60000,
    refLDG: 55000,
    baseTOGround: 2550,
    baseTO50: 3850,
    baseAccelStop: 5450,
    baseLDG: 4300,
    baseVR: 158,
    baseVAPP: 160,
    milPenalty: 1.24,
  },
};

const AIRBASES = {
  dhafra: {
    name: "Al Dhafra AB",
    icao: "OMAM",
    elevationFt: 77,
    location: "N 24°13.841' E 054°33.054'",
    nav: "TWR 293.4 / U14 · APP 242.5 / U17 · TACAN 96X MA · ILS unserviceable",
    closed: "13L / 31R closed",
    runways: [
      { id: "13R", mag: 130, tru: 132, lengthFt: 12008, lengthM: 3660, widthM: 46 },
      { id: "31L", mag: 310, tru: 312, lengthFt: 12008, lengthM: 3660, widthM: 46 },
    ],
  },
  minhad: {
    name: "Al Minhad AB",
    icao: "OMDM",
    elevationFt: 190,
    location: "N 25°01.590' E 055°21.895'",
    nav: "TWR 252.1 / U12 · TACAN 99X MIN · ILS 09 110.70 · ILS 27 110.75",
    runways: [
      { id: "09", mag: 88, tru: 90, lengthFt: 11877, lengthM: 3620, widthM: 45 },
      { id: "27", mag: 268, tru: 270, lengthFt: 11877, lengthM: 3620, widthM: 45 },
    ],
  },
  liwa: {
    name: "Liwa Airbase",
    icao: "OMLW",
    elevationFt: 377,
    location: "N 23°39.087' E 053°49.414'",
    nav: "TWR 251.950 / U13 · TACAN 121X · ILS NIL",
    runways: [
      { id: "13", mag: 130, tru: 132, lengthFt: 11975, lengthM: 3650, widthM: 45 },
      { id: "31", mag: 310, tru: 312, lengthFt: 11975, lengthM: 3650, widthM: 45 },
    ],
  },
  bateen: {
    name: "Al Bateen Airport",
    icao: "OMAD",
    elevationFt: 13,
    location: "N 24°25.690' E 054°27.507'",
    nav: "TWR 251.6 / U11 · APP 242.5 / U17 · TACAN NIL · ILS NIL",
    runways: [
      { id: "13", mag: 130, tru: 132, lengthFt: 7218, lengthM: 2200, widthM: 45 },
      { id: "31", mag: 310, tru: 312, lengthFt: 7218, lengthM: 2200, widthM: 45 },
    ],
  },
};

const STORES = [
  { id: "aim120", name: "AIM-120", weight: 335, drag: 2.2, ac: ["F16C", "F15E"] },
  { id: "aim9", name: "AIM-9", weight: 190, drag: 1.2, ac: ["F16C", "F15E"] },
  { id: "aim7", name: "AIM-7M", weight: 510, drag: 2.5, ac: ["F15E"] },
  { id: "gun", name: "Gun ammo", weight: 250, drag: 0, ac: ["F16C", "F15E"] },
  { id: "hts", name: "HTS pod", weight: 190, drag: 1, ac: ["F16C"] },
  { id: "tgp", name: "TGP / Sniper / Litening", weight: 450, drag: 1.8, ac: ["F16C", "F15E"] },
  { id: "lantirn", name: "F-15E LANTIRN set", weight: 920, drag: 3.5, ac: ["F15E"] },
  { id: "gbu12", name: "GBU-12", weight: 611, drag: 3.2, ac: ["F16C", "F15E"] },
  { id: "gbu38", name: "GBU-38", weight: 558, drag: 2.6, ac: ["F16C", "F15E"] },
  { id: "gbu31", name: "GBU-31", weight: 2000, drag: 5.5, ac: ["F15E"] },
  { id: "mk82", name: "Mk-82", weight: 531, drag: 2.8, ac: ["F16C", "F15E"] },
  { id: "mk84", name: "Mk-84", weight: 1970, drag: 5, ac: ["F15E"] },
  { id: "agm65", name: "AGM-65", weight: 670, drag: 3.5, ac: ["F16C"] },
  { id: "agm88", name: "AGM-88", weight: 800, drag: 4, ac: ["F16C"] },
  { id: "tank300", name: "F-16 300 gal center tank", weight: 2250, usableFuel: 2010, drag: 5, ac: ["F16C"] },
  { id: "tank370", name: "F-16 370 gal wing tank", weight: 2750, usableFuel: 2480, drag: 6.5, ac: ["F16C"] },
  { id: "f15tank", name: "F-15E external tank", weight: 4300, usableFuel: 4090, drag: 7, ac: ["F15E"] },
];

const PRESETS = {
  F16C: {
    "Clean / training": { aim9: 2, aim120: 2, gun: 1 },
    "DJS SEAD 2x HARM": { aim120: 2, aim9: 2, gun: 1, agm88: 2, hts: 1, tgp: 1, tank370: 2 },
    "Strike JDAM 4x GBU-38": { aim120: 2, aim9: 2, gun: 1, gbu38: 4, tgp: 1, tank370: 2 },
    "CAS 4x GBU-12": { aim120: 2, aim9: 2, gun: 1, gbu12: 4, tgp: 1, tank370: 2 },
    "Long range A/A": { aim120: 4, aim9: 2, gun: 1, tgp: 1, tank370: 2, tank300: 1 },
  },
  F15E: {
    "Clean / training": { aim120: 4, aim9: 2, gun: 1, lantirn: 1 },
    "Escort 8x A/A": { aim120: 4, aim9: 4, gun: 1, lantirn: 1, f15tank: 1 },
    "Strike 8x GBU-38": { aim120: 4, aim9: 2, gun: 1, lantirn: 1, gbu38: 8 },
    "Heavy 4x GBU-31": { aim120: 4, aim9: 2, gun: 1, lantirn: 1, gbu31: 4 },
    "CAS 8x GBU-12": { aim120: 4, aim9: 2, gun: 1, lantirn: 1, gbu12: 8 },
  },
};

const FUEL_MODEL = {
  F16C: { startup: 650, transit: 34, rtba: 58, play: 105, recovery: 550, reserve: 1200, jokerPad: 650 },
  F15E: { startup: 1500, transit: 82, rtba: 135, play: 260, recovery: 1200, reserve: 3200, jokerPad: 1800 },
};

const T = {
  en: {
    app: "DCS TOLD Calculator",
    sub: "Takeoff, landing and fuel estimator with loadout selection.",
    lang: "Language", aircraft: "Aircraft", base: "Base", runway: "Runway",
    weather: "Weather", oat: "OAT", qnh: "QNH", windFrom: "Wind from", windSpeed: "Wind speed",
    surface: "Surface", dry: "Dry", dusty: "Dusty / sand", wet: "Wet",
    thrust: "Thrust", headwind: "Headwind", crosswind: "Crosswind",
    pressureAlt: "Pressure altitude", densityAlt: "Density altitude",
    calibration: "DCS calibration", buffer: "Safety buffer", calFactor: "Calibration factor",
    loadout: "Loadout selection", loadoutHelp: "Preset plus manual counters.", preset: "Preset",
    takeoffFuel: "Takeoff fuel", landingFuel: "Landing fuel", storesLanding: "Stores remaining at landing",
    told: "TOLD results", rotation: "Rotation", liftoff: "Lift-off", approach: "Approach", touchdown: "Touchdown",
    groundRoll: "Takeoff ground roll", over50: "Takeoff over 50 ft", accelStop: "Accelerate-stop",
    ldgDist: "Landing distance", togW: "Takeoff gross weight", ldgW: "Landing gross weight",
    warnings: "Warnings", noWarn: "No major warning. Validate in DCS and follow squadron SOP.",
    copy: "Copy kneeboard card", copied: "Copied",
    fuel: "Fuel, Joker and Bingo", fuelHelp: "Estimate mission fuel from route distance, RTBA distance, playtime and cruise altitude.",
    totalDist: "Total distance", rtbaDist: "RTBA distance", playtime: "Playtime on station", altitude: "Cruise altitude",
    aar: "Air refuel planned", fuelReq: "Mission fuel required", selectedFuel: "Selected takeoff fuel",
    internalFuel: "Internal fuel", externalFuel: "External tank fuel", joker: "Joker", bingo: "Bingo",
    aarOffload: "AAR offload needed", landingFuelProjected: "Projected landing fuel",
    fuelOk: "Fuel plan OK without AAR.", fuelShort: "Selected fuel is short for the mission without AAR.",
    fuelAarRequired: "AAR required with selected takeoff fuel.", fuelAarOptional: "AAR planned, but selected fuel already covers the estimate.",
    bases: "Persian Gulf base cards", assumptions: "Assumptions",
    assumptionText: "DCS planning estimator only, not certified real-world TOLD. Tune with Tacview and squadron SOP.",
    margin: "margin", estimated: "estimated", max: "Max", limit: "Limit", usable: "usable fuel",
    closed: "Closed", nav: "Nav / radio", planning: "Planning note", elevation: "Elevation",
  },
  fr: {
    app: "Calculateur TOLD DCS",
    sub: "Estimateur décollage, atterrissage et fuel avec choix du loadout.",
    lang: "Langue", aircraft: "Avion", base: "Base", runway: "Piste",
    weather: "Météo", oat: "Température", qnh: "QNH", windFrom: "Vent du", windSpeed: "Force du vent",
    surface: "Surface", dry: "Sèche", dusty: "Poussière / sable", wet: "Mouillée",
    thrust: "Poussée", headwind: "Vent de face", crosswind: "Vent traversier",
    pressureAlt: "Altitude pression", densityAlt: "Altitude-densité",
    calibration: "Calibration DCS", buffer: "Marge de sécurité", calFactor: "Facteur de calibration",
    loadout: "Sélection du loadout", loadoutHelp: "Préset + compteurs manuels.", preset: "Préset",
    takeoffFuel: "Carburant décollage", landingFuel: "Carburant atterrissage", storesLanding: "Emports restants à l'atterrissage",
    told: "Résultats TOLD", rotation: "Rotation", liftoff: "Décollage", approach: "Approche", touchdown: "Toucher",
    groundRoll: "Roulage décollage", over50: "Décollage au-dessus de 50 ft", accelStop: "Accélération-arrêt",
    ldgDist: "Distance d'atterrissage", togW: "Masse décollage", ldgW: "Masse atterrissage",
    warnings: "Alertes", noWarn: "Aucune alerte majeure. Valide dans DCS et applique les SOP de l'escadron.",
    copy: "Copier la carte kneeboard", copied: "Copié",
    fuel: "Fuel, Joker et Bingo", fuelHelp: "Estime le carburant mission à partir de la distance route, RTBA, playtime et altitude.",
    totalDist: "Distance totale", rtbaDist: "Distance RTBA", playtime: "Playtime sur zone", altitude: "Altitude croisière",
    aar: "Ravitaillement en vol prévu", fuelReq: "Fuel mission requis", selectedFuel: "Fuel décollage sélectionné",
    internalFuel: "Fuel interne", externalFuel: "Fuel bidons externes", joker: "Joker", bingo: "Bingo",
    aarOffload: "Offload AAR requis", landingFuelProjected: "Fuel prévu au posé",
    fuelOk: "Plan fuel OK sans AAR.", fuelShort: "Fuel sélectionné insuffisant sans AAR.",
    fuelAarRequired: "AAR requis avec le fuel sélectionné.", fuelAarOptional: "AAR prévu, mais fuel déjà suffisant.",
    bases: "Fiches bases Golfe Persique", assumptions: "Hypothèses",
    assumptionText: "Estimateur DCS uniquement, non certifié TOLD réel. À calibrer avec Tacview et SOP escadron.",
    margin: "marge", estimated: "estimé", max: "Max", limit: "Limite", usable: "fuel utilisable",
    closed: "Fermé", nav: "Nav / radio", planning: "Note planning", elevation: "Altitude",
  },
};

const NL = String.fromCharCode(10);
const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const clamp = (value, min, max) => Math.min(Math.max(num(value), min), max);
const fmt = (value, digits = 0) => (Number.isFinite(value) ? (Math.abs(value) < 0.005 ? 0 : value).toLocaleString(undefined, { maximumFractionDigits: digits }) : "—");
const ft = (value) => `${fmt(value)} ft`;
const kt = (value) => `${fmt(value)} kt`;
const lb = (value) => `${fmt(value)} lb`;
const deg = (value) => `${Math.round(((num(value) % 360) + 360) % 360).toString().padStart(3, "0")}°`;
const clone = (value) => JSON.parse(JSON.stringify(value || {}));

function statusTone(label) {
  if (label === "NO-GO") return "border-red-200 bg-red-100 text-red-800";
  if (label === "MARGINAL") return "border-amber-200 bg-amber-100 text-amber-900";
  if (label === "CAUTION") return "border-yellow-200 bg-yellow-100 text-yellow-900";
  return "border-emerald-200 bg-emerald-100 text-emerald-800";
}

function fuelStatusTone(key) {
  if (key === "fuelShort") return "border-red-200 bg-red-100 text-red-800";
  if (key === "fuelAarRequired") return "border-sky-200 bg-sky-100 text-sky-800";
  return "border-emerald-200 bg-emerald-100 text-emerald-800";
}

function computeWind(windFrom, windSpeed, heading) {
  const diff = Math.abs(num(windFrom) - num(heading)) % 360;
  const angle = diff > 180 ? 360 - diff : diff;
  const rad = (angle * Math.PI) / 180;
  return {
    angle,
    headwind: num(windSpeed) * Math.cos(rad),
    crosswind: Math.abs(num(windSpeed) * Math.sin(rad)),
  };
}

function statusFromMargin(margin, hardFail) {
  if (hardFail || margin < 0) return "NO-GO";
  if (margin < 10) return "MARGINAL";
  if (margin < 25) return "CAUTION";
  return "GO";
}

function aircraftStores(aircraftId) {
  return STORES.filter((store) => store.ac.includes(aircraftId));
}

function calculateTold(input = {}) {
  const aircraftId = input.aircraftId || "F16C";
  const aircraft = AIRCRAFT[aircraftId] || AIRCRAFT.F16C;
  const base = AIRBASES[input.baseId] || AIRBASES.dhafra;
  const runway = base.runways.find((item) => item.id === input.runwayId) || base.runways[0];
  const counts = input.counts || {};
  const stores = aircraftStores(aircraftId);
  const fuelPct = clamp(input.fuelPct, 0, 100);
  const landingFuelPct = clamp(input.landingFuelPct, 0, 100);
  const landingStoresPct = clamp(input.landingStoresPct, 0, 100);
  const qnh = clamp(input.qnh ?? 29.92, 28.5, 31.5);
  const oat = clamp(input.oatC ?? 15, -50, 70);
  const wind = computeWind(input.windDir ?? runway.tru, input.windSpeed ?? 0, runway.tru);
  const storesWeight = stores.reduce((sum, item) => sum + (counts[item.id] || 0) * item.weight, 0);
  const externalTankFuel = stores.reduce((sum, item) => sum + (counts[item.id] || 0) * (item.usableFuel || 0), 0);
  const dragIndex = stores.reduce((sum, item) => sum + (counts[item.id] || 0) * item.drag, 0);
  const internalTakeoffFuel = aircraft.fuelMax * fuelPct / 100;
  const totalTakeoffFuel = internalTakeoffFuel + externalTankFuel;
  const landingFuel = aircraft.fuelMax * landingFuelPct / 100;
  const takeoffWeight = aircraft.emptyWeight + internalTakeoffFuel + storesWeight;
  const landingWeight = aircraft.emptyWeight + landingFuel + storesWeight * landingStoresPct / 100;
  const pressureAlt = base.elevationFt + (29.92 - qnh) * 1000;
  const isa = 15 - 1.98 * (pressureAlt / 1000);
  const densityAlt = pressureAlt + 120 * (oat - isa);
  const surfaceFactor = input.surface === "wet" ? 1.16 : input.surface === "dusty" ? 1.08 : 1;
  const takeoffWindFactor = wind.headwind >= 0 ? Math.max(0.72, 1 - wind.headwind * 0.01) : 1 + Math.min(Math.abs(wind.headwind), 25) * 0.022;
  const landingWindFactor = wind.headwind >= 0 ? Math.max(0.7, 1 - wind.headwind * 0.014) : 1 + Math.min(Math.abs(wind.headwind), 25) * 0.03;
  const toWeightFactor = Math.pow(takeoffWeight / aircraft.refTO, 1.82);
  const ldgWeightFactor = Math.pow(landingWeight / aircraft.refLDG, 1.72);
  const daTo = 1 + (Math.max(densityAlt, -1000) / 1000) * 0.018;
  const daLdg = 1 + (Math.max(densityAlt, -1000) / 1000) * 0.006;
  const dragFactor = 1 + dragIndex * 0.0037;
  const thrustFactor = input.thrustMode === "MIL" ? aircraft.milPenalty : 1;
  const safetyFactor = 1 + clamp(input.bufferPct, 0, 50) / 100;
  const calibrationFactor = clamp(input.calibrationPct ?? 100, 50, 160) / 100;
  const toGround = aircraft.baseTOGround * toWeightFactor * daTo * dragFactor * thrustFactor * surfaceFactor * takeoffWindFactor * safetyFactor * calibrationFactor;
  const to50 = aircraft.baseTO50 * toWeightFactor * daTo * dragFactor * thrustFactor * surfaceFactor * takeoffWindFactor * safetyFactor * calibrationFactor;
  const accelStop = aircraft.baseAccelStop * Math.pow(takeoffWeight / aircraft.refTO, 1.72) * daTo * surfaceFactor * takeoffWindFactor * safetyFactor * calibrationFactor;
  const landingDistance = aircraft.baseLDG * ldgWeightFactor * daLdg * surfaceFactor * landingWindFactor * safetyFactor * calibrationFactor;
  const vr = aircraft.baseVR * Math.sqrt(takeoffWeight / aircraft.refTO) + dragIndex * 0.12 + (input.thrustMode === "MIL" ? 4 : 0) + Math.max(densityAlt, 0) * 0.00045;
  const vlof = vr + (aircraftId === "F16C" ? 9 : 11);
  const vapp = aircraft.baseVAPP * Math.sqrt(landingWeight / aircraft.refLDG) + dragIndex * 0.08;
  const vtd = vapp - 10;
  const toMarginPct = (runway.lengthFt - to50) / runway.lengthFt * 100;
  const asMarginPct = (runway.lengthFt - accelStop) / runway.lengthFt * 100;
  const ldgMarginPct = (runway.lengthFt - landingDistance) / runway.lengthFt * 100;
  const hardFail = takeoffWeight > aircraft.maxTakeoff || landingWeight > aircraft.maxLanding;
  const status = statusFromMargin(Math.min(toMarginPct, asMarginPct, ldgMarginPct), hardFail);
  const warnings = [];
  if (hardFail) warnings.push("Weight limit exceeded.");
  if (wind.headwind < -8) warnings.push(`Tailwind ${kt(Math.abs(wind.headwind))}.`);
  if (wind.crosswind > 25) warnings.push(`Crosswind ${kt(wind.crosswind)}.`);
  if (densityAlt > 3500) warnings.push(`High density altitude ${ft(densityAlt)}.`);
  if (toMarginPct < 10) warnings.push("Takeoff 50 ft margin below 10%.");
  if (asMarginPct < 10) warnings.push("Accelerate-stop margin below 10%.");
  if (ldgMarginPct < 10) warnings.push("Landing margin below 10%.");
  return {
    aircraftId, aircraft, base, runway,
    storesWeight, externalTankFuel, internalTakeoffFuel, totalTakeoffFuel, landingFuel,
    dragIndex, takeoffWeight, landingWeight, pressureAlt, densityAlt, wind,
    toGround, to50, accelStop, landingDistance, vr, vlof, vapp, vtd,
    toMarginPct, asMarginPct, ldgMarginPct, status, warnings,
  };
}

function altitudeFuelFactor(altitudeFt) {
  if (altitudeFt < 5000) return 1.18;
  if (altitudeFt < 15000) return 1.08;
  if (altitudeFt < 25000) return 1;
  if (altitudeFt < 35000) return 0.92;
  return 0.88;
}

function calculateFuelPlan(input = {}) {
  const model = FUEL_MODEL[input.aircraftId] || FUEL_MODEL.F16C;
  const selected = Math.max(0, num(input.selectedTakeoffFuelLb));
  const dragIndex = Math.max(0, num(input.dragIndex));
  const totalDistance = Math.max(0, num(input.totalDistanceNm));
  const rtbaDistance = clamp(Math.max(0, num(input.rtbaDistanceNm)), 0, totalDistance);
  const transitDistance = totalDistance - rtbaDistance;
  const playtime = Math.max(0, num(input.playtimeMin));
  const altitudeFactor = altitudeFuelFactor(Math.max(0, num(input.cruiseAltitudeFt)));
  const transitRate = model.transit * altitudeFactor * (1 + dragIndex * 0.008);
  const rtbaRate = model.rtba * (1 + dragIndex * 0.006);
  const playRate = model.play * altitudeFactor * (1 + dragIndex * 0.005);
  const transitFuel = transitDistance * transitRate;
  const rtbaFuel = rtbaDistance * rtbaRate;
  const playFuel = playtime * playRate;
  const totalFuelRequired = model.startup + transitFuel + rtbaFuel + playFuel + model.recovery + model.reserve;
  const bingoFuel = (transitDistance / 2) * transitRate + (rtbaDistance / 2) * rtbaRate + model.recovery + model.reserve;
  const jokerFuel = bingoFuel + Math.max(model.jokerPad, playFuel * 0.35);
  const shortfall = Math.max(0, totalFuelRequired - selected);
  const aarOffloadNeeded = input.aarPlanned ? shortfall : 0;
  const projectedLandingFuel = selected + aarOffloadNeeded - (totalFuelRequired - model.reserve);
  let statusKey = "fuelOk";
  if (input.aarPlanned && shortfall > 0) statusKey = "fuelAarRequired";
  else if (input.aarPlanned) statusKey = "fuelAarOptional";
  else if (shortfall > 0) statusKey = "fuelShort";
  return {
    totalDistance, rtbaDistance, transitDistance, playtime,
    transitFuel, rtbaFuel, playFuel,
    totalFuelRequired, bingoFuel, jokerFuel,
    shortfall, aarOffloadNeeded, projectedLandingFuel, statusKey,
  };
}

function Card({ children, className = "" }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm ${className}`}>{children}</section>;
}
function Pill({ children, className = "border-slate-200 bg-slate-100 text-slate-700" }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${className}`}>{children}</span>;
}
function Metric({ title, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-xl font-black text-slate-950">{value}</div>
      {sub ? <div className="mt-1 text-xs font-semibold text-slate-500">{sub}</div> : null}
    </div>
  );
}
function Label({ children }) {
  return <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{children}</span>;
}
function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

// ===== FIXED NumberField — uses local string state so users can edit freely =====
// Bug in original: clamp() was applied on every keystroke, making it impossible to
// type values like "29.92" into a field with min 28.5 (the "2" alone got clamped to 28.5).
// Fix: keep a local string while typing, only commit clamped value on blur.
function NumberField({ label, value, onChange, min, max, step = 1, suffix }) {
  const [str, setStr] = useState(String(value));

  // Sync local string when external value changes (e.g. preset switch).
  // Guard against re-syncing during the user's own typing.
  useEffect(() => {
    if (parseFloat(str) !== value) setStr(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <input
          className="w-full bg-transparent text-sm font-semibold outline-none"
          type="number"
          min={min}
          max={max}
          step={step}
          value={str}
          onChange={(event) => {
            const v = event.target.value;
            setStr(v);
            const n = parseFloat(v);
            if (Number.isFinite(n)) onChange(n); // commit live, but no clamp during typing
          }}
          onBlur={() => {
            const n = parseFloat(str);
            const clamped = Number.isFinite(n)
              ? clamp(n, min, max)
              : (Number.isFinite(value) ? value : min);
            onChange(clamped);
            setStr(String(clamped));
          }}
        />
        <span className="text-xs font-semibold text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function RangeField({ label, value, onChange, min, max }) {
  return (
    <label className="block">
      <Label>{label}: {value}%</Label>
      <input className="w-full" type="range" min={min} max={max} value={value} onChange={(event) => onChange(num(event.target.value, value))} />
    </label>
  );
}

export default function DcsToldCalculatorApp() {
  const [language, setLanguage] = useState("en");
  const [aircraftId, setAircraftId] = useState("F16C");
  const [baseId, setBaseId] = useState("dhafra");
  const [runwayId, setRunwayId] = useState(AIRBASES.dhafra.runways[0].id);
  const [presetName, setPresetName] = useState("DJS SEAD 2x HARM");
  const [counts, setCounts] = useState(clone(PRESETS.F16C["DJS SEAD 2x HARM"]));
  const [fuelPct, setFuelPct] = useState(80);
  const [landingFuelPct, setLandingFuelPct] = useState(25);
  const [landingStoresPct, setLandingStoresPct] = useState(20);
  const [oatC, setOatC] = useState(35);
  const [qnh, setQnh] = useState(29.92);
  const [windDir, setWindDir] = useState(130);
  const [windSpeed, setWindSpeed] = useState(8);
  const [surface, setSurface] = useState("dry");
  const [thrustMode, setThrustMode] = useState("AB");
  const [bufferPct, setBufferPct] = useState(15);
  const [calibrationPct, setCalibrationPct] = useState(100);
  const [totalDistanceNm, setTotalDistanceNm] = useState(320);
  const [rtbaDistanceNm, setRtbaDistanceNm] = useState(60);
  const [playtimeMin, setPlaytimeMin] = useState(20);
  const [cruiseAltitudeFt, setCruiseAltitudeFt] = useState(25000);
  const [aarPlanned, setAarPlanned] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = T[language];
  const base = AIRBASES[baseId];
  const runway = base.runways.find((item) => item.id === runwayId) || base.runways[0];
  const stores = useMemo(() => aircraftStores(aircraftId), [aircraftId]);
  const presets = PRESETS[aircraftId];
  const calc = useMemo(() => calculateTold({ aircraftId, baseId, runwayId, counts, fuelPct, landingFuelPct, landingStoresPct, oatC, qnh, windDir, windSpeed, surface, thrustMode, bufferPct, calibrationPct }), [aircraftId, baseId, runwayId, counts, fuelPct, landingFuelPct, landingStoresPct, oatC, qnh, windDir, windSpeed, surface, thrustMode, bufferPct, calibrationPct]);
  const fuel = useMemo(() => calculateFuelPlan({ aircraftId, totalDistanceNm, rtbaDistanceNm, playtimeMin, cruiseAltitudeFt, aarPlanned, selectedTakeoffFuelLb: calc.totalTakeoffFuel, dragIndex: calc.dragIndex }), [aircraftId, totalDistanceNm, rtbaDistanceNm, playtimeMin, cruiseAltitudeFt, aarPlanned, calc.totalTakeoffFuel, calc.dragIndex]);

  function changeAircraft(next) {
    const preset = next === "F16C" ? "DJS SEAD 2x HARM" : "Strike 8x GBU-38";
    setAircraftId(next);
    setPresetName(preset);
    setCounts(clone(PRESETS[next][preset]));
    setFuelPct(next === "F16C" ? 80 : 70);
  }
  function changeBase(next) {
    const rw = AIRBASES[next].runways[0];
    setBaseId(next);
    setRunwayId(rw.id);
    setWindDir(rw.tru);
  }
  function changePreset(next) {
    setPresetName(next);
    setCounts(clone(presets[next]));
  }
  function changeCount(id, delta) {
    setCounts((previous) => ({ ...previous, [id]: clamp((previous[id] || 0) + delta, 0, 16) }));
  }

  const kneeboard = [
    `${text.app} - ${calc.aircraft.label}`,
    `${text.base}: ${calc.base.name} (${calc.base.icao}) RWY ${calc.runway.id}`,
    `${text.loadout}: ${presetName}`,
    `${text.togW}: ${lb(calc.takeoffWeight)} | ${text.selectedFuel}: ${lb(calc.totalTakeoffFuel)}`,
    `VR ${kt(calc.vr)} | VLOF ${kt(calc.vlof)} | VAPP ${kt(calc.vapp)}`,
    `${text.fuelReq}: ${lb(fuel.totalFuelRequired)} | ${text.joker}: ${lb(fuel.jokerFuel)} | ${text.bingo}: ${lb(fuel.bingoFuel)}`,
  ].join(NL);

  async function copyCard() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(kneeboard);
      setCopied(true);
      if (typeof window !== "undefined") window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-100">DCS World · Persian Gulf · F-16C / F-15E</div>
              <h1 className="text-3xl font-black md:text-5xl">{text.app}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 md:text-base">{text.sub}</p>
            </div>
            <div className="space-y-3 rounded-2xl bg-slate-950/60 p-4 text-right">
              <SelectField label={text.lang} value={language} onChange={setLanguage}>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </SelectField>
              <Pill className={statusTone(calc.status)}>{calc.status}</Pill>
              <div className="text-2xl font-black">VR {kt(calc.vr)}</div>
              <div className="text-xs text-slate-400">{base.name} · RWY {runway.id}</div>
            </div>
          </div>
        </header>

        {/* FIXED layout: was lg:grid-cols-[420px_1fr] (arbitrary value, no JIT compiler in artifact env).
            Replaced with a 5-column grid: 2 cols left, 3 cols right. */}
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <Card>
              <h2 className="mb-4 text-lg font-black">{text.aircraft} / {text.base} / {text.runway}</h2>
              <div className="grid gap-4">
                <SelectField label={text.aircraft} value={aircraftId} onChange={changeAircraft}>
                  {Object.entries(AIRCRAFT).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
                </SelectField>
                <SelectField label={text.base} value={baseId} onChange={changeBase}>
                  {Object.entries(AIRBASES).map(([id, item]) => <option key={id} value={id}>{item.name} ({item.icao})</option>)}
                </SelectField>
                <SelectField label={text.runway} value={runwayId} onChange={setRunwayId}>
                  {base.runways.map((item) => <option key={item.id} value={item.id}>RWY {item.id} · {deg(item.tru)}T · {ft(item.lengthFt)}</option>)}
                </SelectField>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="font-black">{base.name} ({base.icao})</div>
                  <div>{text.elevation} {ft(base.elevationFt)} · {base.location}</div>
                  <div>RWY {runway.id} {deg(runway.tru)}T / {deg(runway.mag)}M · {runway.lengthM}×{runway.widthM}m</div>
                  <div className="text-xs text-slate-500">{base.nav}</div>
                  {base.closed ? <div className="text-xs font-black text-red-700">{text.closed}: {base.closed}</div> : null}
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-black">{text.weather}</h2>
              <div className="grid grid-cols-2 gap-4">
                <NumberField label={text.oat} value={oatC} onChange={setOatC} min={-20} max={60} suffix="°C" />
                <NumberField label={text.qnh} value={qnh} onChange={setQnh} min={28.5} max={31} step={0.01} suffix="inHg" />
                <NumberField label={text.windFrom} value={windDir} onChange={setWindDir} min={0} max={360} suffix="°" />
                <NumberField label={text.windSpeed} value={windSpeed} onChange={setWindSpeed} min={0} max={80} suffix="kt" />
                <SelectField label={text.surface} value={surface} onChange={setSurface}>
                  <option value="dry">{text.dry}</option>
                  <option value="dusty">{text.dusty}</option>
                  <option value="wet">{text.wet}</option>
                </SelectField>
                <SelectField label={text.thrust} value={thrustMode} onChange={setThrustMode}>
                  <option value="AB">MAX AB</option>
                  <option value="MIL">MIL</option>
                </SelectField>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric title={text.headwind} value={kt(calc.wind.headwind)} />
                <Metric title={text.crosswind} value={kt(calc.wind.crosswind)} />
                <Metric title={text.pressureAlt} value={ft(calc.pressureAlt)} />
                <Metric title={text.densityAlt} value={ft(calc.densityAlt)} />
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-black">{text.calibration}</h2>
              <div className="space-y-4">
                <RangeField label={text.buffer} value={bufferPct} onChange={setBufferPct} min={0} max={35} />
                <RangeField label={text.calFactor} value={calibrationPct} onChange={setCalibrationPct} min={80} max={130} />
              </div>
            </Card>
          </div>

          <div className="space-y-5 lg:col-span-3">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">{text.loadout}</h2>
                  <p className="text-sm text-slate-500">{text.loadoutHelp}</p>
                </div>
                <Pill>DI {fmt(calc.dragIndex, 1)}</Pill>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label={text.preset} value={presetName} onChange={changePreset}>
                  {Object.keys(presets).map((item) => <option key={item} value={item}>{item}</option>)}
                </SelectField>
                <div className="grid grid-cols-2 gap-4">
                  <RangeField label={text.takeoffFuel} value={fuelPct} onChange={setFuelPct} min={0} max={100} />
                  <RangeField label={text.landingFuel} value={landingFuelPct} onChange={setLandingFuelPct} min={0} max={100} />
                </div>
              </div>
              <div className="mt-4"><RangeField label={text.storesLanding} value={landingStoresPct} onChange={setLandingStoresPct} min={0} max={100} /></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <div className="text-sm font-black">{store.name}</div>
                      <div className="text-xs text-slate-500">{store.weight} lb · DI {store.drag}{store.usableFuel ? ` · ${text.usable}: ${lb(store.usableFuel)}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="h-8 w-8 rounded-full border bg-white font-black" onClick={() => changeCount(store.id, -1)}>−</button>
                      <div className="w-6 text-center font-black">{counts[store.id] || 0}</div>
                      <button type="button" className="h-8 w-8 rounded-full border bg-white font-black" onClick={() => changeCount(store.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-5 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black">{text.told}</h2>
                  <Pill className={statusTone(calc.status)}>{calc.status}</Pill>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric title={text.rotation} value={kt(calc.vr)} />
                  <Metric title={text.liftoff} value={kt(calc.vlof)} />
                  <Metric title={text.approach} value={kt(calc.vapp)} />
                  <Metric title={text.touchdown} value={kt(calc.vtd)} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Metric title={text.groundRoll} value={ft(calc.toGround)} sub={text.estimated} />
                  <Metric title={text.over50} value={ft(calc.to50)} sub={`${fmt(calc.toMarginPct)}% ${text.margin}`} />
                  <Metric title={text.accelStop} value={ft(calc.accelStop)} sub={`${fmt(calc.asMarginPct)}% ${text.margin}`} />
                  <Metric title={text.ldgDist} value={ft(calc.landingDistance)} sub={`${fmt(calc.ldgMarginPct)}% ${text.margin}`} />
                  <Metric title={text.togW} value={lb(calc.takeoffWeight)} sub={`${text.max} ${lb(calc.aircraft.maxTakeoff)}`} />
                  <Metric title={text.ldgW} value={lb(calc.landingWeight)} sub={`${text.limit} ${lb(calc.aircraft.maxLanding)}`} />
                </div>
              </Card>

              <Card>
                <h2 className="mb-3 text-lg font-black">{text.warnings}</h2>
                {calc.warnings.length ? (
                  <div className="space-y-2">
                    {calc.warnings.map((warning, index) => <div key={index} className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">⚠ {warning}</div>)}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{text.noWarn}</div>
                )}
                <button type="button" onClick={copyCard} className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-black text-white">{copied ? text.copied : text.copy}</button>
              </Card>
            </div>

            <Card>
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-black">{text.fuel}</h2>
                  <p className="text-sm text-slate-500">{text.fuelHelp}</p>
                </div>
                <Pill className={fuelStatusTone(fuel.statusKey)}>{text[fuel.statusKey]}</Pill>
              </div>
              <div className="grid gap-4 md:grid-cols-5">
                <NumberField label={text.totalDist} value={totalDistanceNm} onChange={setTotalDistanceNm} min={0} max={2500} suffix="nm" />
                <NumberField label={text.rtbaDist} value={rtbaDistanceNm} onChange={setRtbaDistanceNm} min={0} max={2500} suffix="nm" />
                <NumberField label={text.playtime} value={playtimeMin} onChange={setPlaytimeMin} min={0} max={240} suffix="min" />
                <NumberField label={text.altitude} value={cruiseAltitudeFt} onChange={setCruiseAltitudeFt} min={0} max={50000} step={1000} suffix="ft" />
                <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <Label>AAR</Label>
                  <span className="flex items-center gap-2 text-sm font-black"><input type="checkbox" checked={aarPlanned} onChange={(event) => setAarPlanned(event.target.checked)} />{text.aar}</span>
                </label>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Metric title={text.fuelReq} value={lb(fuel.totalFuelRequired)} sub={`${fmt(fuel.transitDistance)} nm transit / ${fmt(fuel.rtbaDistance)} nm RTBA`} />
                <Metric title={text.selectedFuel} value={lb(calc.totalTakeoffFuel)} sub={`${text.internalFuel}: ${lb(calc.internalTakeoffFuel)} · ${text.externalFuel}: ${lb(calc.externalTankFuel)}`} />
                <Metric title={text.joker} value={lb(fuel.jokerFuel)} />
                <Metric title={text.bingo} value={lb(fuel.bingoFuel)} />
                <Metric title={text.aarOffload} value={lb(fuel.aarOffloadNeeded)} />
                <Metric title={text.landingFuelProjected} value={lb(fuel.projectedLandingFuel)} />
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-black">{text.bases}</h2>
              {/* FIXED: was min-w-[720px] (arbitrary value). Inline style works without JIT. */}
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 text-sm" style={{ minWidth: 720 }}>
                  <thead className="text-left text-xs uppercase text-slate-500"><tr><th>{text.base}</th><th>ICAO</th><th>{text.runway}</th><th>{text.nav}</th><th>{text.planning}</th></tr></thead>
                  <tbody>
                    {Object.values(AIRBASES).map((item) => (
                      <tr key={item.icao} className="bg-slate-50">
                        <td className="rounded-l-xl p-3 font-black">{item.name}</td>
                        <td className="p-3">{item.icao}</td>
                        <td className="p-3">{item.runways.map((rw) => `${rw.id} ${rw.lengthM}×${rw.widthM}m`).join(" · ")}{item.closed ? ` · ${text.closed}: ${item.closed}` : ""}</td>
                        <td className="p-3 text-xs">{item.nav}</td>
                        <td className="rounded-r-xl p-3 text-xs">{item.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-black">{text.assumptions}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text.assumptionText}</p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
