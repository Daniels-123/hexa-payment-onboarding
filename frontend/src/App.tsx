// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ProductScreen } from './screens/ProductScreen';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="w-full min-h-screen bg-gray-50 flex justify-center">
            {/* Mobile First container: max-width for PC viewing comfort, but full width on mobile */}
            <div className="w-full max-w-md bg-white shadow-xl min-h-screen overflow-hidden relative">
                <Routes>
                    <Route path="/" element={<ProductScreen />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
