import React, { useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

export default function SettingsView({
  adminProfile,
  onUpdateProfile,
  onDbReset,
  onDbClear
}) {
  const [username, setUsername] = useState(adminProfile?.username || 'admin');
  const [displayName, setDisplayName] = useState(adminProfile?.name || 'Administrator');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ username, displayName, password });
    setPassword('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>System Settings</h1>
          <p>Configure access rules, credentials, and debug local database options.</p>
        </div>
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="chart-card">
          <h3 style={{ marginBottom: 20 }}>Admin Account Settings</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="settings-username">Admin Username</label>
              <input
                type="text"
                id="settings-username"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="settings-name">Display Name</label>
              <input
                type="text"
                id="settings-name"
                className="input-field"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="settings-password">New Password</label>
              <input
                type="password"
                id="settings-password"
                className="input-field"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>
              Save System Profile
            </button>
          </form>
        </div>

        <div className="chart-card">
          <h3 style={{ marginBottom: 20 }}>Database Operations</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            The console uses the browser's <strong>LocalStorage API</strong> to preserve adjustments. If you want to purge your modifications, or reset the catalog and tracking pipelines back to original sample assets, run the controls below.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-secondary" onClick={onDbReset} style={{ justifyContent: 'flex-start' }}>
              <RefreshCw style={{ color: 'var(--warning)', width: 16, height: 16 }} />
              Reset Database to Default Samples
            </button>
            <button className="btn btn-secondary" onClick={onDbClear} style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
              <Trash2 style={{ color: 'var(--danger)', width: 16, height: 16 }} />
              Wipe All Storage Data (Logout)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
