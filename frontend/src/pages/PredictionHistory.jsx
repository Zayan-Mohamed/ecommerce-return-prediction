import React, { useState, useEffect } from 'react';
import './PredictionHistory.css';

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    riskLevel: 'all',
    dateRange: 'all',
    productCategory: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Mock data for prediction history
  const mockPredictions = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      product: 'iPhone 15 Pro',
      category: 'Electronics',
      customer: 'John Smith',
      email: 'john.smith@email.com',
      riskLevel: 'High',
      probability: 85,
      value: 1299.99,
      status: 'Processed',
      factors: ['Price Point', 'Customer History', 'Product Category']
    },
    {
      id: 'ORD-002',
      date: '2024-01-14',
      product: 'Nike Air Max',
      category: 'Footwear',
      customer: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      riskLevel: 'Low',
      probability: 23,
      value: 159.99,
      status: 'Delivered',
      factors: ['Loyal Customer', 'Standard Price', 'Good Reviews']
    },
    {
      id: 'ORD-003',
      date: '2024-01-13',
      product: 'Gaming Headset',
      category: 'Electronics',
      customer: 'Mike Chen',
      email: 'mike.chen@email.com',
      riskLevel: 'Medium',
      probability: 58,
      value: 249.99,
      status: 'Shipped',
      factors: ['First Purchase', 'Express Shipping', 'Weekend Order']
    },
    {
      id: 'ORD-004',
      date: '2024-01-12',
      product: 'Leather Jacket',
      category: 'Clothing',
      customer: 'Emma Wilson',
      email: 'emma.w@email.com',
      riskLevel: 'High',
      probability: 78,
      value: 399.99,
      status: 'Processing',
      factors: ['Size Exchange Risk', 'Premium Item', 'Holiday Purchase']
    },
    {
      id: 'ORD-005',
      date: '2024-01-11',
      product: 'Coffee Maker',
      category: 'Home & Garden',
      customer: 'David Brown',
      email: 'david.brown@email.com',
      riskLevel: 'Low',
      probability: 15,
      value: 89.99,
      status: 'Delivered',
      factors: ['Repeat Customer', 'Standard Shipping', 'Good Rating']
    },
    {
      id: 'ORD-006',
      date: '2024-01-10',
      product: 'Wireless Earbuds',
      category: 'Electronics',
      customer: 'Lisa Garcia',
      email: 'lisa.garcia@email.com',
      riskLevel: 'Medium',
      probability: 42,
      value: 199.99,
      status: 'Delivered',
      factors: ['New Customer', 'Gift Purchase', 'Express Delivery']
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadPredictions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPredictions(mockPredictions);
      setFilteredPredictions(mockPredictions);
      setLoading(false);
    };

    loadPredictions();
  }, []);

  useEffect(() => {
    let filtered = [...predictions];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(pred => 
        pred.id.toLowerCase().includes(searchTerm) ||
        pred.product.toLowerCase().includes(searchTerm) ||
        pred.customer.toLowerCase().includes(searchTerm) ||
        pred.email.toLowerCase().includes(searchTerm)
      );
    }

    // Risk level filter
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(pred => 
        pred.riskLevel.toLowerCase() === filters.riskLevel.toLowerCase()
      );
    }

    // Product category filter
    if (filters.productCategory !== 'all') {
      filtered = filtered.filter(pred => 
        pred.category.toLowerCase() === filters.productCategory.toLowerCase()
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(pred => 
          new Date(pred.date) >= filterDate
        );
      }
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'date') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (sortConfig.key === 'probability' || sortConfig.key === 'value') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredPredictions(filtered);
  }, [filters, predictions, sortConfig]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      riskLevel: 'all',
      dateRange: 'all',
      productCategory: 'all'
    });
  };

  const exportData = () => {
    const csvContent = [
      ['Order ID', 'Date', 'Product', 'Category', 'Customer', 'Risk Level', 'Probability %', 'Value', 'Status'],
      ...filteredPredictions.map(pred => [
        pred.id,
        pred.date,
        pred.product,
        pred.category,
        pred.customer,
        pred.riskLevel,
        pred.probability,
        pred.value,
        pred.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prediction-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'risk-badge high-risk';
      case 'medium': return 'risk-badge medium-risk';
      case 'low': return 'risk-badge low-risk';
      default: return 'risk-badge';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-badge delivered';
      case 'shipped': return 'status-badge shipped';
      case 'processing': return 'status-badge processing';
      case 'processed': return 'status-badge processed';
      default: return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="prediction-history-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading prediction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prediction-history-page">
      <div className="history-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Prediction History</h1>
            <p className="page-subtitle">
              Track and analyze all return risk predictions
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={exportData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="search-input-container">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by Order ID, Product, or Customer..."
                  className="search-input"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Risk Level</label>
              <select
                className="filter-select"
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={filters.productCategory}
                onChange={(e) => handleFilterChange('productCategory', e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="footwear">Footwear</option>
                <option value="home & garden">Home & Garden</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <select
                className="filter-select"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
            <span className="results-count">
              {filteredPredictions.length} of {predictions.length} predictions
            </span>
          </div>
        </div>

        {/* Results Table */}
        <div className="table-section">
          <div className="table-container">
            <table className="predictions-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="sortable">
                    Order ID
                    {sortConfig.key === 'id' && (
                      <span className={`sort-arrow ${sortConfig.direction}`}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th onClick={() => handleSort('date')} className="sortable">
                    Date
                    {sortConfig.key === 'date' && (
                      <span className={`sort-arrow ${sortConfig.direction}`}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th onClick={() => handleSort('probability')} className="sortable">
                    Risk Level
                    {sortConfig.key === 'probability' && (
                      <span className={`sort-arrow ${sortConfig.direction}`}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th onClick={() => handleSort('value')} className="sortable">
                    Order Value
                    {sortConfig.key === 'value' && (
                      <span className={`sort-arrow ${sortConfig.direction}`}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.map((prediction) => (
                  <tr key={prediction.id} className="table-row">
                    <td className="order-id">{prediction.id}</td>
                    <td className="date">{new Date(prediction.date).toLocaleDateString()}</td>
                    <td>
                      <div className="product-info">
                        <div className="product-name">{prediction.product}</div>
                        <div className="product-category">{prediction.category}</div>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{prediction.customer}</div>
                        <div className="customer-email">{prediction.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="risk-info">
                        <span className={getRiskBadgeClass(prediction.riskLevel)}>
                          {prediction.riskLevel}
                        </span>
                        <div className="probability">{prediction.probability}%</div>
                      </div>
                    </td>
                    <td className="order-value">${prediction.value.toFixed(2)}</td>
                    <td>
                      <span className={getStatusBadgeClass(prediction.status)}>
                        {prediction.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-outline"
                          title="View Details"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline"
                          title="Re-analyze"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23,4 23,10 17,10"/>
                            <polyline points="1,20 1,14 7,14"/>
                            <path d="M20.49,9A9,9 0 0,0 5.64,5.64L1,10m22,4l-4.64,4.36A9,9 0 0,1 3.51,15"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPredictions.length === 0 && (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <h3>No predictions found</h3>
                <p>Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="stats-summary">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">
                {filteredPredictions.filter(p => p.riskLevel === 'High').length}
              </div>
              <div className="stat-label">High Risk</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {filteredPredictions.filter(p => p.riskLevel === 'Medium').length}
              </div>
              <div className="stat-label">Medium Risk</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {filteredPredictions.filter(p => p.riskLevel === 'Low').length}
              </div>
              <div className="stat-label">Low Risk</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                ${filteredPredictions.reduce((sum, p) => sum + p.value, 0).toFixed(2)}
              </div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionHistory;