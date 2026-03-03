import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <span className="text-sm font-bold text-white">KK</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Kaaj<span className="text-primary-600">Kormo</span>
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
              Bangladesh's premier job portal connecting talent with opportunity.
              Find your dream career or hire the best candidates.
            </p>

            {/* Newsletter */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Stay updated with new opportunities
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <Button size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Job Seekers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">For Job Seekers</h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link to="/jobs" className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/candidate/discover" className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                  Discover Jobs
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/candidate/alerts" className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                  Job Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">For Employers</h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link to="/employer/post-job" className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                  Employer Sign Up
                </Link>
              </li>
              <li>
                <Link to="/employer/candidates" className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                  Browse Candidates
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Support</h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a href="mailto:help@kaajkormo.com" className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary-600">
                  <Mail className="h-3.5 w-3.5" />
                  help@kaajkormo.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} KaajKormo. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
