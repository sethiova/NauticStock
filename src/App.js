import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Topbar from "./pages/layouts/Topbar";
import Sidebar from "./pages/layouts/Sidebar";
import Dashboard from "./pages/dashboard";
import Team from "./pages/team";
import Products from "./pages/products";
import Providers from "./pages/providers";


function App() {
  const [theme, ColorMode] = useMode();
  return (
    <ColorModeContext.Provider value={ColorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/products" element={<Products />} />
              <Route path="/providers" element={<Providers />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
