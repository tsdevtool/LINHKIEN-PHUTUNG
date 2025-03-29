import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
        deleted_at: {
            type: Date,
            default: null
        }
    }, { versionKey: false },
    { collection: "roles" }
);

export const Role = mongoose.model('Role', RoleSchema);
