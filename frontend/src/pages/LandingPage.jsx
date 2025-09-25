import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './LandingPage.css'

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 19c-5 0-8-3-8-6s3-6 8-6c1.25 0 2.45.21 3.58.58A5 5 0 0 1 16 6c2.76 0 5 2.24 5 5s-2.24 5-5 5c-1.38 0-2.63-.56-3.54-1.46A13.85 13.85 0 0 1 9 19z"/>
        </svg>
      ),
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms analyze order patterns to predict return likelihood with high accuracy."
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
      title: "Real-time Analytics",
      description: "Get instant insights on return rates, revenue impact, and customer behavior patterns."
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
          <path d="M2 17L12 22L22 17"/>
          <path d="M2 12L12 17L22 12"/>
        </svg>
      ),
      title: "Easy Integration",
      description: "Seamlessly integrate with your existing e-commerce platform through our simple API."
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7A5 5 0 0 1 17 7V11"/>
        </svg>
      ),
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee and data protection compliance."
    }
  ]

  const stats = [
    { number: "95%", label: "Prediction Accuracy" },
    { number: "30%", label: "Reduction in Returns" },
    { number: "500K+", label: "Orders Analyzed" },
    { number: "24/7", label: "System Uptime" }
  ]

  return (
    <div className={`landing-page ${isVisible ? 'visible' : ''}`}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Predict Returns.
                <span className="gradient-text"> Save Revenue.</span>
              </h1>
              <p className="hero-description">
                Transform your e-commerce business with AI-powered return prediction. 
                Reduce return rates, optimize inventory, and boost customer satisfaction 
                with our advanced machine learning platform.
              </p>
              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary btn-large">
                  Start Free Trial
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                  </svg>
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Sign In
                </Link>
              </div>
              
            </div>
            <div className="hero-visual">
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="preview-title">ReturnPredict Dashboard</div>
                </div>
                <div className="preview-content">
                  <div className="preview-cards">
                    <div className="preview-card">
                      <div className="card-icon success">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      </div>
                      <div className="card-content">
                        <div className="card-title">Return Rate</div>
                        <div className="card-value">12.3%</div>
                        <div className="card-change positive">-2.4%</div>
                      </div>
                    </div>
                    <div className="preview-card">
                      <div className="card-icon warning">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                        </svg>
                      </div>
                      <div className="card-content">
                        <div className="card-title">Revenue Saved</div>
                        <div className="card-value">$45,230</div>
                        <div className="card-change positive">+18.7%</div>
                      </div>
                    </div>
                  </div>
                  <div className="preview-chart">
                    <div className="chart-bars">
                      <div className="bar" style={{height: '60%'}}></div>
                      <div className="bar" style={{height: '80%'}}></div>
                      <div className="bar" style={{height: '45%'}}></div>
                      <div className="bar" style={{height: '90%'}}></div>
                      <div className="bar" style={{height: '70%'}}></div>
                      <div className="bar" style={{height: '55%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bg-decoration">
          <div className="bg-shape bg-shape-1"></div>
          <div className="bg-shape bg-shape-2"></div>
          <div className="bg-shape bg-shape-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose ReturnPredict?</h2>
            <p className="section-description">
              Leverage cutting-edge AI technology to transform your return management strategy
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Reduce Your Return Rates?</h2>
            <p className="cta-description">
              Join thousands of businesses already using ReturnPredict to optimize their operations
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-large">
                Get Started Free
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12,5 19,12 12,19"/>
                </svg>
              </Link>
              <div className="cta-note">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage