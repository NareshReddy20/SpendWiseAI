import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Dashboard</h2>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="avatar">{user?.name?.[0] || 'U'}</div>
          <span>{user?.name || 'User'}</span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            background: 'none', 
            color: '#666',
            fontSize: '20px',
            padding: '4px 8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;