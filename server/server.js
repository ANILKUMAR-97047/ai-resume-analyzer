import { createRequire } from "module"
import pdfParse from "pdf-parse-fork"  

import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import axios from "axios"
import multer from "multer"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Configure multer for PDF memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const getLLMResponse = async (resumeText) => {
  const prompt = `
You are an expert HR recruiter.

Analyze this resume and provide:

1. Resume score out of 10
2. Strengths
3. Weaknesses
4. Missing skills
5. Suggestions to improve

Resume:
${resumeText}
`

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )

  return response.data.choices[0].message.content;
};

// Original text-based endpoint
app.post("/analyze", async (req, res) => {
  try {
    const { resumeText } = req.body

    if (!resumeText) {
      return res.status(400).json({ error: "Missing resume text" });
    }

    const result = await getLLMResponse(resumeText);
    res.json({ result })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "AI analysis failed"
    })
  }
})

// PDF-based endpoint
app.post("/analyze-pdf", upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Parse PDF buffer to text
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from the PDF" });
    }

    // Pass the extracted text to the AI model
    const result = await getLLMResponse(extractedText);
    res.json({ result })

  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({
      error: error.message || "Failed to process PDF"
    })
  }
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})