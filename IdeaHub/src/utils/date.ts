export const isSameDay = (d1: Date | string, d2: Date | string): boolean => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export const formatChatSeparator = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (msgDate.getTime() === today.getTime()) {
        return 'Today';
    }
    
    if (msgDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
};
