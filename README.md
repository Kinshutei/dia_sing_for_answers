# 【非公式】DiαDB

RK Music所属VSinger **Diα** さんの配信情報・楽曲データをまとめたファンメイドDBサイトです。

GitHub Pages でホストされています。

## 構成

```
dia_sing_for_answers/
├── .github/
│   └── workflows/
│       └── pages.yml                  # 自動ビルド・デプロイ
├── web/                               # React + Vite フロントエンド
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                    # ルートコンポーネント・タブ管理
│       ├── App.css                    # グローバルスタイル
│       ├── types.ts                   # 型定義
│       ├── components/
│       │   ├── StreamsTab.tsx         # LiveStreaming INFO タブ
│       │   ├── SongsTab.tsx           # Sung Repertoire タブ
│       │   ├── ChangelogTab.tsx       # 更新履歴タブ
│       │   ├── AboutTab.tsx           # About タブ
│       │   ├── Footer.tsx
│       │   └── TerminalMessage.tsx
│       └── utils/
│           └── csv.ts                 # CSV パース・集計ユーティリティ
├── rkmusic_song_master.csv/json       # 楽曲マスターデータ
├── streaminginfo_Dia.csv/json         # 配信・歌唱記録
├── alias_map.csv                      # エイリアスマップ（予備）
└── README.md
```

## タブ構成

| タブ | 内容 |
|------|------|
| LiveStreaming INFO | 枠ごとのセットリスト表示・楽曲検索 |
| Sung Repertoire | 楽曲統計・歌唱回数ランキング・グラフ |
| 更新履歴 | データ更新ログ |
| About | サイト概要・使い方 |

## 主な機能

- 枠一覧をアコーディオン形式で表示（展開/折りたたみ）
- 楽曲名・原曲アーティスト名でのリアルタイム検索
- 初歌唱バッジ表示
- 楽曲統計グラフ（Plotly.js）：歌唱回数上位・リリース年分布・原曲アーティスト分布
- スマホ対応：768px以下でセットリストをカード表示に切り替え

## データ更新

CSVを編集して `main` ブランチに push すると、GitHub Actions が自動ビルド・デプロイします。

### streaminginfo_Dia.csv カラム

| カラム | 説明 |
|--------|------|
| 枠名 | 配信タイトル |
| song_id | 楽曲マスターとの紐付けキー |
| 歌唱順 | 枠内での順番 |
| 配信日 | YYYY-MM-DD 形式 |
| 枠URL | YouTube URL（タイムスタンプ付き可） |
| 曲終了時間 | 秒数（小数点変換に注意） |
| コラボ相手様 | コラボなしの場合は「なし」 |
| キー | 歌唱キー |

### rkmusic_song_master.csv カラム

| カラム | 説明 |
|--------|------|
| song_id | 楽曲ID |
| 楽曲名 | 曲名 |
| 原曲アーティスト | 原曲歌手・グループ名 |
| 作詞1 / 作詞2 | 作詞者 |
| 作曲1 / 作曲2 | 作曲者 |
| 編曲1 / 編曲2 | 編曲者 |
| リリース日 | 例: 2023年4月20日 |

## ローカル開発

```bash
cd web
npm install
npm run dev
```

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | React 18 + TypeScript |
| ビルド | Vite |
| グラフ | Plotly.js |
| CSVパース | PapaParse |
| デプロイ | GitHub Pages（GitHub Actions） |
