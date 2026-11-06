import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (type.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '')) {
      return <FileImage className="h-5 w-5 text-purple-600" />;
    }
    if (type.includes('pdf') || ext === 'pdf') {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    if (ext === 'doc' || ext === 'docx' || ext === 'txt') {
      return <FileSpreadsheet className="h-5 w-5 text-blue-600" />;
    }
    return <File className="h-5 w-5 text-slate-500" />;
  };

  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setErrorMsg(null);

    const validNewFiles: UploadedFile[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      if (files.length + validNewFiles.length >= maxFiles) {
        setErrorMsg(`Maximum of ${maxFiles} attachments allowed.`);
        break;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the ${maxSizeMB}MB size limit.`);
        continue;
      }

      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      validNewFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
      });
    }

    if (validNewFiles.length > 0) {
      onFilesChange([...files, ...validNewFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          isDragging
            ? 'border-red-500 bg-red-50/40 scale-[0.99]'
            : 'border-slate-200 hover:border-red-400 bg-slate-50/50 hover:bg-white'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.svg"
          onChange={(e) => processFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-11 w-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <UploadCloud className="h-6 w-6" />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-800">
              <span className="text-red-600 underline underline-offset-2">Click to upload</span> or drag and drop
            </p>
            <p className="text-[11px] text-slate-400">
              PDF, DOC, DOCX, TXT, PNG, or JPG (up to {maxSizeMB}MB)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getFileIcon(f.type, f.name)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                    {f.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatFileSize(f.size)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Ready</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(f.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
