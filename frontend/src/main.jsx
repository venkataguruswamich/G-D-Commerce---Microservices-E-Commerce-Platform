import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import '@fontsource-variable/inter';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AddressBookProvider } from './context/AddressBookContext';
import { PaymentMethodsProvider } from './context/PaymentMethodsContext';
import { NotificationProvider } from './context/NotificationContext';
import './styles/index.css';
import './styles/print.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <AddressBookProvider>
                    <PaymentMethodsProvider>
                      <App />
                    </PaymentMethodsProvider>
                  </AddressBookProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>
);
