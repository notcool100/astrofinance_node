import React, { useEffect, useState } from "react";
import { TrashIcon, DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import userService, { UserDocument } from "@/services/user.service";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";

interface UserDocumentsProps {
    userId: string;
}

const UserDocuments: React.FC<UserDocumentsProps> = ({ userId }) => {
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [userId]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await userService.getUserDocuments(userId);
            setDocuments(response.documents || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm("Are you sure you want to delete this document?")) {
            return;
        }

        try {
            await userService.deleteUserDocument(documentId);
            toast.success("Document deleted successfully");
            fetchDocuments();
        } catch (error) {
            console.error("Error deleting document:", error);
            toast.error("Failed to delete document");
        }
    };

    const handleView = (document: UserDocument) => {
        setSelectedDocument(document);
        setShowModal(true);
    };

    const getDocumentTypeLabel = (type: string) => {
        switch (type) {
            case "NATIONAL_ID":
                return "National ID / Citizenship";
            case "PASSPORT":
                return "Passport";
            case "DRIVING_LICENSE":
                return "Driving License";
            case "OTHER":
                return "Other Document";
            default:
                return type;
        }
    };

    const getImageUrl = (filePath: string) => {
        // Use relative path to hide server details
        return `/uploads/${filePath}`;
    };

    if (loading) {
        return <div className="text-center py-4">Loading documents...</div>;
    }

    if (documents.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No documents uploaded yet
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Documents
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Document Preview */}
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                {doc.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                    <img
                                        src={getImageUrl(doc.filePath)}
                                        alt={doc.fileName}
                                        className="w-full h-48 object-cover cursor-pointer"
                                        onClick={() => handleView(doc)}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-48 bg-gray-50">
                                        <DocumentIcon className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Document Info */}
                            <div className="p-4">
                                <h4 className="font-medium text-gray-900 mb-1">
                                    {getDocumentTypeLabel(doc.documentType)}
                                </h4>
                                <p className="text-sm text-gray-500 truncate mb-2">
                                    {doc.fileName}
                                </p>
                                <p className="text-xs text-gray-400 mb-3">
                                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                </p>

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleView(doc)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(doc.id)}
                                        title="Delete document"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Image Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedDocument(null);
                }}
                title={selectedDocument ? getDocumentTypeLabel(selectedDocument.documentType) : "Document"}
            >
                {selectedDocument && (
                    <div className="space-y-4">
                        {selectedDocument.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <div className="max-h-[70vh] overflow-auto">
                                <img
                                    src={getImageUrl(selectedDocument.filePath)}
                                    alt={selectedDocument.fileName}
                                    className="w-full h-auto"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <DocumentIcon className="h-24 w-24 text-gray-400 mb-4" />
                                <p className="text-gray-600">
                                    This document type cannot be previewed
                                </p>
                                <a
                                    href={getImageUrl(selectedDocument.filePath)}
                                    download={selectedDocument.fileName}
                                    className="mt-4"
                                >
                                    <Button variant="primary" size="sm">
                                        Download Document
                                    </Button>
                                </a>
                            </div>
                        )}

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">File Name:</span>
                                <span className="font-medium">{selectedDocument.fileName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Uploaded:</span>
                                <span className="font-medium">
                                    {new Date(selectedDocument.uploadDate).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default UserDocuments;
