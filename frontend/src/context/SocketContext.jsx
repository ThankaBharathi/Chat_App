import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

// Create the SocketContext
const SocketContext = createContext();

// Custom hook to use the SocketContext
export const useSocketContext = () => {
	return useContext(SocketContext);
};

// Provider component to manage socket connections
export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null); // State to store the socket connection
	const [onlineUsers, setOnlineUsers] = useState([]); // State for online users
	const { authUser } = useAuthContext(); // Get authenticated user from AuthContext

	useEffect(() => {
		if (authUser) {
			// Initialize socket connection with credentials
			const socket = io("https://chat-app-yt.onrender.com", {
				withCredentials: true, // Send credentials like cookies
				query: {
					userId: authUser._id, // Send userId as a query parameter
				},
			});

			setSocket(socket);

			// Listen for the list of online users
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			// Error handling: Log any connection errors
			socket.on("connect_error", (err) => {
				console.error("Connection Error:", err);
			});

			// Cleanup on component unmount
			return () => {
				socket.close();
			};
		} else {
			// If the user logs out or is not authenticated, close the socket connection
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [authUser]); // Re-run the effect if authUser changes

	// Provide socket and onlineUsers to children components
	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};
