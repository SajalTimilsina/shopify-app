import React, {useState, useEffect, useRef} from "react";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import './CreateUserModal.css';
import Organization from "../../../models/userModels/Organization";

const CreateUserModal = ({onClose, onCreate, organizationsData, rolesOptions}) => {


    const [formData,setFormData] = useState({
        name: '',
        email: '',
        roleId: '',
        organizationId: '',
    });

    //State for
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState('');

    // Initialized the useRef
    const modalRef = useRef(null);

    useEffect(() => {
        if(rolesOptions && rolesOptions.data && rolesOptions.data.length > 0){
            console.log("Roles: ", rolesOptions.data[0]._id);
            setFormData( prevFormData => ({...prevFormData, roleId: rolesOptions.data[0]._id}));
            
        }

        if(organizationsData && organizationsData.data && organizationsData.data.length > 0){
            console.log("Organizations: ", organizationsData.data);
            setFormData( prevFormData => ({...prevFormData, organizationId: organizationsData.data[0]._id}));
            //setFormData({...formData, organizationId: organizationsData.data[0]._id});
        }
    }, [rolesOptions, organizationsData]);

    const handleSubmit = async (e) => {
        console.log("### Handle Submit ###");
        e.preventDefault();
        setIsSubmitting(true);
        try{
            await onCreate(formData);
            setIsSubmitting(false);
            onClose();
        } catch(error){
            console.error("Error creating user: ", error);
            setSubmissionError(error.message || "Failed to create user. Please try again.");
            setIsSubmitting(false);
        }
    }

    const handleChange = (e) => {
        console.log("### Handle Change ###");
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
        // console.log(organizationsData);
        // console.log(rolesOptions);
        console.log(formData);
    }
    
    const handleClose = () => {
        console.log("### Handle Close the modal ###");
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" ref={modalRef} tabIndex="-1" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 id="create-user-modal">Create New User</h2>
                    <button className="close-button" onClick={handleClose} aria-label="Close Modal"> &times; </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {submissionError && <div className="error-message">{submissionError}</div>}
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required/>
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="roleId" id="role" value={formData.roleId} onChange={handleChange} required>
                            { rolesOptions && rolesOptions.data?.map(role => (
                                <option key={role._id} value={role._id}> {role.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Organization</label>
                        <select name="organizationId" id="organization" value={formData.organizationId} onChange={handleChange}> 
                            {organizationsData && organizationsData?.data.map(organization => (
                                    <option key={organization._id} value={organization._id}>{organization.name}</option>
                            ))}
                        </select>
                        </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Creating ..." : "Create User"}</button>
                        <button type="button" onClick={onClose} disable={isSubmitting}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>

    );
}

export default CreateUserModal;