// This service will later connect to FastAPI backend with LLM
// Currently returning mock responses

export const parseExpenseText = (text) => {
  // Mock parsing logic
  const lowerText = text.toLowerCase();
  
  let amount = '';
  const amountMatch = text.match(/₹\s*(\d+)/);
  if (amountMatch) {
    amount = amountMatch[1];
  } else if (text.match(/\b(\d+)\s*(?:rs|rupees?)?/i)) {
    const match = text.match(/\b(\d+)\s*(?:rs|rupees?)?/i);
    if (match) amount = match[1];
  } else {
    amount = '0';
  }

  let category = 'Other';
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education'];
  for (const cat of categories) {
    if (lowerText.includes(cat.toLowerCase())) {
      category = cat;
      break;
    }
  }

  // Try to extract description
  let description = text;
  if (amountMatch) {
    description = text.replace(amountMatch[0], '').trim();
  } else if (text.match(/\b\d+\s*(?:rs|rupees?)?/i)) {
    const match = text.match(/\b\d+\s*(?:rs|rupees?)?/i);
    if (match) {
      description = text.replace(match[0], '').trim();
    }
  }
  
  // Clean up description
  description = description.replace(/^(?:spent|paid|on|for)\s*/i, '').trim();
  description = description.replace(/yesterday|today|last\s+(?:night|week)/i, '').trim();
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return {
    amount: parseFloat(amount) || 0,
    category,
    description: description || 'Uncategorized expense',
    date: new Date().toISOString().split('T')[0]
  };
};

export const getAIInsights = (transactions) => {
  // Mock insights based on transaction data
  const insights = [];
  
  // Calculate expense totals by category
  const categoryTotals = {};
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  let totalExpenses = 0;
  let totalIncome = 0;
  let foodSpending = 0;
  let previousMonthFood = 0;
  
  transactions.forEach(t => {
    if (t.type === 'expense') {
      totalExpenses += parseFloat(t.amount);
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
      
      const date = new Date(t.date);
      if (t.category === 'Food') {
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          foodSpending += parseFloat(t.amount);
        } else if (date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear) {
          previousMonthFood += parseFloat(t.amount);
        }
      }
    } else if (t.type === 'income') {
      totalIncome += parseFloat(t.amount);
    }
  });

  // Category insights
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    insights.push({
      type: 'spending',
      message: `${topCategory} is your highest spending category at ₹${topAmount.toLocaleString()}.`
    });
    
    if (sortedCategories.length > 1) {
      const [secondCategory, secondAmount] = sortedCategories[1];
      insights.push({
        type: 'spending',
        message: `${secondCategory} is your second-highest expense category at ₹${secondAmount.toLocaleString()}.`
      });
    }
  }

  // Food spending trend
  if (foodSpending > 0 && previousMonthFood > 0) {
    const change = ((foodSpending - previousMonthFood) / previousMonthFood * 100);
    if (Math.abs(change) > 10) {
      const direction = change > 0 ? 'increased' : 'decreased';
      insights.push({
        type: 'trend',
        message: `Your food expenses ${direction} by ${Math.abs(change).toFixed(0)}% compared with last month.`
      });
    }
  }

  // Savings insight
  const savings = totalIncome - totalExpenses;
  if (savings > 0) {
    const savingsRate = (savings / totalIncome * 100);
    if (savingsRate > 20) {
      insights.push({
        type: 'positive',
        message: `Great job! You're saving ${savingsRate.toFixed(0)}% of your income.`
      });
    } else if (savingsRate < 10) {
      insights.push({
        type: 'warning',
        message: `Your savings rate is ${savingsRate.toFixed(0)}%. Consider reducing expenses.`
      });
    }
  } else {
    insights.push({
      type: 'warning',
      message: 'Your expenses exceed your income. Consider creating a budget.'
    });
  }

  // Add a general insight if we don't have many
  if (insights.length < 3) {
    insights.push({
      type: 'general',
      message: 'Track your spending regularly to stay on top of your finances.'
    });
  }

  return insights;
};

export const getChatResponse = (message) => {
  // Mock chat responses
  const responses = [
    "Based on your spending pattern, you're spending most on food and shopping. Consider setting a monthly budget for these categories.",
    "Your savings have improved this month! Keep up the good work by maintaining your current spending habits.",
    "I notice you have several recurring bills. Setting up automatic payments could help you avoid late fees.",
    "You could save more by reducing your dining out expenses. Try cooking at home more often.",
    "Your transportation costs seem high. Consider carpooling or using public transport to reduce expenses.",
    "You're doing well with your savings goals. Consider investing your surplus funds for better returns."
  ];
  
  // Simple keyword matching for better responses
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('spend') || lowerMessage.includes('spending')) {
    return "Your top spending categories are Food and Shopping. You could save more by reducing dining out and unnecessary purchases.";
  } else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return "You're currently saving about 15% of your income. Great job! To save more, try reducing discretionary spending.";
  } else if (lowerMessage.includes('budget')) {
    return "Based on your spending, I'd recommend setting a monthly budget of ₹15,000 for food and ₹5,000 for entertainment.";
  } else if (lowerMessage.includes('invest')) {
    return "Consider investing your savings in mutual funds or fixed deposits for better returns.";
  } else if (lowerMessage.includes('debt')) {
    return "Focus on paying off high-interest debt first. Consider consolidating loans for better interest rates.";
  } else if (lowerMessage.includes('goal')) {
    return "Your savings goal is achievable! You're on track to reach it in about 6 months at your current saving rate.";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};