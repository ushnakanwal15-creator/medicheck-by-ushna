import React, { useState, useRef } from 'react';
import { MedicineRequest } from '../types';
import { Search, User, Loader2, ArrowRight, Mic, X, Camera } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: MedicineRequest) => void;
  isLoading: boolean;
  selectedLanguage: string;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, selectedLanguage }) => {
  const [medicineName, setMedicineName] = useState('');
  const [age, setAge] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Store the full data URL for preview
        setSelectedImage(base64String);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMedicineName(transcript);
      };
      
      recognition.start();
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Requirement: Either name OR image must be present, plus age
    if ((medicineName || selectedImage) && age) {
      // If image is present, we need to strip the data URL prefix for the API
      let cleanBase64 = undefined;
      if (selectedImage) {
        // Remove "data:image/jpeg;base64," part
        cleanBase64 = selectedImage.split(',')[1];
      }

      onSubmit({
        medicineName,
        age: parseInt(age, 10),
        language: selectedLanguage, // Use the prop passed from Header/App
        imageBase64: cleanBase64,
        imageMimeType: imageMimeType || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isLoading}
      />

      <div className="space-y-4">
        
        {/* Image Preview Section (Only visible if image selected) */}
        {selectedImage && (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-4 animate-in fade-in slide-in-from-top-2">
            <img src={selectedImage} alt="Medicine Preview" className="h-48 w-full object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-white text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Medicine Name Input */}
        <div className="space-y-1.5">
          <label htmlFor="medicine" className="block text-sm font-semibold text-slate-700">
            Medicine Name {selectedImage && <span className="font-normal text-slate-500">(Optional if image uploaded)</span>}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="medicine"
              className="block w-full pl-10 pr-24 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm placeholder-slate-400 text-slate-900"
              placeholder={selectedImage ? "Optional name..." : "e.g., Ibuprofen"}
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              required={!selectedImage}
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-100"
                title="Upload Image"
                disabled={isLoading}
              >
                <Camera className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={startListening}
                className={`p-2 transition-colors rounded-full hover:bg-slate-100 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-teal-600'}`}
                title="Use Voice Input"
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Age Input - Full Width now since Language is gone */}
        <div className="space-y-1.5">
          <label htmlFor="age" className="block text-sm font-semibold text-slate-700">
            Patient Age
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="number"
              id="age"
              min="0"
              max="120"
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm text-slate-900"
              placeholder="e.g., 35"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || (!medicineName && !selectedImage) || !age}
        className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold shadow-md transition-all ${
          isLoading || (!medicineName && !selectedImage) || !age
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <span>Check Medicine</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
};
