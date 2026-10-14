import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import teabg from "../../assets/tea images/tea-bg.webp";


const USERS_STORAGE_KEY = "teaFactoryUsers";
const CURRENT_USER_STORAGE_KEY =
  "teaFactoryCurrentUser";


function getRegisteredUsers() {
  try {
    const savedUsers = localStorage.getItem(
      USERS_STORAGE_KEY
    );

    if (!savedUsers) {
      return [];
    }

    const parsedUsers = JSON.parse(savedUsers);

    return Array.isArray(parsedUsers)
      ? parsedUsers
      : [];
  } catch (error) {
    console.error(
      "Could not read registered users:",
      error
    );

    return [];
  }
}


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();


  const handleLogin = (event) => {
    event.preventDefault();

    const cleanedEmail = email
      .trim()
      .toLowerCase();

    if (!cleanedEmail || !password) {
      alert(
        "Please enter your email and password."
      );

      return;
    }

    const registeredUsers = getRegisteredUsers();

    if (registeredUsers.length === 0) {
      alert(
        "No account has been created. Please create an account first."
      );

      navigate("/signin");
      return;
    }

    const matchedUser = registeredUsers.find(
      (user) =>
        user.email === cleanedEmail &&
        user.password === password
    );

    if (!matchedUser) {
      alert(
        "Incorrect email or password. Please try again."
      );

      return;
    }

    // Save only non-sensitive user information
    sessionStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify({
        fullName: matchedUser.fullName,
        email: matchedUser.email,
      })
    );

    alert(
      `Welcome, ${matchedUser.fullName}!`
    );

    navigate("/home");
  };


  return (
    <div
      className="auth-page"
      style={{
        backgroundImage:
          `linear-gradient(
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.35)
          ), url(${teabg})`,

        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="auth-card glass-card">
        <div className="logo-circle">
          <Leaf size={30} />
        </div>

        <h2>Login</h2>

        <p className="auth-subtitle">
          Tea Factory Management System
        </p>

        <form
          onSubmit={handleLogin}
          className="auth-form"
        >
          <div>
            <label htmlFor="loginEmail">
              Email Address
            </label>

            <input
              id="loginEmail"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="loginPassword">
              Password
            </label>

            <input
              id="loginPassword"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
          >
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account?{" "}

          <Link to="/signin">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}