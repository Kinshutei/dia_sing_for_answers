const LILY = `${import.meta.env.BASE_URL}spiderlily.png`

const FLOWERS = [
  { left: '2%',   height: 110, delay: 0.0, duration: 4.2, initRot: -4  },
  { left: '6%',   height: 145, delay: 0.8, duration: 3.8, initRot:  3  },
  { left: '11%',  height:  90, delay: 1.6, duration: 4.6, initRot: -7  },
  { left: '17%',  height: 125, delay: 0.4, duration: 4.0, initRot:  5  },
  { left: '23%',  height:  80, delay: 1.2, duration: 3.6, initRot: -2  },
  { left: '75%',  height:  85, delay: 1.0, duration: 4.4, initRot:  4  },
  { left: '81%',  height: 130, delay: 0.2, duration: 3.9, initRot: -6  },
  { left: '87%',  height:  95, delay: 1.8, duration: 4.1, initRot:  2  },
  { left: '92%',  height: 140, delay: 0.6, duration: 4.7, initRot: -3  },
  { left: '97%',  height:  75, delay: 1.4, duration: 3.7, initRot:  7  },
]

export default function Footer() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      pointerEvents: 'none',
    }}>
      {/* 彼岸花群生 */}
      {FLOWERS.map((f, i) => (
        <img
          key={i}
          src={LILY}
          alt=""
          style={{
            position: 'absolute',
            bottom: 54,
            left: f.left,
            height: f.height,
            width: 'auto',
            mixBlendMode: 'screen',
            opacity: 0.55,
            transformOrigin: 'bottom center',
            animation: `sway ${f.duration}s ease-in-out ${f.delay}s infinite`,
            transform: `rotate(${f.initRot}deg)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* フッターバー */}
      <footer style={{
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
