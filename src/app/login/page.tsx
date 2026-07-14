export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Login</h1>
      <form className="flex flex-col gap-4 w-80">
        <input type="email" placeholder="Email" className="border p-2 rounded" />
        <input type="password" placeholder="Password" className="border p-2 rounded" />
        <button className="bg-blue-500 text-white p-2 rounded">Sign In</button>
      </form>
    </div>
  );
}
