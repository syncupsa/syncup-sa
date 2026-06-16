import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Replace with real API call
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Invalid credentials");
        const { token } = await res.json();
        const expiry = stayLoggedIn
          ? Date.now() + 5 * 24 * 60 * 60 * 1000
          : Date.now() + 2 * 60 * 60 * 1000;
        localStorage.setItem("strapp_token", token);
        localStorage.setItem("strapp_token_expiry", expiry.toString());
        window.location.href = "/";
      })
      .catch((err) => setError(err.message));
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-panel">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-xs p-8 bg-card rounded-xl shadow-lg space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Strapp Walk Login</h1>
        <input
          className="strapp-input w-full"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="strapp-input w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={stayLoggedIn}
            onChange={(e) => setStayLoggedIn(e.target.checked)}
          />
          Stay logged in for 5 days
        </label>
        {error && <div className="text-red-500 text-xs text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded font-bold"
        >
          Login
        </button>
      </form>
    </div>
  );
}
