import mongoose from "mongoose";
const { Schema, model } = mongoose;

const expensesSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Expense name is required'],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Expense amount is required'],
        min: [0, 'Expense amount must be positive'],
    },
    label: {
        type: String,
        required: [true, 'Label is required'],
    },
    percentage: {
        type: Number,
        validate: {
            validator: function(value) {
                return value >= 0 && value <= 100;
            },
            message: 'Percentage must be between 0 and 100',
        },
    },
    expensedDate: {
        type: Date,
        default: Date.now,
    },
});


const formulaItemSchema = new Schema({
    label: {
        type: String,
        required: [true, 'Label is required'],
    },
    percentage: {
        type: Number,
        required: [true, 'Percentage is required'],
        validate: {
            validator: function(value) {
                return value > 0 && value <= 100;
            },
            message: 'Percentage must be between 0 and 100',
        },
    },
    allocatedAmount: {
        type: Number,
        min: [0, 'Allocated amount cannot be negative'],
    }
});

const monthlyBudgetSchema = new Schema({
    userId: {
        required: [true, 'User ID is required'],
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    budgetTemplateId: {
        required: [true, 'Budget Template ID is required'],
        type: Schema.Types.ObjectId,
        ref: 'BudgetTemplate',
    },
    month: {
        type: Number,
        required: [true, 'Month is required'],
        validate: {
            validator: function(value) {
                return value >= 1 && value <= 12;
            },
            message: 'Month must be between 1 and 12',
        }
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        validate: {
            validator: function(value) {
                return value >= 2000 && value <= 2100;
            },
            message: 'Year must be between 2000 and 2100',
        }
    },
    totalIncome: {
        type: Number,
        required: [true, 'Total income is required'],
        min: [0, 'Total income must be positive'],
    },
    formula: [formulaItemSchema],
    expenses: [expensesSchema],
    status: {
        type: Boolean,
        default: true,
    },
    createdBy: String,
    updatedBy: String,
    deletedBy: String,
    deletedDate: Date,
},
{
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
});

// Calculate alloted amount before saving
monthlyBudgetSchema.pre('save', function(next) {
    if (this.formula && this.formula.length > 0 && this.totalIncome) {
        this.formula.forEach(item => {
            item.allocatedAmount = (item.percentage / 100) * this.totalIncome;
        });
    }
    next();
});

// Validate that percentage add up to 100
monthlyBudgetSchema.pre('save', function(next) {
    if (this.formula && this.formula.length > 0) {
        const totalPercentage = this.formula.reduce((sum, item) => sum + item.percentage, 0);

        if (Math.abs(totalPercentage - 100) > 0.01) {
            return next(new Error('Total percentage must equal 100'));
        }
    }
    next();
});

// Virtual for getting remaining budget of the month
monthlyBudgetSchema.virtual('remainingBudget').get(function() {
    const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return this.totalIncome - totalExpenses;
});

// Virtual for getting budget summary by label
monthlyBudgetSchema.virtual('budgetSummary').get(function() {
    const summary = {};

    // Initialize summary with all labels and their alloted amounts
    this.formula.forEach(item => {
        summary[item.label] = {
            allocated: item.allotedAmount || (item.percentage / 100) * this.totalIncome,
            spent: 0,
            remaining: item.allotedAmount || (item.percentage / 100) * this.totalIncome,
        };
    });

    // Add expenses to the summary
    this.expenses.forEach(expense => {
        if (summary[expense.label]) {
            summary[expense.label].spent += expense.amount;
            summary[expense.label].remaining -= expense.amount;
        }
    });

    return summary;
});

// Ensure unique combination of userId, month, and year
monthlyBudgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const MonthlyBudget = model('MonthlyBudget', monthlyBudgetSchema);
export default MonthlyBudget;