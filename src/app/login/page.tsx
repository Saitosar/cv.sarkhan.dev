'use client'

import React from 'react'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign In to AI Resume</h1>
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => signIn('google')} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue with Google
        </button>
        <button 
          onClick={() => signIn('linkedin')} 
          className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
        >
          Continue with LinkedIn
        </button>
      </div>
      <p className="text-sm">
        Don&apos;t have an account? <a href="/register" className="text-blue-500 underline">Register</a>
      </p>
    </div>
  )
}
