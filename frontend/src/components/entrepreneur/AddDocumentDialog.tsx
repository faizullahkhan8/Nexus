import { useState, ChangeEvent } from 'react';
import { useUploadDocumentMutation } from '../../services/document.service';

const AddDocumentDialog = ({ onClose }: { onClose: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [originalName, setOriginalName] = useState('');
    const [displayFileName, setDisplayFileName] = useState('');
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');
    const [uploadDocument, { isLoading }] = useUploadDocumentMutation();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setOriginalName(selectedFile.name);
            setDisplayFileName(selectedFile.name.split('.')[0]);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('originalName', originalName);
        formData.append('visibility', visibility);

        try {
            await uploadDocument(formData);
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload New Document</h2>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select File</label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {file && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
                            <div>
                                <span className="font-bold block">Size:</span>
                                {formatBytes(file.size)}
                            </div>
                            <div>
                                <span className="font-bold block">Format:</span>
                                {file.name.split('.').pop()?.toUpperCase()}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={displayFileName}
                            onChange={(e) => setDisplayFileName(e.target.value)}
                            placeholder="How it appears on the platform"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Visibility</label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value as 'private' | 'public')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="private">Private (Vault)</option>
                            <option value="public">Public (Showcase)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 text-gray-500 hover:text-gray-700 font-medium">
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-400 disabled:shadow-none transition-all"
                    >
                        {isLoading ? 'Processing...' : 'Upload Document'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddDocumentDialog;