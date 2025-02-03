// src/components/Users/UserList.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, CircularProgress, Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const UserList = () => {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  
  // Handle user deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };
  
  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  
  return (
    <TableContainer component={Paper} sx={{ marginTop: 4 }}>
      <Typography variant="h4" component="div" gutterBottom>
        Users
      </Typography>
      <Table aria-label="users table">
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Organization</strong></TableCell>
            <TableCell><strong>Roles</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.organizationId.name}</TableCell>
              <TableCell>{user.roles.map(role => role.name).join(', ')}</TableCell>
              <TableCell>
                <Button
                  component={Link}
                  to={`/users/${user._id}`}
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ marginRight: 1 }}
                >
                  View
                </Button>
                <Button
                  component={Link}
                  to={`/users/edit/${user._id}`}
                  variant="contained"
                  color="secondary"
                  size="small"
                  sx={{ marginRight: 1 }}
                >
                  Edit
                </Button>
                {auth.permissions.includes('delete_user') && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserList;
