import React, {useState, useEffect} from 'react';
import {useAuthenticatedFetch} from '../../hooks/useAuthenticatedFetch';
import EditUserModal from './EditUserModal';
import CreateUserModal from './CreateUserModal';
import './AdminUserManagement.css'; // Optional: For styling
import { set } from 'lodash';


const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [rolesOptions, setRolesOptions] = useState([]);
    const [organizationsData, setOrganizationsData] = useState([]);

    const fetch = useAuthenticatedFetch();

    // Fetch data from the server
    const fetchData = async (url, payload=null, method= 'GET') => {
        console.log("Fetching data from: ", url);
            try{
                let response;
                console.log(`This is my payload:  ${payload}`);
                if(payload){
                    console.log(" ------------------------ doing payload call ------");
                    response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch(url);
                }
            
            if(!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch ${url}`);
            }
            
            const data = await response.json();
            return data;
        } catch(error){
            console.log("Error: ", error); 
            return null;
        }
    }

    //setRoles(fetchData('/api/roles'));
    const loadUsers = async () => {
        const usersData = await fetchData('/api/users');
        if(usersData){
            console.log("Users: ", usersData.data);
            setUsers(usersData.data);
        }
    }

    const loadRoles = async () => {
        const rolesData = await fetchData('/api/roles');
        if(rolesData){
            console.log("Roles Data: ", rolesData);
            setRolesOptions(rolesData);
        }
    }

    const loadOrganization = async() => {
        const organizationsData = await fetchData('/api/organizations')
        if(organizationsData){
            console.log("Organizations Data: ", organizationsData);
            setOrganizationsData(organizationsData);
        }
    }
    

    useEffect(() => {
        loadUsers();
        loadOrganization();
        loadRoles();

    },[]);

    const openEditModal = (user) => {
        setSelectedUser(user);
    }

    const handleDeleteUser = async (userId) => {
        console.log("Deleting user: ", userId);
        const deleteUser = await fetchData(`/api/users/${userId}`, {}, 'DELETE')
        if(deleteUser){
            console.log("User deleted successfully", deleteUser);
            setSuccessMsg('User deleted successfully');
            loadUsers();
        }
    }

    //Handle closing the edit modal
    const closeEditModal = () => {
        setSelectedUser(null);
        setShowCreateUserModal(false);
    }

    //handle updating user
    const handleUpdateUser = async (updateUser) => {
        console.log("######: Updating user: ", updateUser);
        const updateUserDetails = await fetchData(`/api/users/${updateUser._id}`, updateUser, 'POST');
        console.log("**** Update User Details: ", updateUserDetails);
        if(updateUserDetails){
            setSuccessMsg('User updated successfully');
            closeEditModal();
            loadUsers();
        }
    };

    const handleCreateUser = async (newUser) => {
        console.log("Creating new user: ", newUser);
        const createUser = await fetchData('/api/users', newUser, 'POST');
        if(createUser){
            console.log("User created successfully", createUser);
            setSuccessMsg('User created successfully');
            loadUsers();
        }
    }

    return(
        <div className="admin-user-management">
            <button onClick={() => setShowCreateUserModal(true)}>Create User</button>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Organization</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.map(user => (
                        <tr key={user._id || 'NA'}>
                            <td>{user.name || 'NA'}</td>
                            <td>{user.organizationId.name || 'NA'}</td>
                            <td>{user.roles.name || 'NA'}</td>
                            <td>
                            <button onClick={() => openEditModal(user)} className="action-btn">⚙️</button>
                            <button onClick={() => handleDeleteUser(user._id)} className="action-btn delete-btn">🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* editable modal */}
            {selectedUser && (
                
                <EditUserModal user={selectedUser} onClose={closeEditModal} onUpdate={handleUpdateUser}/>
               
            )}

            {/* Create add new User Modal */}

            {
                showCreateUserModal && (
                    <CreateUserModal onClose={closeEditModal} onCreate={handleCreateUser} organizationsData={organizationsData} rolesOptions={rolesOptions}/>
                    
                )
            }

        </div>
    )
}

export default AdminUserManagement;
