import { Budget } from '../models/Budget';
import { User } from '../models/User';
import { getTransactions } from './transactionService';

export const getChatResponse = async (userId: string, messages: Array<{ role: string; content: string }>) => {
    // 1. Fetch user profile and data for context
    const user = await User.findById(userId);
    const country = user?.country || 'United States';
    const currency = user?.currency || 'USD';
    const monthlyIncome = user?.monthlyIncome || 0;

    const transactions = await getTransactions(userId);

    const budgets = await Budget.find({ userId });

    // Format transactions context
    const txSummary = transactions.slice(0, 100).map(tx => ({
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description,
      date: tx.date.toISOString().split('T')[0]
    }));

    // Format budget context
    const budgetSummary = budgets.map(b => ({
      category: b.category,
      limit: b.limit,
      month: b.month,
      year: b.year
    }));

    // Calculate basic stats for the prompt
    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpending: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      }
    });

    const apiKey = process.env.OPEN_ROUTER_API_KEY;

    if (!apiKey) {
      // Mock Response when API Key is missing
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      let mockReply = `Hello! I am SaveUp, your financial assistant. Currently, the \`OPEN_ROUTER_API_KEY\` environment variable is not configured on the backend server. 
      
To activate me fully, please add your key to the backend \`.env\` file:
\`\`\`env
OPEN_ROUTER_API_KEY=your_open_router_key_here
\`\`\`

Here is a summary of your financial data that I will be able to analyze:
- **Total Income tracked**: $${totalIncome.toFixed(2)}
- **Total Expenses tracked**: $${totalExpenses.toFixed(2)}
- **Net Balance**: $${(totalIncome - totalExpenses).toFixed(2)}
- **Budgets Set**: ${budgets.length > 0 ? budgets.map(b => `${b.category} ($${b.limit})`).join(', ') : 'None'}

Please configure the API key, and I will be ready to give you smart recommendations, analyze trends, and help you save money!`;

      // Simulating minor intelligence for preview
      if (lastUserMessage.toLowerCase().includes('spend') || lastUserMessage.toLowerCase().includes('expense')) {
        const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
          mockReply += `\n\n*(Preview)*: I see you've spent the most on **${topCategory[0]}** ($${topCategory[1].toFixed(2)}).`;
        }
      }

      return { message: mockReply };
    }

    // 2. Build system instruction with context
    const systemPrompt = `You are SaveUp, a professional, highly skilled personal finance AI advisor. 
You analyze the user's financial data and answer questions accurately, providing helpful, actionable advice.

Here is the user's profile and actual financial data:
- User Profile:
  * Country of Residence: ${country}
  * Monthly Income: ${currency} ${monthlyIncome.toFixed(2)}
  * Preferred Currency: ${currency}

- Current overall totals:
  * Total Income: ${currency} ${totalIncome.toFixed(2)}
  * Total Expenses: ${currency} ${totalExpenses.toFixed(2)}
  * Current Net Savings: ${currency} ${(totalIncome - totalExpenses).toFixed(2)}

- Budget Configurations:
${budgets.length > 0 ? JSON.stringify(budgetSummary, null, 2) : 'No budget limits configured.'}

- Category-wise Spending:
${JSON.stringify(categorySpending, null, 2)}

- Recent Transactions List (up to 100):
${JSON.stringify(txSummary, null, 2)}

Instructions:
1. Provide personalized advice based on this user's transactions, budgets, country of residence (${country}), and overall monthly income (${currency} ${monthlyIncome.toFixed(2)}).
2. If they ask for financial advice (e.g., how to improve themselves, save money, or optimize spending), tailor your response specifically to their country of residence (${country}) context—mentioning standard local savings accounts, local tax-advantaged tools, cost of living context in ${country}, or other local strategies—and their monthly income (${currency} ${monthlyIncome.toFixed(2)}).
3. If they ask normal questions unrelated to their financial services or personal finance (e.g., general knowledge, recipes, programming, coding, math, weather, or general assistance), respond normally, politely, and comprehensively as a general assistant, without forcing financial advice.
4. If spending exceeds a budget limit, alert the user and suggest saving strategies.
5. Be professional, direct, clear, and encouraging. Use formatting (bullet points, bold text, headings) to make reports readable.
6. All currency units in your responses should be formatted nicely using their preferred currency (${currency}).`;

    const apiBody = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/ChaitanyaEmani/saveup',
        'X-Title': 'SaveUp Financial AI Assistant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API responded with code ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as any;
    const assistantMessage = data.choices?.[0]?.message?.content || 'No response from model.';

    return { message: assistantMessage };
};
