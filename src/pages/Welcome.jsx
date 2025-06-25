import React from "react";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="container">
      <h1>Welcome to My Blog</h1>
      <p>Create and share your thoughts with the world.</p>
      <Link to="/login"><button>Login</button></Link><br/>
      <Link to="/signup"><button>Sign Up</button></Link>
    </div>
  );
}
