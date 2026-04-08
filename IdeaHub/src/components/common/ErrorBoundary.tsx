'use client';

import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() { 
        return { hasError: true }; 
    }    
    
    render() {
        if (this.state.hasError) 
            return (
                <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                        <button 
                            onClick={() => window.location.reload()}
                            className="text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            );
        return this.props.children;
    }
}
