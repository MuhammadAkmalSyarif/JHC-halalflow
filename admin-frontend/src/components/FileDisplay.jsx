import React, { useState, useEffect } from 'react';

// API Base resolution
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getFullFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${path}`;
}

export function getCleanFileName(filename) {
  if (!filename) return '';
  const base = filename.split('/').pop().split('\\').pop();
  // Strip leading timestamps like 1773902349823- or uuid- prefixes
  const cleaned = base
    .replace(/^\d{10,15}[-_]/, '')
    .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[-_]/i, '');
  return cleaned || base;
}

export function getFileCategory(filename) {
  if (!filename) return 'other';
  const clean = filename.toLowerCase().split('?')[0].split('#')[0];
  if (/\.(jpe?g|png|gif|webp|jfif|bmp|svg)$/i.test(clean)) return 'image';
  if (/\.pdf$/i.test(clean)) return 'pdf';
  if (/\.(docx?|rtf|odt)$/i.test(clean)) return 'word';
  if (/\.(xlsx?|csv)$/i.test(clean)) return 'excel';
  return 'document';
}

// Internal SVG icons
const Icons = {
  Eye: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Trash: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  ExternalLink: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  FilePdf: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-6 4h4M9 9h2" />
    </svg>
  ),
  FileWord: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  FileExcel: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Image: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  CheckCircle: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  X: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ZoomIn: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
    </svg>
  )
};

/**
 * Image Lightbox / Full-preview modal
 */
export const ImagePreviewModal = ({ src, filename, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/30 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <Icons.Image className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-sm truncate">{getCleanFileName(filename)}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Pratinjau Gambar
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
            >
              <Icons.ExternalLink className="w-3.5 h-3.5" /> Buka Penuh
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Tutup"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto flex items-center justify-center bg-slate-100 min-h-75">
          <img
            src={src}
            alt={filename}
            className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
          />
        </div>
      </div>
    </div>
  );
};

const FileTypeVisual = ({ category, extension, isImage, fileUrl, cleanName, onPreview }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (isImage && !imgFailed && fileUrl) {
    return (
      <div
        onClick={onPreview ? () => onPreview(fileUrl, cleanName) : undefined}
        className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-200/90 bg-white shadow-2xs group shrink-0 cursor-pointer hover:border-emerald-500 transition-all"
        title="Klik untuk memperbesar gambar"
      >
        <img
          src={fileUrl}
          alt={cleanName}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
          <Icons.ZoomIn className="w-4 h-4 drop-shadow" />
        </div>
      </div>
    );
  }

  if (category === 'pdf') {
    return (
      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-rose-50 border border-rose-200/90 text-rose-600 shadow-2xs shrink-0">
        <Icons.FilePdf className="w-5 h-5" />
        <span className="text-[9px] font-black tracking-wider uppercase text-rose-700 leading-none mt-0.5">PDF</span>
      </div>
    );
  }

  if (category === 'word') {
    return (
      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-sky-50 border border-sky-200/90 text-sky-600 shadow-2xs shrink-0">
        <Icons.FileWord className="w-5 h-5" />
        <span className="text-[9px] font-black tracking-wider uppercase text-sky-700 leading-none mt-0.5">DOCX</span>
      </div>
    );
  }

  if (category === 'excel') {
    return (
      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-emerald-50 border border-emerald-200/90 text-emerald-600 shadow-2xs shrink-0">
        <Icons.FileExcel className="w-5 h-5" />
        <span className="text-[9px] font-black tracking-wider uppercase text-emerald-700 leading-none mt-0.5">XLS</span>
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 shadow-2xs shrink-0">
      <Icons.FileWord className="w-5 h-5" />
      <span className="text-[9px] font-black tracking-wider uppercase text-slate-600 leading-none mt-0.5">FILE</span>
    </div>
  );
};

export const UploadedSingleFileCard = ({
  file,
  label,
  onDelete,
  isDeleting = false,
  onPreview
}) => {
  const [internalPreview, setInternalPreview] = useState(null);

  if (!file) return null;

  const rawFile = file.trim();
  if (!rawFile) return null;

  const cleanName = getCleanFileName(rawFile);
  const category = getFileCategory(rawFile);
  const isImage = category === 'image';
  const fileUrl = getFullFileUrl(`/uploads/${rawFile}`);

  const handlePreview = (url, name) => {
    if (onPreview) {
      onPreview(url, name);
    } else {
      setInternalPreview({ url, name });
    }
  };

  return (
    <>
      <div className="mt-2.5 p-3.5 bg-linear-to-r from-emerald-50/70 via-white to-slate-50/80 border border-emerald-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all">
        {label && (
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Icons.CheckCircle className="w-3 h-3 text-emerald-600" /> Berkas Siap
            </span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileTypeVisual
              category={category}
              isImage={isImage}
              fileUrl={fileUrl}
              cleanName={cleanName}
              onPreview={isImage ? handlePreview : undefined}
            />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate" title={rawFile}>
                {cleanName}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ Terunggah
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {category.toUpperCase()}
                </span>
                {isImage && (
                  <button
                    type="button"
                    onClick={() => handlePreview(fileUrl, cleanName)}
                    className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-0.5 ml-1"
                  >
                    <Icons.ZoomIn className="w-3 h-3" /> Perbesar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-emerald-100/80">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
              title="Buka berkas di tab baru"
            >
              <Icons.Eye className="w-3.5 h-3.5" /> Buka Berkas ↗
            </a>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(rawFile)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                title="Hapus berkas ini"
              >
                <Icons.Trash className="w-3.5 h-3.5" />
                <span>{isDeleting ? '...' : 'Hapus'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {internalPreview && (
        <ImagePreviewModal
          src={internalPreview.url}
          filename={internalPreview.name}
          onClose={() => setInternalPreview(null)}
        />
      )}
    </>
  );
};

export const UploadedFileList = ({
  filesString,
  onDelete,
  deletingFile = '',
  title = 'Berkas Terunggah',
  onPreview,
  isImageGroup = false
}) => {
  const [internalPreview, setInternalPreview] = useState(null);

  if (!filesString) return null;

  const files = (filesString || '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  if (files.length === 0) return null;

  const handlePreview = (url, name) => {
    if (onPreview) {
      onPreview(url, name);
    } else {
      setInternalPreview({ url, name });
    }
  };

  return (
    <>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {title}
            <span className="ml-1 text-[11px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {files.length} berkas
            </span>
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ✓ Siap Diajukan
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {files.map((file, idx) => {
            const cleanName = getCleanFileName(file);
            const category = getFileCategory(file);
            const isImage = category === 'image' || isImageGroup;
            const fileUrl = getFullFileUrl(`/uploads/${file}`);
            const isCurrentDeleting = deletingFile === file;

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 bg-white hover:bg-emerald-50/20 rounded-xl border border-slate-200 hover:border-emerald-200 shadow-2xs hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileTypeVisual
                    category={category}
                    isImage={isImage}
                    fileUrl={fileUrl}
                    cleanName={cleanName}
                    onPreview={isImage ? handlePreview : undefined}
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate" title={file}>
                      {cleanName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <Icons.CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" /> Terunggah
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        • {category}
                      </span>
                      {isImage && (
                        <button
                          type="button"
                          onClick={() => handlePreview(fileUrl, cleanName)}
                          className="text-[10px] font-medium text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-0.5 ml-0.5"
                        >
                          <Icons.ZoomIn className="w-3 h-3" /> Pratinjau
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                    title="Buka berkas di tab baru"
                  >
                    <Icons.Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Buka</span> ↗
                  </a>

                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(file)}
                      disabled={isCurrentDeleting}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus berkas ini"
                    >
                      {isCurrentDeleting ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Icons.Trash className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {internalPreview && (
        <ImagePreviewModal
          src={internalPreview.url}
          filename={internalPreview.name}
          onClose={() => setInternalPreview(null)}
        />
      )}
    </>
  );
};
