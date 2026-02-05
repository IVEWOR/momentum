import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const fetchAIAnalysis = async (data) => {
  const prompt = `
    Analyze this daily productivity data for a software engineer:
    Tasks: ${JSON.stringify(data.tasks)}
    Total Tasks: ${data.total}
    Completed: ${data.completed}
    
    Provide a JSON response with these keys:
    1. "summary": A concise paragraph on today's performance.
    2. "bias": Analysis of their time estimation bias (optimistic vs pessimistic).
    3. "advice": One specific, actionable tip for tomorrow.
    4. "pattern": Identify one behavioral pattern (e.g., "struggles with morning tasks").
  `;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are an elite productivity coach." },
      { role: "user", content: prompt },
    ],
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },
  });

  return completion.choices[0].message.content;
};
