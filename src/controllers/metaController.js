import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const fetchMeta = async (req, res) => {
  const { url } = req.body;
  console.log('正在處理URL:', url);
  
  try {
    // 1. 取得 HTML 內容，加入 User-Agent
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10秒超時
    });
    
    const $ = cheerio.load(html);

    // 2. 更全面的標題抓取
    const title = $('title').text().trim() || 
                 $('meta[property="og:title"]').attr('content') || 
                 $('h1').first().text().trim();

    // 3. 更全面的描述抓取
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="Description"]').attr('content') ||
                       '';

    // 4. 更好的內容抓取
    // 移除 script、style、nav 等不相關標籤
    $('script, style, nav, header, footer, aside').remove();
    
    // 優先抓取主要內容區域
    let bodyText = $('body').text().replace(/\s+/g, ' ').trim();

    // 清理文字
    bodyText = bodyText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000); // 減少到2000字符

    console.log('抓取結果:');
    console.log('- 標題:', title);
    console.log('- 描述:', description);
    console.log('- 內容長度:', bodyText.length);
    console.log('-內容：', bodyText);

    // 5. 呼叫 Gemini 模型 (使用更新的模型名稱)
    let aiSummary = '';
    
    if (bodyText.length > 50) { // 只有在有足夠內容時才呼叫 AI
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(
          `請閱讀以下網頁內容並用一句話簡潔摘要它的用途或功能（用繁體中文，不超過50字）：\n\n標題: ${title}\n描述: ${description}\n內容: ${bodyText}`
        );

        aiSummary = result.response.text().trim();
      } catch (aiError) {
        console.error('AI 摘要失敗:', aiError.message);
        aiSummary = '無法生成摘要';
      }
    } else {
      aiSummary = '內容不足，無法生成摘要';
    }

    // 6. 回傳結果
    res.json({ 
      title, 
      description: description || '無描述', 
      summary: aiSummary || '無法生成摘要',
      contentLength: bodyText.length,
      hasContent: bodyText.length > 50
    });

  } catch (err) {
    console.error('抓取或 Gemini 失敗:', err.message);
    res.status(500).json({ error: '無法取得頁面資訊' });
  }
};
