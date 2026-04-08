'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();
    const userRef = useRef(user);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';

        const initSocket = async () => {
            try {
                // In Next.js with Pages API sockets, we MUST hit the endpoint once to initialize the server
                await fetch('/api/socket');
                
                const newSocket = io(socketUrl, {
                    reconnectionAttempts: 5,
                    timeout: 10000,
                    path: '/socket.io',
                    addTrailingSlash: false,
                });
                
                setSocket(newSocket);

                newSocket.on('connect', () => {
                    console.log('Socket connected');
                });

                newSocket.on('connect_error', (error) => {
                    console.warn('Socket connection error:', error.message);
                });
            } catch (err) {
                console.error('Failed to initialize socket:', err);
            }
        };

        if (typeof window !== 'undefined') {
            initSocket();
        }

        return () => {
            // Disconnect happens automatically on component unmount if we store the socket properly
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
