import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.tsx';

interface PhotoUploadProps {
  value?: string;
  onChange: (base64OrUrl: string) => void;
  label?: string;
  hint?: string;
  required?: boolean;
}

const BOTANICAL_PRESETS = [
  { name: 'Monstera Leaf', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tomato Plant', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80' },
  { name: 'Kitchen Basil', url: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fiddle Leaf Fig', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80' },
  { name: 'Snake Plant', url: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=600&q=80' },
  { name: 'Chili Plant', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80' },
];

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  label = 'Plant Photograph',
  hint = 'Upload a clear photograph of leaves, stem, or pot',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onChange(result);
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-medium underline-offset-2 hover:underline"
        >
          {showPresets ? 'Hide presets' : 'Select from gallery presets'}
        </button>
      </div>

      {showPresets && (
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
          <p className="text-xs text-stone-500 font-medium">Quick sample photos for instant testing:</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {BOTANICAL_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  onChange(p.url);
                  setShowPresets(false);
                }}
                className="group relative rounded-lg overflow-hidden border border-stone-200 hover:border-emerald-500 transition-all aspect-square"
              >
                <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute inset-x-0 bottom-0 bg-stone-900/70 text-[9px] text-white py-0.5 px-1 truncate text-center">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group max-h-64 flex items-center justify-center">
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Replace Photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onChange('')}
            >
              Remove
            </Button>
          </div>
          <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-stone-200 hover:border-emerald-400 hover:bg-stone-50/80 bg-white'
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-stone-800">
            Click to upload or drag & drop photograph
          </p>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">{hint}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">
              <Camera className="w-3.5 h-3.5" /> Camera support
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg font-medium">
              <ImageIcon className="w-3.5 h-3.5" /> JPEG, PNG, WEBP
            </span>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
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
