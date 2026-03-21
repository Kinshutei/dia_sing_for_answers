import { useMemo, useState } from 'react'

import Plot from 'react-plotly.js'
import { StreamingRecord, SongStat } from '../types'
import { aggregateSongs } from '../utils/csv'

interface Props {
  records: StreamingRecord[]
}

type SortKey = keyof SongStat
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: '楽曲名', label: '楽曲名' },
  { key: '原曲アーティスト', label: '原曲アーティスト' },
  { key: '作詞', label: '作詞' },
  { key: '作曲', label: '作曲' },
  { key: 'リリース日', label: 'リリース日' },
  { key: '歌唱回数', label: '歌唱回数' },
]

function sortSongs(songs: SongStat[], key: SortKey, dir: SortDir): SongStat[] {
  return [...songs].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    let cmp: number
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv
    } else {
      cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'ja')
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

export default function SongsTab({ records }: Props) {
  const songs: SongStat[] = useMemo(() => aggregateSongs(records), [records])
  const [sortKey, setSortKey] = useState<SortKey>('歌唱回数')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const sortedSongs = useMemo(() => sortSongs(songs, sortKey, sortDir), [songs, sortKey, sortDir])
  const top20 = songs.slice(0, 20)
  const [barKey, setBarKey] = useState(0)
  const [treeKey, setTreeKey] = useState(0)
  const [treeKey2, setTreeKey2] = useState(0)

  const maxCount = top20[0]?.歌唱回数 ?? 1
  const barColors = top20.map((s) => `rgba(107,159,212,${0.2 + 0.7 * (s.歌唱回数 / maxCount)})`)

  const yearMap = new Map<string, number>()
  for (const s of songs) {
    if (!s.リリース年) continue
    yearMap.set(s.リリース年, (yearMap.get(s.リリース年) ?? 0) + 1)
  }
  const years = Array.from(yearMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const artistMap = new Map<string, number>()
  for (const s of songs) {
    const artist = s.原曲アーティスト?.trim()
    if (!artist) continue
    artistMap.set(artist, (artistMap.get(artist) ?? 0) + s.歌唱回数)
  }
  const artists = Array.from(artistMap.entries()).sort((a, b) => b[1] - a[1])
  const artistTotal = artists.reduce((sum, [, v]) => sum + v, 0)

  if (records.length === 0) {
    return <p style={{ color: '#888', padding: '1rem' }}>曲がまだ登録されていません。</p>
  }

  const handleHeaderClick = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === '歌唱回数' ? 'desc' : 'asc')
    }
  }

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return <span style={{ color: '#ccc', marginLeft: 4 }}>⇅</span>
    return <span style={{ color: '#5a7fa8', marginLeft: 4 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  const treeColorscale: [number, string][] = [
    [0.0, '#1a0a0d'],
    [0.4, '#4a1525'],
    [0.7, '#7f2235'],
    [1.0, '#b32e46'],
  ]

  return (
    <div>
      <div className="songs-table-wrap">
        <table className="songs-table">
          <thead>
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleHeaderClick(key)}
                  style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', background: sortKey === key ? '#1a1e2a' : undefined }}
                >
                  {label}{sortIndicator(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedSongs.map((s, i) => (
              <tr key={i}>
                <td>{s.楽曲名}</td>
                <td style={{ color: '#666' }}>{s.原曲アーティスト}</td>
                <td style={{ color: '#666' }}>{s.作詞}</td>
                <td style={{ color: '#666' }}>{s.作曲}</td>
                <td style={{ color: '#666' }}>{s.リリース日}</td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: '#b32e46' }}>{s.歌唱回数}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <h3 style={{ color: '#555', margin: 0 }}>歌唱回数ランキング（上位20曲）</h3>
        <button className="btn-secondary" onClick={() => setBarKey((k) => k + 1)}>リセット</button>
      </div>
      <Plot
        key={barKey}
        data={[{
          type: 'bar',
          orientation: 'h',
          x: top20.map((s) => s.歌唱回数),
          y: top20.map((s) => s.楽曲名),
          text: top20.map((s) => String(s.歌唱回数)),
          textposition: 'outside',
          marker: { color: barColors, line: { width: 0 } },
          customdata: top20.map((s) => [s.原曲アーティスト]),
          hovertemplate: '<b>%{y}</b><br>歌唱回数: %{x}<br>Artist: %{customdata[0]}<extra></extra>',
        }]}
        layout={{
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { family: 'Noto Sans JP', color: '#a0a0a0', size: 12 },
          yaxis: { autorange: 'reversed', showgrid: false, tickfont: { size: 11 }, color: '#a0a0a0' },
          xaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, color: '#606060' },
          margin: { l: 160, r: 55, t: 16, b: 10 },
          height: Math.max(380, top20.length * 26),
        }}
        config={{ displayModeBar: false, responsive: true, scrollZoom: false }}
        style={{ width: '100%' }}
        useResizeHandler
      />

      {years.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0 8px' }}>
            <h3 style={{ color: '#555', margin: 0 }}>リリース年度分布</h3>
            <button className="btn-secondary" onClick={() => setTreeKey((k) => k + 1)}>リセット</button>
          </div>
          <Plot
            key={treeKey}
            data={[{
              type: 'bar',
              x: years.map(([y]) => y),
              y: years.map(([, v]) => v),
              text: years.map(([, v]) => String(v)),
              textposition: 'outside',
              marker: {
                color: years.map(([, v]) => v),
                colorscale: [
                  [0.0, '#1a0a0d'], [0.4, '#4a1525'], [0.7, '#7f2235'], [1.0, '#b32e46'],
                ],
                line: { width: 0 },
              },
              hovertemplate: '<b>%{x}</b><br>%{y}曲<extra></extra>',
            }]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { family: 'Noto Sans JP', color: '#a0a0a0', size: 12 },
              xaxis: { showgrid: false, color: '#606060', tickangle: -45, tickfont: { size: 11 } },
              yaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, color: '#606060' },
              margin: { l: 40, r: 20, t: 24, b: 60 },
              height: 320,
            }}
            config={{ displayModeBar: false, responsive: true, scrollZoom: false }}
            style={{ width: '100%' }}
            useResizeHandler
          />
        </>
      )}

      {artists.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0 8px' }}>
            <h3 style={{ color: '#555', margin: 0 }}>原曲アーティスト分布</h3>
            <button className="btn-secondary" onClick={() => setTreeKey2((k) => k + 1)}>リセット</button>
          </div>
          <Plot
            key={treeKey2}
            data={[{
              type: 'treemap',
              labels: artists.map(([a]) => a),
              parents: artists.map(() => ''),
              values: artists.map(([, v]) => v),
              text: artists.map(([, v]) => `${(v / artistTotal * 100).toFixed(1)}%`),
              texttemplate: '<b>%{label}</b><br>%{value}回<br>%{text}',
              hovertemplate: '<b>%{label}</b><br>%{value}回 (%{text})<extra></extra>',
              marker: { colors: artists.map(([, v]) => v), colorscale: treeColorscale, line: { width: 2, color: '#ffffff' }, pad: { t: 22, l: 4, r: 4, b: 4 } },
            }]}
            layout={{ paper_bgcolor: 'rgba(0,0,0,0)', font: { family: 'Noto Sans JP', color: '#c0c0c0' }, margin: { t: 4, l: 0, r: 0, b: 0 }, height: 420 }}
            config={{ displayModeBar: false, responsive: true, scrollZoom: false }}
            style={{ width: '100%' }}
            useResizeHandler
          />
        </>
      )}
    </div>
  )
}
