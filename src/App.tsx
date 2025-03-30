import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import Lending from './pages/Lending';
import PoolDetails from './pages/PoolDetails';
import { ModalProvider } from "./contexts/ModalContext";
import { ModalManager } from "./components/ModalManager";

function App() {
  return (
    <ModalProvider>
      <div className="app">
        <Router>
          <Routes>
            <Route path="/" element={<Lending />} />
            <Route path="/lending" element={<Lending />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/pool/:id" element={<PoolDetails />} />
          </Routes>
        </Router>
        <ModalManager />
      </div>
    </ModalProvider>
  );
}

export default App;
