import mongoose from "mongoose";
const { Schema, model } = mongoose;


const formulaItemSchema = new Schema({
    label: {
        type: String,
        required: [true, 'Label is required'],
        trim: true,
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
});


const budgetTemplateSchema = new Schema({
    templateName: {
        type: String,
        unique: true,
        required: [true, 'Template name is required'],
        minlength: [3, 'Template name must be at least 3 characters long'],
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    formula: [formulaItemSchema],
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

// Validate that percentage add up to 100
budgetTemplateSchema.pre('save', function(next) {
    if (this.formula && this.formula.length > 0) {
        const totalPercentage = this.formula.reduce((sum, item) => sum + item.percentage, 0);

        if (Math.abs(totalPercentage - 100) > 0.01) {
            return next(new Error('Total percentage must equal 100'));
        }
    }
    next();
});

// Ensure unique combination of userId and templateName
budgetTemplateSchema.index({ userId: 1, templateName: 1 }, { unique: true });

const BudgetTemplate = model('BudgetTemplate', budgetTemplateSchema);
export default BudgetTemplate;