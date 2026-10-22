import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, CheckCircle, RefreshCw, X } from 'lucide-react';
import { Button } from './Button.tsx';

interface MultiPhotoUploadProps {
  values?: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  hint?: string;
}

export const MultiPhotoUpload: React.FC<MultiPhotoUploadProps> = ({
  values = [],
  onChange,
  label = 'Plant Photographs',
  hint = 'Upload clear photographs of your plant',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onChange([...values, result]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removePhoto = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
        {label}
      </label>

      {/* Grid of uploaded photos */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {values.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200">
            <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 p-1 bg-stone-900/50 text-white rounded-full hover:bg-rose-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* Upload box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-stone-300 hover:border-emerald-400 hover:bg-stone-50'
          }`}
        >
          <Upload className="w-6 h-6 text-stone-400 mb-1" />
          <span className="text-[10px] font-semibold text-stone-500">Add Photo</span>
        </div>
      </div>
      
      <p className="text-xs text-stone-500">{hint}</p>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};
