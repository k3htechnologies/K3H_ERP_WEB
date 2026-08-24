import React, { useRef } from 'react'
import { Upload } from 'lucide-react'

interface ProfilePhotoUploaderProps {
    onChange: (file: File | null) => void
    error?: string
    label?: string | null
    required?: boolean
    uploadText?: string | null
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
    onChange,
    error,
    label = null,
    required = false,
    uploadText = null,
}) => {

    const galleryInputRef = useRef<HTMLInputElement>(null)

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0]

        if (!file) return

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            return
        }

        onChange(file)
        e.target.value = ''
    }

    return (
        <div className="w-full space-y-2">
            
            {label && (
                <div className="flex items-center gap-1">
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>

                    {required && (
                        <span className="text-red-500">*</span>
                    )}
                </div>
            )}

            <div
                onClick={() => galleryInputRef.current?.click()}
                className="w-full min-h-[120px] rounded-xl border border-[#6B8EFF] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ">

                <div
                    className="w-12 h-12 rounded-xl bg-[#E5EEFF] flex items-center justify-center mb-3 " >
                    <Upload className="w-6 h-6 text-[#135BEC]" />
                </div>

                {uploadText && (
                    <div className="text-base font-medium text-gray-600">
                        {uploadText}
                    </div>
                )}
            </div>

            <input
                ref={galleryInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className="hidden"
                onChange={handleGalleryChange}
            />

            {error && (
                <p className="text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    )
}
export default ProfilePhotoUploader;