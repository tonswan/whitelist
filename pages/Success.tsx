import React, { useContext } from 'react';
import { AppContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';

export const Success: React.FC = () => {
    const { state } = useContext(AppContext);
    const t = TRANSLATIONS[state.language];
    const navigate = useNavigate();

    // Placeholder link as requested in the prompt
    const VPN_KEY_LINK = "https://example.com/vpn-setup-instructions";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Success!</h1>
            <p className="text-gray-300 mb-8">
                Your subscription is now active until {new Date(state.subscription.expiryDate || 0).toLocaleDateString()}.
            </p>

            <a 
                href={VPN_KEY_LINK} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-blue-500 transition-all mb-4 block"
            >
                {t.setupInstructions}
            </a>

            <button 
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white text-sm"
            >
                Back to Home
            </button>
        </div>
    );
};