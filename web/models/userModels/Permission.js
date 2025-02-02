import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema({
    name: {
        type: String,
        requried: [true, 'Please add a permission name.'],
        unique: true,
        trim: true,

    },
    description: {
        type: String,
        required: true,
    },

},
{
    timestamps: true,
});

export default mongoose.model.Permission || mongoose.model("Permission", PermissionSchema);