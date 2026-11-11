/* Sourced planning inputs for the "What should I plant?" tool.
   Every price, yield, water figure, cost, and demand signal is dated.
   Assumptions are flagged. Nothing here is invented as a market quote. */

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

export const COST_SETS = {
  bycrop: {
    id: "bycrop",
    label: "By crop",
    seed: 0,
    fert: 137.99,
    diesel: 0,
    labor: 570.44,
    irrig: 142.5,
    note: "Default ranking uses each crop’s own sourced or assumed operating total, plus the irrigation field. The five boxes start at the UA La Paz 2024 alfalfa hay production lines (az2139, June 2025) so a farmer can edit them. Diesel is $0 because that budget does not itemize farm diesel (custom harvest). Irrigation starts at the Yuma County Water Users’ Association 2024 O&M assessment of $142.50/acre, which includes the first 5 acre-feet (ASFMRA Arizona, Bill Moody, 2024 Outlook)."
  },
  alfalfa: {
    id: "alfalfa",
    label: "Alfalfa",
    seed: 0,
    fert: 137.99,
    diesel: 0,
    labor: 570.44,
    irrig: 278,
    note: "UA Cooperative Extension, La Paz County 2024 alfalfa hay production budget (az2139, June 2025). Seed $0 in the production year (no seed line). Fertilizer (10-34-00) $137.99. Diesel not itemized. Labor/harvest: irrigation labor $72.75 + additional crop labor $87.95 + custom harvest $377.84 + custom hauling $31.90 = $570.44. Irrigation water $278 ($55 × 5 AF). Chemicals, cash rent, interest, and machinery are in the crop-specific total, not these five boxes."
  },
  cotton: {
    id: "cotton",
    label: "Cotton",
    seed: 57,
    fert: 108.53,
    diesel: 0,
    labor: 469.91,
    irrig: 278,
    note: "UA La Paz 2024 upland cotton budget (az2139, June 2025). Seed $57. Fertility program $108.53. Diesel not itemized. Labor/harvest: irrigation labor $72.75 + additional $66 + custom harvest $160 + hauling $16.89 + gin/drying $132 + assessments/classing $22.27 = $469.91. Irrigation water $278 ($55 × 5 AF)."
  },
  durum: {
    id: "durum",
    label: "Durum",
    seed: 27.6,
    fert: 360,
    diesel: 0,
    labor: 235.16,
    irrig: 195.5,
    note: "UA La Paz 2024 durum wheat budget (az2139, June 2025). Seed $27.60. NH3 fertility $360. Diesel not itemized. Labor/harvest: irrigation labor $50.93 + additional $43.23 + custom harvest $60 + hauling $81 = $235.16. Irrigation water $195.50 ($55 × 3.5 AF)."
  },
  produce: {
    id: "produce",
    label: "Produce",
    seed: 0,
    fert: 0,
    diesel: 0,
    labor: 8000,
    irrig: 142.5,
    note: "No 2024–26 Yuma vegetable enterprise budget was retrieved, so the category split is not sourced. The $8,000 lettuce/romaine/leaf non-water planning total used on this board is placed in labor/harvest as an unallocated lump. Broccoli’s planning total on the board is $7,000; this chip uses the lettuce total. Irrigation starts at YCWUA 2024 O&M $142.50/acre."
  }
};

/* Demand arrows: national conventional ad counts this week vs last week in the same
   AMS National Retail Report (FVWRETAIL), Friday, November 6, 2026, ads for
   10/31/2026–11/12/2026. Rule, documented here and in the sources drawer:
   up if ads are up 15% or more, down if down 15% or more, else flat.
   Arizona-grocer-specific ad counts are not published in that report.
   Southwest U.S. in the report is Arizona, California, Nevada, and Utah. */
export const DEMAND_META = {
  title: "Grocer demand",
  report: "USDA AMS National Retail Report — Fruits and Vegetables (FVWRETAIL)",
  issued: "Friday, November 6, 2026",
  adsFor: "October 31–November 12, 2026",
  region: "Southwest U.S. (Arizona, California, Nevada, Utah) — not Arizona-only. Arizona-grocer-specific ad counts were not in the report.",
  method: "Arrow direction uses national conventional advertised-feature counts this week versus last week in the same report. Up = +15% or more, down = −15% or more, otherwise flat. Southwest this-week ad counts and advertised prices are shown in the tooltip where a Southwest line exists. Import share is USDA ERS VGS-378, April 2026 (2025 availability). Season tag is the typical Yuma winter vegetable window (mid-November through mid-April), a seasonal guide, not a forecast.",
  url: "https://www.ams.usda.gov/mnreports/fvwretail.pdf"
};

export const PLANT_CROPS = [
  {
    id: "iceberg",
    name: "Iceberg",
    unit: "cartons/acre",
    yield: 800,
    price: 29.25,
    af: 2,
    other: 8000,
    completeness: "partial",
    missing: ["yield", "water", "cost"],
    priceKind: "sourced",
    yieldKind: "assumption",
    waterKind: "assumption",
    costKind: "assumption",
    priceSrc: "AMS IX_FV120, Nov 10, 2026, Western Arizona film-wrapped 24s, mostly $27.75–$30.75. Midpoint $29.25 starting FOB, not a net grower return.",
    yieldSrc: "Planning assumption, 800 cartons/acre. NASS Vegetables 2025 Summary: Arizona 2025 head lettuce 385 cwt/acre (a 50-lb carton would be about 770 cartons; 800 is not that conversion).",
    waterSrc: "Planning assumption, 2 AF applied. Erie et al. lettuce consumptive use is about 9 acre-inches; applied desert irrigation is higher.",
    costSrc: "Planning assumption, $8,000/acre non-water operating cost. No 2024–26 Yuma lettuce budget was retrieved.",
    demand: {
      dir: "down",
      natThis: 241,
      natLast: 365,
      natPct: -34,
      natPrice: 1.99,
      natPriceLast: 2.79,
      pack: "Iceberg, each",
      swAds: 0,
      swNote: "No Southwest iceberg feature ads in the conventional regional table this week (South Central had 42 ads at $1.99).",
      importShare: "5%",
      season: "in",
      tip: "National ads 241 vs 365 last week (−34%). Advertised $1.99 vs $2.79. Southwest (AZ, CA, NV, UT): no iceberg feature ads this week. AMS FVWRETAIL, issued Nov 6, 2026. Import share of U.S. availability ~5% (ERS VGS-378, Apr 2026). Yuma winter window mid-Nov–mid-Apr."
    }
  },
  {
    id: "romaine",
    name: "Romaine",
    unit: "cartons/acre",
    yield: 800,
    price: 26.25,
    af: 2,
    other: 8000,
    completeness: "partial",
    missing: ["yield", "water", "cost"],
    priceKind: "sourced",
    yieldKind: "assumption",
    waterKind: "assumption",
    costKind: "assumption",
    priceSrc: "AMS IX_FV120, Nov 10, 2026, Western Arizona romaine 24s, mostly $24.75–$27.75. Midpoint $26.25 starting FOB.",
    yieldSrc: "Planning assumption, 800 cartons/acre. Not a sourced 2026 Yuma packout.",
    waterSrc: "Planning assumption, 2 AF applied.",
    costSrc: "Planning assumption, $8,000/acre non-water. No 2024–26 Yuma romaine budget was retrieved.",
    demand: {
      dir: "down",
      natThis: 613,
      natLast: 1033,
      natPct: -41,
      natPrice: 3.76,
      natPriceLast: 3.16,
      pack: "Romaine hearts, 3-count",
      swAds: 191,
      swPrice: 4.99,
      swNote: "Southwest 191 ads at $4.99 (3-count).",
      importShare: "8%",
      season: "in",
      tip: "National ads 613 vs 1,033 last week (−41%). Advertised wtd $3.76 vs $3.16. Southwest (AZ, CA, NV, UT): 191 ads at $4.99. AMS FVWRETAIL, issued Nov 6, 2026. Import share of U.S. availability ~8% for romaine/leaf (ERS VGS-378, Apr 2026). Yuma winter window mid-Nov–mid-Apr."
    }
  },
  {
    id: "leaf",
    name: "Leaf",
    unit: "cartons/acre",
    yield: 800,
    price: 27.125,
    af: 2,
    other: 8000,
    completeness: "partial",
    missing: ["yield", "water", "cost", "demand"],
    priceKind: "sourced",
    yieldKind: "assumption",
    waterKind: "assumption",
    costKind: "assumption",
    priceSrc: "AMS IX_FV120, Nov 10, 2026, Western Arizona green/red leaf 24s, both mostly $25.50–$28.75. Midpoint $27.13 starting FOB.",
    yieldSrc: "Planning assumption, 800 cartons/acre.",
    waterSrc: "Planning assumption, 2 AF applied.",
    costSrc: "Planning assumption, $8,000/acre non-water. No 2024–26 Yuma leaf budget was retrieved.",
    demand: {
      dir: null,
      pack: "Leaf lettuce",
      swAds: null,
      importShare: "8%",
      season: "in",
      tip: "No leaf-lettuce advertised-feature line (only iceberg and romaine hearts) in AMS FVWRETAIL, issued Nov 6, 2026. No arrow. Import share of U.S. availability ~8% for romaine/leaf (ERS VGS-378, Apr 2026). Yuma winter window mid-Nov–mid-Apr."
    }
  },
  {
    id: "broccoli",
    name: "Broccoli",
    unit: "20-lb cartons/acre",
    yield: 600,
    price: 19.375,
    af: 2,
    other: 7000,
    completeness: "partial",
    missing: ["water", "cost"],
    priceKind: "sourced",
    yieldKind: "sourced-converted",
    waterKind: "assumption",
    costKind: "assumption",
    priceSrc: "AMS IX_FV120, Nov 10, 2026, Western Arizona crown-cut 20-lb cartons loose, mostly $18.25–$20.50. Midpoint $19.38 starting FOB.",
    yieldSrc: "600 twenty-pound cartons/acre, converted from NASS Vegetables 2025 Summary Arizona 2024 broccoli yield of 120 cwt/acre (2025 withheld). Conversion assumption: 20 lb per carton.",
    waterSrc: "Planning assumption, 2 AF applied.",
    costSrc: "Planning assumption, $7,000/acre non-water. No 2024–26 Yuma broccoli budget was retrieved.",
    demand: {
      dir: "up",
      natThis: 1640,
      natLast: 1155,
      natPct: 42,
      natPrice: 1.90,
      natPriceLast: 1.97,
      pack: "Broccoli crown cut, per lb",
      swAds: 0,
      swNote: "No Southwest conventional broccoli feature ads this week (South Central and Northwest had lines).",
      importShare: "34%",
      season: "in",
      tip: "National crown-cut ads 1,640 vs 1,155 last week (+42%). Advertised wtd $1.90 vs $1.97 per lb. Bunch ads were 1,806 vs 1,885 (−4%, flat). Southwest (AZ, CA, NV, UT): no conventional broccoli feature ads this week. AMS FVWRETAIL, issued Nov 6, 2026. Import share of U.S. availability 34% (ERS VGS-378, Apr 2026). Yuma winter window mid-Nov–mid-Apr."
    }
  },
  {
    id: "alfalfa",
    name: "Alfalfa",
    unit: "tons/acre",
    yield: 8,
    price: 210,
    af: 6.8,
    other: 995.85,
    completeness: "full",
    missing: [],
    priceKind: "sourced",
    yieldKind: "sourced",
    waterKind: "sourced",
    costKind: "sourced",
    priceSrc: "NASS Agricultural Prices agpr1026, released Oct 30, 2026: Arizona alfalfa hay, prices received, September 2026, $210/ton. Not an auction lot.",
    yieldSrc: "UA Cooperative Extension, La Paz County 2024 alfalfa hay production budget (az2139, June 2025): 8.00 tons/acre. Matches Jim’s 8-cutting example.",
    waterSrc: "6.8 AF mean applied irrigation, Arizona dairy-forage producers surveyed summer 2023 (Ottman/Silvertooth). The same UA budget used 5.00 AF.",
    costSrc: "UA La Paz 2024 alfalfa hay production budget, total annual costs $1,270.85/acre minus that budget’s $55 × 5.00 AF water line ($275), leaving $995.85 non-water (includes $170 cash rent).",
    demand: {
      dir: null,
      pack: "Alfalfa hay",
      tip: "Not a grocery produce item. No advertised-feature series in AMS FVWRETAIL (fruits and vegetables), Nov 6, 2026. No retail demand arrow."
    }
  },
  {
    id: "cotton",
    name: "Cotton",
    unit: "lb lint/acre",
    yield: 1500,
    price: 0.733,
    af: 5,
    other: 1438.29,
    completeness: "partial",
    missing: ["price"],
    priceKind: "reference",
    yieldKind: "sourced",
    waterKind: "sourced",
    costKind: "sourced",
    priceSrc: "NASS agpr1026: U.S. upland cotton prices received, September 2026, $0.733/lb. Arizona monthly price was not in the state table. Lint only — seed is not added. CBOT-linked reference, not local discovery.",
    yieldSrc: "UA La Paz 2024 upland cotton budget: 1,500 lb lint/acre.",
    waterSrc: "UA La Paz 2024 upland cotton budget: 5.00 AF flood irrigation.",
    costSrc: "UA La Paz 2024 cotton budget total annual costs $1,713.29 minus $55 × 5.00 AF ($275) = $1,438.29 non-water, including $170 cash rent.",
    demand: {
      dir: null,
      pack: "Upland cotton",
      tip: "Fiber crop, not a grocery produce item. No advertised-feature series in AMS FVWRETAIL, Nov 6, 2026. No retail demand arrow."
    }
  },
  {
    id: "durum",
    name: "Durum",
    unit: "bushels/acre",
    yield: 110,
    price: 6.30,
    af: 3.5,
    other: 1064.43,
    completeness: "partial",
    missing: ["price"],
    priceKind: "reference",
    yieldKind: "sourced",
    waterKind: "sourced",
    costKind: "sourced",
    priceSrc: "NASS agpr1026: U.S. all wheat, September 2026, $6.30/bu. Arizona wheat was withheld in the state table. This is not an Arizona durum quote. The UA 2024 durum budget used $8.82/bu and is not used as the current price.",
    yieldSrc: "UA La Paz 2024 durum wheat budget (az2139, June 2025): 110 bushels/acre.",
    waterSrc: "UA La Paz 2024 durum wheat budget: 3.50 AF flood irrigation.",
    costSrc: "UA La Paz 2024 durum wheat total annual costs $1,259.93 minus $55 × 3.50 AF ($195.50) = $1,064.43 non-water, including $170 cash rent.",
    demand: {
      dir: null,
      pack: "Durum wheat",
      tip: "Grain crop, not a grocery produce item. No advertised-feature series in AMS FVWRETAIL, Nov 6, 2026. No retail demand arrow."
    }
  },
  {
    id: "cantaloupe",
    name: "Cantaloupe",
    unit: "",
    yield: 0,
    price: 0,
    af: 0,
    other: 0,
    completeness: "partial",
    rankable: false,
    missing: ["price", "yield", "water", "cost"],
    priceKind: "missing",
    yieldKind: "missing",
    waterKind: "missing",
    costKind: "missing",
    priceSrc: "No Western Arizona cantaloupe FOB was on AMS IX_FV120, Nov 10, 2026 (a vegetable shipping-point report). Revenue is not ranked until a shed or contract price, yield, and applied water are entered.",
    yieldSrc: "No sourced Arizona cantaloupe yield was retrieved this build.",
    waterSrc: "No sourced Arizona cantaloupe applied-water figure was retrieved this build.",
    costSrc: "No current Arizona melon enterprise budget was retrieved.",
    demand: {
      dir: "down",
      natThis: 397,
      natLast: 1918,
      natPct: -79,
      natPrice: 3.70,
      natPriceLast: 3.22,
      pack: "Cantaloupes, each",
      swAds: 146,
      swPrice: 3.99,
      season: "off",
      tip: "National ads 397 vs 1,918 last week (−79%). Advertised wtd $3.70 vs $3.22. Southwest (AZ, CA, NV, UT): 146 ads at $3.99. AMS FVWRETAIL, issued Nov 6, 2026. Typical Arizona desert melon harvest is late spring–summer; mid-November is off-season for local production."
    }
  },
  {
    id: "honeydew",
    name: "Honeydew",
    unit: "",
    yield: 0,
    price: 0,
    af: 0,
    other: 0,
    completeness: "partial",
    rankable: false,
    missing: ["price", "yield", "water", "cost"],
    priceKind: "missing",
    yieldKind: "missing",
    waterKind: "missing",
    costKind: "missing",
    priceSrc: "No Western Arizona honeydew FOB was on AMS IX_FV120, Nov 10, 2026. Not ranked.",
    yieldSrc: "No sourced Arizona honeydew yield was retrieved this build.",
    waterSrc: "No sourced Arizona honeydew applied-water figure was retrieved this build.",
    costSrc: "No current Arizona melon enterprise budget was retrieved.",
    demand: {
      dir: "flat",
      natThis: 183,
      natLast: 183,
      natPct: 0,
      natPrice: 3.50,
      natPriceLast: 3.50,
      pack: "Honeydews, each",
      swAds: 0,
      swNote: "No Southwest honeydew line this week.",
      season: "off",
      tip: "National ads 183 vs 183 last week (0%). Advertised $3.50 both weeks. No Southwest honeydew feature line this week. AMS FVWRETAIL, issued Nov 6, 2026."
    }
  },
  {
    id: "watermelon",
    name: "Watermelon",
    unit: "",
    yield: 0,
    price: 0,
    af: 0,
    other: 0,
    completeness: "partial",
    rankable: false,
    missing: ["price", "yield", "water", "cost"],
    priceKind: "missing",
    yieldKind: "missing",
    waterKind: "missing",
    costKind: "missing",
    priceSrc: "No Western Arizona watermelon FOB was on AMS IX_FV120, Nov 10, 2026. Not ranked.",
    yieldSrc: "No sourced Arizona watermelon yield was retrieved this build.",
    waterSrc: "No sourced Arizona watermelon applied-water figure was retrieved this build.",
    costSrc: "No current Arizona melon enterprise budget was retrieved.",
    demand: {
      dir: "down",
      natThis: 31,
      natLast: 111,
      natPct: -72,
      natPrice: 3.98,
      natPriceLast: 4.71,
      pack: "Watermelons, red flesh seedless, each",
      swAds: 61,
      swPrice: 0.49,
      swNote: "Southwest had 61 ads for red-flesh watermelon per lb at $0.49 (a different pack than the national each-count used for the arrow).",
      season: "off",
      tip: "National ads (each) 31 vs 111 last week (−72%). Advertised wtd $3.98 vs $4.71. Southwest (AZ, CA, NV, UT): 61 ads at $0.49 per lb. AMS FVWRETAIL, issued Nov 6, 2026."
    }
  }
];

export const PLANT_METHOD = `What should I plant? is a planning estimate, not agronomic, water-rights, or financial advice. Ranked crops use last-known FOB or prices-received times the yield shown, minus either (a) that crop’s sourced or assumed non-water operating total plus the irrigation box, when “By crop” is selected, or (b) the five editable cost boxes, when a cost set is applied or the boxes are edited. Plantable acres = min(farm acres, allotment ÷ AF per acre). Farm profit = net per acre × plantable acres. Net per acre-foot = net per acre ÷ AF per acre. Crops with a $0 price or missing yield or water are listed under demand only and are not ranked. Default farm is 120 acres and 600 AF in Yuma. Irrigation defaults to the YCWUA 2024 O&M assessment of $142.50/acre (includes first 5 AF; ASFMRA 2024). Produce yields of 800 cartons and 2 AF applied water, and produce operating totals of $8,000 (lettuce) and $7,000 (broccoli), are planning assumptions — no 2024–26 Yuma vegetable budget was retrieved. Broccoli yield 600 twenty-pound cartons is converted from NASS Arizona 2024 120 cwt/acre. Alfalfa price is NASS Arizona September 2026 $210/ton; yield 8 tons (UA La Paz 2024); water 6.8 AF (2023 Ottman/Silvertooth mean). Cotton lint price is U.S. $0.733/lb (not Arizona). Durum price is U.S. all wheat $6.30/bu; Arizona wheat was withheld; yield 110 bu and 3.5 AF are from the UA La Paz 2024 durum budget. Demand arrows use national conventional ad counts this week vs last week in AMS FVWRETAIL, issued Friday, November 6, 2026 (ads for Oct 31–Nov 12). Up/down threshold is 15%. Arizona-grocer-specific data was not in the report; Southwest region is AZ, CA, NV, and UT. Import shares are ERS VGS-378, April 2026. Snapshot ${PLANT_AS_OF}.`;
