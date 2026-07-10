import React from 'react'

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Create Your Account</h1>
      <p className="text-gray-600">Join the AI Resume Intelligence platform.</p>
      <div className="flex flex-col gap-2">
        <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded text-center">
          Go to Sign In
        </a>
      </div>
    </div>
  )
}
