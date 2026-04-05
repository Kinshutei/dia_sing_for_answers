import { useState, useEffect, useRef, useCallback } from 'react'
import { StreamingRecord } from './types'
import { parseCSV, parseSongMaster } from './utils/csv'
import StreamsTab from './components/StreamsTab'
import SongsTab from './components/SongsTab'
import AboutTab from './components/AboutTab'
import ChangelogTab from './components/ChangelogTab'
import TerminalMessage from './components/TerminalMessage'
import './App.css'

const STREAMING_CSV_URL =
  import.meta.env.VITE_CSV_URL ??
  'https://raw.githubusercontent.com/Kinshutei/dia_sing_for_answers/main/streaminginfo_Dia.csv'

const SONG_MASTER_URL =
  import.meta.env.VITE_MASTER_URL ??
  'https://raw.githubusercontent.com/Kinshutei/dia_sing_for_answers/main/rkmusic_song_master.csv'

const VIDEOS = [
  { src: `${import.meta.env.BASE_URL}dia_moviecard_01.mp4`, grayscale: false, rate: 0.6  },
  { src: `${import.meta.env.BASE_URL}dia_moviecard_02.mp4`, grayscale: true,  rate: 1.0  },
  { src: `${import.meta.env.BASE_URL}dia_moviecard_03.mp4`, grayscale: true,  rate: 1.0  },
  { src: `${import.meta.env.BASE_URL}dia_moviecard_04.mp4`, grayscale: true,  rate: 0.6  },
]

type Tab = 'streams' | 'songs' | 'about' | 'changelog'

const NAV_ITEMS: { tab: Tab; label: string }[] = [
  { tab: 'streams',   label: 'LiveStreaming INFO' },
  { tab: 'songs',     label: 'Sung Repertoire'   },
  { tab: 'about',     label: 'About'              },
  { tab: 'changelog', label: '更新履歴'           },
]

export default function App() {
  const [records,      setRecords]      = useState<StreamingRecord[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [activeTab,    setActiveTab]    = useState<Tab | null>(null)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [terminalKey,      setTerminalKey]      = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoARef        = useRef<HTMLVideoElement>(null)
  const videoBRef        = useRef<HTMLVideoElement>(null)
  const activeVideoRef   = useRef<'a' | 'b'>('a')
  const transitioningRef = useRef(false)
  const videoIndexRef    = useRef(0)
  const grainCanvasRef   = useRef<HTMLCanvasElement>(null)
  const grainAnimRef     = useRef<number>(0)
  const progressBarRef   = useRef<HTMLDivElement>(null)

  const FADE_BEFORE = 1.5 // 終了 n 秒前にフェード開始
  const FADE_MS     = 1500

  useEffect(() => {
    const videoA = videoARef.current
    const videoB = videoBRef.current
    if (!videoA || !videoB) return

    videoA.style.filter  = 'none'
    videoA.playbackRate  = VIDEOS[0].rate
    videoA.style.opacity = '1'
    videoB.style.opacity = '0'

    const onTimeUpdate = (e: Event) => {
      if (transitioningRef.current) return
      const isA    = e.target === videoA
      if ((activeVideoRef.current === 'a') !== isA) return
      const current = isA ? videoA : videoB
      const next    = isA ? videoB : videoA
      if (!current.duration || isNaN(current.duration)) return
      if (current.duration - current.currentTime > FADE_BEFORE) return

      transitioningRef.current = true
      const nextIndex  = (videoIndexRef.current + 1) % VIDEOS.length
      const nextConfig = VIDEOS[nextIndex]

      next.src          = nextConfig.src
      next.style.filter = nextConfig.grayscale ? 'grayscale(1)' : 'none'
      next.load()
      next.currentTime  = 0
      next.playbackRate = nextConfig.rate
      next.play().catch(() => {})

      current.style.opacity = '0'
      next.style.opacity    = '1'

      setTimeout(() => {
        current.pause()
        current.currentTime    = 0
        videoIndexRef.current  = nextIndex
        setCurrentVideoIndex(nextIndex)
        activeVideoRef.current = isA ? 'b' : 'a'
        transitioningRef.current = false
      }, FADE_MS)
    }

    videoA.addEventListener('timeupdate', onTimeUpdate)
    videoB.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      videoA.removeEventListener('timeupdate', onTimeUpdate)
      videoB.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [masterRes, streamRes] = await Promise.all([
          fetch(SONG_MASTER_URL),
          fetch(STREAMING_CSV_URL),
        ])
        if (!masterRes.ok) throw new Error(`song_master HTTP ${masterRes.status}`)
        if (!streamRes.ok) throw new Error(`streaming_info HTTP ${streamRes.status}`)
        const [masterText, streamText] = await Promise.all([
          masterRes.text(),
          streamRes.text(),
        ])
        setRecords(parseCSV(streamText, parseSongMaster(masterText)))
      } catch (e: unknown) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  /* ── グレインノイズ + プログレスバー（統合RAFループ） ── */
  useEffect(() => {
    const canvas = grainCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SCALE = 2

    // ImageData を一度だけ確保してバッファを使い回す
    let imageData: ImageData | null = null
    let data: Uint8ClampedArray | null = null

    const resize = () => {
      canvas.width  = Math.ceil(canvas.offsetWidth  / SCALE)
      canvas.height = Math.ceil(canvas.offsetHeight / SCALE)
      imageData = ctx.createImageData(canvas.width, canvas.height)
      data      = imageData.data
    }
    resize()
    window.addEventListener('resize', resize)

    let frame = 0
    const loop = () => {
      frame++

      // プログレスバー（毎フレーム）
      const bar    = progressBarRef.current
      const videoA = videoARef.current
      const videoB = videoBRef.current
      if (bar && videoA && videoB) {
        const active   = activeVideoRef.current === 'a' ? videoA : videoB
        const progress = active.duration ? active.currentTime / active.duration : 0
        bar.style.width = `${progress * 100}%`
      }

      // グレイン（約15fps）
      if (frame % 4 === 0 && imageData && data) {
        data.fill(0) // ネイティブ高速クリア
        for (let i = 0; i < data.length; i += 4) {
          if (Math.random() > 0.22) continue
          const v = Math.floor(Math.random() * 40)
          const a = Math.floor(Math.random() * 80 + 20)
          data[i]     = v
          data[i + 1] = v
          data[i + 2] = v
          data[i + 3] = a
        }
        ctx.putImageData(imageData, 0, 0)
      }

      grainAnimRef.current = requestAnimationFrame(loop)
    }

    grainAnimRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(grainAnimRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const skipToVideo = useCallback((index: number) => {
    if (transitioningRef.current || videoIndexRef.current === index) return
    const videoA = videoARef.current
    const videoB = videoBRef.current
    if (!videoA || !videoB) return

    transitioningRef.current = true
    const current = activeVideoRef.current === 'a' ? videoA : videoB
    const next    = activeVideoRef.current === 'a' ? videoB : videoA
    const config  = VIDEOS[index]

    next.src          = config.src
    next.style.filter = config.grayscale ? 'grayscale(1)' : 'none'
    next.load()
    next.currentTime  = 0
    next.playbackRate = config.rate
    next.play().catch(() => {})

    current.style.opacity = '0'
    next.style.opacity    = '1'

    setTimeout(() => {
      current.pause()
      current.currentTime      = 0
      videoIndexRef.current    = index
      setCurrentVideoIndex(index)
      activeVideoRef.current   = activeVideoRef.current === 'a' ? 'b' : 'a'
      transitioningRef.current = false
    }, FADE_MS)
  }, [])

  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const handleLogoClick = () => {
    setActiveTab(null)
    setTerminalKey(k => k + 1)
    setSidebarOpen(false)
  }

  return (
    <div className="layout">

      {/* モバイルオーバーレイ */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* サイドバー */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-top" onClick={handleLogoClick}>
          <span className="sidebar-tagline">Resounding---<br />with the truth of this world.</span>
          <span className="sidebar-title">狭間の場所</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ tab, label }) => (
            <button
              key={tab}
              className={`sidebar-nav-item${activeTab === tab ? ' active' : ''}`}
              onClick={() => handleNavClick(tab)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* メインエリア */}
      <div className="main-area">

        {/* モバイルハンバーガー */}
        <button
          className={`hamburger${sidebarOpen ? ' hamburger--open' : ''}`}
          onClick={() => setSidebarOpen(s => !s)}
          aria-label="メニュー"
        >
          <span /><span /><span />
        </button>

        {/* ── ヒーローセクション（TOP / About / Streams で表示） ── */}
        {(activeTab === null || activeTab === 'about' || activeTab === 'streams') && (
          <section className="hero-section">
            <video ref={videoARef} className="hero-video" src={VIDEOS[0].src} autoPlay muted playsInline />
            <video ref={videoBRef} className="hero-video" muted playsInline />
            <canvas ref={grainCanvasRef} className="hero-grain" />
            <div className="hero-overlay" />
            <div className="hero-video-indicators">
              {VIDEOS.map((_, i) => (
                <div
                  key={i}
                  className={`hero-video-indicator${currentVideoIndex === i ? ' active' : ''}`}
                  onClick={() => skipToVideo(i)}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="hero-progress-track">
              <div ref={progressBarRef} className="hero-progress-bar" />
            </div>
            <div className="hero-terminal">
              <TerminalMessage key={terminalKey} />
            </div>
            {activeTab === 'about' && (
              <div className="hero-about">
                <button className="hero-about-close" onClick={handleLogoClick}>× CLOSE</button>
                <div className="hero-about-body">
                  <AboutTab />
                </div>
              </div>
            )}
            {activeTab === 'streams' && (
              <div className="hero-streams">
                <button className="hero-about-close" onClick={handleLogoClick}>× CLOSE</button>
                <div className="hero-streams-body">
                  {loading && <p className="status-text">読み込み中...</p>}
                  {error   && <p className="status-text status-text--error">データの取得に失敗しました: {error}</p>}
                  {!loading && !error && <StreamsTab records={records} />}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── コンテンツページ（Songs / Changelog） ── */}
        {(activeTab === 'songs' || activeTab === 'changelog') && (
          <main className="content-area">
            <button className="back-btn" onClick={handleLogoClick}>
              ← BACK TO HOME
            </button>
            {loading && <p className="status-text">読み込み中...</p>}
            {error   && <p className="status-text status-text--error">データの取得に失敗しました: {error}</p>}
            {activeTab === 'songs'     && !loading && !error && <SongsTab   records={records} />}
            {activeTab === 'changelog' && <ChangelogTab />}
          </main>
        )}
      </div>

    </div>
  )
}
