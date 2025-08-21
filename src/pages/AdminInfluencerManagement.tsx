import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { influencerAPI } from '../lib/api';
import './AdminInfluencerManagement.css';

interface Influencer {
  id: number;
  name: string;
  phone: string;
  ussd_shortcode: string;
  received: number;
  status: string;
  imageUrl: string;
  created_at: string;
  updated_at: string;
}

interface CreateInfluencerForm {
  name: string;
  phone: string;
  ussd_shortcode: string;
  imageUrl: string;
}

const AdminInfluencerManagement: React.FC = () => {
  const { user } = useAuth();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [createForm, setCreateForm] = useState<CreateInfluencerForm>({
    name: '',
    phone: '',
    ussd_shortcode: '',
    imageUrl: ''
  });

  // Fetch influencers from API
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setIsLoading(true);
        const response = await influencerAPI.getAll();
        setInfluencers(response.data || []);
      } catch (error) {
        console.error('Failed to fetch influencers:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to fetch influencers. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfluencers();
  }, []);

  // Filter influencers based on search and status
  const filteredInfluencers = influencers.filter(influencer => {
    const matchesSearch = influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         influencer.phone.includes(searchTerm) ||
                         influencer.ussd_shortcode.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || influencer.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Handle form input changes
  const handleInputChange = (field: keyof CreateInfluencerForm, value: string) => {
    if (editingInfluencer) {
      setEditingInfluencer({ ...editingInfluencer, [field]: value });
    } else {
      setCreateForm({ ...createForm, [field]: value });
    }
  };

  // Create new influencer
  const handleCreateInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name || !createForm.ussd_shortcode) {
      setMessage({ type: 'error', text: 'Name and USSD shortcode are required!' });
      return;
    }

    try {
      const response = await influencerAPI.create(createForm);
      setInfluencers(prev => [...prev, response.data]);
      setCreateForm({ name: '', phone: '', ussd_shortcode: '', imageUrl: '' });
      setShowCreateForm(false);
      setMessage({ type: 'success', text: 'Influencer created successfully!' });
    } catch (error: any) {
      console.error('Failed to create influencer:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.description || 'Failed to create influencer. Please try again.' 
      });
    }
  };

  // Update influencer
  const handleUpdateInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingInfluencer) return;

    try {
      const response = await influencerAPI.update(editingInfluencer.id, editingInfluencer);
      setInfluencers(prev => 
        prev.map(inf => inf.id === editingInfluencer.id ? response.data : inf)
      );
      setEditingInfluencer(null);
      setMessage({ type: 'success', text: 'Influencer updated successfully!' });
    } catch (error: any) {
      console.error('Failed to update influencer:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.description || 'Failed to update influencer. Please try again.' 
      });
    }
  };

  // Delete influencer
  const handleDeleteInfluencer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this influencer? This action cannot be undone.')) {
      return;
    }

    try {
      await influencerAPI.delete(id);
      setInfluencers(prev => prev.filter(inf => inf.id !== id));
      setMessage({ type: 'success', text: 'Influencer deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete influencer:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete influencer. Please try again.' 
      });
    }
  };

  // Status management functions
  const handleStatusChange = async (id: number, action: 'suspend' | 'activate' | 'terminate') => {
    try {
      let response;
      switch (action) {
        case 'suspend':
          response = await influencerAPI.suspend(id);
          break;
        case 'activate':
          response = await influencerAPI.activate(id);
          break;
        case 'terminate':
          response = await influencerAPI.terminate(id);
          break;
      }
      
      setInfluencers(prev => 
        prev.map(inf => inf.id === id ? { ...inf, status: action === 'activate' ? 'active' : action } : inf)
      );
      
      setMessage({ 
        type: 'success', 
        text: `Influencer ${action}d successfully!` 
      });
    } catch (error) {
      console.error(`Failed to ${action} influencer:`, error);
      setMessage({ 
        type: 'error', 
        text: `Failed to ${action} influencer. Please try again.` 
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'orange';
      case 'terminated': return 'red';
      default: return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (!user || user.user_type !== 'admin') {
    return (
      <div className="admin-influencer-management">
        <div className="header">
          <h1>Access Denied</h1>
        </div>
        <div className="access-denied">
          <p>You don't have permission to access this page. Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-influencer-management">
      <div className="header">
        <h1>Influencer Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + Add New Influencer
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>&times;</button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, phone, or shortcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingInfluencer) && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingInfluencer ? 'Edit Influencer' : 'Create New Influencer'}</h3>
            <form onSubmit={editingInfluencer ? handleUpdateInfluencer : handleCreateInfluencer}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={editingInfluencer ? editingInfluencer.name : createForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editingInfluencer ? editingInfluencer.phone : createForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+254700000000"
                />
              </div>
              
              <div className="form-group">
                <label>USSD Shortcode *</label>
                <input
                  type="text"
                  value={editingInfluencer ? editingInfluencer.ussd_shortcode : createForm.ussd_shortcode}
                  onChange={(e) => handleInputChange('ussd_shortcode', e.target.value)}
                  required
                  placeholder="e.g., *123#"
                />
              </div>
              
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={editingInfluencer ? editingInfluencer.imageUrl : createForm.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingInfluencer ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingInfluencer(null);
                    setCreateForm({ name: '', phone: '', ussd_shortcode: '', imageUrl: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Influencers Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading">Loading influencers...</div>
        ) : (
          <table className="influencers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Shortcode</th>
                <th>Received</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInfluencers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    No influencers found
                  </td>
                </tr>
              ) : (
                filteredInfluencers.map(influencer => (
                  <tr key={influencer.id}>
                    <td>{influencer.id}</td>
                    <td>
                      <div className="influencer-info">
                        {influencer.imageUrl && (
                          <img 
                            src={influencer.imageUrl} 
                            alt={influencer.name}
                            className="influencer-avatar"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&background=cccccc&size=32&rounded=true&color=555`;
                            }}
                          />
                        )}
                        <span>{influencer.name}</span>
                      </div>
                    </td>
                    <td>{influencer.phone || 'N/A'}</td>
                    <td className="shortcode">{influencer.ussd_shortcode || 'N/A'}</td>
                    <td>KSh {influencer.received.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${getStatusColor(influencer.status)}`}>
                        {influencer.status}
                      </span>
                    </td>
                    <td>{formatDate(influencer.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingInfluencer(influencer)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        
                        {influencer.status === 'active' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(influencer.id, 'suspend')}
                            title="Suspend"
                          >
                            ⏸️
                          </button>
                        )}
                        
                        {influencer.status === 'suspended' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(influencer.id, 'activate')}
                            title="Activate"
                          >
                            ▶️
                          </button>
                        )}
                        
                        {influencer.status !== 'terminated' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusChange(influencer.id, 'terminate')}
                            title="Terminate"
                          >
                            🚫
                          </button>
                        )}
                        
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteInfluencer(influencer.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminInfluencerManagement;
