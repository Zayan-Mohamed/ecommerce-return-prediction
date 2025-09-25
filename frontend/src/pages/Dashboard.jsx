import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, _setStats] = useState({
    totalOrders: 1234,
    predictedReturns: 156,
    returnRate: 12.6,
    revenueSaved: 45230,
    accuracy: 94.5
  })

  const [recentPredictions, _setRecentPredictions] = useState([
    {
      id: 'ORD-001',
      product: 'Wireless Headphones',
      category: 'Electronics',
      price: 199.99,
      prediction: 'Low Risk',
      probability: 15,
      date: '2024-01-15',
      status: 'processed'
    },
    {
      id: 'ORD-002',
      product: 'Running Shoes',
      category: 'Sports',
      price: 129.99,
      prediction: 'High Risk',
      probability: 78,
      date: '2024-01-15',
      status: 'processed'
    },
    {
      id: 'ORD-003',
      product: 'Laptop Bag',
      category: 'Accessories',
      price: 49.99,
      prediction: 'Medium Risk',
      probability: 45,
      date: '2024-01-14',
      status: 'processed'
    },
    {
      id: 'ORD-004',
      product: 'Smart Watch',
      category: 'Electronics',
      price: 299.99,
      prediction: 'Low Risk',
      probability: 22,
      date: '2024-01-14',
      status: 'processing'
    },
    {
      id: 'ORD-005',
      product: 'Yoga Mat',
      category: 'Sports',
      price: 29.99,
      prediction: 'High Risk',
      probability: 85,
      date: '2024-01-13',
      status: 'processed'
    }
  ])

  const [quickPrediction, setQuickPrediction] = useState({
    productCategory: '',
    productPrice: '',
    orderQuantity: '',
    userAge: '',
    userGender: '',
    userLocation: '',
    paymentMethod: '',
    shippingMethod: '',
    discountApplied: ''
  })

  const [predictionResult, setPredictionResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleQuickPredictionSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock prediction result
      const probability = Math.floor(Math.random() * 100)
      const riskLevel = probability > 70 ? 'High Risk' : probability > 40 ? 'Medium Risk' : 'Low Risk'
      
      setPredictionResult({
        probability,
        riskLevel,
        confidence: 94.5,
        factors: [
          { factor: 'Product Category', impact: 'Medium', value: quickPrediction.productCategory },
          { factor: 'Price Range', impact: 'High', value: `$${quickPrediction.productPrice}` },
          { factor: 'User Location', impact: 'Low', value: quickPrediction.userLocation },
          { factor: 'Payment Method', impact: 'Medium', value: quickPrediction.paymentMethod }
        ]
      })
    } catch (error) {
      console.error('Prediction failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setQuickPrediction({
      ...quickPrediction,
      [e.target.name]: e.target.value
    })
  }

  const getPredictionColor = (prediction) => {
    switch (prediction) {
      case 'High Risk': return 'danger'
      case 'Medium Risk': return 'warning'
      case 'Low Risk': return 'success'
      default: return 'info'
    }
  }
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!</h1>
            <p className="dashboard-subtitle">
              Here's your return prediction overview for today
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
              </svg>
              Export Report
            </button>
            <button className="btn btn-primary">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add New Order
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon primary">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3v5h5M3.05 13a9 9 0 1 0 1.5-5.5"/>
                </svg>
              </div>
              <div className="stat-trend positive">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                  <polyline points="17,6 23,6 23,12"/>
                </svg>
                +12%
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Total Orders</h3>
              <p className="stat-value">{stats.totalOrders.toLocaleString()}</p>
              <p className="stat-description">This month</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon warning">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                </svg>
              </div>
              <div className="stat-trend negative">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
                  <polyline points="17,18 23,18 23,12"/>
                </svg>
                -8%
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Predicted Returns</h3>
              <p className="stat-value">{stats.predictedReturns}</p>
              <p className="stat-description">High risk orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon info">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/>
                </svg>
              </div>
              <div className="stat-trend positive">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                  <polyline points="17,6 23,6 23,12"/>
                </svg>
                +5%
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Return Rate</h3>
              <p className="stat-value">{stats.returnRate}%</p>
              <p className="stat-description">Overall return rate</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon success">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="stat-trend positive">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                  <polyline points="17,6 23,6 23,12"/>
                </svg>
                +18%
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Revenue Saved</h3>
              <p className="stat-value">${stats.revenueSaved.toLocaleString()}</p>
              <p className="stat-description">From predictions</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Quick Prediction */}
          <div className="dashboard-card quick-prediction">
            <div className="card-header">
              <h2 className="card-title">Quick Prediction</h2>
              <p className="card-subtitle">Get instant return probability for an order</p>
            </div>
            <div className="card-content">
              <form onSubmit={handleQuickPredictionSubmit} className="prediction-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Category</label>
                    <select 
                      name="productCategory" 
                      value={quickPrediction.productCategory}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Sports">Sports</option>
                      <option value="Home">Home & Garden</option>
                      <option value="Books">Books</option>
                      <option value="Beauty">Beauty</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Product Price ($)</label>
                    <input 
                      type="number" 
                      name="productPrice"
                      value={quickPrediction.productPrice}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Order Quantity</label>
                    <input 
                      type="number" 
                      name="orderQuantity"
                      value={quickPrediction.orderQuantity}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">User Age</label>
                    <input 
                      type="number" 
                      name="userAge"
                      value={quickPrediction.userAge}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="25"
                      min="18"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">User Gender</label>
                    <select 
                      name="userGender"
                      value={quickPrediction.userGender}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">User Location</label>
                    <select 
                      name="userLocation"
                      value={quickPrediction.userLocation}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select location</option>
                      <option value="Urban">Urban</option>
                      <option value="Suburban">Suburban</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select 
                      name="paymentMethod"
                      value={quickPrediction.paymentMethod}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select payment</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shipping Method</label>
                    <select 
                      name="shippingMethod"
                      value={quickPrediction.shippingMethod}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select shipping</option>
                      <option value="Standard">Standard</option>
                      <option value="Express">Express</option>
                      <option value="Next Day">Next Day</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Applied (%)</label>
                  <input 
                    type="number" 
                    name="discountApplied"
                    value={quickPrediction.discountApplied}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 19c-5 0-8-3-8-6s3-6 8-6c1.25 0 2.45.21 3.58.58A5 5 0 0 1 16 6c2.76 0 5 2.24 5 5s-2.24 5-5 5c-1.38 0-2.63-.56-3.54-1.46A13.85 13.85 0 0 1 9 19z"/>
                      </svg>
                      Predict Return Risk
                    </>
                  )}
                </button>
              </form>

              {predictionResult && (
                <div className="prediction-result">
                  <h3 className="result-title">Prediction Result</h3>
                  <div className="result-overview">
                    <div className={`risk-badge ${getPredictionColor(predictionResult.riskLevel)}`}>
                      {predictionResult.riskLevel}
                    </div>
                    <div className="probability-circle">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="8"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke={predictionResult.riskLevel === 'High Risk' ? '#e53e3e' : 
                                 predictionResult.riskLevel === 'Medium Risk' ? '#ed8936' : '#38a169'}
                          strokeWidth="8"
                          strokeDasharray={`${predictionResult.probability * 2.2} 220`}
                          strokeDashoffset="0"
                          transform="rotate(-90 40 40)"
                          className="progress-circle"
                        />
                      </svg>
                      <div className="probability-text">
                        <span className="percentage">{predictionResult.probability}%</span>
                        <span className="label">Return Risk</span>
                      </div>
                    </div>
                  </div>
                  <div className="result-details">
                    <div className="confidence-score">
                      Confidence: {predictionResult.confidence}%
                    </div>
                    <div className="contributing-factors">
                      <h4>Key Factors</h4>
                      <div className="factors-list">
                        {predictionResult.factors.map((factor, index) => (
                          <div key={index} className="factor-item">
                            <div className="factor-info">
                              <span className="factor-name">{factor.factor}</span>
                              <span className="factor-value">{factor.value}</span>
                            </div>
                            <div className={`impact-badge ${factor.impact.toLowerCase()}`}>
                              {factor.impact}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Predictions */}
          <div className="dashboard-card recent-predictions">
            <div className="card-header">
              <h2 className="card-title">Recent Predictions</h2>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="card-content">
              <div className="predictions-table">
                <div className="table-header">
                  <div className="col-order">Order ID</div>
                  <div className="col-product">Product</div>
                  <div className="col-prediction">Prediction</div>
                  <div className="col-probability">Risk %</div>
                  <div className="col-status">Status</div>
                </div>
                <div className="table-body">
                  {recentPredictions.map((prediction) => (
                    <div key={prediction.id} className="table-row">
                      <div className="col-order">
                        <span className="order-id">{prediction.id}</span>
                        <span className="order-date">{prediction.date}</span>
                      </div>
                      <div className="col-product">
                        <span className="product-name">{prediction.product}</span>
                        <span className="product-category">{prediction.category}</span>
                      </div>
                      <div className="col-prediction">
                        <span className={`prediction-badge ${getPredictionColor(prediction.prediction)}`}>
                          {prediction.prediction}
                        </span>
                      </div>
                      <div className="col-probability">
                        <div className="probability-bar">
                          <div 
                            className={`progress-fill ${getPredictionColor(prediction.prediction)}`}
                            style={{width: `${prediction.probability}%`}}
                          ></div>
                        </div>
                        <span className="probability-text">{prediction.probability}%</span>
                      </div>
                      <div className="col-status">
                        <span className={`status-badge ${prediction.status}`}>
                          {prediction.status === 'processed' ? 'Processed' : 'Processing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="performance-overview">
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Model Performance</h2>
              <div className="performance-stats">
                <div className="perf-stat">
                  <span className="perf-label">Accuracy</span>
                  <span className="perf-value">{stats.accuracy}%</span>
                </div>
                <div className="perf-stat">
                  <span className="perf-label">Predictions Today</span>
                  <span className="perf-value">247</span>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  <div className="bar" style={{height: '60%'}} data-label="Mon"></div>
                  <div className="bar" style={{height: '80%'}} data-label="Tue"></div>
                  <div className="bar" style={{height: '45%'}} data-label="Wed"></div>
                  <div className="bar" style={{height: '90%'}} data-label="Thu"></div>
                  <div className="bar" style={{height: '70%'}} data-label="Fri"></div>
                  <div className="bar" style={{height: '85%'}} data-label="Sat"></div>
                  <div className="bar" style={{height: '65%'}} data-label="Sun"></div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color primary"></div>
                    <span>Daily Predictions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
