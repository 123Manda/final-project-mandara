import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import teaImage from "../../assets/tea images/teapack-about.jpg";


const USERS_STORAGE_KEY = "teaFactoryUsers";


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


export default function SignInPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();


  const handleSignIn = (event) => {
    event.preventDefault();

    const cleanedFullName = fullName.trim();
    const cleanedEmail = email
      .trim()
      .toLowerCase();

    if (
      !cleanedFullName ||
      !cleanedEmail ||
      !password
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert(
        "Password must contain at least 6 characters."
      );

      return;
    }

    const registeredUsers = getRegisteredUsers();

    const emailAlreadyRegistered =
      registeredUsers.some(
        (user) => user.email === cleanedEmail
      );

    if (emailAlreadyRegistered) {
      alert(
        "An account with this email already exists. Please log in."
      );

      navigate("/login");
      return;
    }

    const newUser = {
      fullName: cleanedFullName,
      email: cleanedEmail,
      password: password
    };

    const updatedUsers = [
      ...registeredUsers,
      newUser
    ];

    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(updatedUsers)
    );

    alert(
      "Account created successfully. You can now log in."
    );

    navigate("/login");
  };


  return (
    <div
      className="auth-page"
      style={{
        backgroundImage:
          `linear-gradient(
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.35)
          ), url(${teaImage})`,

        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="auth-card glass-card">
        <div className="logo-circle">
          <Leaf size={30} />
        </div>

        <h2>Create Account</h2>

        <p className="auth-subtitle">
          Create your account for the Tea Factory
          Management System
        </p>

        <form
          onSubmit={handleSignIn}
          className="auth-form"
        >
          <div>
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label htmlFor="registerEmail">
              Email Address
            </label>

            <input
              id="registerEmail"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="registerPassword">
              Password
            </label>

            <input
              id="registerPassword"
              type="password"
              placeholder="Create your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
          >
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}