import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import AppContext from '../context/AppContext'
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [currentState, setCurrentState] = useState("Signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login, loading } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentState === 'Signup' && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    const res = await login(
      currentState === 'Signup' ? 'signup' : 'login',
      { fullName, email, password, bio }
    );

    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      <img src={assets.logo_big} alt="Logo" className='w-[min(30vw,250px)]' />

      <form
        onSubmit={handleSubmit}
        className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'
      >
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currentState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              alt="Back"
              className='w-5 cursor-pointer'
              onClick={() => setIsDataSubmitted(false)}
            />
          )}
        </h2>

        {currentState === "Signup" && !isDataSubmitted && (
          <input
            type="text"
            placeholder='Full Name'
            className="p-2 border border-gray-500 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              placeholder='Email Address'
              required
              className="p-2 border border-gray-500 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder='Password'
              required
              className="p-2 border border-gray-500 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {currentState === "Signup" && isDataSubmitted && (
          <textarea
            placeholder='Bio'
            className="p-2 border border-gray-500 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        )}

        <button
          type="submit"
          disabled={loading}
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-50'
        >
          {loading
            ? "Processing..."
            : currentState === 'Login'
              ? "Login"
              : "Create Account"}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-300'>
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currentState === "Signup" ? (
            <p className='text-sm text-gray-600'>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrentState("Login");
                  setIsDataSubmitted(false);
                }}
                className='font-medium text-violet-500 cursor-pointer'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className='text-sm text-gray-600'>
              Create an account{" "}
              <span
                onClick={() => {
                  setCurrentState("Signup");
                  setIsDataSubmitted(false);
                }}
                className='font-medium text-violet-500 cursor-pointer'
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
