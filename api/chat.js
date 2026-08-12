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
    const { history } = req.body || {};
    if (!Array.isArray(history) || history.length === 0) {
      res.status(400).json({ error: '缺少對話紀錄' });
      return;
    }

    const messages = [
      {
        role: 'system',
        content:
          '你是一名 Minecraft 基岩版建造/機器規劃者，請直接以純文字自然回覆使用者的追問，不需要套用固定 JSON 格式。',
      },
      ...history,
    ];

    const response = await fetch('https://free.v36.cm/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: 'gpt-5.6-luna', messages }),
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
