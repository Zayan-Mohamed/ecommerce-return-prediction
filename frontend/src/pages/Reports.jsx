import React, { useState, useEffect } from 'react';
import './Reports.css';

const Reports = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock analytics data
  const mockReportData = {
    overview: {
      totalOrders: 2543,
      totalValue: 456789.50,
      avgRiskScore: 42.3,
      returnRate: 12.8,
      trends: {
        orders: '+15.2%',
        value: '+8.7%',
        riskScore: '-3.1%',
        returnRate: '+2.4%'
      }
    },
    riskDistribution: [
      { level: 'Low Risk', count: 1524, percentage: 59.9, color: '#38a169' },
      { level: 'Medium Risk', count: 712, percentage: 28.0, color: '#ed8936' },
      { level: 'High Risk', count: 307, percentage: 12.1, color: '#e53e3e' }
    ],
    categoryAnalysis: [
      { category: 'Electronics', orders: 856, avgRisk: 58.2, returnRate: 18.5 },
      { category: 'Clothing', orders: 623, avgRisk: 45.7, returnRate: 22.1 },
      { category: 'Footwear', orders: 445, avgRisk: 38.9, returnRate: 15.3 },
      { category: 'Home & Garden', orders: 398, avgRisk: 32.1, returnRate: 8.7 },
      { category: 'Books', orders: 221, avgRisk: 15.6, returnRate: 4.2 }
    ],
    monthlyTrends: [
      { month: 'Jul', orders: 1856, avgRisk: 45.2, returns: 238 },
      { month: 'Aug', orders: 2134, avgRisk: 43.8, returns: 267 },
      { month: 'Sep', orders: 2456, avgRisk: 41.5, returns: 289 },
      { month: 'Oct', orders: 2789, avgRisk: 40.2, returns: 325 },
      { month: 'Nov', orders: 2543, avgRisk: 42.3, returns: 326 },
      { month: 'Dec', orders: 2890, avgRisk: 44.1, returns: 378 }
    ],
    topFactors: [
      { factor: 'High Order Value', impact: 85, frequency: 234 },
      { factor: 'First-time Customer', impact: 78, frequency: 456 },
      { factor: 'Express Shipping', impact: 65, frequency: 589 },
      { factor: 'Weekend Purchase', impact: 52, frequency: 723 },
      { factor: 'Multiple Items', impact: 48, frequency: 834 },
      { factor: 'Gift Purchase', impact: 41, frequency: 445 }
    ]
  };

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setReportData(mockReportData);
      setLoading(false);
    };

    loadReportData();
  }, [dateRange]);

  const exportReport = () => {
    // Mock export functionality
    const reportContent = `E-commerce Return Prediction Report\nDate Range: ${dateRange}\n\nOverview:\nTotal Orders: ${reportData.overview.totalOrders}\nTotal Value: $${reportData.overview.totalValue.toLocaleString()}\nAverage Risk Score: ${reportData.overview.avgRiskScore}%\nReturn Rate: ${reportData.overview.returnRate}%`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'return-prediction-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating analytics report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">
              Comprehensive insights into return prediction performance
            </p>
          </div>
          <div className="header-actions">
            <select 
              className="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button className="btn btn-primary" onClick={exportReport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
          <button 
            className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon orders">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                  </div>
                  <div className="kpi-trend positive">
                    {reportData.overview.trends.orders}
                  </div>
                </div>
                <div className="kpi-value">{reportData.overview.totalOrders.toLocaleString()}</div>
                <div className="kpi-label">Total Orders</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon revenue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div className="kpi-trend positive">
                    {reportData.overview.trends.value}
                  </div>
                </div>
                <div className="kpi-value">${reportData.overview.totalValue.toLocaleString()}</div>
                <div className="kpi-label">Total Revenue</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon risk">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <div className="kpi-trend negative">
                    {reportData.overview.trends.riskScore}
                  </div>
                </div>
                <div className="kpi-value">{reportData.overview.avgRiskScore}%</div>
                <div className="kpi-label">Avg Risk Score</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon returns">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1,4 1,10 7,10"/>
                      <polyline points="23,20 23,14 17,14"/>
                      <path d="M20.49,9A9,9 0 0,0 5.64,5.64L1,10m22,4l-4.64,4.36A9,9 0 0,1 3.51,15"/>
                    </svg>
                  </div>
                  <div className="kpi-trend negative">
                    {reportData.overview.trends.returnRate}
                  </div>
                </div>
                <div className="kpi-value">{reportData.overview.returnRate}%</div>
                <div className="kpi-label">Return Rate</div>
              </div>
            </div>

            {/* Risk Distribution Chart */}
            <div className="chart-section">
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Risk Level Distribution</h3>
                  <p className="chart-subtitle">Breakdown of orders by risk classification</p>
                </div>
                <div className="risk-chart">
                  <div className="donut-chart">
                    <svg viewBox="0 0 200 200" className="donut">
                      {reportData.riskDistribution.map((item, index) => {
                        const total = reportData.riskDistribution.reduce((sum, d) => sum + d.count, 0);
                        const percentage = (item.count / total) * 100;
                        const strokeDasharray = `${percentage * 2.83} 283`;
                        const rotation = index === 0 ? 0 : 
                          reportData.riskDistribution.slice(0, index)
                            .reduce((sum, d) => sum + (d.count / total) * 360, 0);

                        return (
                          <circle
                            key={item.level}
                            cx="100"
                            cy="100"
                            r="45"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset="0"
                            transform={`rotate(${rotation - 90} 100 100)`}
                            className="donut-segment"
                          />
                        );
                      })}
                    </svg>
                    <div className="donut-center">
                      <div className="center-value">{reportData.overview.totalOrders.toLocaleString()}</div>
                      <div className="center-label">Total Orders</div>
                    </div>
                  </div>
                  <div className="legend">
                    {reportData.riskDistribution.map((item) => (
                      <div key={item.level} className="legend-item">
                        <div 
                          className="legend-color" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="legend-details">
                          <div className="legend-label">{item.level}</div>
                          <div className="legend-stats">
                            <span className="count">{item.count.toLocaleString()}</span>
                            <span className="percentage">({item.percentage}%)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            {/* Category Analysis */}
            <div className="chart-section">
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Category Performance Analysis</h3>
                  <p className="chart-subtitle">Risk scores and return rates by product category</p>
                </div>
                <div className="category-chart">
                  <div className="category-bars">
                    {reportData.categoryAnalysis.map((category, index) => (
                      <div key={category.category} className="category-bar">
                        <div className="category-info">
                          <div className="category-name">{category.category}</div>
                          <div className="category-stats">
                            <span className="orders">{category.orders} orders</span>
                          </div>
                        </div>
                        <div className="bars-container">
                          <div className="bar-group">
                            <div className="bar-label">Risk Score</div>
                            <div className="bar risk-bar">
                              <div 
                                className="bar-fill"
                                style={{ 
                                  width: `${category.avgRisk}%`,
                                  backgroundColor: category.avgRisk > 50 ? '#e53e3e' : 
                                                 category.avgRisk > 30 ? '#ed8936' : '#38a169'
                                }}
                              ></div>
                              <span className="bar-value">{category.avgRisk}%</span>
                            </div>
                          </div>
                          <div className="bar-group">
                            <div className="bar-label">Return Rate</div>
                            <div className="bar return-bar">
                              <div 
                                className="bar-fill"
                                style={{ 
                                  width: `${category.returnRate * 4}%`,
                                  backgroundColor: '#667eea'
                                }}
                              ></div>
                              <span className="bar-value">{category.returnRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Risk Factors */}
            <div className="chart-section">
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Top Risk Factors</h3>
                  <p className="chart-subtitle">Most impactful factors in return predictions</p>
                </div>
                <div className="factors-chart">
                  {reportData.topFactors.map((factor, index) => (
                    <div key={factor.factor} className="factor-item">
                      <div className="factor-rank">#{index + 1}</div>
                      <div className="factor-details">
                        <div className="factor-name">{factor.factor}</div>
                        <div className="factor-metrics">
                          <div className="metric">
                            <span className="metric-label">Impact:</span>
                            <span className="metric-value">{factor.impact}%</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Frequency:</span>
                            <span className="metric-value">{factor.frequency}</span>
                          </div>
                        </div>
                        <div className="impact-bar">
                          <div 
                            className="impact-fill"
                            style={{ width: `${factor.impact}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="tab-content">
            <div className="chart-section">
              <div className="chart-card full-width">
                <div className="chart-header">
                  <h3 className="chart-title">Monthly Trends</h3>
                  <p className="chart-subtitle">Order volume, risk scores, and returns over time</p>
                </div>
                <div className="trends-chart">
                  <div className="chart-grid">
                    <div className="y-axis">
                      <div className="y-label">Orders</div>
                      <div className="y-values">
                        <span>3000</span>
                        <span>2000</span>
                        <span>1000</span>
                        <span>0</span>
                      </div>
                    </div>
                    <div className="chart-area">
                      <div className="trend-lines">
                        {reportData.monthlyTrends.map((month, index) => (
                          <div key={month.month} className="month-column">
                            <div className="column-bars">
                              <div 
                                className="orders-bar"
                                style={{ height: `${(month.orders / 3000) * 100}%` }}
                                title={`${month.orders} orders`}
                              ></div>
                              <div 
                                className="returns-bar"
                                style={{ height: `${(month.returns / 3000) * 100}%` }}
                                title={`${month.returns} returns`}
                              ></div>
                            </div>
                            <div className="risk-line-point">
                              <div 
                                className="risk-point"
                                style={{ bottom: `${month.avgRisk}%` }}
                                title={`${month.avgRisk}% avg risk`}
                              ></div>
                            </div>
                            <div className="month-label">{month.month}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color orders"></div>
                      <span>Orders</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color returns"></div>
                      <span>Returns</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color risk-line"></div>
                      <span>Avg Risk Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="tab-content">
            <div className="insights-grid">
              <div className="insight-card positive">
                <div className="insight-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                </div>
                <div className="insight-content">
                  <h4 className="insight-title">Prediction Accuracy Improved</h4>
                  <p className="insight-description">
                    Our model accuracy has increased by 12% this month, with 94.2% correct predictions.
                  </p>
                  <div className="insight-metric">+12% accuracy</div>
                </div>
              </div>

              <div className="insight-card warning">
                <div className="insight-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="insight-content">
                  <h4 className="insight-title">Electronics Category Alert</h4>
                  <p className="insight-description">
                    Electronics show the highest return risk (58.2% avg). Consider implementing stricter policies.
                  </p>
                  <div className="insight-metric">18.5% return rate</div>
                </div>
              </div>

              <div className="insight-card info">
                <div className="insight-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <div className="insight-content">
                  <h4 className="insight-title">Customer Loyalty Impact</h4>
                  <p className="insight-description">
                    Repeat customers show 67% lower return risk. Loyalty programs are effectively reducing returns.
                  </p>
                  <div className="insight-metric">-67% risk reduction</div>
                </div>
              </div>

              <div className="insight-card positive">
                <div className="insight-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="insight-content">
                  <h4 className="insight-title">Weekend Orders Stabilized</h4>
                  <p className="insight-description">
                    Weekend order risk has decreased by 8% due to improved customer education initiatives.
                  </p>
                  <div className="insight-metric">-8% weekend risk</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="recommendations-section">
              <div className="section-card">
                <div className="section-header">
                  <h3 className="section-title">AI Recommendations</h3>
                  <p className="section-subtitle">Data-driven suggestions to optimize your return rates</p>
                </div>
                <div className="recommendations-list">
                  <div className="recommendation-item">
                    <div className="recommendation-priority high">High</div>
                    <div className="recommendation-content">
                      <h4>Implement Size Guide for Clothing</h4>
                      <p>Clothing returns are 22% higher than average. An interactive size guide could reduce returns by an estimated 15%.</p>
                      <div className="recommendation-impact">Potential savings: $45,000/month</div>
                    </div>
                  </div>

                  <div className="recommendation-item">
                    <div className="recommendation-priority medium">Medium</div>
                    <div className="recommendation-content">
                      <h4>Enhanced Product Descriptions for Electronics</h4>
                      <p>Add detailed specifications and compatibility information to reduce technical misunderstanding returns.</p>
                      <div className="recommendation-impact">Potential savings: $28,000/month</div>
                    </div>
                  </div>

                  <div className="recommendation-item">
                    <div className="recommendation-priority low">Low</div>
                    <div className="recommendation-content">
                      <h4>Loyalty Program Expansion</h4>
                      <p>Expand loyalty benefits to encourage repeat purchases and reduce first-time customer return risk.</p>
                      <div className="recommendation-impact">Potential savings: $12,000/month</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;