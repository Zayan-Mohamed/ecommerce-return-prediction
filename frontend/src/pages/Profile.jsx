import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    personalInfo: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      role: 'Data Analyst',
      department: 'Analytics',
      joinDate: '2023-06-15'
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
        weeklyReports: true,
        riskAlerts: true,
        systemUpdates: false
      },
      display: {
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD'
      },
      privacy: {
        profileVisibility: 'team',
        dataSharing: false,
        analyticsTracking: true,
        marketingEmails: false
      }
    },
    security: {
      lastPasswordChange: '2024-01-10',
      twoFactorEnabled: false,
      activeSessions: 3,
      lastLogin: '2024-01-15 09:30 AM'
    }
  });

  const [formData, setFormData] = useState(profileData.personalInfo);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(profileData.personalInfo);
  }, [profileData]);

  const handleInputChange = (section, field, value) => {
    if (section === 'personalInfo') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'preferences') {
      setProfileData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: {
            ...prev.preferences[field],
            ...value
          }
        }
      }));
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProfileData(prev => ({
      ...prev,
      personalInfo: formData
    }));
    
    setLoading(false);
    // Show success message (in a real app, you'd use a toast notification)
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setErrors({});

    const newErrors = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setLoading(false);
    alert('Password updated successfully!');
  };

  const toggleTwoFactor = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProfileData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        twoFactorEnabled: !prev.security.twoFactorEnabled
      }
    }));
    
    setLoading(false);
  };

  const handleLogoutAllSessions = async () => {
    if (window.confirm('Are you sure you want to log out of all other sessions?')) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(prev => ({
        ...prev,
        security: {
          ...prev.security,
          activeSessions: 1
        }
      }));
      
      setLoading(false);
      alert('Successfully logged out of all other sessions');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <span className="avatar-initials">
                  {profileData.personalInfo.firstName[0]}{profileData.personalInfo.lastName[0]}
                </span>
              </div>
              <button className="avatar-upload">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
              </h1>
              <p className="profile-role">{profileData.personalInfo.role}</p>
              <p className="profile-department">{profileData.personalInfo.department}</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">15</div>
              <div className="stat-label">Predictions Today</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">94.2%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {Math.floor((new Date() - new Date(profileData.personalInfo.joinDate)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="stat-label">Days Active</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile Information
          </button>
          <button 
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            Preferences
          </button>
          <button 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Security
          </button>
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Notifications
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="settings-card">
              <div className="card-header">
                <h3 className="card-title">Personal Information</h3>
                <p className="card-subtitle">Update your personal details and contact information</p>
              </div>
              <div className="card-content">
                <form className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className={`form-input ${errors.firstName ? 'error' : ''}`}
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className={`form-input ${errors.lastName ? 'error' : ''}`}
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        value={formData.email}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        placeholder="Enter your email"
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.role}
                        onChange={(e) => handleInputChange('personalInfo', 'role', e.target.value)}
                        placeholder="Enter your role"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.department}
                        onChange={(e) => handleInputChange('personalInfo', 'department', e.target.value)}
                        placeholder="Enter your department"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17,21 17,13 7,13 7,21"/>
                            <polyline points="7,3 7,8 15,8"/>
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="preferences-container">
              {/* Display Preferences */}
              <div className="settings-card">
                <div className="card-header">
                  <h3 className="card-title">Display Preferences</h3>
                  <p className="card-subtitle">Customize how the application looks and behaves</p>
                </div>
                <div className="card-content">
                  <div className="preference-group">
                    <div className="preference-item">
                      <div className="preference-info">
                        <label className="preference-label">Theme</label>
                        <p className="preference-description">Choose your preferred color theme</p>
                      </div>
                      <select 
                        className="preference-select"
                        value={profileData.preferences.display.theme}
                        onChange={(e) => handleInputChange('preferences', 'display', { theme: e.target.value })}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <label className="preference-label">Language</label>
                        <p className="preference-description">Select your preferred language</p>
                      </div>
                      <select 
                        className="preference-select"
                        value={profileData.preferences.display.language}
                        onChange={(e) => handleInputChange('preferences', 'display', { language: e.target.value })}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <label className="preference-label">Timezone</label>
                        <p className="preference-description">Set your local timezone</p>
                      </div>
                      <select 
                        className="preference-select"
                        value={profileData.preferences.display.timezone}
                        onChange={(e) => handleInputChange('preferences', 'display', { timezone: e.target.value })}
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Preferences */}
              <div className="settings-card">
                <div className="card-header">
                  <h3 className="card-title">Privacy Settings</h3>
                  <p className="card-subtitle">Control your privacy and data sharing preferences</p>
                </div>
                <div className="card-content">
                  <div className="preference-group">
                    <div className="preference-toggle">
                      <div className="preference-info">
                        <label className="preference-label">Data Sharing</label>
                        <p className="preference-description">Allow anonymous usage data collection to improve the service</p>
                      </div>
                      <div className={`toggle ${profileData.preferences.privacy.dataSharing ? 'active' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={profileData.preferences.privacy.dataSharing}
                          onChange={(e) => handleInputChange('preferences', 'privacy', { dataSharing: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>

                    <div className="preference-toggle">
                      <div className="preference-info">
                        <label className="preference-label">Analytics Tracking</label>
                        <p className="preference-description">Help us improve by tracking app usage and performance</p>
                      </div>
                      <div className={`toggle ${profileData.preferences.privacy.analyticsTracking ? 'active' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={profileData.preferences.privacy.analyticsTracking}
                          onChange={(e) => handleInputChange('preferences', 'privacy', { analyticsTracking: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>

                    <div className="preference-toggle">
                      <div className="preference-info">
                        <label className="preference-label">Marketing Emails</label>
                        <p className="preference-description">Receive emails about new features and updates</p>
                      </div>
                      <div className={`toggle ${profileData.preferences.privacy.marketingEmails ? 'active' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={profileData.preferences.privacy.marketingEmails}
                          onChange={(e) => handleInputChange('preferences', 'privacy', { marketingEmails: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="security-container">
              {/* Password Change */}
              <div className="settings-card">
                <div className="card-header">
                  <h3 className="card-title">Change Password</h3>
                  <p className="card-subtitle">Update your account password</p>
                </div>
                <div className="card-content">
                  <form className="password-form">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                      />
                      {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className={`form-input ${errors.newPassword ? 'error' : ''}`}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                        />
                        {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handlePasswordChange}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="spinner"></div>
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Security Settings */}
              <div className="settings-card">
                <div className="card-header">
                  <h3 className="card-title">Security Settings</h3>
                  <p className="card-subtitle">Manage your account security options</p>
                </div>
                <div className="card-content">
                  <div className="security-options">
                    <div className="security-item">
                      <div className="security-info">
                        <h4 className="security-title">Two-Factor Authentication</h4>
                        <p className="security-description">
                          Add an extra layer of security to your account
                        </p>
                        <div className="security-status">
                          Status: <span className={`status ${profileData.security.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                            {profileData.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <button 
                        className={`btn ${profileData.security.twoFactorEnabled ? 'btn-outline' : 'btn-primary'}`}
                        onClick={toggleTwoFactor}
                        disabled={loading}
                      >
                        {profileData.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>

                    <div className="security-item">
                      <div className="security-info">
                        <h4 className="security-title">Active Sessions</h4>
                        <p className="security-description">
                          You are currently signed in to {profileData.security.activeSessions} devices
                        </p>
                        <div className="security-status">
                          Last Login: {profileData.security.lastLogin}
                        </div>
                      </div>
                      <button 
                        className="btn btn-outline"
                        onClick={handleLogoutAllSessions}
                        disabled={loading}
                      >
                        Logout All Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-card">
              <div className="card-header">
                <h3 className="card-title">Notification Preferences</h3>
                <p className="card-subtitle">Choose how you want to be notified about important events</p>
              </div>
              <div className="card-content">
                <div className="notification-groups">
                  <div className="notification-group">
                    <h4 className="group-title">General Notifications</h4>
                    <div className="notification-items">
                      <div className="notification-toggle">
                        <div className="notification-info">
                          <label className="notification-label">Email Notifications</label>
                          <p className="notification-description">Receive notifications via email</p>
                        </div>
                        <div className={`toggle ${profileData.preferences.notifications.email ? 'active' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={profileData.preferences.notifications.email}
                            onChange={(e) => handleInputChange('preferences', 'notifications', { email: e.target.checked })}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>

                      <div className="notification-toggle">
                        <div className="notification-info">
                          <label className="notification-label">Push Notifications</label>
                          <p className="notification-description">Receive browser push notifications</p>
                        </div>
                        <div className={`toggle ${profileData.preferences.notifications.push ? 'active' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={profileData.preferences.notifications.push}
                            onChange={(e) => handleInputChange('preferences', 'notifications', { push: e.target.checked })}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>

                      <div className="notification-toggle">
                        <div className="notification-info">
                          <label className="notification-label">SMS Notifications</label>
                          <p className="notification-description">Receive notifications via text message</p>
                        </div>
                        <div className={`toggle ${profileData.preferences.notifications.sms ? 'active' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={profileData.preferences.notifications.sms}
                            onChange={(e) => handleInputChange('preferences', 'notifications', { sms: e.target.checked })}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="notification-group">
                    <h4 className="group-title">Application Alerts</h4>
                    <div className="notification-items">
                      <div className="notification-toggle">
                        <div className="notification-info">
                          <label className="notification-label">Weekly Reports</label>
                          <p className="notification-description">Receive weekly analytics reports</p>
                        </div>
                        <div className={`toggle ${profileData.preferences.notifications.weeklyReports ? 'active' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={profileData.preferences.notifications.weeklyReports}
                            onChange={(e) => handleInputChange('preferences', 'notifications', { weeklyReports: e.target.checked })}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>

                      <div className="notification-toggle">
                        <div className="notification-info">
                          <label className="notification-label">Risk Alerts</label>
                          <p className="notification-description">Get notified about high-risk predictions</p>
                        </div>
                        <div className={`toggle ${profileData.preferences.notifications.riskAlerts ? 'active' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={profileData.preferences.notifications.riskAlerts}
                            onChange={(e) => handleInputChange('preferences', 'notifications', { riskAlerts: e.target.checked })}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>

                      <div className="notification-toggle">
                        <div className="notification-info">
                          <label className="notification-label">System Updates</label>
                          <p className="notification-description">Be notified about system maintenance and updates</p>
                        </div>
                        <div className={`toggle ${profileData.preferences.notifications.systemUpdates ? 'active' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={profileData.preferences.notifications.systemUpdates}
                            onChange={(e) => handleInputChange('preferences', 'notifications', { systemUpdates: e.target.checked })}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;