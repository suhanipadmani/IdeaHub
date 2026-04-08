import { cn } from '@/utils/cn';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Loader = ({ size = 'md', className }: LoaderProps) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex justify-center items-center">
            <div
                className={cn(
                    'animate-spin rounded-full border-gray-200 border-t-blue-600',
                    sizeClasses[size],
                    className
                )}
            />
        </div>
    );
};
