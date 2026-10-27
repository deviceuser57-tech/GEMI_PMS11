import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

const PORT = 3000;

// Gemini API initialization on server
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Orchestration Chat Endpoint
app.post('/api/orchestration/chat', async (req, res) => {
  try {
    const {
      prompt,
      agentId,
      agentName,
      targetWps,
      selectedRecordTitle,
      selectedRecordRid,
      project,
      asset,
      gateState,
      chatHistory,
      isArabic,
    } = req.body;

    const ai = getAiClient();

    const activeProject = project || 'PMS-11 Offshore Rig Life Extension & Certification Project';
    const activeAsset = asset || 'PMS-11 Pipe-Lay Derrick Barge (DNV GL Class)';
    const activeGateState = gateState || 'Gate-2: Execution & Construction Integrity (CONDITIONAL)';

    if (!ai) {
      const fallbackReply = isArabic
        ? `[المستشار الافتراضي - ${agentName || 'المحرك الرئيسي'}]\n\n📌 **السياق الحالي المحدد**:\n- المشروع: **${activeProject}**\n- الأصل/المعدة: **${activeAsset}**\n- حالة البوابة: **${activeGateState}**\n- حزمة العمل: **${targetWps}** ${selectedRecordRid ? `(السجل: ${selectedRecordRid})` : ''}\n\n**النتيجة والاستشارة**:\nبناءً على طلبك "${prompt}":\n1. مراجعة نتائج مسح الموجات فوق الصوتية (UT Thickness Survey) للسجل ${selectedRecordRid || 'المعين'}.\n2. التأكد من تطابق الاختبارات مع قواعد DNV ARC المعمول بها.\n3. تطبيق الأسبقية الحتمية: BLOCKED > INCOMPLETE > CONDITIONAL > READY.`
        : `[Virtual Agent - ${agentName || 'Master Orchestrator'}]\n\n📌 **Current Dynamic Context**:\n- Project: **${activeProject}**\n- Asset: **${activeAsset}**\n- Gate State: **${activeGateState}**\n- Work Package: **${targetWps}** ${selectedRecordRid ? `(Record: ${selectedRecordRid})` : ''}\n\n**Audit & Advice**:\nRegarding your query "${prompt}":\n1. Review UT Thickness survey readings for ${selectedRecordRid || 'linked deliverables'}.\n2. Verify compliance with DNV ARC heritage equipment rules.\n3. Deterministic Precedence Enforced: BLOCKED > INCOMPLETE > CONDITIONAL > READY.`;

      return res.json({
        success: true,
        source: 'orchestrator_engine_fallback',
        reply: fallbackReply,
      });
    }

    const systemInstruction = `You are the PMS-11 Offshore Rig Orchestration Chatbot & Virtual Consultant.
Target Project: ${activeProject}
Target Offshore Asset: ${activeAsset}
Current Gate State: ${activeGateState}
Target Work Package: ${targetWps}
${selectedRecordRid ? `Linked Record RID: ${selectedRecordRid} (${selectedRecordTitle || ''})` : ''}
Assigned Consulting Domain Agent: ${agentName || 'Master Orchestrator'}

Guidelines:
1. All advice must strictly adapt to the Current Dynamic Context (Project, Asset, Gate State, WPS).
2. Enforce the Deterministic Gate Precedence Rule: BLOCKED > INCOMPLETE > CONDITIONAL > READY.
3. Reference maritime safety & classification standards (SOLAS, DNV ARC, CAP 437, MARPOL, ISM) when relevant.
4. When mentioning PMS records, use square bracket format like [TASK-102], [GAP-04], [DELIV-12] or [WPS-01] so the UI can render them as clickable navigation links.
5. Answer in ${isArabic ? 'Arabic' : 'English'} in a structured, professional, and clear tone.`;

    const contents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      chatHistory.slice(-6).forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      success: true,
      source: 'gemini_3_8_flash',
      reply: response.text || 'No response generated.',
    });
  } catch (error: any) {
    console.error('Gemini Orchestration Chat Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process orchestration chat query',
    });
  }
});

// Camera OCR Document Scan Endpoint
app.post('/api/ocr/scan-document', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    const ai = getAiClient();

    if (!ai || !imageBase64) {
      // High-fidelity fallback simulated OCR output if Gemini key is absent or offline
      const simulatedScan = {
        document_code: `OCR-INSP-${Math.floor(Math.random() * 9000 + 1000)}`,
        title: 'Offshore Rig PMS-11 Safety & UT Thickness Inspection Sheet',
        category: 'Audit Report',
        department: 'QA/QC',
        mapped_wps_id: 'WPS-01',
        summary_english: 'Scanned physical inspection sheet: Ultrasonic Thickness (UT) survey on 800T Derrick Crane boom arm & weld NDT testing.',
        extracted_text: `OFFSHORE RIG PMS-11 - PHYSICAL FIELD INSPECTION SHEET\nLocation: Deck Zone A / Heavy Lift Crane 800T\nSurvey Type: Ultrasonic Thickness (UT) & NDT Weld Inspection\nReading 1: 24.8mm (Nominal 25.0mm)\nReading 2: 24.5mm (Tolerance Limit 23.0mm)\nStatus: COMPLIANT / VERIFIED\nInspector Sign-off: DNV Senior Surveyor`,
        tags: ['OCR-Scanned', 'Physical-Sheet', 'UT-Survey', 'WPS-01', 'DNV-Verified']
      };

      return res.json({
        success: true,
        source: 'ocr_fallback_simulator',
        data: simulatedScan
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: `Extract information from this physical offshore safety inspection sheet or document photo into JSON format.
Include fields:
- document_code (string like INSP-OFFSHORE-01)
- title (string descriptive title)
- category (one of: Statutory Standard, Class Rule, Barge Manual, Technical Spec, Safety Procedure, Audit Report)
- department (one of: Marine, Technical & Maintenance, HSE & Safety, Pipelay Operations, Aviation & Helideck, QA/QC)
- mapped_wps_id (e.g. WPS-01, WPS-02, WPS-03 ... WPS-24 based on content)
- summary_english (short summary of key findings and readings)
- extracted_text (full extracted text passage including readings, serial numbers, and signoffs)
- tags (array of strings)`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            document_code: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            department: { type: Type.STRING },
            mapped_wps_id: { type: Type.STRING },
            summary_english: { type: Type.STRING },
            extracted_text: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['document_code', 'title', 'mapped_wps_id', 'extracted_text'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');

    return res.json({
      success: true,
      source: 'gemini_3_8_flash_vision',
      data: parsedJson
    });
  } catch (error: any) {
    console.error('OCR Document Scan Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform OCR document scan',
    });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
