import React, { useState } from "react";
import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface DocumentUploadFieldProps {
    documentType: string;
    label: string;
    onFileChange: (file: File | null) => void;
    error?: string;
    required?: boolean;
}

const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
    documentType,
    label,
    onFileChange,
    error,
    required = false,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            // Validate file type
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
            if (!allowedTypes.includes(file.type)) {
                onFileChange(null);
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                onFileChange(null);
                return;
            }

            setSelectedFile(file);

            // Create preview for images
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }

            onFileChange(file);
        } else {
            setSelectedFile(null);
            setPreview(null);
            onFileChange(null);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreview(null);
        onFileChange(null);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {!selectedFile ? (
                <div className="mt-1">
                    <label
                        htmlFor={`file-upload-${documentType}`}
                        className="cursor-pointer block"
                    >
                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-500 transition-colors">
                            <div className="space-y-1 text-center">
                                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <span className="relative font-medium text-primary-600 hover:text-primary-500">
                                        Upload a file
                                    </span>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    PDF, JPG, PNG up to 5MB
                                </p>
                            </div>
                        </div>
                        <input
                            id={`file-upload-${documentType}`}
                            name={`file-upload-${documentType}`}
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            ) : (
                <div className="mt-1 flex items-center space-x-4">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Document preview"
                            className="h-20 w-20 object-cover rounded border"
                        />
                    ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded border">
                            <DocumentArrowUpIcon className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-50"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default DocumentUploadField;
