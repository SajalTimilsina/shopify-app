// import Role from "../../models/roleModel.js";

// // @desc    Create a new role
// // @route   POST /api/roles
// // @access  Private/Admin
// export const createRole  = async (req, res) => {
//     try{
//         const {name, permission} = req.body;

//         const roleExists = await Role.findOne({name});
//         if(roleExists){
//             return res.status(400).json({success: false, message: 'Role already exists.'});
//         }
//         const role = await Role.create({name, permission});

//         res.status(201).json({success: true, data: role});
//     } catch (error){
//         res.status(400).json({success: false, message: error.message});
//     }
// }

// // @desc    Create all role
// // @route   GET /api/roles
// // @access  Private/Admin
// export const getRoles = async (req, res) => {
//     try{
//         const roles = await Role.find();
//         res.status(200).json({success: true, count: roles.length, data: roles});
//     } catch(error){
//         res.status(400).json({success: false, message: error.message});
//     }

// }

// // @desc   Get single role
// // @route  GET /api/roles/:id
// // @access Private/Admin
// export const getRole = async (req, res) => {
//     try{
//         const id = req.params.id;

//         const role = await Role.findById(id);

//         if(!role){
//             return res.status(404).json({success: false, message: 'Role not found'})
//         }
//         res.status(200).json({success: true, data: role});
//     } catch(error){
//         res.status(400).json({success: false, message: error.message});
//     }

// }
// // @desc   Update a role
// // @route  PUT /api/roles/:id
// // @access Private/Admin

// export const updateRole = async (req, res) => {
//     try{
//         const id = req.params.id;
//         const {name, permission} = req.body;

//         let role = await Role.findById(id);

//         if(!role){
//             return res.status(404).json({success: false, message: 'Role not found'});
//         }

//         role.name = name || role.name;
//         role.permission = permission || role.permission;
//         await role.save();

//         res.status(200).json({success: true, data: role});

//     } catch(error){
//         res.status(400).json({success: false, message: error.message});
//     }

// }

// // @desc    Delete role
// // @route   DELETE /api/roles/:id
// // @access  Private/Admin
// export const deleteRole = async (req, res) => {
//     try{
//         const id = req.params.id;

//         const role = await Role.findById(id);

//         if(!role){
//             return res.status(404).json({success: false, message: 'Role not found'});
//         }

//         await role.remove();

//         res.status(200).json({success: true, message: 'Role deleted'});

//     } catch(error){
//         res.status(400).json({success: false, message: error.message});
//     }
// }