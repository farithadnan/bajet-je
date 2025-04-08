
import BudgetTemplate from "../../src/models/BudgetTemplate.js";

// Create new template
export const createBudgetTemplate = async (req, res) => {
    try {
        const { templateName, formula } = req.body;
        const existingTemplate = await BudgetTemplate.findOne({ templateName });
        if (existingTemplate) {
            return res.status(400).json({ message: "Template name already exists" });
        }

        const budgetTemplate = new BudgetTemplate({
            templateName,
            formula,
            userId: req.user.userId,
            createdBy: req.user.username,
        });

        const savedTemplate = await budgetTemplate.save();
        res.status(201).json({
            message: "Budget template created successfully",
            budgetTemplate: savedTemplate,
        });

    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all templates
export const getAllBudgetTemplates = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const budgetTemplates = await BudgetTemplate.find({ userId: req.user.userId })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-__v -userId")
            .lean();

        const totalTemplates = await BudgetTemplate.countDocuments({ userId: req.user.userId });
        res.json({
            budgetTemplates,
            totalTemplates,
            totalPages: Math.ceil(totalTemplates / limit),
            currentPage: page,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get template by id
export const getBudgetTemplateById = async (req, res) => {
    try {
        const budgetTemplate = await BudgetTemplate.findById(req.params.id)
            .select("-__v -userId")
            .lean();

        if (!budgetTemplate) {
            return res.status(404).json({ message: "Budget template not found" });
        }

        res.json(budgetTemplate);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update template by id
export const updateBudgetTemplateById = async (req, res) => {
    try {
        const { templateName, formula, status } = req.body;
        const budgetTemplate = await BudgetTemplate.findById(req.params.id);

        if (!budgetTemplate) {
            return res.status(404).json({ message: "Budget template not found" });
        }

        budgetTemplate.templateName = templateName !== undefined ? templateName : budgetTemplate.templateName;
        budgetTemplate.formula = formula !== undefined ? formula : budgetTemplate.formula;
        budgetTemplate.updatedBy = req.user.username;
        budgetTemplate.status = status !== undefined ? status : budgetTemplate.status;

        const updatedTemplate = await budgetTemplate.save();
        res.json({
            message: "Budget template updated successfully",
            budgetTemplate: updatedTemplate,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Soft delete template by id
export const softDeleteBudgetTemplateById = async (req, res) => {
    try {
        const budgetTemplate = await BudgetTemplate.findById(req.params.id);

        if (!budgetTemplate) {
            return res.status(404).json({ message: "Budget template not found" });
        }

        budgetTemplate.status = false;
        budgetTemplate.deletedBy = req.user.username;
        budgetTemplate.deletedDate = new Date();

        await budgetTemplate.save();
        res.status(200).json({
            message: "Budget template deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};