import React from 'react';
import { CrisisResources } from '../types';

interface CrisisResourcesProps {
  isVisible: boolean;
  onClose: () => void;
  resources?: CrisisResources[];
}

const defaultResources: CrisisResources[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    url: 'https://988lifeline.org'
  },
  {
    name: 'Crisis Text Line',
    text: 'Text HOME to 741741'
  },
  {
    name: 'Emergency Services',
    number: '911'
  },
  {
    name: 'ADHD Support Groups',
    url: 'https://chadd.org/about-add-adhd/support-groups/'
  }
];

const CrisisResourcesComponent: React.FC<CrisisResourcesProps> = ({ 
  isVisible, 
  onClose, 
  resources = defaultResources 
}) => {
  if (!isVisible) return null;

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleText = (message: string) => {
    // Extract the number and text from formats like "Text HOME to 741741"
    const textMatch = message.match(/text\s+(\w+)\s+to\s+(\d+)/i);
    if (textMatch) {
      const [, text, number] = textMatch;
      window.location.href = `sms:${number}?body=${encodeURIComponent(text)}`;
    }
  };

  const handleWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-red-500">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🆘</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Crisis Resources</h2>
          <p className="text-gray-300 text-sm">
            If you're in immediate danger, please reach out for help right now.
          </p>
        </div>

        <div className="space-y-4">
          {resources.map((resource, index) => (
            <div 
              key={index}
              className="bg-gray-700 rounded-xl p-4 border border-gray-600"
            >
              <h3 className="font-bold text-white mb-2">{resource.name}</h3>
              
              <div className="space-y-2">
                {resource.number && (
                  <button
                    onClick={() => handleCall(resource.number!)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    📞 Call {resource.number}
                  </button>
                )}
                
                {resource.text && (
                  <button
                    onClick={() => handleText(resource.text!)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    💬 {resource.text}
                  </button>
                )}
                
                {resource.url && (
                  <button
                    onClick={() => handleWebsite(resource.url!)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    🌐 Visit Website
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-900 bg-opacity-50 rounded-lg border border-yellow-600">
          <p className="text-yellow-200 text-sm text-center">
            <strong>Remember:</strong> You are not alone. Your life has value. These feelings are temporary, but you are important.
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrisisResourcesComponent;
