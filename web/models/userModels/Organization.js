import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
    {
        name : {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxLength: [50, 'Role name cannot exceed 50 Characters.']
        },
        address: {
            type: String,
        },
    },
{
    timestamps: true,
});

export default mongoose.model.Organization || mongoose.model("Organization", OrganizationSchema);