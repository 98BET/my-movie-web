"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include', // เพิ่มบรรทัดนี้เพื่อให้เบราว์เซอร์ยอมรับและบันทึกคุกกี้
    });

    if (res.ok) {
      window.location.href = '/admin'; // เปลี่ยนเป็นบังคับโหลดหน้าใหม่เพื่อให้เบราว์เซอร์ส่งคุกกี้เข้า Middleware สมบูรณ์
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-amber-400">🔒 Admin Login</h1>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-300">รหัสผ่านแอดมิน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
            placeholder="กรอกรหัสผ่าน..."
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition cursor-pointer"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}