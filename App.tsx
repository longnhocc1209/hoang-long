
import React, { useState, useCallback, useRef } from 'react';
import { editImage } from './services/geminiService';
import { UploadIcon, SparklesIcon, DownloadIcon } from './components/icons';

type ImageData = {
    base64: string;
    mimeType: string;
};

const App: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Vui lòng chọn một tệp hình ảnh hợp lệ.');
                return;
            }
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setOriginalImagePreview(result);
                const base64Data = result.split(',')[1];
                setOriginalImage({ base64: base64Data, mimeType: file.type });
                setEditedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleSubmit = useCallback(async () => {
        if (!originalImage) {
            setError('Vui lòng tải lên một hình ảnh.');
            return;
        }
        if (!prompt.trim()) {
            setError('Vui lòng nhập yêu cầu chỉnh sửa.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const result = await editImage(originalImage.base64, originalImage.mimeType, prompt);
            if (result.image) {
                setEditedImage(`data:image/png;base64,${result.image}`);
            } else {
                setError(result.text || 'Không thể tạo ảnh. Vui lòng thử lại với yêu cầu khác.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không mong muốn.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [originalImage, prompt]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-6xl text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Trình Chỉnh Sửa Ảnh AI
                </h1>
                <p className="mt-2 text-lg text-gray-400">Chỉnh sửa quần áo, tóc, bối cảnh và hơn thế nữa với Nano Banana</p>
            </header>

            <main className="w-full max-w-6xl flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col gap-4">
                        <h2 className="text-2xl font-semibold text-center text-purple-300">1. Tải ảnh của bạn</h2>
                        <div 
                            className="relative w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-purple-400 transition-colors duration-300 bg-gray-800"
                            onClick={triggerFileSelect}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                            {originalImagePreview ? (
                                <img src={originalImagePreview} alt="Xem trước ảnh gốc" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <>
                                    <UploadIcon className="w-12 h-12 text-gray-500 mb-2" />
                                    <span className="text-gray-400">Nhấp để chọn ảnh</span>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col gap-4">
                        <h2 className="text-2xl font-semibold text-center text-purple-300">2. Mô tả chỉnh sửa</h2>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ví dụ: thay áo sơ mi thành màu đỏ, thêm một chiếc mũ, đổi nền thành bãi biển..."
                            className="w-full h-full min-h-[16rem] bg-gray-800 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !originalImage || !prompt}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6" />
                                Bắt đầu chỉnh sửa
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
                        <span className="font-medium">Lỗi:</span> {error}
                    </div>
                )}
                
                {(isLoading || editedImage) &&
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold mb-4 text-gray-300">Ảnh gốc</h3>
                            <div className="w-full h-96 bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden flex items-center justify-center">
                                {originalImagePreview && <img src={originalImagePreview} alt="Ảnh gốc" className="w-full h-full object-contain"/>}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold mb-4 text-gray-300">Ảnh đã chỉnh sửa</h3>
                            <div className="relative w-full h-96 bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden flex items-center justify-center">
                                {isLoading && !editedImage && (
                                    <div className="flex flex-col items-center text-gray-400">
                                       <SparklesIcon className="w-16 h-16 animate-pulse text-purple-400"/>
                                       <p className="mt-2 text-lg">AI đang sáng tạo...</p>
                                    </div>
                                )}
                                {editedImage && <img src={editedImage} alt="Ảnh đã chỉnh sửa" className="w-full h-full object-contain"/>}
                                {editedImage && (
                                    <a
                                        href={editedImage}
                                        download="edited-image.png"
                                        className="absolute bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-110 shadow-lg"
                                        title="Tải ảnh xuống"
                                    >
                                        <DownloadIcon className="w-6 h-6" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                }

            </main>
        </div>
    );
};

export default App;
