import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import logo from '../assets/logo.png';

function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let loginEmail = email.trim();
      if (!loginEmail.includes('@')) {
        loginEmail = `${loginEmail}@kavachh.local`;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password
      });

      if (authError) {
        throw authError;
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      background: 'var(--bg-main)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambient Glows */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0) 70%)',
        top: '15%',
        left: '20%',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0) 70%)',
        bottom: '15%',
        right: '20%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Brand/Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(249, 115, 22, 0.25)',
            border: '1px solid rgba(255,255,255,0.10)',
            marginBottom: '0.5rem',
            overflow: 'hidden',
            padding: '8px'
          }}>
            <img src={logo} alt="Kavachh Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '800', 
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-heading)',
            margin: 0,
            background: 'linear-gradient(to right, #ffffff, var(--text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            KAVACHH
          </h2>
          <p style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: '600',
            margin: 0 
          }}>
            Treasury CFO Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            alignItems: 'flex-start',
            padding: '0.85rem 1rem', 
            borderRadius: '10px',
            fontSize: '0.85rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            animation: 'shake 0.4s ease-in-out'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Email / ID Group */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600' }}>ID / Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="e.g. diyanegi or email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                required
                disabled={loading}
              />
              <Mail size={16} style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          {/* Password Group */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
                disabled={loading}
              />
              <Lock size={16} style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '0.8rem', 
              fontSize: '1rem',
              borderRadius: '10px',
              marginTop: '0.75rem',
              background: 'var(--color-primary)',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>

        </form>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Secured access for CFO & Treasury Managers only.
        </div>
      </div>
    </div>
  );
}

export default LoginView;
