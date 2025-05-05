import MonthlyBudget from "../../src/models/MonthlyBudget.js";
import BudgetTemplate from "../../src/models/BudgetTemplate.js";

// Create new monthly budget
export const createMonthlyBudget = async (req, res) => {
    try {
        const { budgetTemplateId, month, year, totalIncome, formula, expenses } = req.body;
        const monthlyBudget = await MonthlyBudget.findOne({ month, year, userId: req.user.userId });
        if (monthlyBudget) {
            return res.status(400).json({ message: "Monthly budget for this month and year already exists" });
        }

        const existingBudgetTemplate = await BudgetTemplate.findById(budgetTemplateId);
        if (!existingBudgetTemplate) {
            return res.status(400).json({ message: "Budget template not found" });
        }

        const newMonthlyBudget = new MonthlyBudget({
            budgetTemplateId,
            month,
            year,
            totalIncome,
            formula,
            expenses,
            userId: req.user.userId,
            createdBy: req.user.username,
        });

        const savedBudget = await newMonthlyBudget.save();
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
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;
      const status = req.query.status !== undefined ? req.query.status === "true" : null;
      const month = req.query.month ? parseInt(req.query.month) : null;
      const year = req.query.year ? parseInt(req.query.year) : null;

      const filter = {};

      if (status !== null) {
        filter.status = status;
      }

      if (req.user.role !== "admin") {
        filter.userId = req.user.userId;
      }

      // Add month filter if provided
      if (month !== null && month >= 1 && month <= 12) {
        filter.month = month;
      }

      // Add year filter if provided
      if (year !== null && year >= 2000 && year <= 2100) {
        filter.year = year;
      }

      // Add search filter for text fields
      if (search) {
        // Use $or to search across multiple fields
        // We'll populate budgetTemplateId to search by template name
        filter = {
          ...filter,
          $or: [{ "expenses.name": { $regex: search, $options: "i" } }, { createdBy: { $regex: search, $options: "i" } }],
        };
      }

      const monthlyBudgets = await MonthlyBudget.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("budgetTemplateId", "templateName")
        .select("-__v")
        .lean();

      const totalBudgets = await MonthlyBudget.countDocuments(filter);
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
        const { budgetTemplateId, month, year, totalIncome, formula, expenses, status } = req.body;
        const monthlyBudget = await MonthlyBudget.findById(req.params.id);
        if (!monthlyBudget) {
            return res.status(404).json({ message: "Monthly budget not found" });
        }

        const duplicateBudget = await MonthlyBudget.findOne({
            userId: req.user.userId,
            month,
            year,
            _id: { $ne: req.params.id },
        });
        if (duplicateBudget) {
            return res.status(400).json({ message: "Monthly budget for this month and year already exists" });
        }

        if (budgetTemplateId) {
            const existingBudgetTemplate = await BudgetTemplate.findById(budgetTemplateId);
            if (!existingBudgetTemplate) {
                return res.status(400).json({ message: "Budget template not found" });
            }
            monthlyBudget.budgetTemplateId = budgetTemplateId; // Update directly
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