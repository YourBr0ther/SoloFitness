'use client';

import { useState } from 'react';
import { User, Camera, X } from 'lucide-react';

interface ProfilePictureProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUpload?: (base64: string) => Promise<void>;
  onRemove?: () => Promise<void>;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export default function ProfilePicture({
  src,
  alt = 'Profile picture',
  size = 'md',
  editable = false,
  onUpload,
  onRemove,
  className = '',
}: ProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUpload) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await onUpload(base64);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setIsUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    setIsUploading(true);
    try {
      await onRemove();
    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove image');
    }
    setIsUploading(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          overflow-hidden 
          bg-primary-600/20 
          border-2 
          border-primary-500/30 
          flex 
          items-center 
          justify-center
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={`${iconSizeClasses[size]} text-primary-400`} />
        )}
      </div>

      {editable && (
        <>
          <label
            htmlFor="profile-picture-upload"
            className="
              absolute 
              -bottom-1 
              -right-1 
              w-6 
              h-6 
              bg-primary-500 
              hover:bg-primary-600 
              rounded-full 
              flex 
              items-center 
              justify-center 
              cursor-pointer 
              transition-colors 
              border-2 
              border-background-dark
            "
          >
            <Camera className="w-3 h-3 text-white" />
          </label>
          
          <input
            id="profile-picture-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />

          {src && onRemove && (
            <button
              onClick={handleRemove}
              disabled={isUploading}
              className="
                absolute 
                -top-1 
                -right-1 
                w-6 
                h-6 
                bg-red-500 
                hover:bg-red-600 
                rounded-full 
                flex 
                items-center 
                justify-center 
                cursor-pointer 
                transition-colors 
                border-2 
                border-background-dark
              "
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}