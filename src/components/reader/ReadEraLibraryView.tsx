import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Star,
  Trash2,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { useReaderStore } from '../../stores/readerStore';
import { StoredBook } from '../../types/reader';
import { toast } from '../../stores/noticeStore';

interface ReadEraLibraryViewProps {
  onOpenBook?: (book: StoredBook) => void;
}

export const ReadEraLibraryView: React.FC<ReadEraLibraryViewProps> = ({ onOpenBook }) => {
  const { books, isLoadingBooks, loadBooks, openBook, importBookFile, toggleFavorite, deleteBook } = useReaderStore();
  const [activeTab, setActiveTab] = useState<'reading_now' | 'all' | 'favorites' | 'have_read'>('reading_now');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const imported = await importBookFile(file);
        toast.success(`Added "${imported.title}" to library.`, 'Book Added');
      } catch {
        toast.error(`Could not add "${file.name}".`);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const imported = await importBookFile(file);
        toast.success(`Imported "${imported.title}".`, 'E-Reader Library');
      } catch {
        toast.error(`Failed to import "${file.name}".`);
      }
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.format.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'reading_now') return b.progressPercent > 0 && b.progressPercent < 100;
    if (activeTab === 'favorites') return b.isFavorite;
    if (activeTab === 'have_read') return b.progressPercent >= 100;
    return true; // 'all'
  });

  const handleOpenBook = (book: StoredBook) => {
    openBook(book);
    onOpenBook?.(book);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-24 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-sans text-[10.5px] font-medium tracking-wider uppercase text-vibe-ink-muted/80">
              Personal E-Reader & Documents
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-vibe-ink leading-tight">
            E-Reader Library
          </h1>
        </div>

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.epub,.txt,.mobi,.fb2"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Open / Import Book</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
            : 'border-vibe-border hover:border-vibe-accent/40 bg-vibe-card-subtle/50'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-vibe-ink">
          Drop any <span className="font-semibold text-vibe-accent">PDF, EPUB, TXT, or MOBI</span> file here
        </p>
        <p className="text-xs text-vibe-ink-muted mt-1">
          Files are stored locally in your browser's IndexedDB for private, instant offline reading.
        </p>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vibe-border pb-3">
        {/* ReadEra Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('reading_now')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'reading_now'
                ? 'bg-vibe-card text-vibe-accent border border-vibe-border shadow-xs'
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            Reading Now ({books.filter((b) => b.progressPercent > 0 && b.progressPercent < 100).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-vibe-card text-vibe-accent border border-vibe-border shadow-xs'
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            All Books ({books.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-vibe-card text-vibe-accent border border-vibe-border shadow-xs'
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            Favorites ({books.filter((b) => b.isFavorite).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('have_read')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'have_read'
                ? 'bg-vibe-card text-vibe-accent border border-vibe-border shadow-xs'
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            Have Read ({books.filter((b) => b.progressPercent >= 100).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-vibe-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search local documents..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-vibe-border bg-vibe-card text-vibe-ink placeholder:text-vibe-ink-muted focus:border-vibe-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Book Grid */}
      {isLoadingBooks ? (
        <div className="py-16 text-center text-xs text-vibe-ink-muted">Loading your local documents...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-vibe-border bg-vibe-card p-12 text-center space-y-3 shadow-soft max-w-md mx-auto">
          <FolderOpen className="w-10 h-10 text-vibe-ink-muted mx-auto" />
          <h3 className="text-sm font-semibold text-vibe-ink">No books found in this section</h3>
          <p className="text-xs text-vibe-ink-muted">
            Drop a book above or choose "Open / Import Book" to start reading.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleOpenBook(book)}
              className="group bg-vibe-card border border-vibe-border rounded-2xl p-4 shadow-soft hover:shadow-float transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Top header row: format pill & favorite button */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-vibe-accent-subtle text-vibe-accent border border-vibe-accent/20">
                    {book.format}
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(book.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        book.isFavorite ? 'text-amber-500' : 'text-vibe-ink-muted hover:text-amber-500'
                      }`}
                      title={book.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBook(book.id)}
                      className="p-1.5 text-vibe-ink-muted hover:text-rose-500 transition-colors"
                      title="Remove from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cover & Title */}
                <div className="flex gap-3.5 items-start mb-3">
                  {book.coverUrl ? (
                    <div className="w-14 h-20 rounded-lg overflow-hidden border border-vibe-border shadow-xs flex-shrink-0 bg-vibe-card-subtle">
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-20 rounded-lg border border-vibe-border bg-emerald-900/10 text-vibe-accent flex flex-col items-center justify-center p-1.5 text-center flex-shrink-0">
                      <FileText className="w-5 h-5 mb-1" />
                      <span className="text-[8px] font-mono font-bold uppercase tracking-tight">{book.format}</span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-vibe-ink line-clamp-2 leading-snug group-hover:text-vibe-accent transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-vibe-ink-muted mt-1 truncate">{book.author}</p>
                    <span className="text-[10px] text-vibe-ink-muted font-mono block mt-1">
                      {Math.round(book.fileSize / 1024)} KB
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress footer */}
              <div className="pt-3 border-t border-vibe-border space-y-1.5">
                <div className="flex items-center justify-between text-xs text-vibe-ink-muted">
                  <span className="text-[11px]">
                    {book.progressPercent > 0 ? `Page ${book.currentPage}` : 'Not started'}
                  </span>
                  <span className="font-mono text-[11px] font-medium text-vibe-ink">
                    {book.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-vibe-card-subtle overflow-hidden">
                  <div
                    className="h-full bg-vibe-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(book.progressPercent, 2)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
