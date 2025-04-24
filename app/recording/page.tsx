"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ArrowRight, Info, X, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function RecordingPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [showHand, setShowHand] = useState(true)
  const [recognizedText, setRecognizedText] = useState("")
  const [interimText, setInterimText] = useState("")
  const audioVisualizerRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>(0)
  const previousAudioDataRef = useRef<number[]>([])
  const recognitionRef = useRef<any>(null)
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

  // 音声認識の初期化
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'ja-JP'

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          setRecognizedText(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript)
          setInterimText('')
        } else {
          setInterimText(interimTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('音声認識エラー:', event.error)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Simulated audio data for visualization
  const simulateAudioData = () => {
    // 波形をシミュレート（よりゆっくり変化するデータ）
    const time = Date.now() / 8000; // 非常にゆっくりした時間変化
    
    // 正弦波をベースにした波形生成（滑らかな波形）
    return Array(24).fill(0).map((_, i) => {
      const position = i / 24;
      
      // 3つの異なる周波数の正弦波を合成して複雑な波形を作る
      const wave1 = Math.sin(time * 1.0 + position * Math.PI * 2) * 40;
      const wave2 = Math.sin(time * 0.5 + position * Math.PI * 4) * 20;
      const wave3 = Math.sin(time * 0.2 + position * Math.PI * 6) * 10;
      
      // 基本の高さ (50) + 合成波
      return 50 + wave1 + wave2 + wave3;
    });
  }

  // Draw audio visualizer
  const drawVisualizer = () => {
    if (!audioVisualizerRef.current || !isRecording) return

    const canvas = audioVisualizerRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Get audio data (simulated)
    const audioData = simulateAudioData()
    
    // 前回のデータがなければ初期化
    if (previousAudioDataRef.current.length === 0) {
      previousAudioDataRef.current = audioData
    }
    
    // より滑らかな補間（非常にゆっくり）- さらに補間を強化
    const smoothedData = audioData.map((value, i) => {
      const prev = previousAudioDataRef.current[i] || value
      // 非常にゆっくりな補間係数（0.01は極めて緩やか）
      const smoothFactor = 0.01
      return prev * (1 - smoothFactor) + value * smoothFactor
    })
    
    // 次のフレーム用にデータを保存
    previousAudioDataRef.current = smoothedData
    
    // 背景の円（ベース）
    ctx.beginPath()
    ctx.arc(centerX, centerY, width / 3.2, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(244, 63, 94, 0.08)"
    ctx.lineWidth = 8
    ctx.stroke()
    
    // 波形の描画
    drawWaveform(ctx, centerX, centerY, width / 3, smoothedData);

    // フレームレート（非常に遅く）
    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(drawVisualizer)
    }, 80)
  }
  
  // 滑らかな波形を描画する関数
  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    baseRadius: number,
    data: number[]
  ) => {
    const segments = data.length;
    const angleStep = (Math.PI * 2) / segments;
    
    // メインの波形
    drawWaveLayer(ctx, centerX, centerY, baseRadius, data, 
      "rgba(244, 114, 182, 0.2)", "rgba(244, 114, 182, 0)", 0.4);
    
    // 補助的な波形（少しサイズと位相を変えて重ねる）
    drawWaveLayer(ctx, centerX, centerY, baseRadius * 0.85, data.map(
      (v, i) => v * 0.9 + Math.sin(i/3) * 10), 
      "rgba(249, 168, 212, 0.15)", "rgba(249, 168, 212, 0)", 0.3);
      
    // さらに小さな波形
    drawWaveLayer(ctx, centerX, centerY, baseRadius * 0.7, data.map(
      (v, i) => v * 0.8 + Math.cos(i/2) * 15), 
      "rgba(253, 224, 235, 0.1)", "rgba(253, 224, 235, 0)", 0.2);
  }
  
  // 単一の波レイヤーを描画
  const drawWaveLayer = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    baseRadius: number,
    data: number[],
    fillColorStart: string,
    fillColorEnd: string,
    amplitudeFactor: number
  ) => {
    const segments = data.length;
    const angleStep = (Math.PI * 2) / segments;
    
    // 時間経過による回転（非常にゆっくり）
    const rotation = (Date.now() / 30000) % (Math.PI * 2);
    
    // パスの開始
    ctx.beginPath();
    
    // 波形の描画（より滑らかな曲線で）
    for (let i = 0; i <= segments; i++) {
      const idx = i % segments;
      const nextIdx = (i + 1) % segments;
      const prevIdx = (i - 1 + segments) % segments;
      
      // データ値の取得（隣接点も含めて平均化）
      const value = data[idx] / 100;
      const prevValue = data[prevIdx] / 100;
      const nextValue = data[nextIdx] / 100;
      
      // 平均化された値（さらに滑らかに）
      const smoothValue = (prevValue + value + nextValue) / 3;
      
      // 角度計算（ゆっくり回転）
      const angle = (i * angleStep + rotation) % (Math.PI * 2);
      
      // 半径計算（波の高さ）
      const radiusMultiplier = 1 + smoothValue * amplitudeFactor;
      const radius = baseRadius * radiusMultiplier;
      
      // 座標計算
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // よりスムーズな曲線のための制御点を計算
        const prevAngle = ((i - 1) * angleStep + rotation) % (Math.PI * 2);
        const prevX = centerX + Math.cos(prevAngle) * (baseRadius * (1 + prevValue * amplitudeFactor));
        const prevY = centerY + Math.sin(prevAngle) * (baseRadius * (1 + prevValue * amplitudeFactor));
        
        // 制御点を計算（より自然な曲線のため）
        const cp1x = prevX + (x - prevX) / 3;
        const cp1y = prevY + (y - prevY) / 3;
        const cp2x = prevX + (x - prevX) * 2/3;
        const cp2y = prevY + (y - prevY) * 2/3;
        
        // ベジェ曲線で滑らかに接続
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
    }
    
    // パスを閉じる
    ctx.closePath();
    
    // グラデーション設定
    const gradient = ctx.createRadialGradient(
      centerX, centerY, baseRadius * 0.5,
      centerX, centerY, baseRadius * 1.8
    );
    gradient.addColorStop(0, fillColorStart);
    gradient.addColorStop(1, fillColorEnd);
    
    // 塗りつぶし
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 輪郭線（非常に薄く）
    ctx.strokeStyle = fillColorStart.replace(/[^,]+\)/, "0.15)");
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Reset animation variables
      previousAudioDataRef.current = []

      // Start visualizer
      drawVisualizer()

      // 音声認識開始
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } else {
      setRecordingTime(0)

      // Stop visualizer
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Clear canvas
      if (audioVisualizerRef.current) {
        const ctx = audioVisualizerRef.current.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, audioVisualizerRef.current.width, audioVisualizerRef.current.height)
        }
      }

      // 音声認識停止
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }

    return () => {
      if (interval) clearInterval(interval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isRecording])

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // 録音開始時にテキストをリセット
      setRecognizedText("")
      setInterimText("")
    }
  }

  // 結果ページへ遷移
  const goToResult = () => {
    // 録音状態をリセット
    setIsRecording(false)
    // 結果ページへ遷移
    router.push('/result')
  }
  
  // ホームに戻る
  const goToHome = () => {
    // 録音状態をリセット
    setIsRecording(false)
    // ホームに戻る
    router.push('/home')
  }

  // Function to draw heart SVG path
  const heartPath = "M25,1 C11.2,1 1,11.2 1,25 C1,38.8 11.2,49 25,49 C38.8,49 49,38.8 49,25 C49,11.2 38.8,1 25,1 Z"

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50 relative overflow-hidden">
      {/* hand.png画像 - 位置を上に調整 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showHand ? 0.8 : 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 z-10"
      >
        <Image
          src="/hand.png"
          alt="Hand"
          width={250}
          height={250}
          style={{ maxHeight: '180px', objectFit: 'contain' }}
        />
      </motion.div>

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* ドットパターン - 左右のみに表示（数を減らす） */}
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
      <div className="absolute bottom-0 left-0 right-0 h-32 z-0">
        <svg viewBox="0 0 1440 320" className="w-full absolute bottom-0">
          <path
            fill="rgba(254, 215, 170, 0.6)"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 flex justify-between items-center">
        <div className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
          Emotion Voice
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowInfo(!showInfo)}>
          <Info className="w-5 h-5 text-gray-600" />
        </Button>
      </header>

      {/* Info modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              className="bg-white/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full shadow-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">アプリについて</h3>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowInfo(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <p>このアプリは、あなたの声から感情を分析し、心の状態を可視化します。</p>
                <p>話し方のトーン、スピード、抑揚などから、あなたの感情状態を分析し、フィードバックを提供します。</p>
                <p>定期的に使用することで、感情の変化を追跡し、メンタルヘルスの維持に役立てることができます。</p>
              </div>
              <Button
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white"
                onClick={() => setShowInfo(false)}
              >
                閉じる
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto flex flex-col items-center"
        >
          {/* Heart container */}
          <div className="relative mb-6">
            {/* Heart shape background */}
            <motion.div
              className="relative w-72 h-72 flex items-center justify-center"
              animate={{
                scale: isRecording ? [1, 1.03, 1] : 1,
              }}
              transition={{
                repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
                duration: 1.8,
              }}
            >
              {/* SVG Heart */}
              <svg
                viewBox="0 0 512 512"
                className="absolute w-full h-full"
                style={{ filter: "drop-shadow(0 10px 15px rgba(244, 114, 182, 0.3))" }}
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

              {/* Glass effect overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 512 512" className="w-full h-full">
                  <path
                    d="M256 448l-30.164-27.211C118.718 322.442 48 258.61 48 179.095 48 114.221 97.918 64 162.4 64c36.399 0 70.717 16.742 93.6 43.947C278.882 80.742 313.199 64 349.6 64 414.082 64 464 114.221 464 179.095c0 79.516-70.719 143.348-177.836 241.694L256 448z"
                    fill="white"
                    opacity="0.15"
                  />
                </svg>
              </div>

              {/* Text and mic inside heart */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                <motion.p
                  className="text-gray-800 mb-4 font-medium text-lg tracking-tight"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  あなたが今抱えている悩みを教えてください
                </motion.p>
                <motion.p
                  className="text-gray-600 text-sm mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  (回答時間目安: 10秒以上)
                </motion.p>

                <div className="relative">
                  {/* Audio visualizer */}
                  <div
                    className={cn(
                      "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full",
                      isRecording ? "opacity-100" : "opacity-0",
                      "transition-opacity duration-300",
                    )}
                  >
                    <canvas ref={audioVisualizerRef} width="128" height="128" className="w-full h-full" />
                  </div>

                  {/* Modern Microphone SVG */}
                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <motion.button
                      onClick={toggleRecording}
                      className="relative w-24 h-24 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Simple Circular Microphone Icon */}
                      <motion.svg
                        width="100"
                        height="100"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        animate={{
                          scale: isRecording ? [1, 1.05, 1] : 1,
                        }}
                        transition={{
                          repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
                          duration: 1.2,
                        }}
                      >
                        {/* Circle Background */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="48" 
                          stroke={isRecording ? "#f43f5e" : "#333333"} 
                          strokeWidth="4" 
                          fill="none"
                        />
                        
                        {/* Classic Microphone */}
                        <g transform="translate(28, 22)">
                          {/* Microphone Body */}
                          <path
                            d="M22,0 L22,0 C27.52,0 32,4.48 32,10 L32,30 C32,35.52 27.52,40 22,40 L22,40 C16.48,40 12,35.52 12,30 L12,10 C12,4.48 16.48,0 22,0 Z"
                            fill={isRecording ? "#f43f5e" : "#333333"}
                          />
                          
                          {/* Mic Grills */}
                          <rect x="12" y="12" width="20" height="3" fill="white" />
                          <rect x="12" y="19" width="20" height="3" fill="white" />
                          <rect x="12" y="26" width="20" height="3" fill="white" />
                          
                          {/* Stand */}
                          <path
                            d="M22,40 L22,48 M10,48 L34,48"
                            stroke={isRecording ? "#f43f5e" : "#333333"}
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          
                          {/* Side lines for circle accent, like in the image */}
                          <g transform="translate(-28, -22)">
                            <path
                              d="M5,40 L15,40 M5,60 L15,60 M85,40 L95,40 M85,60 L95,60"
                              stroke={isRecording ? "#f43f5e" : "#333333"}
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </g>
                        </g>
                      </motion.svg>
                    </motion.button>
                  </motion.div>
                </div>

                <motion.p
                  className="text-gray-700 text-sm mt-6 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isRecording ? `録音中... ${recordingTime}秒` : "マイクをタップで録音開始"}
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* 音声認識テキスト表示エリア */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md px-4 py-3 mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              {isRecording ? (
                <Mic className="w-4 h-4 text-rose-500 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4 text-gray-400" />
              )}
              <h3 className="text-sm font-medium text-gray-700">認識テキスト</h3>
            </div>
            <div className="min-h-[80px] max-h-[120px] overflow-y-auto p-2 rounded-lg bg-white/70 border border-gray-100 text-sm">
              {recognizedText ? (
                <p className="text-gray-800">{recognizedText}</p>
              ) : (
                <p className="text-gray-400 italic">
                  {isRecording ? (interimText || "音声を認識中...") : "録音を開始すると、ここに認識されたテキストが表示されます。"}
                </p>
              )}
              {interimText && (
                <p className="text-gray-500 italic mt-1">{interimText}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Navigation buttons */}
      <div className="relative z-10 p-4 flex justify-between w-full max-w-md mx-auto mb-4">
        <Button
          variant="outline"
          className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90 px-6 rounded-xl shadow-sm"
          onClick={goToHome}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>

        <Button
          className={`px-6 rounded-xl shadow-sm ${
            isRecording || recordingTime > 0
              ? "bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!isRecording && recordingTime === 0}
          onClick={isRecording || recordingTime > 0 ? goToResult : undefined}
        >
          次へ
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
} 