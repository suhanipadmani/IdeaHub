'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useMemo } from 'react';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const RichTextEditor = ({
  value,
  onChange,
  label,
  placeholder,
  error,
  required,
}: RichTextEditorProps) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'link',
  ];


  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={`prose dark:prose-invert max-w-none ${error ? 'border-red-500' : ''}`}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-white dark:bg-gray-900 rounded-md overflow-hidden"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      <style jsx global>{`
        .ql-container {
          height: 250px;
          overflow-y: auto;
          font-size: 1rem;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          background-color: transparent !important;
        }
        /* Custom scrollbar for a premium look */
        .ql-container::-webkit-scrollbar {
          width: 6px;
        }
        .ql-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .ql-container::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .dark .ql-container::-webkit-scrollbar-thumb {
          background: #374151;
        }
        .ql-container::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .dark .ql-container::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }


        .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background-color: #f9fafb !important;
          border-color: #d1d5db !important;
        }
        .dark .ql-toolbar {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        .dark .ql-container {
          border-color: #374151 !important;
          color: #f3f4f6;
        }
        .dark .ql-stroke {
          stroke: #9ca3af !important;
        }
        .dark .ql-fill {
          fill: #9ca3af !important;
        }
        .dark .ql-picker {
          color: #9ca3af !important;
        }
      `}</style>
    </div>
  );
};
