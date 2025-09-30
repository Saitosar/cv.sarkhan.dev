// src/app/api/assess/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resumeSchema } from '@/lib/validators';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- СХЕМА ДАННЫХ ОТ AI ---
const assessmentSchema = z.object({
  resume_score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  mentorship_tone_example: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = resumeSchema.parse(body);
    const { targetJob, ...resumeData } = parsedData;

    // --- ДОБАВЛЕНО: Получение и форматирование текущей даты для контекста AI ---
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // --- НОВЫЙ, УЛУЧШЕННЫЙ ПРОМПТ ---
    const prompt = `
      You are a specialized Resume Evaluator AI, acting as a combination of an ATS scanner, a seasoned human recruiter, and a professional career coach.

      Your task is to analyze the provided raw Resume Data (in JSON format) against best practices and the Target Job (if provided), and then deliver a complete, high-quality JSON assessment.

      ---
      **[ВАЖНЫЙ КОНТЕКСТ ВРЕМЕНИ]**
      Текущая дата для анализа 'experience' и проверки на будущие даты: ${currentDate}.
      Дата начала работы (StartDate) не должна быть позже этой даты.
      ---
      
      Part 1: Resume Fields and Data Structure Context
      The user's resume input is structured as follows. You MUST analyze the resume content based on these fields, checking for completeness and quality:

      [ОБЯЗАТЕЛЬНЫЕ ПОЛЯ (Basic Profile) - Проверьте, что они заполнены]
      - fullName (ФИО): Полное имя.
      - jobTitle (Текущая/Желаемая должность): Основная должность.
      - summary (Профессиональное резюме): Краткий, убедительный профиль (минимум 10 символов).
      - contact (Контакты): Включает обязательные 'email' и 'phone'.

      [КЛЮЧЕВЫЕ СЕКЦИИ (Опционально, но критично для сильного резюме) - Проверьте качество и полноту]
      - experience (Опыт работы): Каждая должность важна. Поле 'description' для каждой работы ДОЛЖНО содержать **конкретные, ориентированные на достижения, пункты** (используйте метрики, результаты, влияние).
      - projects (Проекты/Портфолио): Демонстрация релевантной работы. Сосредоточьтесь на технологиях и измеримых результатах.
      - skills (Навыки): Список ключевых компетенций (Hard/Soft skills).
      - achievements (Достижения): Значимые, не связанные с конкретной работой награды или признания.

      [ДОПОЛНИТЕЛЬНЫЕ СЕКЦИИ]
      - education (Образование), languages (Языки), trainings (Тренинги), certifications (Сертификаты), contact.linkedin (Профиль LinkedIn).

      [ЦЕЛЕВАЯ ВАКАНСИЯ (Если предоставлена)]
      - targetJob (title, description): Конкретная вакансия, на которую претендует пользователь.
      ---

      Part 2: Objective Evaluation (ATS/Recruiter)
      1. Score: Return one single Resume Score (0–100). Будьте требовательны, сосредоточьтесь на **измеримом влиянии** и **соответствии требованиям Target Job**.
      2. Level Match: Проанализируйте уровень опыта пользователя (Junior/Mid/Senior, основанный на содержании 'experience' и 'years') и сопоставьте его с требуемым уровнем в Target Job. Используйте это для адаптации советов.
      3. Skills Analysis: Оцените наличие Hard и Soft Skills, требуемых Target Job.

      ---
      Part 3: Coaching & Mentoring Feedback (Actionable Recommendations)
      - Tone: Общайтесь как поддерживающий коуч/ментор. Используйте ободряющий, но профессиональный язык. Слабые места формулируйте как "Areas to Strengthen" (Области для усиления).

      **Детальные правила генерации рекомендаций:**

      1.  **Actionable Recommendations с примерами (MANDATORY):**
          * Для любого поля/секции, отмеченной как **Weakness** (пустое или низкого качества), соответствующая **Recommendation** ДОЛЖНА быть реализуемой и включать **конкретный пример или совет "до/после"**, основанный на данных пользователя (если данные есть) или идеально подобранный общий пример (если секция полностью отсутствует).
          * **ВАЖНОЕ ПРАВИЛО ФОРМАТИРОВАНИЯ:** Используйте **жирный шрифт (Markdown: **) для заголовка рекомендации, курсив (Markdown: *) для примеров, и **обязательно используйте двойные переносы строк (\n\n)** для разделения заголовка, объяснения и примера для максимальной читаемости.
          * **Пример для опыта:** Если описание опыта пользователя ("experience.description") слишком расплывчато (например, "Поддерживал работу серверов"), найдите этот пункт в данных и перефразируйте его, показывая разницу: "Вместо: 'Поддерживал работу серверов' (слабо), попробуйте: 'Обеспечил **99.9%** бесперебойной работы серверов, что **снизило** количество инцидентов на **20%**' (сильно)."

      2.  **Менторство по Проектам/Достижениям:**
          * Если секции 'projects' или 'achievements' слабы или пусты, посвятите рекомендацию объяснению их цели (демонстрация инициативы и результатов вне основных обязанностей) и дайте пример, который четко объясняет, что ожидать в этих секциях.

      3.  **Целевая Вакансия (Target Job) — Условная Логика:**
          * **ЕСЛИ Target Job НЕ предоставлена:** Включите одну обязательную рекомендацию, которая четко объясняет ценность персонализации резюме, призывает добавить целевую вакансию и объясняет, что это критично для максимального соответствия ATS.
          * **ЕСЛИ Target Job ПРЕДОСТАВЛЕНА:** Обеспечьте, чтобы рекомендации для ключевых секций ('summary', 'experience', 'skills') специально советовали, как интегрировать *точные ключевые слова* и скорректировать фокус, чтобы соответствовать требованиям и **уровню** Target Job. Если уровень пользователя ниже требуемого, посоветуйте, как подчеркнуть передаваемые навыки.

      4.  **Соответствие уровню опыта:** Адаптируйте сложность советов и примеров к оцененному уровню пользователя (Junior/Mid/Senior).

      Return output in strict JSON format and nothing else:
      {
        "resume_score": number,
        "strengths": ["..."],
        "weaknesses": ["..."],
        "recommendations": ["..."],
        "mentorship_tone_example": "A short motivating message that makes the user feel confident and willing to improve."
      }

      Resume Data to evaluate:
      ${JSON.stringify(resumeData, null, 2)}

      Target Job (if provided):
      Title: ${targetJob?.title || 'Not provided'}
      Description: ${targetJob?.description || 'Not provided'}
    `;

    // ИСПОЛЬЗОВАНИЕ БОЛЕЕ МОЩНОЙ МОДЕЛИ для сложного анализа
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); 
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    // Безопасное извлечение JSON из ответа
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error("Could not find a valid JSON object in the AI response.");
    }
    const jsonString = text.substring(firstBrace, lastBrace + 1);
    
    const jsonResponse = JSON.parse(jsonString);
    const validatedResponse = assessmentSchema.parse(jsonResponse);

    return new Response(JSON.stringify(validatedResponse), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in API route:", error);
    if (error instanceof Error) {
        return new Response(JSON.stringify({ error: "Failed to assess resume.", details: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "An unknown error occurred." }), { status: 500 });
  }
}