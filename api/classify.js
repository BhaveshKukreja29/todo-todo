export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing GROQ_API_KEY' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are the bouncer of a meta-to-do list app called "todo-todo". Users can ONLY add tasks about managing their to-do list, NOT actual real-world tasks.

Examples of APPROVED meta-tasks:
- "Open to-do list app"
- "Add 5 tasks in list"
- "Add shopping as a to-do"
- "Mark 3rd task as done"
- "Reorganize my to-do list"
- "Delete completed tasks"

Examples of REJECTED real tasks:
- "Buy groceries"
- "Make tea"
- "Finish homework"
- "Call mom"
- "Clean the house"

Respond in EXACTLY this JSON format, nothing else:
{"approved": true/false, "roast": "your snarky one-liner here"}

If approved, the roast should be a passive-aggressive compliment.
If rejected, the roast should be a short, funny, snarky roast about how they tried to add a real task.
Keep roasts under 20 words. Be funny, and very mean.`
          },
          {
            role: 'user',
            content: `Classify this to-do: "${text}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
