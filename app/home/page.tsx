"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // セッションチェック
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      const session = localStorage.getItem('userSession')
      if (!session) {
        // セッションがなければログインページにリダイレクト
        router.push('/')
      }
    }

    // ホームページからの離脱をマーク
    return () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem('fromHome', 'true')
      }
    }
  }, [router])

  // 録音ページへ遷移
  const goToRecordingPage = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push('/recording')
    }, 500)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dot pattern */}
        <div className="absolute top-0 left-0 w-16 h-full opacity-30">
          <div className="grid grid-cols-3 gap-8">
            {Array(30)
              .fill(0)
              .map((_, i) => (
                <div key={`dot-left-${i}`} className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
              ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-16 h-full opacity-30">
          <div className="grid grid-cols-3 gap-8">
            {Array(30)
              .fill(0)
              .map((_, i) => (
                <div key={`dot-right-${i}`} className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-35vh z-0">
        <svg viewBox="0 0 1440 320" className="w-full absolute bottom-0">
          <path
            fill="#FFCC99"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 flex justify-between items-center">
        <div className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
          Emotion Voice
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        {/* 「あなたの感情を測定します」テキスト */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center"
        >
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
            あなたの感情を測定します
          </h2>
        </motion.div>

        {/* pi.png画像を中央に表示 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10"
        >
          <Image
            src="/pi.png"
            alt="Emotion Voice"
            width={320}
            height={320}
            className="drop-shadow-lg"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-xs mx-auto flex justify-center"
        >
          <Button
            className={`
              px-10 py-6 rounded-xl text-lg font-semibold shadow-md
              ${isLoading ? 'bg-gray-300' : 'bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500'}
              text-white
              transition-all duration-300
            `}
            disabled={isLoading}
            onClick={goToRecordingPage}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </span>
            ) : (
              <span className="flex items-center">
                START
                <Sparkles className="ml-2 w-5 h-5" />
              </span>
            )}
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <div className="relative z-10 p-6 text-center text-gray-500 text-xs">
        <p>© 2023 Emotion Voice Analyzer</p>
      </div>
    </div>
  )
} 