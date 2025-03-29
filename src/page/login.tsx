import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";

const Login = () => {
  const router = useNavigate();

  useEffect(() => {
    // Fetch the token from localStorage or a cookie
    const token = localStorage.getItem("authToken");

    if (token) {
      // If the user is logged in, redirect to the dashboard
      router("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 family-primary">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
