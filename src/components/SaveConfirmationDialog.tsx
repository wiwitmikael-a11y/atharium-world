
import React from 'react';
import Icon from './Icon';

interface SaveConfirmationDialogProps {
  show: boolean;
}

const SaveConfirmationDialog: React.FC<SaveConfirmationDialogProps> = ({ show }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex items-center space-x-4 bg-gray-900/80 backdrop-blur-md border-2 border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-400/20 text-white p-4 pop-in">
        <Icon name="checkmark" className="w-8 h-8 text-green-400" />
        <span className="text-xl font-cinzel">Game Saved!</span>
      </div>
    </div>
  );
};

export default SaveConfirmationDialog;
