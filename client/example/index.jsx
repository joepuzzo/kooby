// React dependencies
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "@react-spectrum/s2/page.css";
import "./example.css";

import App from "./App";
import Readonly from "./ReadOnly";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/convo/:id" element={<App />} />
      <Route path="/pastconvo" element={<Readonly />} />
    </Routes>
  </Router>,
);
