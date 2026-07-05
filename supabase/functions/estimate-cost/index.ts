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
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function constructPrompt(project: Record<string, unknown>) {
  return `You are BuildWise AI, a senior construction cost estimator specialising in Pakistan residential and commercial construction.
Generate a detailed, professional construction cost estimate in Pakistani Rupees (PKR) for the project below.
Use realistic 2025-2026 regional cost averages for Pakistan.
If live market data is unavailable, clearly indicate: "This estimate is based on regional construction cost averages for Pakistan."

Return ONLY valid JSON with EXACTLY these keys (no markdown, no extra text):
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
}

Rules:
- All cost values must be realistic positive numbers in PKR.
- total_estimate_min must be <= total_estimate_max.
- total_estimate_min and total_estimate_max must roughly equal the sum of all cost line items (with a +/-10% buffer).
- confidence must be between 0 and 100.
- explanation must be at least 100 characters explaining the breakdown methodology.
- pricing_basis must state the data source or clearly say "This estimate is based on regional construction cost averages for Pakistan."
- timeline must describe the construction duration in plain English (e.g., "12-18 months for 2 floors").
- suggestions must be an array of at least 3 actionable cost-saving or quality tips.
- risk_factors must be an array of at least 2 potential construction risks for this project.
- Do NOT include markdown, code fences, or any text outside the JSON object.

Project details:
${JSON.stringify(project, null, 2)}`;
}

function parseEstimate(content: string): Estimate {
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

  if (typeof parsed.explanation !== 'string' || parsed.explanation.length < 10) {
    parsed.explanation = 'Cost estimate generated based on regional construction averages for Pakistan.';
  }
  if (typeof parsed.timeline !== 'string') parsed.timeline = 'Timeline not specified.';
  if (!Array.isArray(parsed.suggestions)) parsed.suggestions = [];
  if (typeof parsed.material_quality_recommendation !== 'string') parsed.material_quality_recommendation = '';
  if (!Array.isArray(parsed.risk_factors)) parsed.risk_factors = [];
  if (typeof parsed.pricing_basis !== 'string') {
    parsed.pricing_basis = 'This estimate is based on regional construction cost averages for Pakistan.';
  }

  if (parsed.total_estimate_min > parsed.total_estimate_max) {
    const tmp = parsed.total_estimate_max;
    parsed.total_estimate_max = parsed.total_estimate_min;
    parsed.total_estimate_min = tmp;
  }

  // Fallback: if totals are zero, sum line items
  if (parsed.total_estimate_min === 0 && parsed.total_estimate_max === 0) {
    const lineSum = numericKeys
      .filter((k) => !['total_estimate_min', 'total_estimate_max', 'confidence'].includes(k))
      .reduce((acc, k) => acc + (parsed[k] as number), 0);
    parsed.total_estimate_min = Math.round(lineSum * 0.9);
    parsed.total_estimate_max = Math.round(lineSum * 1.1);
  }

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

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nvidiaKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          temperature: attempt === 1 ? 0.1 : attempt === 2 ? 0 : 0.2,
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

      const estimate = parseEstimate(content);

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
