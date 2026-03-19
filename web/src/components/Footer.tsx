const LILY_GROUP = `${import.meta.env.BASE_URL}spiderlily_group.png`

export default function Footer() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,       // コンテンツ(z-index:100)より低い
      pointerEvents: 'none',
    }}>
      {/* 彼岸花群生：茎の下端をフッターバー上端に合わせる */}
      <img
        src={LILY_GROUP}
        alt=""
        style={{
          position: 'absolute',
          bottom: 54,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100vw',
          minWidth: '100%',
          maxWidth: 'none',
          height: 'auto',
          opacity: 0.45,
          animation: 'sway 5s ease-in-out infinite',
          transformOrigin: 'bottom center',
          pointerEvents: 'none',
        }}
      />

      {/* フッターバー */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgb(22, 22, 22)',
        borderTop: '1px solid rgb(34, 34, 34)',
        fontSize: 13,
        color: 'rgb(112, 112, 112)',
        letterSpacing: '0.06em',
        fontFamily: '"Noto Sans JP", sans-serif',
        pointerEvents: 'auto',
      }}>
        <span className="footer-full">
          © 2026{' '}
          <a href="https://x.com/WL_GE_inn" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgb(136, 136, 136)', textDecoration: 'none' }}>
            金鷲亭
          </a>
          　|　非公式ファンサイト — 深影（Mikage / RK Music）　|　掲載情報の誤りは{' '}
          <a href="https://x.com/WL_GE_inn" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgb(136, 136, 136)', textDecoration: 'none' }}>
            @WL_GE_inn
          </a>{' '}
          までお気軽にどうぞ
        </span>
        <span className="footer-short">
          © 2026 金鷲亭　|　深影（Mikage / RK Music）非公式ファンサイト
        </span>
      </footer>
    </div>
  )
}
