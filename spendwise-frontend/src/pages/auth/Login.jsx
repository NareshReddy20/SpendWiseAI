import React, { useState } from "react";
import {
  useNavigate,
  Link
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import { useLoginMutation } from "../../tanstack/alltanstack";


const Login = () => {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");


  const navigate = useNavigate();

  const { setLoggedInUser } = useAuth();

  const loginMutation = useLoginMutation();


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    if (!email || !password) {

      setError("Please fill in all fields");

      return;
    }


    try {

      const result =
        await loginMutation.mutateAsync({
          email: email,
          password: password,
        });


      console.log(
        "Login successful:",
        result
      );


      // Store JWT
      localStorage.setItem(
        "access_token",
        result.access_token
      );


      // Store user
      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );


      // Update AuthContext
      setLoggedInUser(result.user);


      // Navigate to Dashboard
      navigate("/dashboard");

    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Invalid email or password";


      setError(errorMessage);

    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "400px",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >

        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >

          <h1
            style={{
              fontSize: "28px",
              color: "#333",
            }}
          >
            💰 SpendWise AI
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: "8px",
            }}
          >
            Sign in to your account
          </p>

        </div>


        <form onSubmit={handleSubmit}>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
            required
          />


          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            required
          />


          {error && (
            <div
              style={{
                color: "#f44336",
                fontSize: "14px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}


          <Button
            type="submit"
            variant="primary"
            disabled={loginMutation.isPending}
            style={{
              width: "100%",
            }}
          >
            {loginMutation.isPending
              ? "Signing in..."
              : "Sign In"}
          </Button>

        </form>


        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#666",
          }}
        >

          Don't have an account?{" "}

          <Link
            to="/register"
            style={{
              color: "#667eea",
              fontWeight: "500",
            }}
          >
            Sign Up
          </Link>

        </div>

      </div>

    </div>
  );
};


export default Login;