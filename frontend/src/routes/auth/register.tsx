import { SignUp } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Briefcase, Compass, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

const benefits = [
  { icon: Sparkles, text: "Smart job matching" },
  { icon: Compass, text: "Swipe-to-discover jobs" },
  { icon: BarChart3, text: "Application tracking" },
  { icon: Briefcase, text: "One-click apply" },
];

function RegisterPage() {
  return (
    <div className="flex min-h-[80vh]">
      {/* Side illustration */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-accent-500 to-primary-600 lg:flex">
        <div className="max-w-md px-12 text-white">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold">Join KaajKormo</h2>
          <p className="mt-3 text-lg text-white/80">
            Create your account and start discovering amazing career opportunities across
            Bangladesh.
          </p>
          <div className="mt-8 space-y-4">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <b.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-white/90">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <SignUp
          routing="hash"
          afterSignUpUrl="/"
          signInUrl="/auth/login"
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
