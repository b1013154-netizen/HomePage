# ホームページの遊び場

トップページ `/` から、HOSHIZORA星座図鑑 `/hoshizora` と全天プラネタリウム `/planetarium` を開けます。全ページに共通のドロワーメニューを配置。旧トップページの `#explore`・`#guide`・`#about` リンクはHOSHIZORAへ引き継ぎます。ページを増やすときは `public/playground-nav.js` の pages とトップページのカードを追加してください。

# HOSHIZORA

## 全天プラネタリウム

`public/planetarium.html` に追加。左ボタンをホールドしてドラッグ、ホイールでズーム。タッチのスワイプとピンチ、方向キー・＋／−・Homeにも対応します。

- XHIP由来の実在恒星118,216個（d3-celestial stars.14.json）を軽量な配列形式に変換して同梱。最大13.78等。全天のすべての恒星を網羅したカタログではありません。
- WebGLのポイント描画。WebGLが使えない端末ではCanvas 2Dへフォールバック。
- 等級の上限4〜14、星座線・星座名・明るい星名・天球グリッドの切り替え、全88星座への視点移動、星のクリックによるHIP番号・等級・名前の表示。
- 星の座標はJ2000、色はB−Vの補間近似、点の半径と光のにじみは視認性のための表現。観察地・時刻・地平線・惑星・固有運動の計算は行いません。
- 星の元データ：https://github.com/ofrohn/d3-celestial/blob/master/data/stars.14.json
- 星名：https://github.com/ofrohn/d3-celestial/blob/master/data/starnames.json
- 元星表：XHIP, Anderson & Francis (2012), VizieR V/137D。加工元ライセンスは `public/assets/d3-celestial-LICENSE.txt` に同梱。

星座を季節や名前から探せる、日本語のサンプルサイトです。HTML・CSS・JavaScriptのみで動作します。

## 機能

- 国立天文台の公式一覧に照合した全88星座を収録（へび座の頭部・尾部は1星座）
- 季節と北天・南天などのエリアでの絞り込み、名前順・学名順・面積順
- 日本語名・学名・略符・漢字での検索、ひらがな・カタカナの表記ゆれ対応
- 星の座標から投影した配置図、正式略符・学名の属格・面積・20時の位置の目安
- 元の12星座の観察ガイド・神話も継続掲載
- スマートフォン対応、キーボード操作、動きを抑える設定への対応

実際の観察日時の星の位置を計算する星図ではありません。季節区分は国立天文台の東京20時の位置の目安から春4〜6月・夏7〜9月・秋10〜12月・冬1〜3月に分類しています。北天・天の赤道付近・南天は配置図の中心赤緯が30度以上・±30度未満・マイナス30度以下による分類です。南天の星座には日本から一部・全体が見えないものもあります。

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
- 正式な日本語名・学名・属格・略符・面積・位置の目安：https://www.nao.ac.jp/new-info/constellation.html （2026-11-12確認）
- 星座線の座標：d3-celestial https://github.com/ofrohn/d3-celestial/blob/master/data/constellations.lines.json （BSD-3-Clause、Copyright (c) 2015 Olaf Frohn）
- ライセンス全文：`public/assets/d3-celestial-LICENSE.txt`
- 配置図は星座ごとの中心付近へのステレオ投影を個別に拡大したものです。へび座は2領域の線を統合しています。星の明るさは表現していません。
- 観察情報の参照先：https://www.nao.ac.jp/astro/sky/

メイン写真は説明用背景です。上に重ねたカシオペヤ座の装飾と写真中の星の位置関係は実際の空を表しません。
