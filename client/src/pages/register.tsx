import { Link } from "wouter";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Registration is currently disabled.
        </p>
        <Link href="/login">
          <a className="text-indigo-600 hover:text-indigo-500">
            Back to Login
          </a>
        </Link>
      </div>
    </div>
  );
}
