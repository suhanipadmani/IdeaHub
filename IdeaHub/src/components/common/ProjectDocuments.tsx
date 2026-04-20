'use client';

import React from 'react';
import { FileText, Calendar, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

interface IDocument {
    name: string;
    url: string;
    uploadedAt: string;
}

interface ProjectDocumentsProps {
    documents?: IDocument[];
    className?: string;
}

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ documents, className }) => {
    if (!documents || documents.length === 0) {
        return null;
    }

    const getDownloadUrl = (url: string) => {
        if (url.includes('ik.imagekit.io')) {
            return `${url}${url.includes('?') ? '&' : '?'}ik-attachment=true`;
        }
        return url;
    };

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center gap-4 mb-2">
                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] whitespace-nowrap">Associated Documents</h4>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {documents.map((doc, index) => (
                    <div 
                        key={`${doc.url}-${index}`}
                        className="group relative flex items-center justify-between p-5 rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate pr-4">
                                    {doc.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-sm"
                                title="View in New Tab"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <a
                                href={getDownloadUrl(doc.url)}
                                download={doc.name}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none font-bold text-xs uppercase tracking-widest active:scale-95"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
