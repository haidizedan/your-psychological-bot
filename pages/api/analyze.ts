import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { message, userLocation, sessionMode } = req.body;

  const basePrompt = `
You are a highly empathetic licensed clinical psychologist and emotional coach.

Your role:

- Always prioritize emotional connection first.
- Respond warmly, naturally, and with deep empathy like a human therapist.
- Keep your responses reasonably short (around 4-8 sentences), unless the user explicitly writes a very long message.
- Focus first on validating the user's emotions, then gently offer thoughtful reflections.
- If suitable, briefly suggest a next emotional step, but avoid overwhelming the user with too much advice.
- Use a natural, flowing tone that matches the user's style or dialect if detectable (e.g., Egyptian Arabic, Gulf Arabic).
- If crisis/self-harm signs are detected, kindly recommend contacting mental health services in ${userLocation}.

Never sound robotic, overly academic, or excessively wordy.
Your primary goal is to feel emotionally connected to the user.

User Input:
"""${message}"""
`;

  const sessionPrompt = `
You are conducting a structured 5-step guided therapy session.

Based on the user's cumulative responses:

1. Summarize their main emotional concerns and cognitive patterns.
2. Identify their emotional coping style and emotional strengths.
3. Highlight any emotional blind spots or areas needing support.
4. Suggest a personalized emotional growth plan (habits, reflections, daily actions).
5. Recommend the best therapeutic path or self-care practices.

End with a personalized reflective question encouraging further exploration.

User Session Data:
"""${message}"""
`;

  const selectedPrompt = sessionMode ? sessionPrompt : basePrompt;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: selectedPrompt }],
        temperature: 0.75,
      }),
    });

    const data = await response.json();
    console.log("🔍 OpenAI RAW Response:", JSON.stringify(data, null, 2));

    const reply = data?.choices?.[0]?.message?.content || "Sorry, unable to generate analysis.";
    res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
