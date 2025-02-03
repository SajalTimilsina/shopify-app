import mongoose from "mongoose";
import User from "../../models/userModels/User.js";
import Role from "../../models/userModels/Role.js";
import Organization from "../../models/userModels/Organization.js";


const getAllUser = async (req, res) => {

    try{
        console.log("### Get all users");
        const users = await User.find()
        .populate('organizationId', 'name address')
        .populate('roles', 'name permission');
        console.log("### Get all users: ", users);
        res.status(200).json({success: true, count: users.length, data: users});
    } catch(error){
        res.status(400).json({success: false, message: error.message});
    }
}

const getUserById = async (req, res) => {
    try{
        const {id} = req.params;

        const user = await User.findById(id)
        .populate('organizationId', 'name address')
        .populate('roles', 'name permission');
        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        }
        res.status(200).json({success: true, data: user});
    }  catch(error){
        res.status(400).json({success: false, message: error.message});
    }
}

const createUser = async (req, res) => {
    try{
        const {name, email, organizationId, roleId} = req.body;
        console.log(`req.body: ${JSON.stringify(req.body,null,2)}`);

        if(organizationId && roleId && !mongoose.Types.ObjectId.isValid(organizationId) && !mongoose.Types.ObjectId.isValid(roleId)){
            console.log("Invalid organization id or role id");
            return res.status(400).json({success: false, message: 'Invalid organization id or role id'});
        }

        const newUser = await new User({
            name: name,
            email: email,
            organizationId: organizationId,
            roles: roleId
        });

        console.log("### newUser created: ", newUser);

        await newUser.save();
        return res.status(201).json({success: true, message: "User created successfully !!!", data: newUser});
        
    } catch(error){
        console.log("Error: ", error);
        res.status(400).json({success: false, message: error.message || "User not created"});
    }
}

const updateUser = async (req, res) => {
    try{
        const {id} = req.params;
        const {name, email, organizationId, roles} = req.body;
        console.log(`req.body: ${JSON.stringify(req.body,null,2)}`);
        console.log(`######################################## Update User: ${id}, ${name}, ${email}, ${organizationId}, ${roles} ###`);

        if(organizationId &&roles && !mongoose.Types.ObjectId.isValid(organizationId) && !mongoose.Types.ObjectId.isValid(roles)){
            return res.status(400).json({success: false, message: 'Invalid organization id or role id'});
        }

        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        }

        console.log("*** User: ", user);
        if(name) user.name = name;
        if(email) user.email = email;

        // Update the organizationId if provided
        if(organizationId) {
            const organization = await Organization.findById(organizationId);
            if(!organization){
                return res.status(400).json({success: false, message: 'Organization not found'});
                }
                user.organizationId = organizationId;
            }

        // update the roleId if provided
        if(roles){
            const role = await Role.findById(roles);
            if(!role){
                return res.status(400).json({success: false, message: 'Role not found'});
            }
            user.roles = roles;
        }

        console.log("### User which is going to saved: ", user);
        await user.save();
        res.status(200).json({success: true, message: "User updated successfully", data: user});
    } catch(error){
        console.log("Error: ", error);
        res.status(400).json({success: false, message: error.message});
    }

}

const deleteUser = async (req, res) => {

    const {id} = req.params;

    try{
        const deleted = await User.findByIdAndDelete(id);
        if(!deleted){
            return res.status(404).json({success: false, message: 'User not found'});
        }
        res.json({success: true, message: "User deleted successfully"});
    } catch(error){
        res.status(400).json({success: false, message: error.message});
    }

}

const assignRole = async (req, res) => {

    const {id} = req.params;
    const {roles} = req.body; // array of the roles

    try{
        // find the user
        const user = await User.findById(id);
        // find the roles records match with the roles array
        const roleRecords = await Role.find({name: {$in: roles}});
        // assign the roles to the user
        user.roles = roleRecords.map(role => role._id);
        await user.save();
        res.json({success: true, message: "Role assigned successfully"});
    } catch(error){
        res.status(400).json({success: false, message: error.message});
    }

}

const getAllRole = async (req, res) => {
    try{
        const roles = await Role.find();
        if(!roles){
            return res.status(404).json({success: false, message: 'Roles not found', data: []});
        }
        res.status(200).json({success: true, message: 'Roles found', data: roles});
    } catch(error){
        res.status(400).json({success: false, message: error.message});
    }
}

const getAllOrganization = async(req, res) => {
    try{
        const organizations = await Organization.find();
        if(!organizations){
            return res.status(404).json({success: false, message: 'Organizations not found', data: []});
        }
        res.status(200).json({success: true, message: 'Organizations found', data: organizations});
    } catch(error){
        res.status(400).json({success: false, message: error.message});
    }
}

export {getAllUser, getAllRole, getAllOrganization, getUserById, createUser, updateUser, assignRole, deleteUser};