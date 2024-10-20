const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    address: String,
    addressLowCase: String,
    index: Number,
    projects: [{
        project_id: String,
        project_name: String,
        added_at: { type: Date, default: Date.now },
        metrics: { points: String, last_updated: { type: Date, default: Date.now } }
    }],
    balances: {
        type: Map,
        of: {
            balance: { type: Map, of: Number },
            added_at: { type: Date, default: Date.now },
            last_updated: { type: Date, default: Date.now }
        }
    }
}, { _id: true, strict: false });

walletSchema.index({ address: 1 });
walletSchema.index({ addressLowCase: 1 });
walletSchema.index({ 'projects.project_name': 1 });

const logSchema = new mongoose.Schema({
    index: Number,
    wallet: String,
    project_name: String,
    level: String,
    action: String,
    message: String,
    stack_trace: String,
    date: { type: Date, default: Date.now, index: { expires: '90d' } }
}, { _id: true });

logSchema.index({ project_name: 1 });
logSchema.index({ wallet: 1 });
logSchema.index({ level: 1 });
logSchema.index({ date: 1 });

const projectSchema = new mongoose.Schema({
    name: String,
    wallet_ids: [String],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { _id: true });

projectSchema.index({ name: 1 });

module.exports = {
    walletSchema,
    logSchema,
    projectSchema
};
