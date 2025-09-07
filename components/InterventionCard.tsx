import React from 'react';
import { InterventionTechnique } from '../types';
import GentleCard from './GentleCard';
import { theme } from '../styles/theme';

interface InterventionCardProps {
  intervention: InterventionTechnique;
  onSelect: () => void;
}

const InterventionCard: React.FC<InterventionCardProps> = ({ intervention, onSelect }) => {
  const getIcon = (name: string): React.ReactNode => {
    const iconStyle = { fontSize: '24px' };
    if (name.toLowerCase().includes('breathing')) return <span style={iconStyle}>🌬️</span>;
    if (name.toLowerCase().includes('grounding')) return <span style={iconStyle}>🌍</span>;
    if (name.toLowerCase().includes('exercise')) return <span style={iconStyle}>🏃</span>;
    if (name.toLowerCase().includes('visualization')) return <span style={iconStyle}>✨</span>;
    if (name.toLowerCase().includes('music')) return <span style={iconStyle}>🎵</span>;
    if (name.toLowerCase().includes('writing')) return <span style={iconStyle}>✏️</span>;
    return <span style={iconStyle}>💡</span>;
  };

  const getVariant = (name: string): 'primary' | 'secondary' | 'calm' => {
    if (name.toLowerCase().includes('breathing')) return 'secondary';
    if (name.toLowerCase().includes('grounding')) return 'calm';
    return 'primary';
  };

  return (
    <GentleCard
      variant={getVariant(intervention.name)}
      clickable={true}
      onClick={onSelect}
      hoverable={true}
      glow={true}
      padding="small"
      className="w-full"
      icon={getIcon(intervention.name)}
      title={intervention.name}
      subtitle={intervention.duration ? `⏱️ ${intervention.duration}` : undefined}
      animationDelay={100}
    >
      <p style={{
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.gray[300],
        lineHeight: theme.typography.lineHeight.relaxed,
        marginTop: theme.spacing[2]
      }}>
        {intervention.description}
      </p>
    </GentleCard>
  );
};

export default InterventionCard;
