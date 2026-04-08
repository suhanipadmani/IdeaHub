'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <div className="fixed bottom-8 left-0 md:left-64 right-0 flex justify-center z-20 pointer-events-none">
            <div className="inline-flex items-center space-x-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 p-2 rounded-full shadow-xl pointer-events-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full w-10 h-10 p-0 focus:ring-0 focus:ring-offset-0"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className="w-10 h-10 p-0 rounded-full mx-0.5"
                        >
                            {page}
                        </Button>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full w-10 h-10 p-0 focus:ring-0 focus:ring-offset-0"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
