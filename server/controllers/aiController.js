const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Parse a natural language expense description using Gemini AI.
 * Extracts: product, amount, date, category
 */
const parseExpense = async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: 'Text input is required' });
  }

  // Always use IST (Indian Standard Time) for today's date
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // gives YYYY-MM-DD in IST

  const prompt = `
You are an expense parsing assistant. Extract expense details from the user's natural language input.

Today's date is: ${today}

User input: "${text}"

Extract the following fields and return ONLY valid JSON (no markdown, no explanation):
{
  "product": "name of the item or service purchased",
  "amount": numeric_value_only (no currency symbol, just number),
  "date": "YYYY-MM-DD format (use today ${today} if date is unclear or missing)",
  "category": "one of: Food, Travel, Bills, Shopping, Entertainment, Health, Education, Other"
}

Rules:
- If amount is not mentioned, set amount to 0
- If product is unclear, make your best guess from context
- For category, classify based on the product/service intelligently
- Return ONLY the JSON object, nothing else
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Strip markdown code blocks if Gemini wraps it
    const cleaned = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(422).json({
        message: 'AI could not parse the expense. Please try again with more details.',
        raw: responseText,
      });
    }

    // Validate and sanitize
    const sanitized = {
      product: String(parsed.product || 'Unknown Item').trim(),
      amount: parseFloat(parsed.amount) || 0,
      date: parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : today,
      category: [
        'Food', 'Travel', 'Bills', 'Shopping',
        'Entertainment', 'Health', 'Education', 'Other',
      ].includes(parsed.category)
        ? parsed.category
        : 'Other',
    };

    return res.json({ success: true, data: sanitized });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return res.status(500).json({
      message: 'AI service error. Please check your API key.',
      error: err.message,
    });
  }
};

module.exports = { parseExpense };
