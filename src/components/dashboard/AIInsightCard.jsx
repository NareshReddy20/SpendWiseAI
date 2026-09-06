import React from 'react';

const AIInsightCard = ({ insight, icon = '💡' }) => {
  return (
    <div className="insight-card">
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <span className="insight-icon">{icon}</span>
        <div>
          <h4 style={{ marginBottom: '4px' }}>AI Insight</h4>
          <p>{insight}</p>
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;