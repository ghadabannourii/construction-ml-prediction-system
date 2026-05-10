import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useRef, useState, DragEvent, ChangeEvent } from 'react';

type ImageUploaderProps = {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
};

export default function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    // Créer la prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Notifier le parent
    onImageSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300
            ${isDragging 
              ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/30'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
              ${isDragging ? 'bg-blue-500/20' : 'bg-slate-700/50'}
            `}>
              <Upload size={32} className={isDragging ? 'text-blue-400' : 'text-slate-400'} />
            </div>
            
            <div>
              <p className="text-lg font-semibold text-white mb-1">
                {isDragging ? 'Déposez l\'image ici' : 'Glissez une image ici'}
              </p>
              <p className="text-sm text-slate-400">
                ou cliquez pour sélectionner un fichier
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Formats acceptés: JPG, PNG, JPEG
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="relative group">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700">
            <img
              src={preview}
              alt="Prévisualisation"
              className="w-full h-auto max-h-96 object-contain bg-slate-800"
            />
            
            {/* Overlay avec bouton supprimer */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleClear}
                disabled={disabled}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <X size={18} />
                Supprimer
              </button>
            </div>
          </div>

          {/* Badge "Image sélectionnée" */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full glass flex items-center gap-2">
            <ImageIcon size={14} className="text-green-400" />
            <span className="text-xs text-white font-medium">Image sélectionnée</span>
          </div>
        </div>
      )}
    </div>
  );
}
