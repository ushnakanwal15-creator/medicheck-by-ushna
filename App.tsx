import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { MedicineRequest, MedicineResponse, LanguageOption } from './types';
import { fetchMedicineInfo } from './services/geminiService';
import { Pill, Sparkles, Lock, Clock } from 'lucide-react';

// Constants for Subscription Logic
const IMAGE_UPLOAD_LIMIT = 3;
const COOLDOWN_PERIOD_MS = 9 * 60 * 60 * 1000; // 9 hours
const STORAGE_KEY = 'mediCheck_uploads';

interface UploadState {
  count: number;
  lastUploadTime: number;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestAge, setRequestAge] = useState<number>(0);
  const [language, setLanguage] = useState<string>(LanguageOption.ENGLISH);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [nextUnlockTime, setNextUnlockTime] = useState<Date | null>(null);

  const checkLimit = (): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      let state: UploadState = { count: 0, lastUploadTime: 0 };

      if (stored) {
        state = JSON.parse(stored);
      }

      // If cooldown period has passed, reset the counter
      if (now - state.lastUploadTime > COOLDOWN_PERIOD_MS) {
        state.count = 0;
        state.lastUploadTime = 0;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }

      // If limit reached
      if (state.count >= IMAGE_UPLOAD_LIMIT) {
        const unlockTime = new Date(state.lastUploadTime + COOLDOWN_PERIOD_MS);
        setNextUnlockTime(unlockTime);
        setShowSubscriptionModal(true);
        return false;
      }

      return true;
    } catch (e) {
      console.error("Error checking limits", e);
      return true; // Fail open if error
    }
  };

  const incrementUploadCount = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      let state: UploadState = { count: 0, lastUploadTime: 0 };

      if (stored) {
        state = JSON.parse(stored);
        // Reset logic if needed
        if (now - state.lastUploadTime > COOLDOWN_PERIOD_MS) {
          state.count = 0;
        }
      }

      state.count += 1;
      state.lastUploadTime = now; 
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error incrementing count", e);
    }
  };

  const handleSearch = async (request: MedicineRequest) => {
    // Only enforce limits if an image is being uploaded
    if (request.imageBase64) {
        const allowed = checkLimit();
        if (!allowed) return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setRequestAge(request.age);

    try {
      const data = await fetchMedicineInfo(request);
      setResult(data);
      
      // Increment count only on success and if it was an image search
      if (request.imageBase64) {
        incrementUploadCount();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-12 relative">
      <Header selectedLanguage={language} onLanguageChange={setLanguage} />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 pt-8">
        
        {/* Initial State / Hero */}
        {!result && !loading && !error && (
           <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white p-4 rounded-full inline-flex mb-6 shadow-sm">
                <Pill className="w-10 h-10 text-teal-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Check Your Medicine Safely</h2>
              <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                Get instant dosage guidance and side effects. Upload an image or type the name.
              </p>
           </div>
        )}

        <div className="space-y-8">
          <InputForm 
            onSubmit={handleSearch} 
            isLoading={loading} 
            selectedLanguage={language}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 animate-in fade-in">
              <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {loading && (
             <div className="space-y-6 animate-pulse">
                <div className="h-32 bg-slate-200 rounded-2xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="h-48 bg-slate-200 rounded-2xl"></div>
                   <div className="h-48 bg-slate-200 rounded-2xl"></div>
                </div>
             </div>
          )}

          {result && (
            <div className="relative">
               <ResultCard data={result} requestAge={requestAge} />
               
               <div className="mt-8 flex justify-center">
                 <button 
                   onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                   className="text-teal-600 font-medium hover:text-teal-800 flex items-center gap-2 transition-colors"
                 >
                   <Sparkles className="w-4 h-4" />
                   Check another medicine
                 </button>
               </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-auto py-8 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} MediCheck by USHNA. For informational purposes only.</p>
      </footer>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>
            
            <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-teal-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900">Upload Limit Reached</h3>
            
            <p className="text-slate-600">
              You have reached the limit of {IMAGE_UPLOAD_LIMIT} free image uploads.
              To continue using the image analysis feature, please subscribe or wait for the cooldown period to end.
            </p>

            {nextUnlockTime && (
              <div className="bg-slate-100 rounded-lg p-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
                <Clock className="w-4 h-4" />
                <span>Next upload available at: {nextUnlockTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button 
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98]"
                onClick={() => alert("Subscription feature is coming soon!")}
              >
                Subscribe Now - $4.99/mo
              </button>
              <button 
                onClick={() => setShowSubscriptionModal(false)}
                className="w-full py-3 px-4 bg-white border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icon for the error state
const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

export default App;
