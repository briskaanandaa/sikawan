import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, LoaderIcon, EyeIcon, EyeOffIcon } from "lucide-react";

const DEMO_CREDENTIALS = {
  email: "admin-sikawan",
  password: "admin-sikawan123!@#",
  name: "Admin Demo",
  role: "admin",
  avatar: "",
};

async function mockLogin(email, password) {
  await new Promise((r) => setTimeout(r, 800));
  if (
    email === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: "1",
        name: DEMO_CREDENTIALS.name,
        email: DEMO_CREDENTIALS.email,
        role: DEMO_CREDENTIALS.role,
        avatar: DEMO_CREDENTIALS.avatar,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      }),
    );
    const signature = btoa("mock-signature");
    const token = `${header}.${payload}.${signature}`;
    return {
      token,
      user: {
        name: DEMO_CREDENTIALS.name,
        email: DEMO_CREDENTIALS.email,
        avatar: DEMO_CREDENTIALS.avatar,
      },
    };
  }
  throw new Error("Email atau password salah.");
}

export function LoginForm({ className, ...props }) {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { token, user: userData } = await mockLogin(
        form.email,
        form.password,
      );
      login(token, userData);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {/* Logo & Brand */}
      {/* <div className="flex flex-col items-center gap-3 text-center">
        <img
          src="/sikawan.png"
          alt="Sikawan Logo"
          className="h-16 w-auto object-contain"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sikawan</h1>
          <p className="text-sm text-balance text-muted-foreground mt-1">
            Masukkan email Anda untuk login ke akun Anda
          </p>
        </div>
      </div> */}

      {/* Email */}
      <div className="grid gap-2">
        <Label htmlFor="email">Username</Label>
        <Input
          id="email"
          type="text"
          placeholder="Masukkan username Anda"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          autoComplete="email"
          required
        />
      </div>

      {/* Password */}
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          {/* <a
            href="#"
            className="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Lupa password?
          </a> */}
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            autoComplete="current-password"
            placeholder="Masukkan password Anda"
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={loading}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Memverifikasi..." : "Login"}
      </Button>
    </form>
  );
}
