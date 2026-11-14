import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

type Estimate = {
  material_cost: number;
  labour_cost: number;
  foundation_cost: number;
  structure_cost: number;
  roofing_cost: number;
  plumbing_cost: number;
  electrical_cost: number;
  paint_cost: number;
  tiles_cost: number;
  doors_windows_cost: number;
  miscellaneous_cost: number;
  land_preparation_cost: number;
  finishing_cost: number;
  total_estimate_min: number;
  total_estimate_max: number;
  explanation: string;
  timeline: string;
  confidence: number;
  suggestions: string[];
  material_quality_recommendation: string;
  risk_factors: string[];
  pricing_basis: string;
  built_house_comparison?: {
    market_ready_house_est: number;
    self_build_savings: number;
    self_build_savings_percentage: number;
    comparison_note: string;
  };
  current_market_rates?: {
    cement_bag_pkr: string;
    steel_per_ton_pkr: string;
    bricks_per_thousand_pkr: string;
    sand_crush_per_cft_pkr: string;
    tiles_per_sqft_pkr: string;
    labour_rate_per_sqft_pkr: string;
  };
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function constructPrompt(project: Record<string, unknown>) {
  const coveredArea = Number(project.covered_area) || 2000;
  const quality = String(project.material_quality || 'Standard').toLowerCase();
  const city = String(project.city || 'Lahore');
  const cityLower = city.toLowerCase();

  // Regional city cost multiplier
  let cityFactor = 1.0;
  if (cityLower.includes('islamabad') || cityLower.includes('rawalpindi')) cityFactor = 1.05;
  else if (cityLower.includes('karachi')) cityFactor = 1.04;
  else if (cityLower.includes('peshawar') || cityLower.includes('quetta')) cityFactor = 1.02;
  else if (cityLower.includes('multan') || cityLower.includes('faisalabad')) cityFactor = 0.98;

  const baseRatePerSqft = quality.includes('luxury') || quality.includes('a+') ? 8500
    : quality.includes('premium') || quality.includes('a') ? 6800
    : quality.includes('economy') ? 4200 : 5400;
  const ratePerSqft = Math.round(baseRatePerSqft * cityFactor);
  const targetTotal = coveredArea * ratePerSqft;

  const tagsList = Array.isArray(project.tags) ? project.tags.join(', ') : 'Standard layout';

  return `You are BuildWise AI, Pakistan's leading senior quantity surveyor and construction cost estimation expert.
Generate an authentic, highly accurate, itemized construction cost estimate in Pakistani Rupees (PKR) for this project.

PROJECT DETAILS:
- Title: ${project.title}
- City: ${city} (City adjustment index: ${cityFactor}x)
- Covered Area: ${coveredArea} sq ft
- Plot Size: ${project.plot_size || 5} Marla
- Floors: ${project.floors || 2}
- Construction Type: ${project.construction_type || 'Turnkey'}
- Material Quality: ${project.material_quality || 'Standard'}
- Soil Type: ${project.soil_type || 'Normal'}
- Room Layout & Spaces: ${tagsList}
- Features: Parking=${project.parking}, Solar=${project.solar}, SmartHome=${project.smart_home}, Garden=${project.garden}, Pool=${project.swimming_pool}

PAKISTANI 2025-2026 GROUND MARKET BENCHMARKS IN ${city.toUpperCase()}:
- Cement: Rs. 1,390 - 1,460 per 50kg bag (Bestway, Lucky, Maple Leaf, Fauji)
- Steel Rebar (Grade 60): Rs. 262,000 - 272,000 per ton (~Rs. 265/kg deformed bar - Mughal, Amreli, Model)
- Bricks: Rs. 13,500 - 15,500 per 1,000 Class-1 Awwal kiln bricks (or Rs. 65-75/block for Karachi concrete masonry)
- Sand & Crush: Chenab/Lawrencepur sand Rs. 55-85/cft; Margalla/Sargodha machine crush Rs. 120-145/cft
- Porcelain Tiles: Master / Stile Grade-A porcelain Rs. 230 - 350 / sq ft
- Labour Contract: Grey structure Rs. 480 - 640 / sq ft; Complete turnkey labour Rs. 980 - 1,300 / sq ft

READY HOUSE BENCHMARK COMPARISON:
- A developer-built, ready-to-move house in ${city} has an added 18% - 24% developer margin and 2% agent commission.
- Target Direct Self-Build Total: ~PKR ${targetTotal.toLocaleString()}
- Ready-to-Move Market Equivalent: ~PKR ${Math.round(targetTotal * 1.22).toLocaleString()} (Homeowner saves ~20% by building directly!)

Category Guidelines (all values in realistic full PKR amounts, NOT placeholder single digits):
1. Structure (Grey structure - cement, steel rebar, bricks, sand, crush): ~38% - 44% of total (~PKR ${Math.round(targetTotal * 0.40).toLocaleString()})
2. Foundation & Excavation: ~8% - 12% of total (~PKR ${Math.round(targetTotal * 0.10).toLocaleString()})
3. Roofing & Waterproofing: ~5% - 7% of total (~PKR ${Math.round(targetTotal * 0.06).toLocaleString()})
4. Tiles & Flooring (porcelain/granite/marble): ~8% - 12% of total (~PKR ${Math.round(targetTotal * 0.10).toLocaleString()})
5. Paint & Finishes (primer, putty, weathercoat, emulsion): ~4% - 6% of total (~PKR ${Math.round(targetTotal * 0.05).toLocaleString()})
6. Doors, Windows & Glass (solid wood/ash, UPVC/aluminum windows): ~6% - 8% of total (~PKR ${Math.round(targetTotal * 0.07).toLocaleString()})
7. Electrical (Pakistan/Fast cables, switch plates, distribution, LED fixtures): ~5% - 7% of total (~PKR ${Math.round(targetTotal * 0.06).toLocaleString()})
8. Plumbing & Sanitary (UPVC pipes, PPRC, commodes, faucets, geyser): ~5% - 7% of total (~PKR ${Math.round(targetTotal * 0.06).toLocaleString()})
9. Finishing & Woodwork (wardrobes, kitchen cabinets, ceiling): ~6% - 8% of total (~PKR ${Math.round(targetTotal * 0.07).toLocaleString()})
10. Land Preparation: ~1% - 2% of total (~PKR ${Math.round(targetTotal * 0.015).toLocaleString()})
11. Miscellaneous: ~2% - 3% of total (~PKR ${Math.round(targetTotal * 0.025).toLocaleString()})
12. Overall Labour Cost: ~30% - 35% of total (~PKR ${Math.round(targetTotal * 0.32).toLocaleString()})
13. Overall Material Cost: ~65% - 70% of total (~PKR ${Math.round(targetTotal * 0.68).toLocaleString()})

Return ONLY valid JSON with EXACTLY these keys:
{
  "material_cost": number,
  "labour_cost": number,
  "foundation_cost": number,
  "structure_cost": number,
  "roofing_cost": number,
  "plumbing_cost": number,
  "electrical_cost": number,
  "paint_cost": number,
  "tiles_cost": number,
  "doors_windows_cost": number,
  "miscellaneous_cost": number,
  "land_preparation_cost": number,
  "finishing_cost": number,
  "total_estimate_min": number,
  "total_estimate_max": number,
  "explanation": string,
  "timeline": string,
  "confidence": number,
  "suggestions": ["tip 1", "tip 2", "tip 3"],
  "material_quality_recommendation": string,
  "risk_factors": ["risk 1", "risk 2"],
  "pricing_basis": string
}`;
}

function parseEstimate(content: string, project?: Record<string, unknown>): Estimate {
  const trimmed = content.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  const parsed = JSON.parse(trimmed.slice(start, end + 1));

  const numericKeys = [
    'material_cost', 'labour_cost', 'foundation_cost', 'structure_cost', 'roofing_cost',
    'plumbing_cost', 'electrical_cost', 'paint_cost', 'tiles_cost', 'doors_windows_cost',
    'miscellaneous_cost', 'land_preparation_cost', 'finishing_cost',
    'total_estimate_min', 'total_estimate_max', 'confidence'
  ] as const;

  for (const key of numericKeys) {
    if (typeof parsed[key] !== 'number' || !Number.isFinite(parsed[key]) || parsed[key] < 0) {
      parsed[key] = 0;
    }
  }

  // Calculate baseline reference
  const coveredArea = project ? (Number(project.covered_area) || 2000) : 2000;
  const quality = project ? String(project.material_quality || 'Standard').toLowerCase() : 'standard';
  const ratePerSqft = quality.includes('luxury') || quality.includes('a+') ? 8500
    : quality.includes('premium') || quality.includes('a') ? 6800
    : quality.includes('economy') ? 4200 : 5400;
  const baselineTotal = coveredArea * ratePerSqft;

  // Validate and calibrate total
  let total = (parsed.total_estimate_min + parsed.total_estimate_max) / 2;
  if (!total || total < baselineTotal * 0.4 || total > baselineTotal * 3) {
    total = baselineTotal;
    parsed.total_estimate_min = Math.round(total * 0.92);
    parsed.total_estimate_max = Math.round(total * 1.08);
  }

  // Ensure every category has realistic Pakistani market values
  const minTile = Math.round(total * 0.08);
  const minPaint = Math.round(total * 0.04);
  const minDoorsWindows = Math.round(total * 0.06);
  const minElectrical = Math.round(total * 0.05);
  const minPlumbing = Math.round(total * 0.05);
  const minFinishing = Math.round(total * 0.06);
  const minFoundation = Math.round(total * 0.09);
  const minStructure = Math.round(total * 0.38);
  const minRoofing = Math.round(total * 0.05);
  const minLand = Math.round(total * 0.015);
  const minMisc = Math.round(total * 0.025);

  if (parsed.tiles_cost < minTile * 0.5) parsed.tiles_cost = Math.round(total * 0.095);
  if (parsed.paint_cost < minPaint * 0.5) parsed.paint_cost = Math.round(total * 0.048);
  if (parsed.doors_windows_cost < minDoorsWindows * 0.5) parsed.doors_windows_cost = Math.round(total * 0.068);
  if (parsed.electrical_cost < minElectrical * 0.5) parsed.electrical_cost = Math.round(total * 0.058);
  if (parsed.plumbing_cost < minPlumbing * 0.5) parsed.plumbing_cost = Math.round(total * 0.058);
  if (parsed.finishing_cost < minFinishing * 0.5) parsed.finishing_cost = Math.round(total * 0.07);
  if (parsed.foundation_cost < minFoundation * 0.5) parsed.foundation_cost = Math.round(total * 0.10);
  if (parsed.structure_cost < minStructure * 0.5) parsed.structure_cost = Math.round(total * 0.40);
  if (parsed.roofing_cost < minRoofing * 0.5) parsed.roofing_cost = Math.round(total * 0.055);
  if (parsed.land_preparation_cost < minLand * 0.5) parsed.land_preparation_cost = Math.round(total * 0.015);
  if (parsed.miscellaneous_cost < minMisc * 0.5) parsed.miscellaneous_cost = Math.round(total * 0.025);

  parsed.labour_cost = Math.round(total * 0.32);
  parsed.material_cost = Math.round(total * 0.68);

  if (typeof parsed.explanation !== 'string' || parsed.explanation.length < 10) {
    parsed.explanation = `Cost estimate generated based on regional construction averages for ${project?.city || 'Pakistan'} (covered area: ${coveredArea} sq ft at ~PKR ${ratePerSqft}/sq ft).`;
  }
  if (typeof parsed.timeline !== 'string' || parsed.timeline.length < 5) {
    const floors = Number(project?.floors) || 2;
    parsed.timeline = `${floors * 5}-${floors * 7} months for ${floors} floors`;
  }
  if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
    parsed.suggestions = [
      'Procure bulk steel and cement early during foundation to lock in wholesale rates.',
      'Select Grade-A Pakistani porcelain tiles (24x24) for optimal durability and cost balance.',
      'Install UPVC multi-chamber windows for thermal efficiency and long-term electricity savings.'
    ];
  }
  if (!Array.isArray(parsed.risk_factors) || parsed.risk_factors.length === 0) {
    parsed.risk_factors = [
      'Fluctuations in steel rebar and fuel transportation rates.',
      'Monsoon seasonal delays during excavation and foundation stages.'
    ];
  }
  if (typeof parsed.pricing_basis !== 'string') {
    parsed.pricing_basis = 'Estimate calibrated using 2025-2026 Pakistan Construction Industry Rates (C&W Dept & Market Averages).';
  }

  if (parsed.total_estimate_min > parsed.total_estimate_max) {
    const tmp = parsed.total_estimate_max;
    parsed.total_estimate_max = parsed.total_estimate_min;
    parsed.total_estimate_min = tmp;
  }

  if (parsed.confidence < 60 || parsed.confidence > 98) {
    parsed.confidence = 88;
  }

  // Calculate comparison against market ready-built houses
  const readyMarkup = 1.22; // ~22% developer & dealer markup on commercial ready-built houses in Pakistan
  const readyMin = Math.round(parsed.total_estimate_min * readyMarkup);
  const readyMax = Math.round(parsed.total_estimate_max * readyMarkup);
  const readyMidpoint = (readyMin + readyMax) / 2;
  const selfSavings = Math.round(readyMidpoint - total);
  const savingsPct = Math.round((selfSavings / readyMidpoint) * 100);

  const cityName = String(project?.city || 'Pakistan');
  parsed.built_house_comparison = {
    market_ready_house_est: readyMidpoint,
    self_build_savings: selfSavings,
    self_build_savings_percentage: savingsPct,
    comparison_note: `Building directly via BuildWise saves approx. PKR ${selfSavings.toLocaleString()} (~${savingsPct}%) compared to purchasing a developer-built ready house in ${cityName}, where developer profits (18-22%) and broker commissions are added.`
  };

  parsed.current_market_rates = {
    cement_bag_pkr: 'Rs. 1,390 – 1,460 / 50kg bag',
    steel_per_ton_pkr: 'Rs. 262,000 – 272,000 / ton (Grade-60)',
    bricks_per_thousand_pkr: cityName.toLowerCase().includes('karachi') ? 'Rs. 65 – 75 / block' : 'Rs. 13,800 – 15,200 / 1,000 bricks',
    sand_crush_per_cft_pkr: 'Sand: Rs. 58-75/cft | Crush: Rs. 120-140/cft',
    tiles_per_sqft_pkr: 'Rs. 230 – 350 / sq ft (Grade-A Porcelain)',
    labour_rate_per_sqft_pkr: 'Grey: Rs. 480-620/sqft | Turnkey: Rs. 980-1,280/sqft'
  };

  return parsed as Estimate;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ message: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const nvidiaKey = Deno.env.get('NVIDIA_API_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ message: 'Supabase environment is not fully configured.' }, 500);
  }
  if (!nvidiaKey) {
    return json({ message: 'NVIDIA_API_KEY secret is not set. Add it in the Supabase dashboard under Edge Function secrets.' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  // Use user JWT for all DB operations — no service role key needed
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ message: 'Authentication required.' }, 401);

  let body: { projectId?: string };
  try { body = await req.json(); } catch { return json({ message: 'Invalid request body.' }, 400); }
  const { projectId } = body;
  if (!projectId) return json({ message: 'projectId is required.' }, 400);

  const { data: project, error: projectError } = await userClient
    .from('projects').select('*').eq('id', projectId).single();
  if (projectError || !project) return json({ message: 'Project not found or access denied.' }, 404);

  const prompt = constructPrompt(project);
  let lastError = 'AI response could not be parsed.';

  const candidateModels = [
    'meta/llama-3.2-11b-vision-instruct',
    'deepseek-ai/deepseek-v4-flash-0731',
    'meta/llama-3.2-90b-vision-instruct'
  ];

  for (let attempt = 1; attempt <= candidateModels.length; attempt++) {
    const selectedModel = candidateModels[attempt - 1];
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nvidiaKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          temperature: 0.1,
          max_tokens: 1200,
          messages: [
            { role: 'system', content: 'You are a construction cost estimation AI. You return strict JSON only. No markdown. No explanation outside JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`NVIDIA API returned ${response.status}: ${errText.slice(0, 200)}`);
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || content.trim() === '') {
        throw new Error('NVIDIA API returned an empty response.');
      }

      const estimate = parseEstimate(content, project);

      // Write back using user's JWT (project row belongs to them, so RLS allows update)
      const { error: updateError } = await userClient
        .from('projects')
        .update({ ai_estimate_json: estimate, ai_error: null, ai_estimated_at: new Date().toISOString() })
        .eq('id', projectId);
      if (updateError) throw updateError;

      return json({ estimate });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  await userClient.from('projects').update({ ai_error: lastError }).eq('id', projectId);
  return json({
    message: 'The project was saved but the AI estimate could not be generated right now. Please retry in a moment.',
    details: lastError
  }, 502);
});
