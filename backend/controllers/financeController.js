import Finance from "../models/financeModel.js";

// Add or update finance data for user (per month)
export const addOrUpdateFinance = async (req, res) => {
  try {
    const { income, expenses, savings, date } = req.body;
    const userId = req.user._id;

    // Normalize date to month start
    const monthStart = new Date(date);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Check if finance data exists for this user & month
    let finance = await Finance.findOne({ userId, date: monthStart });

    if (finance) {
      finance.income = income;
      finance.expenses = expenses;
      finance.savings = savings;
      await finance.save();
    } else {
      finance = new Finance({
        userId,
        income,
        expenses,
        savings,
        date: monthStart,
      });
      await finance.save();
    }

    res.status(200).json({ message: "Finance data saved successfully", finance });
  } catch (error) {
    console.error("Error saving finance data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get finance data for logged-in user (all months)
export const getFinanceData = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await Finance.find({ userId }).sort({ date: 1 }); // oldest to newest

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching finance data:", error);
    res.status(500).json({ message: "Server error" });
  }
};
