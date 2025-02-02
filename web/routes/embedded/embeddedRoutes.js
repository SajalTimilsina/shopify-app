import express from 'express';
const router = express.Router();
//import {createRole, getRoles, getRole, updateRole, deleteRole} from '../../controllers/embedded/roleController.js';
import { authorize} from "../../middleware/authMidleware.js"; // can use authorization also
import { getAllUser, getAllRole, getAllOrganization, getUserById, createUser, updateUser, deleteUser, assignRole, } from '../../controllers/embedded/userController.js';
import Organization from '../../models/userModels/Organization.js';
import permission from '../../models/userModels/Permission.js';


// router
//     .route('/')
//     .post(authorize('Admin'), createRole)
//     .get(authorize('Admin'), getRoles);

// router
//     .route('/:id')
//     .get(authorize('Admin'), getRole)
//     .put(authorize('Admin'), updateRole)
//     .delete(authorize('Admin'), deleteRole);

router
    .route('/users')
    .get(authorize(['view_user']), getAllUser)
    .post(authorize(['create_user']), createUser);

router
    .route('/users/:id')
    .get(authorize(['view_user']), getUserById)
    .post(authorize(['update_user']), updateUser)
    .delete(authorize(['delete_user']), deleteUser);
router
    .route('/users/:id/roles')
    .post(authorize(['update_user']), assignRole);

router
    .route('/roles')
    .get(authorize(['view_role']), getAllRole);

router
    .route('/organizations')
    .get(authorize(['view_organization']), getAllOrganization);



export default router;