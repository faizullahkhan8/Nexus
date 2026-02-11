import { useState, useEffect } from 'react';
import { FileText, Download, X, ExternalLink } from 'lucide-react';

interface IDocument {
    _id: string;
    fileName: string;
    cloudinaryUrl: string;
    format: 'pdf' | 'doc' | 'docx';
    fileSize: number;
}

interface DocumentPreviewerProps {
    doc: IDocument | null;
    isOpen: boolean;
    onClose: () => void;
}

const DocumentPreviewer = ({ doc, isOpen, onClose }: DocumentPreviewerProps) => {
    const [__, setPageNumber] = useState(1);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setPageNumber(1);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);



    if (!isOpen || !doc) return null;

    const isWord = doc.format === 'doc' || doc.format === 'docx';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

                <div className="flex items-center justify-between px-6 py-4 bg-white border-b z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">
                                {doc.fileName}
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                {doc.format} • {(doc.fileSize / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={doc.cloudinaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Download</span>
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-xl transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-100 flex justify-center scrollbar-hide">
                    {isWord ? (
                        <div className="w-full h-full p-2">
                            <iframe
                                title="Word Viewer"
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(doc.cloudinaryUrl)}&embedded=true`}
                                className="w-full h-full border-none rounded-xl bg-white shadow-inner"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center bg-white m-4 rounded-2xl w-full">
                            <div className="p-6 bg-orange-50 rounded-full mb-4">
                                <ExternalLink size={40} className="text-orange-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Preview Not Available</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-xs">
                                This file format doesn't support direct previews. Please download it to view the contents.
                            </p>
                            <a
                                href={doc.cloudinaryUrl}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Download Now
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewer;