// PagePress v0.0.3 - 2025-11-30
// Registration page

import { RegisterForm } from '../components/RegisterForm';

/**
 * Registration page component
 */
export function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">PagePress</h1>
            <p className="text-gray-600 mt-2">Create your account</p>
            <p className="text-sm text-blue-600 mt-1">
              First user will be the admin
            </p>
          </div>
          
          {/* Registration Form */}
          <RegisterForm />
        </div>
        
        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          PagePress v0.0.3 • Self-hosted Website Builder
        </p>
      </div>
    </div>
  );
}
