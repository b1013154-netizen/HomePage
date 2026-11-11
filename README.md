# HOSHIZORA

星座を季節や名前から探せる、日本語のサンプルサイトです。HTML・CSS・JavaScriptのみで動作します。

## 機能

- 春夏秋冬の代表的な12星座を収録
- 季節フィルター、日本語・英語名の検索、詳細ダイアログ
- 星座の模式図、見つけ方、神話の紹介
- スマートフォン対応、キーボード操作、動きを抑える設定への対応

実際の星の位置を計算する星図ではありません。季節と見頃は日本の中緯度での宵の観察の目安です。

## Cloudflare Workers（現在の連携設定）

- ビルドコマンド：なし
- デプロイコマンド：`npx wrangler deploy`
- ルートディレクトリ：`/`
- `wrangler.jsonc` により `public/` 内だけを公開します。

## Cloudflare Pages を使う場合

- リポジトリ：`b1013154-netizen/HomePage`
- フレームワーク：なし
- ビルドコマンド：空欄
- 出力ディレクトリ：`public`
- `public/` 内の `index.html` と `style.css`、`app.js`、`assets/` を公開します。

## ローカルで表示

このフォルダーで `python -m http.server 4173 --bind 127.0.0.1 --directory public` を実行し、`http://127.0.0.1:4173` を開きます。

## 素材・参考

- 写真：Unsplash (`photo-1475274047050-1d0c0975c63e`)
- 書体：Google Fonts Noto Sans JP / Noto Serif JP（読み込み失敗時は端末の書体を使用）
- 星座線：オリジナルの学習用模式図
- 観察情報の参照先：https://www.nao.ac.jp/astro/sky/

写真は説明用背景です。上に重ねた星座線との位置関係は実際の空を表しません。
