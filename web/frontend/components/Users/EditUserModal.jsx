{/* <EditUserModal user={selectedUser} roles={roles} onClose={closeEditModal} onUpdate={handleUpdateUser}/> */}
import React, {useState, useEffect} from 'react';
import {useAuthenticatedFetch} from '../../hooks/useAuthenticatedFetch';
import './EditUserModal.css'; // Optional: For styling
import { set } from 'lodash';
import Organization from '../../../models/userModels/Organization';

const EditUserModal = ({user, onClose, onUpdate}) => {
    const fetch = useAuthenticatedFetch();
    const [formData, setFormData] = useState({
        _id: user._id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId._id,
        roles: user.roles._id,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rolesOptions, setRolesOptions] = useState([]);
    const [organizationsData, setOrganizationsData] = useState([]);

    const handleChange = (e) => {
        console.log("### Handle Change ###");
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("### Handle Submit ###");
        setLoading(true);
        try{
            await onUpdate(formData);
            setLoading(false);
            onClose();

        } catch(error){
            setError(error.message);
            setLoading(false);
        }
    }

    useEffect(() => {

        const fetchData = async(url) => {
            try{
                const response = await fetch(url);
                if(!response.ok){
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to fetch ${url}`);
                }
                const roleData = await response.json();
                console.log("Data Roles: ", roleData.data);
                return roleData.data;
            } catch(error){
                console.log("Error: ", error);
                return null;
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
        loadOrganization();
        loadRoles();
    },[]);

return (
    <div className="modal-overlay">
        <div className="edit-user-modal">
            {error && <div className="error">{error} </div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Organization</label>
                    <select name="organizationId" value={formData.organizationId} onChange={handleChange}>
                        {organizationsData && organizationsData.map(organization => (
                            <option key={organization._id} value={organization._id}>{organization.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Roles:</label>
                    <select name="roles" value={formData.roles.name} onChange={handleChange} required>
                        {rolesOptions && rolesOptions.map(role => (
                            <option key={role._id} value={role._id}>{role.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" onClick={onClose} disable={loading}>Cancel</button>
                </div>
            </form>
        </div>
    </div>
);
}

export default EditUserModal;