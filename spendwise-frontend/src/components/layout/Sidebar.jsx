import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaChartPie, 
  FaReceipt, 
  FaPlusCircle, 
  FaWallet, 
  FaRobot, 
  FaFileAlt, 
  FaUser,
  FaBrain,
  FaMicrophone,
  FaTimes
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/dashboard', icon: <FaChartPie />, label: 'Dashboard' },
    { path: '/transactions', icon: <FaReceipt />, label: 'Transactions' },
    { path: '/add-expense', icon: <FaPlusCircle />, label: 'Add Expense' },
    { path: '/add-income', icon: <FaWallet />, label: 'Add Income' },
    { path: '/budgets', icon: <FaWallet />, label: 'Budgets' },
    { path: '/ai-insights', icon: <FaRobot />, label: 'AI Insights' },
    { path: '/ai-parser', icon: <FaBrain />, label: 'AI Parser' },
    // { path: '/ai-chat', icon: <FaMicrophone />, label: 'AI Chat' },
    { path: '/reports', icon: <FaFileAlt />, label: 'Reports' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && window.innerWidth <= 768 && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Close button for mobile */}
        <button 
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FaTimes />
        </button>
        
        <div className="sidebar-brand">
          💰 SpendWise AI
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-menu-item ${isActive ? 'active' : ''}`
              }
              onClick={handleLinkClick}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
        
        <div className="sidebar-footer">
          Made with ❤️
        </div>
      </div>
    </>
  );
};

export default Sidebar;