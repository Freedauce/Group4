import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 2 // Manager = 2
    });

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await usersAPI.getAll({ page, pageSize: 10 });
            setUsers(res.data.items);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateManager = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await usersAPI.createInternal(createForm);
            alert('Manager created successfully!');
            setShowCreateModal(false);
            setCreateForm({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', role: 2 });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create manager');
        } finally {
            setCreating(false);
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await usersAPI.deactivate(id);
            setUsers(users.map(u => u.id === id ? { ...u, isActive: false } : u));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to deactivate user');
        }
    };

    const handleReactivate = async (id) => {
        if (!window.confirm('Are you sure you want to reactivate this user?')) return;
        try {
            await usersAPI.reactivate(id);
            setUsers(users.map(u => u.id === id ? { ...u, isActive: true } : u));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reactivate user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('⚠️ WARNING: This will permanently delete this user and all their data. This action cannot be undone. Are you sure?')) return;
        try {
            await usersAPI.delete(id);
            setUsers(users.filter(u => u.id !== id));
            alert('User has been permanently deleted.');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user. They may have active bookings.');
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            Admin: 'badge-error',
            Manager: 'badge-warning',
            CarOwner: 'badge-info',
            Client: 'badge-success',
        };
        return styles[role] || 'badge-info';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Manage Users</h1>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                    ➕ Create Manager
                </button>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <td>{index + 1}</td>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td><span className={`badge ${getRoleBadge(user.role)}`}>{user.role}</span></td>
                                <td>
                                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {user.role !== 'Admin' && (
                                            <>
                                                {user.isActive ? (
                                                    <button
                                                        onClick={() => handleDeactivate(user.id)}
                                                        className="btn btn-sm btn-ghost"
                                                        title="Deactivate user"
                                                    >
                                                        🚫 Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivate(user.id)}
                                                        className="btn btn-sm btn-primary"
                                                        title="Reactivate user"
                                                    >
                                                        ✅ Reactivate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="btn btn-sm"
                                                    style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                                                    title="Permanently delete user"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="btn btn-sm btn-secondary"
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span style={{ padding: '0.5rem 1rem' }}>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="btn btn-sm btn-secondary"
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Create Manager Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                }}>
                    <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>➕ Create Manager</h2>
                        <form onSubmit={handleCreateManager}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">First Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.firstName}
                                        onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={createForm.lastName}
                                        onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={createForm.email}
                                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={createForm.phoneNumber}
                                    onChange={e => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                                    placeholder="+250 780 000 000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={createForm.password}
                                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Manager'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;

