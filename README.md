# MineBuild 部署說明

## 1. 推送到 GitHub
```bash
cd minebuild
git init
git remote add origin https://github.com/illusd/br-mine-build.git
git add .
git commit -m "Initial MineBuild site"
git branch -M main
git push -u origin main
```

## 2. 在 Vercel 匯入專案
1. 到 https://vercel.com/new
2. 選擇剛剛的 GitHub repo `illusd/br-mine-build`
3. Framework Preset 選 **Other**（不需要 build command，`public/` 為靜態資料夾，`api/` 會自動變成 Serverless Functions）
4. 部署前先加環境變數（見下）

## 3. 設定環境變數
在 Vercel 專案 → **Settings → Environment Variables** 新增：

| Key | Value |
|---|---|
| `V36_API_KEY` | 你在 free.v36.cm 領取的 API Key |

新增後記得重新部署（Redeploy）一次讓變數生效。

## 4. 檔案結構
```
minebuild/
├── public/
│   └── index.html      # 首頁 + BuildNow 表單 + 結果顯示 + Star 彈窗
├── api/
│   ├── analyze.js       # 呼叫 free.v36.cm，依分析模式套用對應 prompt
│   └── chat.js          # 分析完成後的自由追問
└── package.json
```

## 5. 之後如果要改
- 首頁文字、範例卡片、Logo 都在 `public/index.html`
- Prompt 格式與分析模式對應在 `api/analyze.js` 的 `modeInstructionMap`
- 想加真正的方塊圖片，可以在 `blockChip()` 那段補上 wiki 圖片網址
