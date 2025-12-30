// layouts/LandingPage.jsx

import React from "react";
import { Link } from "react-router-dom";


function LandingPage() {
  return (
    <div style={{ padding: 40, background: "yellow" }}>
      <h1>Landing OK</h1>
      <p>This is the landing page.</p>
      <Link to="/login">
        <button>Go to Login</button>
      </Link>
    </div>
  );
}

export default LandingPage;
