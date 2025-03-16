import { LoginForm } from "@/components/login/LoginForm";
import { Button } from "@/components/ui/button";
import { useStore } from "@/services/StoreContext";
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function LoginPage() {
  const navigate = useNavigate();
  const { state } = useStore()
  const { user, role } = state;

  useEffect(() => {
    if (user) {
      navigate(`/${role}`); // Điều hướng đến trang tương ứng với role của người dùng
    }
  }, [user, role, navigate]);

  return (
    <>
      <Helmet>
        <title>{GLOBAL_NAME} - Login</title>
        <meta name="description" content={`${GLOBAL_NAME} - Online Teaching Center.`} />
      </Helmet>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link to="/" className="mr-6 flex items-center">
            <span className="font-bold text-lg">{GLOBAL_NAME} </span>
            <span className="ml-0 font-bold text-lg">.</span>
          </Link>
        </div>
      </header>
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
