export interface CityGroundRates {
  cement: {
    pricePerBag: string;
    brands: string;
    trend: string;
  };
  steel: {
    pricePerTon: string;
    pricePerKg: string;
    standard: string;
    brands: string;
  };
  bricks: {
    pricePerThousand: string;
    type: string;
    note?: string;
  };
  sandCrush: {
    sandPerCft: string;
    crushPerCft: string;
    source: string;
  };
  tiles: {
    rangePerSqft: string;
    popularBrands: string;
    importedRange: string;
  };
  labour: {
    greyStructurePerSqft: string;
    fullTurnkeyPerSqft: string;
    masonDaily: string;
    mazdoorDaily: string;
  };
}

export interface ReadyHouseBenchmark {
  readyHouseEstimateMin: number;
  readyHouseEstimateMax: number;
  selfBuildSavingsMin: number;
  selfBuildSavingsMax: number;
  savingsPercentage: number;
  developerMarkupPercent: number;
  dealerCommissionPercent: number;
  qualityControlNoteEn: string;
  qualityControlNoteUr: string;
}

const CITY_BENCHMARKS: Record<string, CityGroundRates> = {
  lahore: {
    cement: { pricePerBag: 'Rs. 1,390 – 1,440', brands: 'Bestway / Lucky / Maple Leaf / Fauji', trend: 'Stable' },
    steel: { pricePerTon: 'Rs. 262,000 – 270,000', pricePerKg: 'Rs. 262 – 270 / kg', standard: 'ASTM A615 Grade-60 Deformed', brands: 'Mughal / Ittehad / Model / Amreli' },
    bricks: { pricePerThousand: 'Rs. 13,800 – 15,200', type: 'Class-1 (Awwal) Kiln Bricks' },
    sandCrush: { sandPerCft: 'Rs. 58 – 72 / cft (Chenab/Ravi)', crushPerCft: 'Rs. 120 – 140 / cft (Sargodha/Margalla)', source: 'Chenab sand & Sargodha/Margalla plant crush' },
    tiles: { rangePerSqft: 'Rs. 220 – 340 / sq ft (Local Porcelain)', popularBrands: 'Master, Stile, Shabbir, Sonex', importedRange: 'Rs. 450 – 750 / sq ft (Spanish/Chinese)' },
    labour: { greyStructurePerSqft: 'Rs. 480 – 620 / sq ft', fullTurnkeyPerSqft: 'Rs. 950 – 1,250 / sq ft', masonDaily: 'Rs. 2,800 – 3,200', mazdoorDaily: 'Rs. 1,500 – 1,800' }
  },
  karachi: {
    cement: { pricePerBag: 'Rs. 1,420 – 1,480', brands: 'Lucky / Thatta / Falcon / Power', trend: 'Steady' },
    steel: { pricePerTon: 'Rs. 265,000 – 275,000', pricePerKg: 'Rs. 265 – 275 / kg', standard: 'Grade-60 Deformed Billet', brands: 'Amreli / Razzaque / Agha' },
    bricks: { pricePerThousand: 'Rs. 62 – 75 / block', type: 'Solid & Hollow Concrete Blocks (Coastal Standard)' },
    sandCrush: { sandPerCft: 'Rs. 50 – 68 / cft (Hub/Malir)', crushPerCft: 'Rs. 125 – 148 / cft (Nooriabad)', source: 'Hub/Malir river sand & Nooriabad crush' },
    tiles: { rangePerSqft: 'Rs. 240 – 360 / sq ft (Vitrified)', popularBrands: 'Stile, Master, Shabbir Tiles', importedRange: 'Rs. 480 – 850 / sq ft (Imported vitrified)' },
    labour: { greyStructurePerSqft: 'Rs. 520 – 660 / sq ft', fullTurnkeyPerSqft: 'Rs. 1,050 – 1,350 / sq ft', masonDaily: 'Rs. 3,000 – 3,500', mazdoorDaily: 'Rs. 1,600 – 1,900' }
  },
  islamabad: {
    cement: { pricePerBag: 'Rs. 1,400 – 1,460', brands: 'Bestway / Fauji / Askari', trend: 'Stable' },
    steel: { pricePerTon: 'Rs. 264,000 – 272,000', pricePerKg: 'Rs. 264 – 272 / kg', standard: 'Grade-60 Thermal Quenched Rebar', brands: 'Ittehad / Mughal / AFCO' },
    bricks: { pricePerThousand: 'Rs. 14,500 – 16,000', type: 'Class-1 Red Clay Bricks (Fateh Jang / Taxila)' },
    sandCrush: { sandPerCft: 'Rs. 75 – 92 / cft (Lawrencepur)', crushPerCft: 'Rs. 115 – 135 / cft (Margalla)', source: 'Lawrencepur coarse sand & Margalla machine crush' },
    tiles: { rangePerSqft: 'Rs. 250 – 380 / sq ft (Porcelain Glazed)', popularBrands: 'Master, Granitto, Portoro', importedRange: 'Rs. 520 – 900 / sq ft (European/Turkish)' },
    labour: { greyStructurePerSqft: 'Rs. 520 – 680 / sq ft', fullTurnkeyPerSqft: 'Rs. 1,050 – 1,380 / sq ft', masonDaily: 'Rs. 3,000 – 3,500', mazdoorDaily: 'Rs. 1,600 – 1,900' }
  },
  rawalpindi: {
    cement: { pricePerBag: 'Rs. 1,400 – 1,460', brands: 'Bestway / Fauji / Askari', trend: 'Stable' },
    steel: { pricePerTon: 'Rs. 263,000 – 272,000', pricePerKg: 'Rs. 263 – 272 / kg', standard: 'ASTM A615 Grade-60', brands: 'Ittehad / Mughal / AFCO' },
    bricks: { pricePerThousand: 'Rs. 14,200 – 15,800', type: 'Class-1 Awwal Bricks (Rawat / Taxila)' },
    sandCrush: { sandPerCft: 'Rs. 72 – 88 / cft (Lawrencepur/Ghazi)', crushPerCft: 'Rs. 115 – 135 / cft (Margalla)', source: 'Lawrencepur & Margalla quarries' },
    tiles: { rangePerSqft: 'Rs. 230 – 360 / sq ft', popularBrands: 'Master, Stile, Karam', importedRange: 'Rs. 480 – 800 / sq ft' },
    labour: { greyStructurePerSqft: 'Rs. 500 – 650 / sq ft', fullTurnkeyPerSqft: 'Rs. 1,000 – 1,320 / sq ft', masonDaily: 'Rs. 2,900 – 3,400', mazdoorDaily: 'Rs. 1,550 – 1,850' }
  },
  faisalabad: {
    cement: { pricePerBag: 'Rs. 1,380 – 1,430', brands: 'Lucky / Maple Leaf / Bestway', trend: 'Stable' },
    steel: { pricePerTon: 'Rs. 260,000 – 268,000', pricePerKg: 'Rs. 260 – 268 / kg', standard: 'Grade-60 Deformed Billet', brands: 'Mughal / Ittehad' },
    bricks: { pricePerThousand: 'Rs. 13,200 – 14,500', type: 'Awwal Kiln Bricks' },
    sandCrush: { sandPerCft: 'Rs. 52 – 68 / cft (Chenab)', crushPerCft: 'Rs. 118 – 136 / cft (Sargodha)', source: 'Chenab & Sargodha plant' },
    tiles: { rangePerSqft: 'Rs. 210 – 330 / sq ft', popularBrands: 'Master, Stile, National', importedRange: 'Rs. 420 – 700 / sq ft' },
    labour: { greyStructurePerSqft: 'Rs. 460 – 580 / sq ft', fullTurnkeyPerSqft: 'Rs. 920 – 1,180 / sq ft', masonDaily: 'Rs. 2,700 – 3,100', mazdoorDaily: 'Rs. 1,450 – 1,750' }
  },
  multan: {
    cement: { pricePerBag: 'Rs. 1,390 – 1,440', brands: 'Maple Leaf / Pioneer / Lucky', trend: 'Stable' },
    steel: { pricePerTon: 'Rs. 262,000 – 270,000', pricePerKg: 'Rs. 262 – 270 / kg', standard: 'Grade-60 Rebar', brands: 'Mughal / Model' },
    bricks: { pricePerThousand: 'Rs. 12,800 – 14,000', type: 'First Class Clay Bricks (Multan / Shujabad)' },
    sandCrush: { sandPerCft: 'Rs. 48 – 65 / cft (Chenab/Sutlej)', crushPerCft: 'Rs. 132 – 155 / cft (Sargodha transport)', source: 'River Chenab sand, Sargodha crush via train/truck' },
    tiles: { rangePerSqft: 'Rs. 210 – 320 / sq ft', popularBrands: 'Master, Stile, Diamond', importedRange: 'Rs. 420 – 720 / sq ft' },
    labour: { greyStructurePerSqft: 'Rs. 450 – 570 / sq ft', fullTurnkeyPerSqft: 'Rs. 900 – 1,180 / sq ft', masonDaily: 'Rs. 2,600 – 3,000', mazdoorDaily: 'Rs. 1,400 – 1,700' }
  },
  peshawar: {
    cement: { pricePerBag: 'Rs. 1,380 – 1,430', brands: 'Cherat / Bestway / Lucky / Kohat', trend: 'Competitive (Local Factories)' },
    steel: { pricePerTon: 'Rs. 262,000 – 272,000', pricePerKg: 'Rs. 262 – 272 / kg', standard: 'Grade-60 Rebar', brands: 'Mughal / Frontier' },
    bricks: { pricePerThousand: 'Rs. 13,800 – 15,000', type: 'Class-1 Awwal Bricks (Charsadda/Nowshera)' },
    sandCrush: { sandPerCft: 'Rs. 50 – 68 / cft (Kabul River)', crushPerCft: 'Rs. 100 – 120 / cft (Local Swabi/Kohat quarries)', source: 'Local stone crush & river sand' },
    tiles: { rangePerSqft: 'Rs. 220 – 340 / sq ft', popularBrands: 'Master, Karam, Frontier', importedRange: 'Rs. 420 – 750 / sq ft' },
    labour: { greyStructurePerSqft: 'Rs. 460 – 600 / sq ft', fullTurnkeyPerSqft: 'Rs. 920 – 1,220 / sq ft', masonDaily: 'Rs. 2,700 – 3,200', mazdoorDaily: 'Rs. 1,500 – 1,800' }
  }
};

const DEFAULT_BENCHMARK: CityGroundRates = {
  cement: { pricePerBag: 'Rs. 1,390 – 1,450', brands: 'Lucky / Bestway / Maple Leaf / Fauji', trend: 'Stable' },
  steel: { pricePerTon: 'Rs. 262,000 – 272,000', pricePerKg: 'Rs. 262 – 272 / kg', standard: 'Grade-60 Deformed Billet', brands: 'Mughal / Amreli / Ittehad' },
  bricks: { pricePerThousand: 'Rs. 13,500 – 15,000', type: 'Class-1 Kiln Bricks' },
  sandCrush: { sandPerCft: 'Rs. 55 – 75 / cft', crushPerCft: 'Rs. 120 – 145 / cft', source: 'Regional river sand & machine crushed stone' },
  tiles: { rangePerSqft: 'Rs. 220 – 350 / sq ft', popularBrands: 'Master, Stile, Shabbir', importedRange: 'Rs. 450 – 780 / sq ft' },
  labour: { greyStructurePerSqft: 'Rs. 480 – 620 / sq ft', fullTurnkeyPerSqft: 'Rs. 950 – 1,250 / sq ft', masonDaily: 'Rs. 2,800 – 3,200', mazdoorDaily: 'Rs. 1,500 – 1,800' }
};

export function getCityGroundRates(city: string): CityGroundRates {
  const normalized = (city || '').trim().toLowerCase();
  return CITY_BENCHMARKS[normalized] || DEFAULT_BENCHMARK;
}

export function calculateReadyHouseBenchmark(
  selfBuildMin: number,
  selfBuildMax: number
): ReadyHouseBenchmark {
  const midpoint = (selfBuildMin + selfBuildMax) / 2;
  // In Pakistan, a commercial ready house (e.g. DHA, Bahria, Gulberg) sells at roughly a 22% - 28% premium
  // over pure construction cost due to builder profit (18-22%) and dealer commission (2-3%).
  const developerMarkupPercent = 20;
  const dealerCommissionPercent = 2;
  const totalMarkupMultiplier = 1 + (developerMarkupPercent + dealerCommissionPercent) / 100; // ~1.22x

  const readyHouseEstimateMin = Math.round(selfBuildMin * totalMarkupMultiplier);
  const readyHouseEstimateMax = Math.round(selfBuildMax * totalMarkupMultiplier);

  const readyMidpoint = (readyHouseEstimateMin + readyHouseEstimateMax) / 2;
  const selfBuildSavingsMin = readyHouseEstimateMin - selfBuildMin;
  const selfBuildSavingsMax = readyHouseEstimateMax - selfBuildMax;
  const savingsPercentage = Math.round(((readyMidpoint - midpoint) / readyMidpoint) * 100); // ~18-20% of ready price

  return {
    readyHouseEstimateMin,
    readyHouseEstimateMax,
    selfBuildSavingsMin,
    selfBuildSavingsMax,
    savingsPercentage,
    developerMarkupPercent,
    dealerCommissionPercent,
    qualityControlNoteEn:
      'Commercial ready-to-move houses built by property developers typically incur an 18-22% developer margin plus a 2% agent commission. More importantly, commercial builds frequently use sub-grade concealed materials (thinner steel rebar, diluted mortar, non-tested plumbing pipes). By self-building through BuildWise verified contractors, you save 18-24% in cash while maintaining 100% control over Grade-A steel and certified cement ratios.',
    qualityControlNoteUr:
      'مارکیٹ میں بنے بنائے کمرشل گھروں پر ڈویلپر اور پراپرٹی ڈیلر عموماً ۱۸ سے ۲۲ فیصد تک منافع اور ۲ فیصد کمیشن چارج کرتے ہیں۔ اس کے علاوہ کمرشل بلڈرز اکثر دیواروں کے اندر پوشیدہ میٹریل (کم وزن سریہ، کم سیمنٹ کا مصالحہ اور سستے پائپ) استعمال کرتے ہیں۔ بلڈ وائز کے ذریعے خود ٹھیکیدار کے ساتھ تعمیر کروا کے آپ خطیر بچت کے ساتھ ساتھ مکمل میٹریل کوالٹی یقینی بنا سکتے ہیں۔'
  };
}
