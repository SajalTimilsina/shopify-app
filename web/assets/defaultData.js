import mongoose from "mongoose"

const defaultData = {
    customer: {
        _id: new mongoose.Types.ObjectId('66bd152c89a1d87a5e8aac85'),
        email: "default@gmail.com",
        firstName: "default",
        lastName: "customer",
        phone: "+1234567890",
        createdAt: "2025-01-30T21:01:23.000+00:00",
    },
    product: {
        _id: new mongoose.Types.ObjectId('67902d9bc91dee7e2cc765db'),
        lineItem: {
            variant: "",
        }
    }
}

export default defaultData;