import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddData.css'

const AddData = ({ user }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    productCategory: '',
    productPrice: '',
    orderQuantity: '1',
    userAge: '',
    userGender: '',
    userLocation: '',
    paymentMethod: '',
    shippingMethod: '',
    discountApplied: '0'
  })

  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [errors, setErrors] = useState({})

  const productCategories = [
    'Electronics', 'Clothing', 'Sports', 'Home & Garden', 'Books', 
    'Beauty', 'Toys', 'Jewelry', 'Automotive', 'Health'
  ]

  const paymentMethods = [
    'Credit Card', 'Debit Card', 'PayPal', 'Apple Pay', 
    'Google Pay', 'Bank Transfer', 'Cash on Delivery'
  ]

  const shippingMethods = [
    'Standard', 'Express', 'Next Day', 'Two Day', 'Ground'
  ]

  const locations = [
    'Urban', 'Suburban', 'Rural'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.productCategory) newErrors.productCategory = 'Product category is required'
    if (!formData.productPrice || parseFloat(formData.productPrice) <= 0) {
      newErrors.productPrice = 'Please enter a valid price'
    }
    if (!formData.orderQuantity || parseInt(formData.orderQuantity) <= 0) {
      newErrors.orderQuantity = 'Please enter a valid quantity'
    }
    if (!formData.userAge || parseInt(formData.userAge) < 18 || parseInt(formData.userAge) > 100) {
      newErrors.userAge = 'Please enter a valid age (18-100)'
    }
    if (!formData.userGender) newErrors.userGender = 'User gender is required'
    if (!formData.userLocation) newErrors.userLocation = 'User location is required'
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required'
    if (!formData.shippingMethod) newErrors.shippingMethod = 'Shipping method is required'
    
    const discount = parseFloat(formData.discountApplied)
    if (isNaN(discount) || discount < 0 || discount > 100) {
      newErrors.discountApplied = 'Discount must be between 0 and 100'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // TODO: Replace with actual API call
      // const response = await api.predictReturn(formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock prediction result
      const probability = Math.floor(Math.random() * 100)
      const riskLevel = probability > 70 ? 'High Risk' : probability > 40 ? 'Medium Risk' : 'Low Risk'
      const orderId = `ORD-${Date.now().toString().slice(-6)}`
      
      const predictionResult = {
        orderId,
        probability,
        riskLevel,
        confidence: 94.5,
        factors: [
          { factor: 'Product Category', impact: getImpactLevel(formData.productCategory), value: formData.productCategory },
          { factor: 'Price Range', impact: getPriceImpact(parseFloat(formData.productPrice)), value: `$${formData.productPrice}` },
          { factor: 'User Demographics', impact: 'Medium', value: `${formData.userAge}y, ${formData.userGender}` },
          { factor: 'Payment Method', impact: getPaymentImpact(formData.paymentMethod), value: formData.paymentMethod },
          { factor: 'Shipping Method', impact: getShippingImpact(formData.shippingMethod), value: formData.shippingMethod },
          { factor: 'Discount Applied', impact: getDiscountImpact(parseFloat(formData.discountApplied)), value: `${formData.discountApplied}%` }
        ],
        recommendations: generateRecommendations(riskLevel, formData)
      }

      setPrediction(predictionResult)
    } catch (error) {
      console.error('Prediction failed:', error)
      setErrors({ submit: 'Failed to process prediction. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getImpactLevel = (category) => {
    const highRiskCategories = ['Electronics', 'Clothing', 'Jewelry']
    const mediumRiskCategories = ['Sports', 'Beauty', 'Toys']
    
    if (highRiskCategories.includes(category)) return 'High'
    if (mediumRiskCategories.includes(category)) return 'Medium'
    return 'Low'
  }

  const getPriceImpact = (price) => {
    if (price > 200) return 'High'
    if (price > 50) return 'Medium'
    return 'Low'
  }

  const getPaymentImpact = (method) => {
    if (method === 'Cash on Delivery') return 'High'
    if (['Credit Card', 'Debit Card'].includes(method)) return 'Low'
    return 'Medium'
  }

  const getShippingImpact = (method) => {
    if (method === 'Standard') return 'Low'
    if (method === 'Express' || method === 'Next Day') return 'Medium'
    return 'Low'
  }

  const getDiscountImpact = (discount) => {
    if (discount > 20) return 'High'
    if (discount > 10) return 'Medium'
    return 'Low'
  }

  const generateRecommendations = (riskLevel, data) => {
    const recommendations = []
    
    if (riskLevel === 'High Risk') {
      recommendations.push('Consider additional quality checks before shipping')
      recommendations.push('Provide detailed product information and sizing guides')
      recommendations.push('Follow up with customer after delivery')
    } else if (riskLevel === 'Medium Risk') {
      recommendations.push('Send proactive customer service message')
      recommendations.push('Include return policy information with shipment')
    } else {
      recommendations.push('Standard processing recommended')
      recommendations.push('Consider for priority customer program')
    }

    if (parseFloat(data.discountApplied) > 20) {
      recommendations.push('High discount may indicate impulse purchase - consider customer education')
    }

    return recommendations
  }

  const resetForm = () => {
    setFormData({
      orderDate: new Date().toISOString().split('T')[0],
      productCategory: '',
      productPrice: '',
      orderQuantity: '1',
      userAge: '',
      userGender: '',
      userLocation: '',
      paymentMethod: '',
      shippingMethod: '',
      discountApplied: '0'
    })
    setPrediction(null)
    setErrors({})
  }

  const saveAndContinue = () => {
    // TODO: Save to database
    console.log('Saving prediction:', prediction)
    navigate('/dashboard')
  }

  return (
    <div className="add-data-page">
      <div className="add-data-container">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Add New Order Data</h1>
            <p className="page-subtitle">
              Enter order details to get return risk prediction
            </p>
          </div>
          <div className="header-actions">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-outline"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 12H5m7-7l-7 7 7 7"/>
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="content-grid">
          {/* Order Entry Form */}
          <div className="form-section">
            <div className="section-card">
              <div className="card-header">
                <h2 className="card-title">Order Information</h2>
                <p className="card-subtitle">Fill in all required fields for accurate prediction</p>
              </div>

              <form onSubmit={handleSubmit} className="order-form">
                {errors.submit && (
                  <div className="error-banner">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {errors.submit}
                  </div>
                )}

                <div className="form-section-group">
                  <h3 className="form-section-title">Basic Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Order Date</label>
                      <input
                        type="date"
                        name="orderDate"
                        value={formData.orderDate}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Product Category *</label>
                      <select
                        name="productCategory"
                        value={formData.productCategory}
                        onChange={handleInputChange}
                        className={`form-select ${errors.productCategory ? 'error' : ''}`}
                        required
                      >
                        <option value="">Select category</option>
                        {productCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {errors.productCategory && <span className="error-text">{errors.productCategory}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Product Price ($) *</label>
                      <input
                        type="number"
                        name="productPrice"
                        value={formData.productPrice}
                        onChange={handleInputChange}
                        className={`form-input ${errors.productPrice ? 'error' : ''}`}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                      {errors.productPrice && <span className="error-text">{errors.productPrice}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Order Quantity *</label>
                      <input
                        type="number"
                        name="orderQuantity"
                        value={formData.orderQuantity}
                        onChange={handleInputChange}
                        className={`form-input ${errors.orderQuantity ? 'error' : ''}`}
                        min="1"
                        required
                      />
                      {errors.orderQuantity && <span className="error-text">{errors.orderQuantity}</span>}
                    </div>
                  </div>
                </div>

                <div className="form-section-group">
                  <h3 className="form-section-title">Customer Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">User Age *</label>
                      <input
                        type="number"
                        name="userAge"
                        value={formData.userAge}
                        onChange={handleInputChange}
                        className={`form-input ${errors.userAge ? 'error' : ''}`}
                        placeholder="25"
                        min="18"
                        max="100"
                        required
                      />
                      {errors.userAge && <span className="error-text">{errors.userAge}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">User Gender *</label>
                      <select
                        name="userGender"
                        value={formData.userGender}
                        onChange={handleInputChange}
                        className={`form-select ${errors.userGender ? 'error' : ''}`}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.userGender && <span className="error-text">{errors.userGender}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">User Location *</label>
                    <select
                      name="userLocation"
                      value={formData.userLocation}
                      onChange={handleInputChange}
                      className={`form-select ${errors.userLocation ? 'error' : ''}`}
                      required
                    >
                      <option value="">Select location type</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.userLocation && <span className="error-text">{errors.userLocation}</span>}
                  </div>
                </div>

                <div className="form-section-group">
                  <h3 className="form-section-title">Payment & Shipping</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Payment Method *</label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className={`form-select ${errors.paymentMethod ? 'error' : ''}`}
                        required
                      >
                        <option value="">Select payment method</option>
                        {paymentMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                      {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shipping Method *</label>
                      <select
                        name="shippingMethod"
                        value={formData.shippingMethod}
                        onChange={handleInputChange}
                        className={`form-select ${errors.shippingMethod ? 'error' : ''}`}
                        required
                      >
                        <option value="">Select shipping method</option>
                        {shippingMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                      {errors.shippingMethod && <span className="error-text">{errors.shippingMethod}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Applied (%)</label>
                    <input
                      type="number"
                      name="discountApplied"
                      value={formData.discountApplied}
                      onChange={handleInputChange}
                      className={`form-input ${errors.discountApplied ? 'error' : ''}`}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    {errors.discountApplied && <span className="error-text">{errors.discountApplied}</span>}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn btn-outline">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                    Reset Form
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
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
                </div>
              </form>
            </div>
          </div>

          {/* Prediction Results */}
          {prediction && (
            <div className="results-section">
              <div className="section-card">
                <div className="card-header">
                  <h2 className="card-title">Prediction Results</h2>
                  <div className="order-id-badge">Order ID: {prediction.orderId}</div>
                </div>

                <div className="prediction-overview">
                  <div className="risk-summary">
                    <div className={`risk-indicator ${prediction.riskLevel.toLowerCase().replace(' ', '-')}`}>
                      <div className="risk-circle">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={`${prediction.probability * 2.83} 283`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                            className="progress-ring"
                          />
                        </svg>
                        <div className="risk-text">
                          <span className="percentage">{prediction.probability}%</span>
                          <span className="label">Risk</span>
                        </div>
                      </div>
                    </div>
                    <div className="risk-details">
                      <h3 className={`risk-level ${prediction.riskLevel.toLowerCase().replace(' ', '-')}`}>
                        {prediction.riskLevel}
                      </h3>
                      <p className="confidence">Confidence: {prediction.confidence}%</p>
                      <div className="risk-description">
                        {prediction.riskLevel === 'High Risk' && 
                          'This order has a high likelihood of being returned. Consider additional precautions.'}
                        {prediction.riskLevel === 'Medium Risk' && 
                          'This order has moderate return risk. Standard monitoring recommended.'}
                        {prediction.riskLevel === 'Low Risk' && 
                          'This order has low return risk. Normal processing recommended.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="factors-analysis">
                  <h3 className="section-title">Contributing Factors</h3>
                  <div className="factors-grid">
                    {prediction.factors.map((factor, index) => (
                      <div key={index} className="factor-card">
                        <div className="factor-header">
                          <span className="factor-name">{factor.factor}</span>
                          <span className={`impact-level ${factor.impact.toLowerCase()}`}>
                            {factor.impact} Impact
                          </span>
                        </div>
                        <div className="factor-value">{factor.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recommendations">
                  <h3 className="section-title">Recommendations</h3>
                  <div className="recommendations-list">
                    {prediction.recommendations.map((recommendation, index) => (
                      <div key={index} className="recommendation-item">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4"/>
                          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.68 0 3.25.46 4.6 1.27"/>
                        </svg>
                        {recommendation}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="results-actions">
                  <button type="button" onClick={resetForm} className="btn btn-outline">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Another Order
                  </button>
                  <button type="button" onClick={saveAndContinue} className="btn btn-primary">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                    Save & Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddData