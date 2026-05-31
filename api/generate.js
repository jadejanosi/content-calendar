export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { niche, stage, platform, frequency, goal } = req.body;

  const freqMap = {
    '1–2x/week': 10,
    '3–4x/week': 20,
    '5–7x/week': 30
  };
  const postCount = freqMap[frequency] || 20;

  const prompt = `You are a content strategist for digital product creators. Generate a personalized 30-day content calendar.

User profile:
- Niche: ${niche}
- Business stage: ${stage}
- Main platform: ${platform}
- Posting frequency: ${frequency}
- Primary goal: ${goal}

Generate exactly 30 days of content ideas. For each day create a content post even on "rest" days (just lighter content).

Respond ONLY with a valid JSON object in this exact format, no preamble, no markdown, no explanation:

{
  "calendar": [
    {
      "day": 1,
      "type": "CONTENT TYPE (e.g. Education, Story, Social Proof, Engagement, Sales, Behind the Scenes, Myth Bust, Inspiration)",
      "idea": "Specific content idea tailored to their niche and platform (1-2 sentences)",
      "hook": "A compelling opening hook for this post (1 sentence)"
    }
  ]
}

Rules:
- Make every idea specific to their niche (${niche}), not generic
- Vary the content types across the 30 days — mix education, story, engagement, sales, social proof
- Weight the types toward their goal: ${goal}
- Keep hooks punchy and scroll-stopping
- Tailor language and format suggestions to ${platform}
- Generate all 30 days, no skipping`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
