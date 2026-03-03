import { SignIn } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Shield, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const features = [
  { icon: Briefcase, text: "Thousands of job listings" },
  { icon: Users, text: "Connect with top employers" },
  { icon: TrendingUp, text: "Track your applications" },
  { icon: Shield, text: "Secure and private" },
];

function LoginPage() {
  return (
    <div className="flex min-h-[80vh]">
      {/* Side illustration */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-primary-500 to-accent-600 lg:flex">
        <div className="max-w-md px-12 text-white">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-3 text-lg text-white/80">
            Sign in to access your dashboard, track applications, and discover new opportunities.
          </p>
          <div className="mt-8 space-y-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <f.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-white/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <SignIn
          routing="hash"
          afterSignInUrl="/"
          signUpUrl="/auth/register"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg rounded-xl border border-gray-200",
            },
          }}
        />
      </div>
    </div>
  );
}
