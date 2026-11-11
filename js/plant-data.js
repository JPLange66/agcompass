/* Sourced per-crop defaults for the "What should I plant?" tool.
   Every price, yield, water, and cost figure is dated. Assumptions and
   unit conversions are flagged in tooltips and the sources drawer only. */

export const PLANT_AS_OF = "November 11, 2026, Arizona time";

export const PLANT_ZONES = [
  { id: "yuma", name: "Yuma" },
  { id: "lapaz", name: "La Paz / Parker" },
  { id: "maricopa", name: "Maricopa" },
  { id: "pinal", name: "Pinal" },
  { id: "cochise", name: "Cochise / Willcox" },
  { id: "graham", name: "Graham / Safford" },
  { id: "nogales", name: "Santa Cruz / Nogales" },
  { id: "pima", name: "Pima / Tucson" },
  { id: "mohave", name: "Mohave" },
  { id: "north", name: "Northern AZ" },
  { id: "az", name: "Statewide" }
];

export const DEMAND_META = {
  title: "Grocer demand",
  report: "USDA AMS National Retail Report — Fruits and Vegetables (FVWRETAIL)",
  issued: "Friday, November 6, 2026",
  adsFor: "October 31–November 12, 2026",
  region: "Southwest U.S. (Arizona, California, Nevada, Utah) — not Arizona-only. Arizona-grocer-specific ad counts were not in the report.",
  method: "Arrow direction uses national conventional advertised-feature counts this week versus last week in the same report. Up = +15% or more, down = −15% or more, otherwise flat. Southwest this-week ad counts and advertised prices are shown in the tooltip where a Southwest line exists. Import share is USDA ERS VGS-378, April 2026 (2025 availability). Season tag is the typical Yuma winter vegetable window (mid-November through mid-April), a seasonal guide, not a forecast.",
  url: "https://www.ams.usda.gov/mnreports/fvwretail.pdf"
};

const YCWUA_IRRIG = 142.5;
const YCWUA_IRRIG_SRC = "Yuma County Water Users’ Association 2024 O&M assessment $142.50/acre, includes the first 5 acre-feet (ASFMRA Arizona, Bill Moody, 2024 Outlook). The 2001 UA vegetable budgets recorded irrigation water as $0 in cash operating expenses, with a $31/acre water assessment in ownership costs.";

function vegOther(totalCash, seed, fert, diesel, labor, assessment = 31) {
  return Math.round((totalCash - seed - fert - diesel - labor + assessment) * 100) / 100;
}

/* Vegetable component costs, yields, and applied water: UA Cooperative Extension
   AZ1263, 2001–2002 Arizona Vegetable Crop Budgets, Western Arizona (Yuma and
   La Paz Counties), Teegerstrom, Palumbo (Yuma Agricultural Center), and
   Zerkoune. Yuma Valley North fall (lettuce, broccoli) and spring (melons)
   tables. Dollar costs are 2001 dollars and are not inflated. */
export const PLANT_CROPS = [
  {
    id: "iceberg",
    name: "Iceberg",
    unit: "cartons/acre",
    completeness: "partial",
    missing: ["cost-year"],
    price: 29.25, yield: 823, af: 3.42,
    seed: 95.4, fert: 170.14, diesel: 18.33, labor: 2137.98, irrig: YCWUA_IRRIG, other: 896.66,
    priceKind: "sourced", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced-2001",
    priceSrc: "AMS IX_FV120, Nov 10, 2026, Western Arizona film-wrapped 24s, mostly $27.75–$30.75. Midpoint $29.25 starting FOB, not a net grower return.",
    yieldSrc: "UA Cooperative Extension AZ1263, 2001–2002, Yuma Valley North fall iceberg: 823 cartons/acre (Table 7A). NASS Vegetables 2025 Summary reported Arizona 2025 head lettuce at 385 cwt/acre, a more recent statewide check, not used as this default.",
    waterSrc: "UA AZ1263, 2001–2002, Table 7D, Yuma Valley North fall iceberg: total water applied 41.0 inches = 3.42 acre-feet/acre.",
    seedSrc: "UA AZ1263 Table 7A, seed/transplants $95.40/acre (2001 dollars).",
    fertSrc: "UA AZ1263 Table 7A, fertilizer $170.14/acre (2001 dollars).",
    dieselSrc: "UA AZ1263 Table 7A, diesel fuel $18.33/acre (2001 dollars; Table 7D lists 20.7 gallons). EIA West Coast less California on-highway diesel was $6.429/gal in the week of Nov 9, 2026 — not applied as an inflation of this default.",
    laborSrc: "UA AZ1263 Table 7A, paid labor $90.78 plus custom harvest/post-harvest $2,047.20 = $2,137.98/acre (2001 dollars).",
    irrigSrc: YCWUA_IRRIG_SRC,
    otherSrc: "Residual of UA AZ1263 Table 7A total cash operating expenses $3,287.51 minus seed, fertilizer, diesel, and labor, plus the $31/acre water assessment from Table 7B (chemicals, repairs, interest, services, and ownership water). 2001 dollars.",
    demand: {
      dir: "down",
      tip: "National ads 241 vs 365 last week (−34%). Southwest (AZ, CA, NV, UT) had no iceberg feature ads this week. AMS FVWRETAIL, issued Nov 6, 2026. Not Arizona-only. Import share of U.S. availability ~5% (ERS VGS-378, Apr 2026)."
    }
  },
  {
    id: "romaine",
    name: "Romaine",
    unit: "cartons/acre",
    completeness: "partial",
    missing: ["cost-year", "pack"],
    price: 26.25, yield: 712, af: 4.29,
    seed: 636, fert: 98.67, diesel: 40.35, labor: 3339.22, irrig: YCWUA_IRRIG, other: 468.33,
    priceKind: "sourced", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced-2001",
    priceSrc: "AMS IX_FV120, Nov 10, 2026, Western Arizona romaine 24s, mostly $24.75–$27.75. Midpoint $26.25 starting FOB.",
    yieldSrc: "UA AZ1263, 2001–2002, Yuma Valley North romaine, Table 4A: 712 cartons/acre, priced in that budget as a 40-pound carton. Today’s FOB is romaine 24s; the farmer can edit the packout.",
    waterSrc: "UA AZ1263 Table 4D, Yuma Valley North romaine: total water applied 51.5 inches = 4.29 acre-feet/acre.",
    seedSrc: "UA AZ1263 Table 4A, seed/transplants $636.00/acre (2001 dollars).",
    fertSrc: "UA AZ1263 Table 4A, fertilizer $98.67/acre (2001 dollars).",
    dieselSrc: "UA AZ1263 Table 4A, diesel fuel $40.35/acre (2001 dollars; Table 4D lists 45.6 gallons).",
    laborSrc: "UA AZ1263 Table 4A, paid labor $189.22 plus custom harvest/post-harvest $3,150.00 = $3,339.22/acre (2001 dollars).",
    irrigSrc: YCWUA_IRRIG_SRC,
    otherSrc: "Residual of UA AZ1263 Table 4A total cash operating expenses $4,551.57 minus seed, fertilizer, diesel, and labor, plus the $31/acre water assessment. 2001 dollars.",
    demand: {
      dir: "down",
      tip: "National ads 613 vs 1,033 last week (−41%). Southwest: 191 ads at $4.99 (3-count). AMS FVWRETAIL, issued Nov 6, 2026. Southwest is AZ, CA, NV, UT — not Arizona-only. Import share ~8% for romaine/leaf (ERS VGS-378, Apr 2026)."
    }
  },
  {
    id: "leaf",
    name: "Leaf",
    unit: "cartons/acre",
    completeness: "partial",
    missing: ["cost-year", "pack", "demand"],
    price: 27.125, yield: 1162, af: 4.29,
    seed: 305.28, fert: 98.67, diesel: 41.98, labor: 6086.56, irrig: YCWUA_IRRIG, other: 647.63,
    priceKind: "sourced", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced-2001",
    priceSrc: "AMS IX_FV120, Nov 10, 2026, Western Arizona green/red leaf 24s, both mostly $25.50–$28.75. Midpoint $27.13 starting FOB.",
    yieldSrc: "UA AZ1263, 2001–2002, Yuma Valley North fall leaf lettuce, Table 6A: 1,162 cartons/acre, priced in that budget as a 25-pound carton. Today’s FOB is leaf 24s; the farmer can edit the packout.",
    waterSrc: "UA AZ1263 Table 6D, Yuma Valley North fall leaf: total water applied 51.5 inches = 4.29 acre-feet/acre.",
    seedSrc: "UA AZ1263 Table 6A, seed/transplants $305.28/acre (2001 dollars).",
    fertSrc: "UA AZ1263 Table 6A, fertilizer $98.67/acre (2001 dollars).",
    dieselSrc: "UA AZ1263 Table 6A, diesel fuel $41.98/acre (2001 dollars; Table 6D lists 47.4 gallons).",
    laborSrc: "UA AZ1263 Table 6A, paid labor $191.56 plus custom harvest/post-harvest $5,895.00 = $6,086.56/acre (2001 dollars).",
    irrigSrc: YCWUA_IRRIG_SRC,
    otherSrc: "Residual of UA AZ1263 Table 6A total cash operating expenses $7,149.12 minus seed, fertilizer, diesel, and labor, plus the $31/acre water assessment. 2001 dollars.",
    demand: {
      dir: null,
      tip: "No leaf-lettuce advertised-feature line in AMS FVWRETAIL, issued Nov 6, 2026. No arrow. Import share of U.S. availability ~8% for romaine/leaf (ERS VGS-378, Apr 2026)."
    }
  },
  {
    id: "broccoli",
    name: "Broccoli",
    unit: "20-lb cartons/acre",
    completeness: "partial",
    missing: ["cost-year", "pack-conversion"],
    price: 19.375, yield: 790.4, af: 2.83,
    seed: 412.13, fert: 144.66, diesel: 17.8, labor: 2771.64, irrig: YCWUA_IRRIG, other: 224.06,
    priceKind: "sourced", yieldKind: "sourced-converted", waterKind: "sourced", costKind: "sourced-2001",
    priceSrc: "AMS IX_FV120, Nov 10, 2026, Western Arizona crown-cut 20-lb cartons loose, mostly $18.25–$20.50. Midpoint $19.38 starting FOB.",
    yieldSrc: "UA AZ1263, 2001–2002, Yuma Valley North fall broccoli, Table 5A: 608 cartons/acre of 26-pound cartons, converted to 790.4 twenty-pound cartons (608 × 26 ÷ 20) to match the current FOB unit. NASS Vegetables 2025 Summary: Arizona 2024 broccoli yield 120 cwt/acre (2025 withheld) would be 600 twenty-pound cartons; not used as this default.",
    waterSrc: "UA AZ1263 Table 5D, Yuma Valley North fall broccoli: total water applied 34.0 inches = 2.83 acre-feet/acre.",
    seedSrc: "UA AZ1263 Table 5A, seed/transplants $412.13/acre (2001 dollars).",
    fertSrc: "UA AZ1263 Table 5A, fertilizer $144.66/acre (2001 dollars).",
    dieselSrc: "UA AZ1263 Table 5A, diesel $16.82 growing plus $0.98 harvest = $17.80/acre (2001 dollars; Table 5D lists 20.1 gallons).",
    laborSrc: "UA AZ1263 Table 5A, paid labor $117.45 growing plus $2.19 harvest plus custom harvest/post-harvest $2,652.00 = $2,771.64/acre (2001 dollars).",
    irrigSrc: YCWUA_IRRIG_SRC,
    otherSrc: "Residual of UA AZ1263 Table 5A total cash operating expenses $4,539.29 minus seed, fertilizer, diesel, and labor, plus the $31/acre water assessment. 2001 dollars.",
    demand: {
      dir: "up",
      tip: "National crown-cut ads 1,640 vs 1,155 last week (+42%). Southwest had no conventional broccoli feature ads this week. AMS FVWRETAIL, issued Nov 6, 2026. Import share of U.S. availability 34% (ERS VGS-378, Apr 2026)."
    }
  },
  {
    id: "alfalfa",
    name: "Alfalfa",
    unit: "tons/acre",
    completeness: "full",
    missing: [],
    price: 210, yield: 9, af: 4,
    seed: 0, fert: 0, diesel: 0, labor: 539.09, irrig: 183, other: 807.1,
    priceKind: "sourced", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced",
    priceSrc: "NASS Agricultural Prices agpr1026, released Oct 30, 2026: Arizona alfalfa hay, prices received, September 2026, $210/ton. Not an auction lot. The UA Yuma 2026 production budget used $200/ton and is not used as the current price.",
    yieldSrc: "UA Cooperative Extension az2178, January 2026, Yuma County alfalfa hay production budget: 9.00 tons/acre.",
    waterSrc: "UA az2178, January 2026, Yuma alfalfa hay production: 4.00 AF flood irrigation, from local grower interviews (irrigation chapter). A 2023 Ottman/Silvertooth dairy-forage survey mean of 6.8 AF is a statewide check, not this default.",
    seedSrc: "UA az2178 Yuma 2026 alfalfa hay production budget has no seed line in the production year (seed is in the establishment budget). Default $0.",
    fertSrc: "UA az2178 Yuma 2026 alfalfa hay production budget has no fertility-program line in the production year. Default $0. The farmer can enter a fertility bill.",
    dieselSrc: "UA az2178 does not itemize farm diesel on the alfalfa production table (machinery variable cash is $7.64 and includes fuel at the budget’s $4/gal assumption). Default $0.",
    laborSrc: "UA az2178 Yuma 2026 alfalfa hay production: irrigation labor $64.00, additional crop labor $66.00, PCA $13.20, custom harvest $360.00, custom hauling $35.89 = $539.09/acre.",
    irrigSrc: "UA az2178 Yuma 2026 alfalfa hay production irrigation line $183.00 (flood water $45 × 4.00 AF = $180 plus $3 annual repairs).",
    otherSrc: "Residual of UA az2178 Yuma 2026 alfalfa total annual costs $1,529.19 minus labor $539.09 and irrigation $183.00, covering establishment $351.71, chemicals $110, cash rent $250, interest, other expenses, and machinery. Equals $807.10.",
    demand: { dir: null, tip: "Not a grocery produce item. No advertised-feature series in AMS FVWRETAIL, Nov 6, 2026. No retail demand arrow." }
  },
  {
    id: "cotton",
    name: "Cotton",
    unit: "lb lint/acre",
    completeness: "partial",
    missing: ["price"],
    price: 0.733, yield: 1400, af: 5,
    seed: 96, fert: 142, diesel: 0, labor: 328.36, irrig: 228, other: 1030.09,
    priceKind: "reference", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced",
    priceSrc: "NASS agpr1026: U.S. upland cotton prices received, September 2026, $0.733/lb. Arizona monthly price was not in the state table. Lint only — seed is not added. The UA Yuma 2026 budget used $0.82/lb lint and is not used as the current price.",
    yieldSrc: "UA az2178, January 2026, Yuma County upland cotton budget: 1,400 lb lint/acre (and 2,100 lb seed, not in this lint yield).",
    waterSrc: "UA az2178, January 2026, Yuma upland cotton: 5.00 AF flood irrigation.",
    seedSrc: "UA az2178 Yuma 2026 upland cotton, seed costs $96.00/acre.",
    fertSrc: "UA az2178 Yuma 2026 upland cotton, fertility program $142.00/acre (nitrogen $104, phosphorus $38).",
    dieselSrc: "UA az2178 does not itemize farm diesel on the cotton table (machinery variable cash is $189.79 and includes fuel at the budget’s $4/gal assumption). Default $0.",
    laborSrc: "UA az2178 Yuma 2026 cotton: irrigation labor $80.00, additional labor $49.50, PCA $19.80, soil sampling $3.30, custom harvest $160.00, custom hauling $15.76 = $328.36/acre.",
    irrigSrc: "UA az2178 Yuma 2026 cotton irrigation line $228.00 (flood water $45 × 5.00 AF = $225 plus $3 annual repairs).",
    otherSrc: "Residual of UA az2178 Yuma 2026 cotton total annual costs $1,824.45 minus seed, fertilizer, labor, and irrigation, covering land preparation, chemicals, assessments, crop insurance $110, cash rent $250, interest, and machinery depreciation. Equals $1,030.09.",
    demand: { dir: null, tip: "Fiber crop, not a grocery produce item. No FVWRETAIL ad series." }
  },
  {
    id: "durum",
    name: "Durum",
    unit: "bushels/acre",
    completeness: "partial",
    missing: ["price"],
    price: 6.3, yield: 120, af: 3,
    seed: 73.6, fert: 170, diesel: 0, labor: 182.25, irrig: 138, other: 502.09,
    priceKind: "reference", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced",
    priceSrc: "NASS agpr1026: U.S. all wheat, September 2026, $6.30/bu. Arizona wheat was withheld in the state table. This is not an Arizona durum quote. The UA Yuma 2026 durum budget used $8.00/bu and is not used as the current price.",
    yieldSrc: "UA az2178, January 2026, Yuma County durum wheat budget: 120.00 bushels/acre.",
    waterSrc: "UA az2178, January 2026, Yuma durum wheat: 3.00 AF flood irrigation.",
    seedSrc: "UA az2178 Yuma 2026 durum wheat, seed costs $73.60/acre.",
    fertSrc: "UA az2178 Yuma 2026 durum wheat, fertility program $170.00/acre (nitrogen $150, phosphorus $20).",
    dieselSrc: "UA az2178 does not itemize farm diesel on the durum table (machinery variable cash is $79.44 and includes fuel at the budget’s $4/gal assumption). Default $0.",
    laborSrc: "UA az2178 Yuma 2026 durum: irrigation labor $48.00, additional labor $33.00, PCA $6.60, soil sampling $1.65, custom harvest $60.00, custom hauling $33.00 = $182.25/acre.",
    irrigSrc: "UA az2178 Yuma 2026 durum irrigation line $138.00 (flood water $45 × 3.00 AF = $135 plus $3 annual repairs).",
    otherSrc: "Residual of UA az2178 Yuma 2026 durum total annual costs $1,065.94 minus seed, fertilizer, labor, and irrigation, covering land preparation, chemicals, crop insurance, a $250 cash-rent line, interest, and machinery. Equals $502.09.",
    demand: { dir: null, tip: "Grain crop, not a grocery produce item. No FVWRETAIL ad series." }
  },
  {
    id: "cantaloupe",
    name: "Cantaloupe",
    unit: "cartons/acre",
    completeness: "partial",
    rankable: false,
    missing: ["price", "cost-year"],
    price: 0, yield: 811, af: 3.33,
    seed: 20.06, fert: 180.13, diesel: 25.72, labor: 3481.2, irrig: YCWUA_IRRIG, other: 550.54,
    priceKind: "missing", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced-2001",
    priceSrc: "No Western Arizona cantaloupe FOB was on AMS IX_FV120, Nov 10, 2026. Enter a shed or contract price to rank this crop. The 2001 budget price of $6.98/carton is not used as a current FOB.",
    yieldSrc: "UA AZ1263, 2001–2002, Yuma Valley North spring cantaloupe, Table 8A: 811 cartons/acre.",
    waterSrc: "UA AZ1263 Table 8D, Yuma Valley North spring cantaloupe: total water applied 40.0 inches = 3.33 acre-feet/acre.",
    seedSrc: "UA AZ1263 Table 8A, seed/transplants $20.06/acre (2001 dollars).",
    fertSrc: "UA AZ1263 Table 8A, fertilizer $180.13/acre (2001 dollars).",
    dieselSrc: "UA AZ1263 Table 8A, diesel fuel $25.72/acre (2001 dollars; Table 8D lists 29.0 gallons).",
    laborSrc: "UA AZ1263 Table 8A, paid labor $89.20 plus custom harvest/post-harvest $3,392.00 = $3,481.20/acre (2001 dollars).",
    irrigSrc: YCWUA_IRRIG_SRC,
    otherSrc: "Residual of UA AZ1263 Table 8A total cash operating expenses $4,226.65 minus seed, fertilizer, diesel, and labor, plus the $31/acre water assessment. 2001 dollars.",
    demand: {
      dir: "down",
      tip: "National ads 397 vs 1,918 last week (−79%). Southwest: 146 ads at $3.99. AMS FVWRETAIL, issued Nov 6, 2026."
    }
  },
  {
    id: "honeydew",
    name: "Honeydew",
    unit: "cartons/acre",
    completeness: "partial",
    rankable: false,
    missing: ["price", "cost-year"],
    price: 0, yield: 473, af: 3.33,
    seed: 42.97, fert: 180.13, diesel: 24.12, labor: 1901.2, irrig: YCWUA_IRRIG, other: 668.41,
    priceKind: "missing", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced-2001",
    priceSrc: "No Western Arizona honeydew FOB was on AMS IX_FV120, Nov 10, 2026. Enter a shed or contract price to rank this crop.",
    yieldSrc: "UA AZ1263, 2001–2002, Yuma Valley North spring honeydews, Table 9A: 473 cartons/acre.",
    waterSrc: "UA AZ1263 Table 9D, Yuma Valley North spring honeydews: total water applied 40.0 inches = 3.33 acre-feet/acre.",
    seedSrc: "UA AZ1263 Table 9A, seed/transplants $42.97/acre (2001 dollars).",
    fertSrc: "UA AZ1263 Table 9A, fertilizer $180.13/acre (2001 dollars).",
    dieselSrc: "UA AZ1263 Table 9A, diesel fuel $24.12/acre (2001 dollars; Table 9D lists 27.2 gallons).",
    laborSrc: "UA AZ1263 Table 9A, paid labor $89.20 plus custom harvest/post-harvest $1,812.00 = $1,901.20/acre (2001 dollars).",
    irrigSrc: YCWUA_IRRIG_SRC,
    otherSrc: "Residual of UA AZ1263 Table 9A total cash operating expenses $2,785.83 minus seed, fertilizer, diesel, and labor, plus the $31/acre water assessment. 2001 dollars.",
    demand: { dir: "flat", tip: "National ads 183 vs 183 last week. AMS FVWRETAIL, issued Nov 6, 2026." }
  },
  {
    id: "watermelon",
    name: "Watermelon",
    unit: "tons/acre",
    completeness: "partial",
    rankable: false,
    missing: ["price", "cost-year"],
    price: 0, yield: 22, af: 4.17,
    seed: 96.23, fert: 143.6, diesel: 39.58, labor: 1842.42, irrig: YCWUA_IRRIG, other: 663.72,
    priceKind: "missing", yieldKind: "sourced", waterKind: "sourced", costKind: "sourced-2001",
    priceSrc: "No Western Arizona watermelon FOB was on AMS IX_FV120, Nov 10, 2026. Enter a shed or contract price to rank this crop. The 2001 budget used $141.60/ton and is not used as a current FOB.",
    yieldSrc: "UA AZ1263, 2001–2002, Yuma Valley North spring watermelons, Table 11A: 22.0 tons/acre (income quantity 22.05 tons).",
    waterSrc: "UA AZ1263 Table 11D, Yuma Valley North spring watermelons: total water applied 50.0 inches = 4.17 acre-feet/acre.",
    seedSrc: "UA AZ1263 Table 11A, seed/transplants $96.23/acre (2001 dollars).",
    fertSrc: "UA AZ1263 Table 11A, fertilizer $143.60/acre (2001 dollars).",
    dieselSrc: "UA AZ1263 Table 11A, diesel fuel $39.58/acre (2001 dollars; Table 11D lists 44.7 gallons).",
    laborSrc: "UA AZ1263 Table 11A, paid labor $128.02 plus custom harvest/post-harvest $1,714.40 = $1,842.42/acre (2001 dollars).",
    irrigSrc: YCWUA_IRRIG_SRC,
    otherSrc: "Residual of UA AZ1263 Table 11A total cash operating expenses $2,754.55 minus seed, fertilizer, diesel, and labor, plus the $31/acre water assessment. 2001 dollars.",
    demand: {
      dir: "down",
      tip: "National ads (each) 31 vs 111 last week (−72%). Southwest: 61 ads at $0.49/lb. AMS FVWRETAIL, issued Nov 6, 2026."
    }
  }
];

export function defaultEdits() {
  return Object.fromEntries(PLANT_CROPS.map((c) => [c.id, {
    price: c.price, yield: c.yield, af: c.af,
    seed: c.seed, fert: c.fert, diesel: c.diesel, labor: c.labor, irrig: c.irrig, other: c.other
  }]));
}

export const PLANT_METHOD = `What should I plant? is a planning estimate, not agronomic, water-rights, or financial advice. Each crop carries its own editable price, yield, acre-feet per acre, and per-acre costs (seed, fertilizer, diesel, labor/harvest, irrigation, and other). Net per acre = price × yield − the six cost boxes. Plantable acres = min(farm acres, allotment ÷ AF per acre). Farm profit = net per acre × plantable acres. Net per acre-foot = net per acre ÷ AF per acre. Crops with a $0 price are listed under demand only and are not ranked until a price is entered. Vegetable yield, applied water, and component costs are from UA Cooperative Extension AZ1263, 2001–2002 Western Arizona vegetable budgets (Yuma Valley North; Teegerstrom, Palumbo / Yuma Agricultural Center, and Zerkoune). Those dollar costs are 2001 dollars and are not inflated. Broccoli yield 790.4 twenty-pound cartons is 608 twenty-six-pound cartons from that budget, converted to the current AMS 20-lb crown-cut unit (608 × 26 ÷ 20). Vegetable irrigation defaults to the YCWUA 2024 O&M assessment of $142.50/acre (includes first 5 AF; ASFMRA 2024), because the 2001 budgets booked water as a $31/acre ownership assessment with $0 cash water. Alfalfa, upland cotton, and durum yield, water, and component costs are from UA Cooperative Extension az2178, January 2026, Yuma County field-crop production budgets. Current prices are last-known FOB or prices-received (AMS IX_FV120 Nov 10, 2026, or NASS agpr1026, September 2026). Cotton lint and durum use U.S. NASS prices (Arizona monthly cotton was not in the state table; Arizona wheat was withheld). Demand arrows use national conventional ad counts this week vs last week in AMS FVWRETAIL, issued Friday, November 6, 2026 (ads for Oct 31–Nov 12). Up/down threshold is 15%. Arizona-grocer-specific data was not in the report; Southwest region is AZ, CA, NV, and UT. Snapshot ${PLANT_AS_OF}.`;
