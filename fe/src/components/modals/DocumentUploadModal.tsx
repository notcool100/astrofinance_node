import { useState } from "react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface RequiredDocument {
	id: string;
	name: string;
	description: string;
}

interface DocumentUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
	onUpload: (formData: FormData) => Promise<void>;
	isSubmitting: boolean;
	requiredDocuments: RequiredDocument[];
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
	isOpen,
	onClose,
	onUpload,
	isSubmitting,
	requiredDocuments,
}) => {
	const [files, setFiles] = useState<Record<string, File | null>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleFileChange = (documentId: string, file: File | null) => {
		// Validate file type and size
		if (file) {
			const allowedTypes = [
				"application/pdf",
				"image/jpeg",
				"image/jpg",
				"image/png",
			];
			const maxSize = 10 * 1024 * 1024; // 10MB

			if (!allowedTypes.includes(file.type)) {
				setErrors((prev) => ({
					...prev,
					[documentId]: "Please upload a PDF, JPEG, or PNG file",
				}));
				return;
			}

			if (file.size > maxSize) {
				setErrors((prev) => ({
					...prev,
					[documentId]: "File size must be less than 10MB",
				}));
				return;
			}
		}

		setFiles((prev) => ({ ...prev, [documentId]: file }));

		// Clear error when a valid file is selected
		if (file) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[documentId];
				return newErrors;
			});
		}
	};

	const validateFiles = () => {
		const newErrors: Record<string, string> = {};
		let isValid = true;

		requiredDocuments.forEach((doc) => {
			if (!files[doc.id]) {
				newErrors[doc.id] = `${doc.name} is required`;
				isValid = false;
			}
		});

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateFiles()) return;

		const formData = new FormData();

		// Append all files to the form data with proper structure
		Object.entries(files).forEach(([documentId, file]) => {
			if (file) {
				formData.append("files", file);
				formData.append("documentTypes", documentId);
				formData.append("documentNames", file.name);
			}
		});

		await onUpload(formData);
	};

	const handleClose = () => {
		// Reset state when closing
		setFiles({});
		setErrors({});
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Upload Required Documents"
		>
			<form onSubmit={handleSubmit}>
				<div className="space-y-4">
					<p className="text-sm text-gray-500">
						Please upload the following documents to proceed with your loan
						application. All documents should be in PDF, JPG, or PNG format and
						less than 10MB in size.
					</p>

					{requiredDocuments.map((doc) => (
						<div key={doc.id} className="border border-gray-200 rounded-md p-4">
							<div className="flex justify-between items-start">
								<div>
									<h4 className="text-sm font-medium text-gray-900">
										{doc.name}
									</h4>
									<p className="text-xs text-gray-500 mt-1">
										{doc.description}
									</p>
								</div>
								<div className="flex items-center">
									{files[doc.id] && (
										<button
											type="button"
											onClick={() => handleFileChange(doc.id, null)}
											className="text-gray-400 hover:text-gray-500 mr-2"
										>
											<XMarkIcon className="h-5 w-5" />
										</button>
									)}
									<label
										htmlFor={`file-${doc.id}`}
										className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
									>
										{files[doc.id] ? "Change File" : "Select File"}
										<input
											id={`file-${doc.id}`}
											name={doc.id}
											type="file"
											className="sr-only"
											onChange={(e) =>
												handleFileChange(doc.id, e.target.files?.[0] || null)
											}
											accept=".pdf,.jpg,.jpeg,.png"
										/>
									</label>
								</div>
							</div>

							{files[doc.id] && (
								<div className="mt-2 text-xs text-gray-500">
									Selected: {files[doc.id]?.name} (
									{(files[doc.id]?.size || 0) / 1024 < 1024
										? `${Math.round((files[doc.id]?.size || 0) / 1024)} KB`
										: `${Math.round(((files[doc.id]?.size || 0) / 1024 / 1024) * 10) / 10} MB`}
									)
								</div>
							)}

							{errors[doc.id] && (
								<div className="mt-1 text-xs text-red-500">
									{errors[doc.id]}
								</div>
							)}
						</div>
					))}
				</div>

				<div className="mt-6 flex justify-end space-x-3">
					<Button
						type="button"
						variant="secondary"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="primary"
						icon={<DocumentArrowUpIcon className="h-5 w-5 mr-1" />}
						isLoading={isSubmitting}
					>
						Upload Documents
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default DocumentUploadModal;
