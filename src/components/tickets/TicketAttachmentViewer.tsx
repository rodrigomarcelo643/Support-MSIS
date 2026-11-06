import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TicketAttachment } from '../../types';
import { fetchTicketDetails } from '../../services/ticketsApi';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Eye,
  Download,
  ExternalLink,
  Paperclip,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Loader2
} from 'lucide-react';

interface TicketAttachmentViewerProps {
  ticketId: string;
  attachmentsCount: number;
  initialAttachments?: TicketAttachment[];
  onAttachmentsLoaded?: (attachments: TicketAttachment[]) => void;
}

export const TicketAttachmentViewer: React.FC<TicketAttachmentViewerProps> = ({
  ticketId,
  attachmentsCount,
  initialAttachments,
  onAttachmentsLoaded,
}) => {
  const [attachments, setAttachments] = useState<TicketAttachment[]>(initialAttachments || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<TicketAttachment | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // If attachmentsCount > 0 but attachments list is empty, fetch details from backend
  useEffect(() => {
    if (initialAttachments && initialAttachments.length > 0) {
      setAttachments(initialAttachments);
      return;
    }

    if (attachmentsCount > 0 && (!attachments || attachments.length === 0)) {
      let isMounted = true;
      setIsLoading(true);
      fetchTicketDetails(ticketId)
        .then((ticket) => {
          if (isMounted && ticket.attachments && ticket.attachments.length > 0) {
            setAttachments(ticket.attachments);
            if (onAttachmentsLoaded) {
              onAttachmentsLoaded(ticket.attachments);
            }
          }
        })
        .catch((err) => {
          console.warn('Could not fetch attachments details:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [ticketId, attachmentsCount, initialAttachments]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageAttachment = (att: TicketAttachment): boolean => {
    if (att.isImage) return true;
    const ext = (att.name || '').split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  const getDocIcon = (name: string) => {
    const ext = (name || '').split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500 shrink-0" />;
    }
    if (['csv', 'xls', 'xlsx'].includes(ext || '')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600 shrink-0" />;
    }
    if (['log', 'txt', 'json', 'sql'].includes(ext || '')) {
      return <FileCode className="h-5 w-5 text-indigo-500 shrink-0" />;
    }
    return <File className="h-5 w-5 text-slate-500 shrink-0" />;
  };

  const images = attachments.filter(isImageAttachment);
  const documents = attachments.filter((a) => !isImageAttachment(a));

  if (attachmentsCount === 0 && attachments.length === 0) {
    return (
      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-2 text-slate-400 mt-1">
        <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="text-[11px] sm:text-xs">No files or screenshots attached to this ticket</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-1">
      {/* Header Counter */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5 text-red-600 shrink-0" />
          <span>Verified Attachments ({attachments.length || attachmentsCount})</span>
        </span>
        {isLoading && (
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin text-red-500" />
            <span>Fetching files...</span>
          </span>
        )}
      </div>

      {/* 1. Image Preview Gallery (If images exist) */}
      {images.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Images & Screenshots ({images.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className="group relative rounded-xl border border-slate-200 bg-slate-900/5 overflow-hidden flex flex-col shadow-2xs hover:shadow-xs transition-all"
              >
                {/* Image Thumbnail with Overlay */}
                <div
                  className="relative h-36 sm:h-40 w-full bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => {
                    setPreviewImage(img);
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback icon if image cannot be fetched directly
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Hover Backdrop Actions */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full bg-white text-slate-800 hover:bg-red-50 hover:text-red-600 flex items-center justify-center shadow-md transition-transform scale-90 group-hover:scale-100 cursor-pointer"
                      title="View Fullscreen"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 rounded-full bg-white text-slate-800 hover:bg-red-50 hover:text-red-600 flex items-center justify-center shadow-md transition-transform scale-90 group-hover:scale-100 cursor-pointer"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={img.url}
                      download={img.name}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 rounded-full bg-white text-slate-800 hover:bg-red-50 hover:text-red-600 flex items-center justify-center shadow-md transition-transform scale-90 group-hover:scale-100 cursor-pointer"
                      title="Download image"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* File Info Bar */}
                <div className="p-2 bg-white flex items-center justify-between gap-2 border-t border-slate-100 text-[11px]">
                  <span className="font-medium text-slate-800 truncate" title={img.name}>
                    {img.name}
                  </span>
                  {img.size && (
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {formatFileSize(img.size)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Documents & Error Logs List (If documents exist) */}
      {documents.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Documents & System Logs ({documents.length})
          </span>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
            {documents.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    {getDocIcon(doc.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-800 block truncate" title={doc.name}>
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {formatFileSize(doc.size) || 'Verified document'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                    title="View Document"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View</span>
                  </a>
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Download File"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Fallback when attachments list isn't populated yet */}
      {attachments.length === 0 && attachmentsCount > 0 && !isLoading && (
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
            <Paperclip className="h-4 w-4 text-red-600 shrink-0" />
            <span>{attachmentsCount} file attachment(s) logged</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              fetchTicketDetails(ticketId)
                .then((ticket) => {
                  if (ticket.attachments) setAttachments(ticket.attachments);
                })
                .finally(() => setIsLoading(false));
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Load Files
          </button>
        </div>
      )}

      {/* 4. Fullscreen Lightbox Modal (Mounted on document.body with z-[9999]) */}
      {previewImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewImage(null);
            }}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 rounded-2xl text-white mb-3 shrink-0 border border-white/10 shadow-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <span className="text-xs sm:text-sm font-semibold truncate text-slate-200">
                  {previewImage.name}
                </span>
                {previewImage.size && (
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                    {formatFileSize(previewImage.size)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <a
                  href={previewImage.url}
                  download={previewImage.name}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white ml-2 transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Container */}
            <div
              className="flex-1 flex items-center justify-center overflow-auto p-2"
              onClick={() => setPreviewImage(null)}
            >
              <img
                src={previewImage.url}
                alt={previewImage.name}
                onClick={(e) => e.stopPropagation()}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-h-[82vh] max-w-[92vw] object-contain rounded-xl shadow-2xl cursor-default"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
