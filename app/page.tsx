"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  // キャッシュ更新時に自動でログイン画面に戻るための処理
  useEffect(() => {
    // ローカルストレージからセッション情報を削除
    localStorage.removeItem('userSession')
    
    // 現在のページがホームページからの戻りかどうかを確認
    const fromHome = sessionStorage.getItem('fromHome')
    if (fromHome) {
      sessionStorage.removeItem('fromHome')
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // バックエンドは実装せず、単純に遷移のみ行う
    setTimeout(() => {
      setIsLoading(false)
      
      // セッション情報をローカルストレージに保存（実際の認証は行わない）
      localStorage.setItem('userSession', 'logged-in')
      
      // ホームページに遷移
      router.push("/home")
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dot pattern */}
        <div className="absolute top-0 left-0 w-64 h-64 opacity-30">
          <div className="grid grid-cols-12 gap-4">
            {Array(144)
              .fill(0)
              .map((_, i) => (
                <div key={`dot-tl-${i}`} className="w-1 h-1 rounded-full bg-orange-400"></div>
              ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-30">
          <div className="grid grid-cols-12 gap-4">
            {Array(144)
              .fill(0)
              .map((_, i) => (
                <div key={`dot-tr-${i}`} className="w-1 h-1 rounded-full bg-orange-400"></div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-0">
        <svg viewBox="0 0 1440 320" className="w-full absolute bottom-0">
          <path
            fill="rgba(254, 215, 170, 0.6)"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 flex justify-center items-center">
        <div className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
          Emotion Voice
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto flex flex-col items-center"
        >
          {/* Login Card */}
          <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                <svg
                  viewBox="0 0 512 512"
                  className="absolute w-full h-full"
                  style={{ filter: "drop-shadow(0 4px 6px rgba(244, 114, 182, 0.25))" }}
                >
                  <defs>
                    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FEDFE1" />
                      <stop offset="50%" stopColor="#FDC4CF" />
                      <stop offset="100%" stopColor="#FBACBD" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M256 448l-30.164-27.211C118.718 322.442 48 258.61 48 179.095 48 114.221 97.918 64 162.4 64c36.399 0 70.717 16.742 93.6 43.947C278.882 80.742 313.199 64 349.6 64 414.082 64 464 114.221 464 179.095c0 79.516-70.719 143.348-177.836 241.694L256 448z"
                    fill="url(#heartGradient)"
                    opacity="0.9"
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="text-center text-xl font-semibold mb-6 text-gray-800">
              エモーション・ボイスにログイン
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="w-full bg-white/70"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/70"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "ログイン中..." : "ログイン"}
                </Button>
              </div>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                アカウントをお持ちでない方は <a href="#" className="text-pink-500 hover:text-pink-600">新規登録</a>
              </p>
            </form>
            
           
          </div>
        </motion.div>
      </main>
      
      <footer className="relative z-10 p-6 text-center text-sm text-gray-600">
        © 2023 Emotion Voice. All rights reserved.
      </footer>
    </div>
  )
}
