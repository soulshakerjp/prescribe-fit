# PRESCRIBE FIT

OpenAI API 対応の Next.js 14 + TypeScript + Tailwind CSS アプリです。Vercel にそのままデプロイできます。

## できること

- トレーニングカルテ入力
- 日付編集可能なデイリーログ
- 食事ごとの推定 PFC 表示
- 履歴一覧 → 詳細編集
- 食事 / 筋トレ / AIメニューの履歴リセット
- OpenAI によるカルテ総評と日次アドバイス
- PWA 用 manifest / アイコン対応

## ローカル起動

```bash
npm install
npm run dev
```

## 環境変数

Vercel または `.env.local` に以下を設定してください。

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

`OPENAI_MODEL` は省略可能です。未設定時は `gpt-4.1-mini` を使います。

## ビルド確認

```bash
npm run build
npm run start
```

## Vercel へのデプロイ

1. GitHub に push
2. Vercel で `Import Project`
3. Environment Variables に `OPENAI_API_KEY` を登録
4. Deploy

## 主な画面

- `/` ホーム
- `/onboarding` トレーニングカルテ
- `/log` デイリーログ
- `/prescription` AIメニュー詳細
- `/report` 進捗レポート

## 補足

- OpenAI API キーが未設定でも、ローカルのルールベース提案で最低限動作します。
- データ保存は `localStorage` です。一般公開向けには次フェーズで Supabase 連携を推奨します。
