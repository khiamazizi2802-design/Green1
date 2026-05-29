import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to Dispatch Server');
            setIsConnected(true);
        });

        newSocket.on('radar-update', (updatedDrivers) => {
            setDrivers(updatedDrivers);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from Dispatch Server');
            setIsConnected(false);
        });

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={{ socket, drivers, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);



