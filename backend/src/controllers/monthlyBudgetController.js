import MonthlyBudget from "../../src/models/MonthlyBudget.js";


// Create new monthly budget
export const createMonthlyBudget = async (req, res) => {
    try {
        const { month, year, totalIncome, formula, expenses } = req.body;
        const existingBudget = await MonthlyBudget.findOne({ month, year, userId: req.user.userId });
        if (existingBudget) {
            return res.status(400).json({ message: "Monthly budget for this month and year already exists" });
        }

        const monthlyBudget = new MonthlyBudget({
            month,
            year,
            totalIncome,
            formula,
            expenses,
            userId: req.user.userId,
            createdBy: req.user.username,
        });

        const savedBudget = await monthlyBudget.save();
        res.status(201).json({
            message: "Monthly budget created successfully",
            monthlyBudget: savedBudget,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

};

// Get all monthly budgets of a user
export const getAllMonthlyBudgets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const monthlyBudgets = await MonthlyBudget.find({ userId: req.user.userId })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-__v -userId")
            .lean();

        const totalBudgets = await MonthlyBudget.countDocuments({ userId: req.user.userId });
        res.json({
            monthlyBudgets,
            totalBudgets,
            totalPages: Math.ceil(totalBudgets / limit),
            currentPage: page,
        });
    }
    catch(error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get monthly budget by id
export const getMonthlyBudgetById = async (req, res) => {
    try {
        const monthlyBudget = await MonthlyBudget.findById(req.params.id)
            .select("-__v -userId")
            .lean();
        if (!monthlyBudget) {
            return res.status(404).json({ message: "Monthly budget not found" });
        }

        res.json(monthlyBudget);
    }
    catch(error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update monthly budget by id
export const updateMonthlyBudgetById = async (req, res) => {
    try {
        const { month, year, totalIncome, formula, expenses, status } = req.body;
        const monthlyBudget = await MonthlyBudget.findById(req.params.id);
        if (!monthlyBudget) {
            return res.status(404).json({ message: "Monthly budget not found" });
        }

        monthlyBudget.month = month !== undefined ? month : monthlyBudget.month;
        monthlyBudget.year = year !== undefined ? year : monthlyBudget.year;
        monthlyBudget.totalIncome = totalIncome !== undefined ? totalIncome : monthlyBudget.totalIncome;
        monthlyBudget.formula = formula !== undefined ? formula : monthlyBudget.formula;
        monthlyBudget.expenses = expenses !== undefined ? expenses : monthlyBudget.expenses;
        monthlyBudget.status = status !== undefined ? status : monthlyBudget.status;
        monthlyBudget.updatedBy = req.user.username;

        const updatedBudget = await monthlyBudget.save();
        res.json({
            message: "Monthly budget updated successfully",
            monthlyBudget: updatedBudget,
        });
    }
    catch(error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Soft delete monthly budget by id
export const softDeleteMonthlyBudgetById = async (req, res) => {
    try {
        const monthlyBudget = await MonthlyBudget.findById(req.params.id);
        if (!monthlyBudget) {
            return res.status(404).json({ message: "Monthly budget not found" });
        }

        monthlyBudget.deletedBy = req.user.username;
        monthlyBudget.deletedDate = new Date();
        monthlyBudget.status = false;

        await monthlyBudget.save();
        res.json({
            message: "Monthly budget deleted successfully",
        });
    }
    catch(error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};