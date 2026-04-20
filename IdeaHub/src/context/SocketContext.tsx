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
                const response = await fetch('/api/socket');
                if (!response.ok) {
                    console.warn('Failed to prime socket server endpoint');
                }
                
                const newSocket = io(socketUrl, {
                    reconnectionAttempts: 10,
                    reconnectionDelay: 1000,
                    timeout: 20000,
                    path: '/socket.io',
                    addTrailingSlash: false,
                    // Start with polling so socket.io doesn't do a raw WebSocket upgrade
                    // that races with the priming fetch() above.
                    transports: ['polling', 'websocket'],
                });
                
                setSocket(newSocket);


                newSocket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error.message);
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
