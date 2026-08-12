export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.V36_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: '伺服器尚未設定 API Key（V36_API_KEY），請至 Vercel 專案設定環境變數。' });
    return;
  }

  try {
    const { goal, buildMode, seed, analysisMode, history } = req.body || {};

    if (!goal || !buildMode || !analysisMode) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }

    const modeInstructionMap = {
      SuperMini: '請將您分析結果將機器/建築優化到極致，用最少材料',
      QuickBuild: '請你快速分析',
      LimiCons: '請你分析到極致，運用到更多材料來更新到極致',
    };

    const instruction = modeInstructionMap[analysisMode] || '請你快速分析';

    const systemPrompt = `你是一名 Minecraft 基岩版建造/機器規劃者。請務必以下列 JSON 格式回覆（不要加上任何 markdown 或多餘文字），欄位如下：
{
  "summary": "簡短說明這個建築/機器的用途與原理",
  "materials": [ { "name": "方塊/物品中文名稱", "id": "基岩版數據值ID，例如 minecraft:stone", "count": "數量或約略數量" } ],
  "steps": [ { "title": "步驟標題", "detail": "詳細說明", "blocks": ["用到的方塊中文名稱1", "用到的方塊中文名稱2"] } ]
}
方塊名稱與 ID 請盡量對應基岩版數據值，可參考 https://zh.minecraft.wiki/w/基岩版數據值/方塊ID `;

    const userPrompt = `用途：${goal}
模式：${buildMode}
種子碼：${seed || '（未提供）'}

${instruction}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    if (Array.isArray(history)) {
      for (const h of history) {
        if (h && h.role && h.content) messages.push({ role: h.role, content: h.content });
      }
    }

    const response = await fetch('https://free.v36.cm/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: `AI 服務錯誤: ${text}` });
      return;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message || '未知錯誤' });
  }
}
