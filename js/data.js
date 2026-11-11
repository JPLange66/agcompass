/**
 * Ag Compass sourced defaults — aligned with the main Page
 * (canvas c3671ed0) plus NOAA GOES imagery and the AgWest mailer concept.
 * Built Nov 11, 2026 (America/Phoenix). Defaults are tagged
 * sourced | derived | assumption | jim-example | unverified.
 */
export const BUILD = {
  dateLabel: "Nov 11, 2026, America/Phoenix",
  disclaimer:
    "Ag Compass is a decision board for discussion, not financial, legal, agronomic, water-rights, or lending advice. Mentions of AgWest Farm Credit, the University of Arizona, Wilbur-Ellis, CAP, SRP, USDA, irrigation districts, or any supplier do not imply endorsement, sponsorship, partnership, or approval.",
};

export const TAGLINE = "Leave the drought to nature, not your bank account.";
export const PURPOSE = "Arizona’s market board for what Chicago doesn’t trade.";
export const SECONDARY = "The farmer’s decision destination for the best path to profitability. Most of what Arizona grows is not discovered on the CME.";

export const GOES = {
  psw1200: "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/GEOCOLOR/1200x1200.jpg",
  pswFull: "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/GEOCOLOR/latest.jpg",
  sp19_1200: "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/sp/GEOCOLOR/1200x1200.jpg",
  note: "Public NESDIS rolling latest. Confirmed reachable Nov 10, 2026, Arizona time: GOES-18 Pacific Southwest 1200x1200 and latest.jpg; GOES-19 Southwest 1200x1200. The GOES-18 sector path “sp” returned 404. Regional picture, not a field-level forecast.",
};

export const AZMET_SNAPSHOT = {
  station: "AZMET Yuma Valley (az02)",
  date: "Nov 9, 2026",
  maxF: 86.7,
  minF: 58.3,
  rainIn: 0.0,
  soil4F: 70.7,
  soil20F: 72.1,
  lastRain: "November 1, 2026, 0.92 inches",
  amsHeader: "Yuma, AZ Clear 61–87°F (USDA AMS IX_FV120 header, Nov 9, 2026)",
  source: "University of Arizona AZMET, Yuma Valley station az02 daily data through Nov 9, 2026. Snapshot, not a live station feed.",
};

export const MAILER = {
  code: "AGW-SAG-2026",
  payload: "https://jplange66.github.io/agcompass/setup.html?src=AGW-SAG-2026",
  status: "Concept only — this site is not counting clicks. No password or payment is collected. Public board: https://jplange66.github.io/agcompass/",
};

export const DIESEL = {
  eiaWestCoastLessCA: 6.429,
  eiaUS: 6.127,
  eiaWestCoast: 7.11,
  weekOf: "Nov 9, 2026",
  released: "Nov 10, 2026",
  series: "U.S. Energy Information Administration, Weekly Retail On-Highway Diesel Fuel Prices, West Coast less California (PADD 5 ex-CA). Prices include all taxes. EIA does not publish a weekly Arizona-only diesel series. This is taxed on-highway retail, not a tax-exempt farm bunker quote.",
  illinoisFarmDiesel: 5.71,
  illinoisNote: "USDA AMS Illinois Production Cost Report (AMS_3195), week ending Oct 30, 2026: Illinois farm diesel ask averaged $5.71/gal — a Midwest farm figure, not Arizona bunker.",
};

export const FERTILIZER = {
  region: "Illinois FOB distributor ask (USDA AMS_3195, not Arizona delivered)",
  weekEnding: "Oct 30, 2026",
  report: "https://www.ams.usda.gov/mnreports/ams_3195.pdf",
  products: {
    urea: { name: "Urea 46-0-0", avg: 770, unit: "ton" },
    dap: { name: "DAP", avg: 932.14, unit: "ton" },
    map: { name: "MAP", avg: 948, unit: "ton" },
    potash: { name: "Potash", avg: 517.73, unit: "ton" },
    uan32: { name: "UAN 32%", avg: 540, unit: "ton" },
  },
};

export const DISTRICTS = [
  {
    id: "ycwua",
    name: "Yuma Valley (YCWUA)",
    region: "Yuma Project, Priority 1",
    assessment: 142.5,
    includedAF: 5,
    extraAF: 0,
    costKind: "sourced",
    source: "ASFMRA Arizona, Bill Moody, Yuma County Market Trends, 2024 Outlook",
    note: "2024 O&M assessment includes the first 5 acre-feet and an IID fee. Extra-water rate was not in that table. Enter your current bill; 2025–26 charges may differ.",
  },
  {
    id: "ymidd",
    name: "Yuma Mesa Irrigation & Drainage District",
    region: "Gila Project, Priority 3",
    assessment: 99.5,
    includedAF: 9,
    extraAF: 0,
    costKind: "sourced",
    source: "ASFMRA Arizona, Bill Moody, Yuma County Market Trends, 2024 Outlook",
    note: "2024 O&M assessment includes the first 9 acre-feet. Extra-water rate was not in that table. Enter your current bill.",
  },
  {
    id: "wmidd",
    name: "Wellton-Mohawk Irrigation & Drainage District",
    region: "Gila Project, Priority 3",
    assessment: 172,
    includedAF: 4,
    extraAF: 0,
    costKind: "sourced",
    source: "ASFMRA Arizona, Bill Moody, 2024 Outlook; WMIDD irrigation page",
    note: "2024 O&M includes the first 4 acre-feet. WMIDD charges an increasing rate above 4 AF; the dollar schedule was not retrieved. Enter extra $/AF from your bill. District consumptive-use entitlement is 278,000 AF, not a per-farm figure.",
  },
  {
    id: "unitb",
    name: "Unit B Irrigation & Drainage District",
    region: "Yuma Project",
    assessment: 178.68,
    includedAF: 10,
    extraAF: 0,
    costKind: "sourced",
    source: "ASFMRA Arizona, Bill Moody, Yuma County Market Trends, 2024 Outlook",
    note: "2024 O&M assessment includes the first 10 acre-feet. Extra-water rate was not in that table.",
  },
  {
    id: "ngila",
    name: "North Gila Valley Irrigation District",
    region: "Gila Project (portion Priority 1)",
    assessment: 100,
    includedAF: 5,
    extraAF: 0,
    costKind: "sourced",
    source: "ASFMRA Arizona, Bill Moody, Yuma County Market Trends, 2024 Outlook",
    note: "2024 O&M assessment includes the first 5 acre-feet. Extra-water rate was not in that table.",
  },
  {
    id: "sgila",
    name: "South Gila Valley (Yuma Irrigation District)",
    region: "Gila Project, Priority 3",
    assessment: 101,
    includedAF: 5,
    extraAF: 0,
    costKind: "sourced",
    source: "ASFMRA Arizona, Bill Moody, Yuma County Market Trends, 2024 Outlook",
    note: "2024 O&M assessment includes the first 5 acre-feet and an IID fee. Extra-water rate was not in that table.",
  },
  {
    id: "capag",
    name: "CAP Agricultural Settlement Pool (when available)",
    region: "Central Arizona Project",
    assessment: 0,
    includedAF: 0,
    extraAF: 85,
    costKind: "sourced",
    source: "CAP Final 2026–2030 Water Rate Schedule, board approved June 5, 2025",
    note: "When Settlement Pool water is available, agricultural users pay only the 2026 pumping energy rate of $85/AF, not the $309/AF full water delivery rate. Availability may be zero. Enter your scheduled volume as the allocation.",
  },
  {
    id: "custom",
    name: "Other / enter my district bill",
    region: "Arizona — custom",
    assessment: 0,
    includedAF: 0,
    extraAF: 0,
    costKind: "assumption",
    source: "Farmer-entered",
    note: "Published 2025–26 assessments were not independently retrieved for SRP, MSIDD, Hohokam, CAIDD, and several other central Arizona districts. Enter the figures from your current district bill.",
  },
];

export const CROPS = [
  {
    id: "iceberg",
    name: "Iceberg lettuce",
    group: "produce",
    season: "Yuma winter vegetable window",
    unit: "cartons/acre (24s)",
    yield: 800,
    price: 29.25,
    af: 2,
    other: 8000,
    defaultAcres: 200,
    yieldKind: "assumption",
    priceKind: "sourced",
    waterKind: "assumption",
    yieldNote: "Planning assumption — not a sourced 2026 Yuma packout. Enter your cartons/acre.",
    priceNote: "USDA AMS Phoenix Shipping Point Vegetables (IX_FV120), Nov 10, 2026, Western Arizona, film-wrapped 24s, mostly $27.75–$30.75. Midpoint $29.25 is a starting FOB, not a net grower return. Film-lined 24s mostly $26.75–$29.75. No AMS reports Nov 11 (Veterans Day).",
    waterNote: "Planning assumption for applied irrigation. Erie et al. lettuce consumptive use is about 9 acre-inches; applied desert irrigation is higher. Enter your applied AF.",
    otherNote: "Planning assumption for non-water operating cost. No 2024–26 Yuma lettuce enterprise budget was retrieved. FOB carton prices overstate net return if packing and selling costs are missing.",
    importNote: "USDA ERS VGS-378 (April 2026): U.S. lettuce production accounted for 93% of domestic availability in 2025. Import share of availability was about 5% for iceberg. Of imported lettuce, 81% came from Mexico and 12% from Canada.",
  },
  {
    id: "romaine",
    name: "Romaine lettuce",
    group: "produce",
    season: "Yuma winter vegetable window",
    unit: "cartons/acre (24s)",
    yield: 800,
    price: 26.25,
    af: 2,
    other: 8000,
    defaultAcres: 0,
    yieldKind: "assumption",
    priceKind: "sourced",
    waterKind: "assumption",
    yieldNote: "Planning assumption — not a sourced 2026 Yuma packout.",
    priceNote: "USDA AMS IX_FV120, Nov 10, 2026, Western Arizona romaine 24s, mostly $24.75–$27.75. Midpoint $26.25 starting FOB. Hearts 12 3-count mostly $27.50–$30.75; green/red leaf 24s mostly $25.50–$28.75. Hearts and leaf are not this default.",
    waterNote: "Planning assumption for applied irrigation. Enter your applied AF.",
    otherNote: "Planning assumption. No 2024–26 Yuma romaine budget was retrieved.",
    importNote: "USDA ERS VGS-378: import share of availability was about 8% for romaine/leaf in 2025.",
  },
  {
    id: "carrots",
    name: "Carrots",
    group: "produce",
    season: "Yuma cool-season",
    unit: "sacks/acre",
    yield: 600,
    price: 0,
    af: 2.5,
    other: 6000,
    defaultAcres: 120,
    yieldKind: "assumption",
    priceKind: "assumption",
    waterKind: "assumption",
    yieldNote: "Planning assumption — not a sourced Yuma packout.",
    priceNote: "No Western Arizona carrot FOB was on the Nov 10, 2026 IX_FV120 report. Revenue stays at $0 until you enter a contract or shed price. California quotes on that report were not used as Arizona farm FOB.",
    waterNote: "Planning assumption for applied irrigation. Enter your applied AF.",
    otherNote: "Planning assumption. No 2024–26 Yuma carrot budget was retrieved.",
    importNote: "No Arizona-specific carrot import-share figure was sourced.",
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    group: "produce",
    season: "Shoulder / selected Yuma plantings",
    unit: "cartons/acre",
    yield: 1200,
    price: 0,
    af: 3,
    other: 9000,
    defaultAcres: 80,
    yieldKind: "assumption",
    priceKind: "assumption",
    waterKind: "assumption",
    yieldNote: "Planning assumption — not a sourced Yuma packout.",
    priceNote: "No Western Arizona tomato FOB was on the Nov 10, 2026 IX_FV120 report. Enter your contract or shed price, or tomato revenue stays at $0. Otay Mesa and Texas tomato quotes on that report were not used as Arizona farm FOB. USDA ERS VGS-378 (April 2026): imports were 68.9% of U.S. fresh tomato availability in 2025; Mexico supplied 90% of U.S. tomato imports in 2023–25.",
    waterNote: "Planning assumption for applied irrigation. Enter your applied AF.",
    otherNote: "Planning assumption. No 2024–26 Yuma tomato budget was retrieved.",
    importNote: "Arizona is both a winter growing area and the Nogales gateway. That is not the same as “80% of Arizona produce comes from Mexico,” which was not verified.",
  },
  {
    id: "alfalfa",
    name: "Alfalfa hay",
    group: "field",
    season: "Year-round desert cuttings",
    unit: "tons/acre",
    yield: 8,
    price: 135,
    nassPrice: 210,
    jimPrice: 135,
    af: 6.8,
    other: 995.85,
    defaultAcres: 0,
    yieldKind: "jim-example",
    priceKind: "jim-example",
    waterKind: "sourced",
    yieldNote: "Jim’s example: about 1 ton/acre per cutting × 8 cuttings. Matches the 8.00 ton default in the UA Cooperative Extension La Paz County 2024 alfalfa hay production budget.",
    priceNote: "Jim’s example, $135/ton, is the editable default — not a current market quote. USDA NASS Agricultural Prices (October 2026): Arizona alfalfa hay, prices received, September 2026, $210/ton (also $210 in August 2026; $180 in September 2025). The La Paz 2024 budget used $240.20/ton.",
    waterNote: "Default 6.8 AF is the mean applied irrigation reported by Arizona dairy-forage producers surveyed in summer 2023 (Ottman/Silvertooth). The La Paz 2024 alfalfa production budget used 5.00 AF. Enter your applied water.",
    otherNote: "UA La Paz 2024 alfalfa hay production budget, total annual costs $1,270.85/acre minus that budget’s $55 × 5.00 AF water line ($275), leaving $995.85 non-water costs (includes $170 cash rent). Water is recalculated from the district picker, not the budget’s $55/AF.",
    importNote: "Domestic forage, not a Mexico-import grocery item.",
  },
  {
    id: "cotton",
    name: "Upland cotton (lint + seed)",
    group: "field",
    season: "Summer field crop",
    unit: "lb lint/acre",
    yield: 1500,
    price: 1.05,
    af: 5,
    other: 1438.29,
    defaultAcres: 0,
    yieldKind: "sourced",
    priceKind: "sourced",
    waterKind: "sourced",
    yieldNote: "UA Cooperative Extension, La Paz County 2024 upland cotton budget: 1,500 lb lint and 2,250 lb seed per acre.",
    priceNote: "Budget lint $0.90/lb plus seed $0.10/lb × 2,250/1,500 = $0.15 lint-equivalent, or $1.05 per pound of lint for combined lint+seed revenue ($1,575/acre). Enter your current quotes.",
    waterNote: "UA La Paz County 2024 upland cotton budget: 5.00 AF flood irrigation.",
    otherNote: "UA La Paz 2024 cotton budget total annual costs $1,713.29 minus $55 × 5.00 AF ($275) = $1,438.29 non-water costs, including $170 cash rent. The same budget was a $138.29/acre loss after total annual costs at those 2024 prices — a budget result, not a forecast of your farm.",
    importNote: "Fiber market, not a grocery-produce import story.",
  },
  {
    id: "corn",
    name: "Feed corn (silage)",
    group: "field",
    season: "Summer forage for dairies",
    unit: "tons/acre",
    yield: 30.32,
    price: 0,
    af: 4.9,
    other: 0,
    defaultAcres: 0,
    yieldKind: "sourced",
    priceKind: "assumption",
    waterKind: "sourced",
    yieldNote: "Mean silage yield 30.32 tons/acre from Arizona dairy-forage producer survey, summer 2023 (Ottman/Silvertooth).",
    priceNote: "No Arizona silage price was retrieved from NASS this build (state field-crop prices are often withheld). Enter your dairy or feedlot contract price.",
    waterNote: "Mean applied irrigation 4.9 AF from the same 2023 dairy-forage survey.",
    otherNote: "No current Arizona silage-corn enterprise budget was retrieved. Enter your non-water operating cost per acre.",
    importNote: "Dairy forage, not a Mexico grocery-import item.",
  },
  {
    id: "sorghum",
    name: "Grain sorghum",
    group: "field",
    season: "Summer grain",
    unit: "bushels/acre",
    yield: 100,
    price: 5.6,
    af: 2.5,
    other: 772.13,
    defaultAcres: 0,
    yieldKind: "sourced",
    priceKind: "sourced",
    waterKind: "sourced",
    yieldNote: "UA Cooperative Extension, La Paz County 2024 grain sorghum budget: 100 bushels/acre.",
    priceNote: "Same budget: $5.60/bushel. USDA NASS U.S. sorghum grain, September 2026, was $8.09/cwt in the October 2026 Agricultural Prices report — not an Arizona-specific quote.",
    waterNote: "UA La Paz 2024 grain sorghum budget: 2.50 AF. A 2023 dairy-forage survey mean of 3.8 AF applies to forage sorghum, not this grain budget.",
    otherNote: "UA La Paz 2024 grain sorghum total annual costs $909.63 minus $55 × 2.50 AF ($137.50) = $772.13 non-water costs, including $170 cash rent. The same budget was a $349.63/acre loss after total annual costs — a budget result, not a forecast of your farm.",
    importNote: "Forage/grain crop, not a Mexico grocery-import item.",
  },
];

export const DEMO_FARM = {
  name: "UA review demo — Yuma lettuce / carrot / tomato",
  kind: "assumption",
  note: "Sample plan for the University of Arizona-affiliated review. It is not a real named farm and is not a university endorsement. Defaults: 400 farm acres in Yuma Valley (YCWUA), 200 acres iceberg, 120 acres carrots, 80 acres tomatoes. Tomato price starts at $0 until you enter a contract or shed price.",
  districtId: "ycwua",
  farmAcres: 400,
};

export const INPUTS = [
  { id: "diesel", name: "Diesel", unit: "gal", price: 6.429, qty: 0, sponsor: "Cholla / fuel sponsor slot", supplier: "" },
  { id: "fertilizer", name: "Fertilizer (urea 46-0-0 starting feed)", unit: "ton", price: 770, qty: 0, sponsor: "Prickly Pear / input sponsor slot", supplier: "Wilbur-Ellis (example slot — not a sponsor or endorsement)" },
  { id: "seed", name: "Seed", unit: "your units", price: 0, qty: 0, sponsor: "Cholla / seed sponsor slot", supplier: "" },
  { id: "pesticides", name: "Pesticides", unit: "your units", price: 0, qty: 0, sponsor: "Cholla / crop-protection slot", supplier: "" },
  { id: "herbicides", name: "Herbicides", unit: "your units", price: 0, qty: 0, sponsor: "Cholla / crop-protection slot", supplier: "" },
  { id: "maintenance", name: "Maintenance", unit: "your units", price: 0, qty: 0, sponsor: "Cholla / equipment slot", supplier: "" },
];

export const CONTEXT_STATS = [
  { value: "16,710", label: "Arizona farms, 2022 Census", source: "University of Arizona Cooperative Extension county agricultural profiles, citing the 2022 Census of Agriculture." },
  { value: "1,221,799", label: "Acres of cropland", source: "Same UA Cooperative Extension county profiles." },
  { value: "99%", label: "Harvested cropland irrigated", source: "Same UA Cooperative Extension county profiles." },
  { value: "75%", label: "Of state water use, irrigated agriculture", source: "Same UA Cooperative Extension county profiles. Agricultural demand in Active Management Areas fell from more than 2.2 million AF in 1985 to 1.8 million AF in 2021." },
  { value: "512,000 AF", label: "Arizona 2025 Tier 1 Colorado River reduction", source: "Central Arizona Project, Colorado River operations: 512,000 acre-foot reduction, described as 30% of CAP’s normal supply." },
];

export const IMPORT_REALITY = {
  jimClaim:
    "Jim’s working statement was that 80% or more of Arizona’s produce comes from Mexico. That exact claim was not found in a public source this build, and it should not be repeated as a fact.",
  sourced: [
    "USDA ERS, Vegetables and Pulses Outlook, April 2026 (VGS-378): imports accounted for 35% of U.S. fresh vegetable availability in 2025.",
    "The same outlook: Mexico supplied 77% of U.S. fresh vegetable imports in 2023–25; Canada supplied about 13%.",
    "Import share of U.S. availability in 2025: asparagus about 100%, cucumbers 91%, tomatoes 69%, broccoli 34%, romaine/leaf lettuce 8%, iceberg lettuce 5%.",
    "U.S. lettuce production accounted for 93% of domestic lettuce availability in 2025. Of lettuce imports, 81% came from Mexico.",
    "City of Nogales and trade reporting describe Nogales as a leading U.S. gateway for Mexican fresh produce (often cited around 37% of Mexican produce entering the United States). That is port throughput for the U.S. market, not the share of produce sold in Arizona grocery stores, and not the share of Arizona-grown production.",
    "USDA AMS Agricultural Refrigerated Truck Quarterly, Q4 2025: Mexico was 36% of reported U.S. fresh fruit and vegetable truck shipments; Arizona itself 5% (394,000 tons). Q1 2025: Mexico 41%, Arizona 15% (1.28 million tons) in the winter window.",
    "Yuma Fresh Vegetable Association (cited in the Ag Compass white paper): from October to April the Yuma/Gila area grows 90% of U.S. and Canada leafy greens — a winter production claim, not a year-round grocery-import share.",
  ],
};

export const SPONSOR_TIERS = [
  {
    id: "saguaro",
    name: "Saguaro",
    level: "Highest / founding",
    year1: 25000,
    note: "Jim liked a roughly $25,000 Year 1 founding package. AgWest Farm Credit has been pitched as a Saguaro Founding Sponsor — pitched, not signed. The $15,000–$50,000 comfort range around that number is Hunter’s judgment, not AgWest data. Concept: report branding, client mailer with tracking code AGW-SAG-2026, quarterly usage results.",
  },
  {
    id: "prickly",
    name: "Prickly Pear",
    level: "Middle / category",
    year1: 8000,
    note: "Assumption for input, energy, or regional lender/supplier packages. Year 1 model uses 2 packages ($16,000). Not a sold package.",
  },
  {
    id: "cholla",
    name: "Cholla",
    level: "Entry / input-line slot",
    year1: 3000,
    note: "Assumption for dealer, seed, chem, shop, and bunker slots on input lines. Year 1 model uses 4 slots ($12,000). Not a sold package.",
  },
];

export const FORECAST = {
  kind: "assumption",
  note: "Illustrative rebuild so sponsors and ads lead and farmer subscriptions stay low. Not a signed contract, not AgWest underwriting, and not a guarantee. The Institutional Financing PDF put subscriptions first (Year 1 $71,925 of $106,925).",
  subscriptionPrice: 99,
  subscriptionNote: "Assumption: free basic tier; paid $99/year for saved plans and bank reports. 40 / 200 / 500 paid farms. Not a posted price.",
  years: [
    { year: "Year 1", subsAccounts: 40, subs: 3960, sponsors: 53000, ads: 20000 },
    { year: "Year 2", subsAccounts: 200, subs: 19800, sponsors: 81000, ads: 60000 },
    { year: "Year 3", subsAccounts: 500, subs: 49500, sponsors: 134000, ads: 165000 },
  ],
  oldDoc: {
    y1: { subs: 71925, ads: 20000, primary: 15000, total: 106925 },
    y2: { subs: 178790, ads: 60000, primary: 55000, total: 293790 },
    y3: { subs: 425545, ads: 165000, primary: 100000, total: 690545 },
    threeYear: 1091260,
    source: "Ag Compass Institutional Financing PDF, three-year forecast (management estimates, not guaranteed).",
  },
};

export const SOURCES = [
  { title: "EIA Weekly On-Highway Diesel Fuel Prices", detail: "Week of Nov 9, 2026, released Nov 10, 2026. West Coast less California $6.429/gal. https://www.eia.gov/petroleum/gasdiesel/" },
  { title: "USDA AMS Illinois Production Cost Report (AMS_3195)", detail: "Week ending Oct 30, 2026. Urea $770, DAP $932.14, MAP $948, potash $517.73, UAN 32% $540 per short ton FOB Illinois. Farm diesel ask $5.71/gal. https://www.ams.usda.gov/mnreports/ams_3195.pdf" },
  { title: "USDA AMS Phoenix Shipping Point Vegetables IX_FV120", detail: "Nov 10, 2026 (no reports Nov 11, Veterans Day). Western Arizona iceberg film-wrapped 24s mostly $27.75–$30.75; romaine 24s mostly $24.75–$27.75; hearts 12 3-count mostly $27.50–$30.75; green/red leaf 24s mostly $25.50–$28.75; broccoli crown-cut 20-lb mostly $18.25–$20.50. No Western Arizona tomato or carrot FOB. https://www.ams.usda.gov/mnreports/ix_fv120.pdf" },
  { title: "USDA AMS Federal Milk Order Class Prices (CLS-1026)", detail: "November 4, 2026. October 2026 final Class III $15.16/cwt (−$0.88), Class IV $20.54/cwt (+$1.60). https://www.ams.usda.gov/mnreports/dymclassprices.pdf" },
  { title: "USDA AMS Advanced Dairy Prices (ADV-1126)", detail: "October 21, 2026. November 2026 Base Class I $20.27/cwt. https://www.ams.usda.gov/mnreports/dymadvancedprices.pdf" },
  { title: "USDA AMS Dairy Market News Vol. 93 Report 45", detail: "Week of Nov 2–6, 2026, MMN slug 2998. Arizona Order 131 (Phoenix) October Class I $21.48, November Class I $22.87; Class I differential $2.60. https://www.ams.usda.gov/mnreports/dywweeklyreport.pdf" },
  { title: "USDA AMS Southwest Direct Cattle (AMS_2940)", detail: "Week ending Oct 30, 2026. AZ/CA/NV ML 1-2 steers FOB: 750 lb $342.66, 800 lb $325.48, 850 lb $321.20 per cwt. Regional direct, not a single Arizona auction." },
  { title: "USDA AMS Fresh Fruit and Vegetable Shipments (FVDDAILY_MOV)", detail: "Nov 10, 2026. Selected Mexico-origin lines only, 40,000-lb units: Nogales white seedless grapes 3,006 season-to-date (week 0); flame seedless 1,314; Sweet Celebration 453; Sugraone 386; Prime 323. San Luis dates-organic 120 season-to-date / 9 units that week. Not a complete port total." },
  { title: "USDA NASS Agricultural Prices, October 2026 (agpr1026, released Oct 30, 2026)", detail: "Arizona alfalfa hay, prices received, September 2026, $210/ton (same as August; $180 September 2025); other hay $175. Arizona all-milk September 2026 $19.00/cwt, fat 4.03% (August $19.60; September 2025 $19.70). Arizona milk cows October 2026 $3,200/head. U.S. upland cotton September 2026 $0.733/lb (reference). U.S. all wheat September 2026 $6.30/bu (reference). Arizona wheat state table withheld (S)/(D). No Arizona hay auction report was retrieved for this build. https://esmis.nal.usda.gov/sites/default/release-files/796128/agpr1026.pdf" },
  { title: "USDA ERS Vegetables and Pulses Outlook, April 2026 (VGS-378)", detail: "Imports 35% of U.S. fresh vegetable availability in 2025; Mexico 77% of those imports. https://www.ers.usda.gov/media/20874/vgs-378.pdf" },
  { title: "CAP Final 2026–2030 Water Rate Schedule", detail: "Board approved June 5, 2025. Energy $85/AF; full delivery $309/AF. https://library.cap-az.com/documents/departments/finance/Final-CAWCD-2026-2030-Water-Rate-Schedule.pdf" },
  { title: "ASFMRA Arizona, Bill Moody, Yuma County Market Trends, 2024 Outlook", detail: "2024 irrigation district O&M assessments and included allotments used as editable starting points." },
  { title: "UA Cooperative Extension, La Paz County 2024 field crop budgets (az2139)", detail: "June 2025. Alfalfa, upland cotton, and grain sorghum yields, costs, and applied water. https://extension.arizona.edu/sites/default/files/2025-07/az2139_Arizona-Agricultural-Enterprise-Budgets-La-Paz-County-2024-Field-Crop-Production-Budgets.pdf" },
  { title: "Ottman / Silvertooth forage water assessment", detail: "2023 dairy-forage survey means: alfalfa 6.8 AF, corn silage 4.9 AF, silage yield 30.32 tons/acre." },
  { title: "University of Arizona AZMET, Yuma Valley (az02)", detail: "Daily weather, soil, and rain through Nov 9, 2026 (snapshot). https://azmet.arizona.edu/past-data/station-level-summaries/az02/daily" },
  { title: "NOAA NESDIS GOES-18 Pacific Southwest GeoColor", detail: "Embedded public image. https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/GEOCOLOR/1200x1200.jpg — full latest.jpg also confirmed. GOES-19 Southwest 1200x1200 also resolves." },
  { title: "UA Cooperative Extension county agricultural profiles", detail: "16,710 Arizona farms, 1,221,799 cropland acres, 99% irrigated, about 75% of state water use." },
  { title: "Wellton-Mohawk Irrigation & Drainage District", detail: "https://www.wmidd.org/irrigation.html" },
  { title: "Farm Credit, Arizona at a glance (Dec. 31, 2024)", detail: "Cited in the Institutional Financing PDF: 1,127 Arizona customers, $3.4 billion loan volume, $25.6 million patronage. Not an endorsement." },
  { title: "Ag Compass source PDFs", detail: "Executive summary, white paper, final draft, go-to-market, and institutional financing in /workspace/agcompass/." },
];


export const DAIRY = {
  classIII: { value: 15.16, unit: "$/cwt", month: "October 2026 final", change: -0.88, source: "AMS CLS-1026, Nov 4, 2026, dymclassprices.pdf" },
  classIV: { value: 20.54, unit: "$/cwt", month: "October 2026 final", change: 1.60, source: "AMS CLS-1026, Nov 4, 2026" },
  classIIISpark: [14.59, 14.94, 16.16, 16.82, 16.92, 15.98, 15.52, 16.64, 16.04, 15.16],
  classIVSpark: [13.55, 16.29, 18.94, 20.22, 22.32, 20.96, 18.34, 17.36, 18.94, 20.54],
  sparkLabel: "January–October 2026 monthly finals",
  baseClassI: { value: 20.27, month: "November 2026", source: "AMS ADV-1126, Oct 21, 2026, dymadvancedprices.pdf" },
  advIIISkim: 10.38,
  advIVSkim: 16.03,
  azOrder131: {
    octClassI: 21.48,
    novClassI: 22.87,
    differential: 2.60,
    source: "AMS Dairy Market News Vol. 93 Report 45, week of Nov 2–6, 2026, MMN slug 2998, dywweeklyreport.pdf",
  },
  azAllMilk: { value: 19.00, month: "September 2026", fat: 4.03, aug: 19.60, yearAgo: 19.70, source: "NASS agpr1026, released Oct 30, 2026" },
  azCows: { value: 3200, asOf: "October 2026", source: "NASS agpr1026" },
  note: "November Class III and IV finals have not been announced (typically early December). Last-known announced prices, not a live CME cash ticker. Canvas cannot fetch; this site embeds the same dated values.",
};

export const CATTLE = {
  report: "AMS_2940 Southwest Direct Cattle (AZ/CA/NV), week ending Oct 30, 2026",
  steers: [
    { wt: 750, price: 342.66 },
    { wt: 800, price: 325.48 },
    { wt: 850, price: 321.20 },
  ],
  note: "ML 1-2 steers, FOB, $/cwt. Regional direct trade, not a single Arizona auction sale. A dedicated Arizona auction report was not retrieved for this build.",
};

export const REFERENCE = {
  note: "Cotton and wheat appear only as reference points. They trade on CME; they are not the board’s local-discovery focus.",
  cotton: { value: 0.733, unit: "$/lb", month: "September 2026 U.S. upland", source: "NASS agpr1026. Columns: 2011 base $0.880, Sept 2025 $0.608, Aug 2026 $0.667, Sept 2026 $0.733. No Arizona monthly cotton price was in the state table used here." },
  wheat: { value: 6.30, unit: "$/bu", month: "September 2026 U.S. all wheat", source: "NASS agpr1026 narrative. Arizona wheat state table withheld (S)/(D)." },
};

export const PRODUCE_CARDS = [
  { name: "Iceberg lettuce", value: "$29.25", range: "Mostly $27.75–$30.75, film-wrapped 24s", source: "AMS IX_FV120, Nov 10, 2026, Western Arizona shipping point. Midpoint used in the planner." },
  { name: "Romaine 24s", value: "$26.25", range: "Mostly $24.75–$27.75", source: "AMS IX_FV120, Nov 10, 2026, Western Arizona." },
  { name: "Romaine hearts", value: "$27.50–$30.75", range: "12 3-count, mostly", source: "AMS IX_FV120, Nov 10, 2026, Western Arizona." },
  { name: "Green / red leaf 24s", value: "$25.50–$28.75", range: "Mostly", source: "AMS IX_FV120, Nov 10, 2026, Western Arizona." },
  { name: "Broccoli crown-cut", value: "$18.25–$20.50", range: "20-lb cartons, mostly", source: "AMS IX_FV120, Nov 10, 2026, Western Arizona." },
  { name: "Tomatoes", value: "Enter price", range: "No Western Arizona FOB on this report", source: "AMS IX_FV120, Nov 10, 2026. Otay Mesa / Texas quotes were not used as Arizona farm FOB." },
  { name: "Carrots", value: "Enter price", range: "No Western Arizona FOB on this report", source: "AMS IX_FV120, Nov 10, 2026. California quotes were not used as Arizona farm FOB." },
  { name: "Melons, citrus, dates, pecans", value: "Not on this report", range: "No Arizona shipping-point quote retrieved", source: "IX_FV120 is a vegetable report. Those commodities need their own AMS shipping-point or terminal series." },
  { name: "Alfalfa hay", value: "$210/ton", range: "Arizona prices received, Sept 2026", source: "NASS agpr1026, released Oct 30, 2026. Same as August; $180 Sept 2025. Other hay $175. No hay auction or direct AMS report was retrieved; this is prices received, not an auction sale." },
];

export const BORDER_LINES = [
  { port: "Nogales", crop: "Grapes — white seedless type", std: 3006, week: 0, unit: "40,000-lb units" },
  { port: "Nogales", crop: "Grapes — flame seedless", std: 1314, week: 0, unit: "40,000-lb units" },
  { port: "Nogales", crop: "Grapes — Sweet Celebration", std: 453, week: 0, unit: "40,000-lb units" },
  { port: "Nogales", crop: "Grapes — Sugraone", std: 386, week: 0, unit: "40,000-lb units" },
  { port: "Nogales", crop: "Grapes — Prime", std: 323, week: 0, unit: "40,000-lb units" },
  { port: "San Luis", crop: "Dates — organic", std: 120, week: 9, unit: "40,000-lb units" },
];
export const BORDER_NOTE = "USDA AMS FVDDAILY_MOV, Nov 10, 2026. Mexico-origin lines only, matched to the commodity heading immediately above each Nogales or San Luis row. Season-to-date and Nov 3–9 week (Nov 7–8 blank as weekend). This is a selected, verified extract — not a complete port total and not a crop-family rollup.";

export const ZONES = [
  { id: "az", name: "Statewide", path: "M 92 12 L 168 20 L 200 118 L 188 210 L 40 218 L 18 150 L 28 92 L 60 40 Z", blurb: "Statewide board. Yuma is one zone among many. County outlines are public-domain U.S. Census TIGER cartographic boundaries (FIPS 04xxx, via us-atlas). This map is a geographic zone selector, not a 2022 Census sales ranking — NASS county-profile PDFs were not retrieved as PDFs this build. Gila is grouped with Pinal; Greenlee with Graham / Safford." },
  { id: "yuma", name: "Yuma", path: "M 18 150 L 70 150 L 70 218 L 40 218 Z", blurb: "Yuma winter vegetables, desert hay, and the San Luis crossing. Review demo mix: iceberg, carrots, tomatoes (tomato and carrot prices start at $0 until you enter a shed or contract price).", districtId: "ycwua", farmAcres: 400, crops: { iceberg: 200, carrots: 120, tomatoes: 80 } },
  { id: "lapaz", name: "La Paz / Parker", path: "M 28 92 L 80 92 L 80 150 L 18 150 Z", blurb: "La Paz / Parker river-valley hay and field crops. UA La Paz 2024 budgets inform alfalfa, cotton, and sorghum cost defaults." },
  { id: "maricopa", name: "Maricopa / Central AZ", path: "M 80 92 L 140 92 L 140 150 L 80 150 Z", blurb: "Central Arizona dairy, hay, vegetables, and cotton country around Phoenix and the AMAs." },
  { id: "pinal", name: "Pinal", path: "M 90 150 L 150 150 L 150 188 L 90 188 Z", blurb: "Pinal field crops, hay, and dairy, between the Phoenix AMA and Tucson." },
  { id: "cochise", name: "Cochise / Willcox", path: "M 150 150 L 200 118 L 188 210 L 150 210 Z", blurb: "Cochise / Willcox — pecans, chiles, wine grapes, and high-desert vegetables." },
  { id: "graham", name: "Graham / Safford", path: "M 150 118 L 188 118 L 188 150 L 150 150 Z", blurb: "Graham / Safford — Gila Valley cotton, hay, and pecans." },
  { id: "nogales", name: "Santa Cruz / Nogales", path: "M 110 188 L 150 188 L 150 218 L 110 218 Z", blurb: "Nogales gateway. Border-crossing volumes below are selected AMS movement lines, not a complete port total." },
  { id: "pima", name: "Pima / Tucson", path: "", blurb: "Pima County around Tucson, shown on the county map so southern Arizona is complete. A Pima-specific shipping-point quote was not on IX_FV120, Nov 10; statewide hay, milk, and Western Arizona produce tickers still apply. Enter your district bill and local quotes. No default crop mix is loaded." },
  { id: "mohave", name: "Mohave", path: "M 28 40 L 80 40 L 80 92 L 28 92 Z", blurb: "Mohave — river agriculture and high-desert range." },
  { id: "north", name: "Northern AZ", path: "M 80 12 L 168 20 L 168 80 L 80 80 Z", blurb: "Northern Arizona plateau and high country (Coconino, Yavapai, Navajo, and Apache counties on the map). Smaller irrigated acreage; included so the board is statewide." },
];
