import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const { signup, error, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
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
          <h1 className="text-2xl font-bold text-on-background mb-2">
            Create an account
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Start your culinary journey today
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-background mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-surface text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-background mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-surface text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-background mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`border rounded-lg p-3 cursor-pointer transition-all text-center ${formData.role === "user" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-outline-variant hover:bg-surface"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    className="hidden"
                    checked={formData.role === "user"}
                    onChange={handleChange}
                  />
                  <div className="text-sm font-semibold">Customer</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Book a cook
                  </div>
                </label>
                <label
                  className={`border rounded-lg p-3 cursor-pointer transition-all text-center ${formData.role === "cook" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-outline-variant hover:bg-surface"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="cook"
                    className="hidden"
                    checked={formData.role === "cook"}
                    onChange={handleChange}
                  />
                  <div className="text-sm font-semibold">Cook</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Find work
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex justify-center items-center text-sm mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Log in
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
