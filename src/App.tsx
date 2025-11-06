import { useEffect, useState } from "react";
import type { AccessTokenPayloadDTO } from "./models/auth";
import * as authService from "./services/auth-service"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextToken } from "./utils/context-token";
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { setNavigationRef } from './utils/navigation';
import { LoginPage } from "./routes/Login";
import Dashboard from "./routes/Dashboard";
import ControlledSkuManagement from "./routes/ControlledSkuManagement";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const queryClient = new QueryClient();

// Component to capture and store the navigate function
function NavigationSetter() {
    const navigate = useNavigate();
    
    useEffect(() => {
        setNavigationRef(navigate);
    }, [navigate]);
    
    return null;
}

function App() {

    const [contextTokenPayload, setContextTokenPayload] = useState<AccessTokenPayloadDTO>();


    useEffect(() => {
        if (authService.isAuthenticated()) {
            const tokenPayLoad = authService.getAccessTokenPayload();
            setContextTokenPayload(tokenPayLoad);
        }
    }, []);


    return (
        <>
            <QueryClientProvider client={queryClient}>
                <ContextToken.Provider value={{contextTokenPayload, setContextTokenPayload}}>
                    <BrowserRouter>
                        <NavigationSetter />
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/controlled-skus" element={<ControlledSkuManagement />} />
                        </Routes>
                    </BrowserRouter>
                    <ToastContainer 
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                    />
                </ContextToken.Provider>
            </QueryClientProvider>
        </>
    )
}

export default App