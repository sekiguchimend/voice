"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Heart, Activity, ArrowUpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"


export default function ResultPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // 分析結果のサンプルデータ
  const [emotionData, setEmotionData] = useState({
    mainEmotion: "ややモヤモヤ",
    relatedKeywords: ["上司", "仕事", "頼まれたとき"],
    advice: "お疲れ気味ですね。こういう時は寝るか、おいしいものを食べるか、会いたい人に会ってください。\n\n今日は電子メールの日だそうです。久しぶりの人に連絡してみましょう。"
  })

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
    
    // ローディング状態を更新
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    
    return () => {
      clearTimeout(timer)
    }
  }, [router])
  
  // ホームに戻る
  const goToHome = () => {
    router.push('/home')
  }
  
  // 保存（仮の実装）
  const saveResult = () => {
    // 保存する分析結果データを作成
    const resultToSave = {
      date: new Date().toLocaleString('ja-JP'),
      emotionAnalysis: emotionData
    }
    
    // JSONデータの作成
    const jsonData = JSON.stringify(resultToSave, null, 2)
    
    // Blobの作成
    const blob = new Blob([jsonData], { type: 'application/json' })
    
    // ダウンロードリンクの作成
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `感情分析結果_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')}.json`
    
    // リンクをクリックしてダウンロードを開始
    document.body.appendChild(a)
    a.click()
    
    // クリーンアップ
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    alert("結果をダウンロードしました")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#e6f7fa] relative overflow-hidden">
      {/* ドット背景 */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-40">
        <div className="grid grid-cols-10 gap-2">
          {Array(100)
            .fill(0)
            .map((_, i) => (
              <div key={`dot-tl-${i}`} className="w-1 h-1 rounded-full bg-orange-400"></div>
            ))}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-40">
        <div className="grid grid-cols-10 gap-2">
          {Array(100)
            .fill(0)
            .map((_, i) => (
              <div key={`dot-tr-${i}`} className="w-1 h-1 rounded-full bg-orange-400"></div>
            ))}
        </div>
      </div>

      {/* 波形の背景 - 元の肌色の波形 */}
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] z-5">
        <svg 
          viewBox="0 0 1440 600" 
          preserveAspectRatio="none" 
          className="w-full h-full absolute bottom-0"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(254, 215, 170, 0.8)" />
              <stop offset="100%" stopColor="rgba(254, 215, 170, 0.9)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradient)"
            d="M0,320L48,309.3C96,299,192,277,288,277.3C384,277,480,299,576,298.7C672,299,768,277,864,277.3C960,277,1056,299,1152,304C1248,309,1344,299,1392,293.3L1440,288L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"
          ></path>
        </svg>
      </div>
      
      {/* ヘッダー */}
      <header className="relative z-10 pt-6 px-6 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/80"
          onClick={goToHome}
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
          分析結果
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/80"
          onClick={saveResult}
        >
          <Download className="w-5 h-5 text-gray-600" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-6 pb-24 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent rounded-full mb-4"
            ></motion.div>
            <p className="text-gray-600">感情を分析しています...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto space-y-6"
          >
            {/* 感情表示部分 */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
              <h3 className="text-base font-medium text-gray-500 mb-4">あなたの感情は...</h3>
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-full w-16 h-16 flex items-center justify-center mr-4 shadow-md">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  {emotionData.mainEmotion}
                </h2>
              </div>
            </div>
            
            {/* キーワード部分 */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
              <div className="flex items-center mb-4">
                <Heart className="w-5 h-5 text-pink-500 mr-2" />
                <h3 className="text-base font-medium text-gray-700">特に感情が強く出ていたワード</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {emotionData.relatedKeywords.map((keyword, index) => (
                  <motion.div 
                    key={index} 
                    className="border-2 border-red-400 rounded-xl px-4 py-2.5 text-center bg-red-50/50"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <span className="text-red-600 font-medium">「{keyword}」</span>
                  </motion.div>
                ))}
              </div>
              <div className="text-xs text-right mt-3 text-red-400 italic">
                結果による文字色の変更
              </div>
            </div>
            
            {/* アドバイス部分 */}
            <div className="bg-gradient-to-br from-[#fdcdc2] to-[#ffb9a7] rounded-2xl p-6 shadow-lg border border-white/50 mt-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-3">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{emotionData.advice}</p>
              </div>
              <div className="text-xs text-right mt-2 text-red-500 italic">
                結果による文言の変更
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* フッターナビゲーション */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 p-4 flex justify-between w-full bg-gradient-to-r from-pink-500 to-rose-400 shadow-lg">
        <Button
          variant="ghost"
          onClick={goToHome}
          className="px-8 py-2.5 rounded-md bg-transparent hover:bg-white/10 text-white font-medium transition-all duration-200"
        >
          戻る
        </Button>
        
        <Button
          onClick={saveResult}
          className="px-8 py-2.5 rounded-md bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium border border-white/30 transition-all duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          保存する
        </Button>
      </footer>

      {/* 著作権表示 */}
      <div className="absolute bottom-20 left-0 right-0 z-10 p-2 text-center text-xs text-white/70">
        <p>© 2025 Emotion Voice Analyzer</p>
      </div>
    </div>
  )
} 