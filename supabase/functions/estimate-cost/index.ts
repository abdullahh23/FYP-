import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

type Estimate = {
  land_preparation_cost: number;
  structure_cost: number;
  electrical_cost: number;
  plumbing_cost: number;
  finishing_cost: number;
  total_estimate_min: number;
  total_estimate_max: number;
  explanation: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function constructPrompt(project: Record<string, unknown>) {
  return `You are BuildWise AI, a senior construction cost estimator for Pakistan.
Estimate construction cost in Pakistani Rupees (PKR) for this project.
Return only valid JSON with exactly these keys:
{
  "land_preparation_cost": number,
  "structure_cost": number,
  "electrical_cost": number,
  "plumbing_cost": number,
  "finishing_cost": number,
  "total_estimate_min": number,
  "total_estimate_max": number,
  "explanation": string
}
Project:
${JSON.stringify(project, null, 2)}
Rules:
- Use realistic 2026 Pakistan construction planning assumptions.
- Make total_estimate_min lower than total_estimate_max.
- Explanation must be concise and friendly.
- Do not include markdown or text outside JSON.`;
}

function parseEstimate(content: string): Estimate {
  const trimmed = content.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  const parsed = JSON.parse(trimmed.slice(start, end + 1));
  const required = ['land_preparation_cost', 'structure_cost', 'electrical_cost', 'plumbing_cost', 'finishing_cost', 'total_estimate_min', 'total_estimate_max', 'explanation'] as const;
  for (const key of required) {
    if (!(key in parsed)) throw new Error(`Missing ${key}`);
  }
  for (const key of required.slice(0, 7)) {
    if (typeof parsed[key] !== 'number' || !Number.isFinite(parsed[key])) throw new Error(`Invalid ${key}`);
  }
  if (typeof parsed.explanation !== 'string' || parsed.explanation.length < 10) throw new Error('Invalid explanation');
  if (parsed.total_estimate_min > parsed.total_estimate_max) {
    const min = parsed.total_estimate_max;
    parsed.total_estimate_max = parsed.total_estimate_min;
    parsed.total_estimate_min = min;
  }
  return parsed as Estimate;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ message: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const nvidiaKey = Deno.env.get('NVIDIA_API_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) return json({ message: 'Supabase function environment is incomplete.' }, 500);
  if (!nvidiaKey) return json({ message: 'NVIDIA_API_KEY is not configured.' }, 500);

  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ message: 'Authentication required.' }, 401);

  const { projectId } = await req.json().catch(() => ({ projectId: null }));
  if (!projectId) return json({ message: 'projectId is required.' }, 400);

  const { data: project, error: projectError } = await userClient.from('projects').select('*').eq('id', projectId).single();
  if (projectError || !project) return json({ message: 'Project not found or access denied.' }, 404);

  const prompt = constructPrompt(project);
  let lastError = 'AI response could not be parsed.';

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nvidiaKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          temperature: attempt === 1 ? 0.15 : 0,
          max_tokens: 900,
          messages: [
            { role: 'system', content: 'You return strict JSON only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) throw new Error(`NVIDIA NIM returned ${response.status}`);
      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') throw new Error('NVIDIA NIM returned an empty response.');
      const estimate = parseEstimate(content);

      const { error: updateError } = await adminClient
        .from('projects')
        .update({ ai_estimate_json: estimate, ai_error: null, ai_estimated_at: new Date().toISOString() })
        .eq('id', projectId);
      if (updateError) throw updateError;
      return json({ estimate });
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }

  await adminClient.from('projects').update({ ai_error: lastError }).eq('id', projectId);
  return json({ message: 'We saved the project, but the AI estimate could not be generated right now. Please retry in a moment.', details: lastError }, 502);
});
