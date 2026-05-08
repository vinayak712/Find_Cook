import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <span className="material-symbols-outlined text-3xl text-primary">
            restaurant
          </span>
          <span className="text-2xl font-bold text-primary">FindCOOK</span>
        </Link>

        {/* Form container */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-on-background mb-2">Log in</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Enter your email and password to continue
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-background mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-surface text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-background mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-surface text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex justify-center items-center text-sm mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-on-surface-variant mt-6">
          By continuing, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
