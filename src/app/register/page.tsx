export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Register</h1>
      <form className="flex flex-col gap-4 w-80">
        <input type="email" placeholder="Email" className="border p-2 rounded" />
        <input type="password" placeholder="Password" className="border p-2 rounded" />
        <button className="bg-green-500 text-white p-2 rounded">Sign Up</button>
      </form>
    </div>
  );
}
