
import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Server, FileText, Globe, Image, Database, AlertTriangle } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-y-auto">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-800 shrink-0">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
            <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="text-emerald-500" />
                Privacy Policy
            </h2>
            <p className="text-slate-400 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="space-y-8 text-slate-300 leading-relaxed pr-2 pb-8">
        
        {/* 1. Introduction */}
        <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <FileText size={18} className="text-indigo-400"/> 
                1. Introduction
            </h3>
            <p className="text-sm mb-3">
                Welcome to Solve AI ("we," "our," or "us"). We are committed to protecting your privacy and ensuring transparency in how we handle your data. This Privacy Policy explains the types of information we collect, how it is used, and the measures we take to keep it secure when you use our math solving, calculator, and conversion tools.
            </p>
            <p className="text-sm">
                By using this application, you acknowledge the terms regarding data processing outlined below.
            </p>
        </section>

        {/* 2. Information We Collect */}
        <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Database size={18} className="text-blue-400"/> 
                2. Information Collection & Usage
            </h3>
            <div className="space-y-4">
                <div>
                    <h4 className="text-white font-semibold text-sm mb-1">A. User Inputs</h4>
                    <p className="text-sm text-slate-400">
                        We collect the mathematical equations, text prompts, and queries you explicitly enter into the application. This data is used solely to generate the solution or calculation you requested.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-semibold text-sm mb-1">B. Image Data</h4>
                    <p className="text-sm text-slate-400">
                        When you upload an image for analysis, the image file is processed in your browser and transmitted securely to our AI provider for interpretation. We do not permanently store your images on our servers.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-semibold text-sm mb-1">C. Technical Data</h4>
                    <p className="text-sm text-slate-400">
                        We may process minimal technical data such as browser type and device capabilities (e.g., checking for camera or microphone support) to ensure the application functions correctly on your device.
                    </p>
                </div>
            </div>
        </section>

        {/* 3. AI Processing */}
        <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Server size={18} className="text-purple-400"/> 
                3. AI Processing & Third-Party Services
            </h3>
            <p className="text-sm mb-4">
                This application leverages advanced Artificial Intelligence to solve complex math problems. To provide this service, specific data is shared with third-party providers under strict security protocols.
            </p>
            
            <div className="border-l-2 border-indigo-500 pl-4 mb-6">
                <h4 className="text-white font-bold text-sm mb-1">Google Gemini API</h4>
                <p className="text-sm mb-2">
                    We use Google's Generative AI (Gemini) models to analyze your text and image inputs.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-400">
                    <li><strong>Data Transmission:</strong> Inputs are sent securely via encrypted HTTPS connections.</li>
                    <li><strong>No Training on User Data:</strong> According to Google's API terms, data submitted via their standard API is typically not used to train their public foundation models.</li>
                    <li><strong>Retention:</strong> Data sent to the API is retained only temporarily for the purpose of generating the response and for safety monitoring.</li>
                </ul>
            </div>

            <div className="border-l-2 border-yellow-500 pl-4">
                <h4 className="text-white font-bold text-sm mb-1">Other APIs</h4>
                <p className="text-sm text-slate-400">
                    <strong>Exchange Rates:</strong> We use public APIs (such as Open Exchange Rates) to fetch real-time currency data. No user-identifiable data is sent to these services; we only request the rate data.
                </p>
            </div>
        </section>

        {/* 4. Data Storage */}
        <section>
             <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Lock size={18} className="text-rose-400"/> 
                4. Local Storage & Persistence
            </h3>
            <p className="text-sm mb-3">
                We prioritize your privacy by minimizing server-side storage.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
                <li><strong>History:</strong> Your calculation history is stored <strong>locally on your device</strong> using browser LocalStorage. This data does not leave your device unless you choose to export it (e.g., as a PDF).</li>
                <li><strong>Preferences:</strong> Settings such as "Dark Mode" or preferred theme are also stored locally.</li>
                <li><strong>Clearing Data:</strong> You can delete your history at any time using the "Clear History" button in the app, or by clearing your browser's cache/cookies.</li>
            </ul>
        </section>

        {/* 5. Security */}
        <section>
             <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield size={18} className="text-emerald-400"/> 
                5. Data Security
            </h3>
            <p className="text-sm mb-2">
                We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
                <li><strong>Encryption:</strong> All communication between your browser and the AI endpoints is encrypted using Transport Layer Security (TLS/SSL).</li>
                <li><strong>No Account Required:</strong> We do not require you to create an account or provide personal contact details (email, phone number) to use the calculator functions, reducing the risk of personal data exposure.</li>
            </ul>
        </section>

        {/* 6. Disclaimer */}
        <section className="bg-amber-900/20 p-5 rounded-xl border border-amber-500/30">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500"/> 
                6. Important Disclaimer
            </h3>
            <p className="text-sm text-slate-300">
                Please <strong>do not</strong> input sensitive personally identifiable information (PII), financial passwords, or confidential health data into the text prompts or images. While we process data securely, AI models should not be used as a vault for sensitive private information.
            </p>
        </section>

        {/* 7. Contact */}
        <section className="border-t border-slate-800 pt-6 mt-8">
            <p className="text-sm text-slate-400 text-center">
                If you have any questions or concerns regarding this Privacy Policy, please contact the developer support team.
            </p>
            <p className="text-xs text-slate-600 text-center mt-4">
                © 2025 Solve AI Inc. All rights reserved.
            </p>
        </section>
      </div>
    </div>
  );
};
