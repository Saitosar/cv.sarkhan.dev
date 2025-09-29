// src/components/CreateResumeForm.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema } from "@/lib/validators";
import type { z } from "zod";
import type { TemplateName } from "./TemplateSelector";
import type { FieldErrors } from "react-hook-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { ScoreCircle } from './ScoreCircle';

type ResumeFormData = z.infer<typeof resumeSchema>;

// Тип для ответа от API (без message)
type AssessmentApiResponse = {
  confidenceScore: number;
  recommendations: string[];
};

// Тип для состояния на клиенте (с message)
type AssessmentResult = {
  confidenceScore: number;
  recommendations: string[];
  message: string;
};

interface CreateResumeFormProps {
  onGenerate: (data: any) => void;
  template: TemplateName;
}

const addButtonStyle = "mt-2 flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-white/20 p-3 text-white/50 transition-all hover:border-white/40 hover:text-white/80";
const removeButtonStyle = "absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-red-400";
const inputStyle = "mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet";
const baseLabelStyle = "block text-sm font-medium text-white/80";

const RemoveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

const Label = ({ htmlFor, children, required = true }: { htmlFor: string, children: React.ReactNode, required?: boolean }) => (
    <label htmlFor={htmlFor} className={baseLabelStyle}>
        {children} {required && <span className="text-red-400">*</span>}
    </label>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="font-display text-xl mb-3">{title}</h3>
);

// --- НОВАЯ ФУНКЦИЯ ДЛЯ ВЫБОРА СООБЩЕНИЯ ---
const getMotivationalMessage = (score: number): string => {
  if (score >= 90) {
    return "Great! Your CV is ATS-ready. Now you can apply with confidence 🚀";
  }
  if (score >= 50) {
    return "Good start! A few quick fixes will make your CV shine brighter ✨";
  }
  return "Don’t worry, many CVs start here. Follow the tips — you’ll see fast progress 💪";
};

export function CreateResumeForm({ onGenerate, template }: CreateResumeFormProps) {
  const { register, control, handleSubmit, formState: { errors }, getValues } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      experience: [{ company: "", position: "", years: "", description: "" }],
      projects: [],
      education: [],
      skills: [{ value: "" }],
      languages: [],
      achievements: [],
      trainings: [],
      certifications: [],
      targetJob: { title: "", description: "" },
    },
  });

  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control, name: "experience" });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: "projects" });
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({ control, name: "education" });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: "skills" });
  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({ control, name: "languages" });
  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({ control, name: "achievements" });
  const { fields: trainingFields, append: appendTraining, remove: removeTraining } = useFieldArray({ control, name: "trainings" });
  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({ control, name: "certifications" });

  const onFormSubmit = (data: ResumeFormData) => {
    onGenerate(data);
  };

  const onFormError = (errors: FieldErrors<ResumeFormData>) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const element = document.querySelector(`[name^="${firstErrorKey}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  async function handleAssess() {
    setIsAssessing(true);
    setAssessmentResult(null);
    setAssessmentError(null);
    const values = getValues();
    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assess resume.");
      }
      const data: AssessmentApiResponse = await response.json();
      
      // --- ИЗМЕНЕНИЕ: Генерируем сообщение и добавляем его к результату ---
      const message = getMotivationalMessage(data.confidenceScore);
      setAssessmentResult({ ...data, message });

    } catch (error) {
      console.error("Assessment error:", error);
      setAssessmentError(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsAssessing(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label htmlFor="fullName">Full Name</Label><input {...register("fullName")} id="fullName" className={inputStyle} placeholder="e.g., John Doe"/>{errors.fullName && <p className="mt-1 text-red-400 text-sm">{errors.fullName.message}</p>}</div>
          <div><Label htmlFor="jobTitle">Job Title</Label><input {...register("jobTitle")} id="jobTitle" className={inputStyle} placeholder="e.g., Senior Frontend Developer"/>{errors.jobTitle && <p className="mt-1 text-red-400 text-sm">{errors.jobTitle.message}</p>}</div>
        </div>
        <div className="border-t border-white/20"></div>
        <div>
          <h3 className="font-display text-xl mb-1">Target Vacancy (Optional)</h3>
          <p className="text-sm text-white/60 mb-4">Provide details of the job you're applying for to tailor the resume.</p>
          <div className="space-y-3 border border-white/20 p-4 rounded-md">
            <div><Label htmlFor="targetJob.title" required={false}>Vacancy Title</Label><input {...register("targetJob.title")} id="targetJob.title" className={inputStyle} placeholder="e.g., Senior Product Manager"/></div>
            <div><Label htmlFor="targetJob.description" required={false}>Vacancy Description</Label><textarea {...register("targetJob.description")} id="targetJob.description" rows={4} className={inputStyle} placeholder="Copy and paste the job description here..."/></div>
          </div>
        </div>
        <div className="border-t border-white/20"></div>
        <div><Label htmlFor="summary">Professional Summary</Label><textarea {...register("summary")} id="summary" rows={4} className={inputStyle} placeholder="A highly skilled and motivated developer..."/>{errors.summary && <p className="mt-1 text-red-400 text-sm">{errors.summary.message}</p>}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label htmlFor="contact.email">Email</Label><input {...register("contact.email")} id="contact.email" className={inputStyle} placeholder="john.doe@email.com"/>{errors.contact?.email && <p className="mt-1 text-red-400 text-sm">{errors.contact.email.message}</p>}</div>
          <div><Label htmlFor="contact.phone">Phone</Label><input {...register("contact.phone")} id="contact.phone" className={inputStyle} placeholder="+1 (555) 123-4567"/>{errors.contact?.phone && <p className="mt-1 text-red-400 text-sm">{errors.contact.phone.message}</p>}</div>
          <div className="md:col-span-2"><Label htmlFor="contact.linkedin" required={false}>LinkedIn URL (Optional)</Label><input {...register("contact.linkedin")} id="contact.linkedin" className={inputStyle} placeholder="https://linkedin.com/in/johndoe"/>{errors.contact?.linkedin && <p className="mt-1 text-red-400 text-sm">{errors.contact.linkedin.message}</p>}</div>
        </div>
        <div>
          <SectionHeader title="Work Experience" />
          {experienceFields.map((field, index) => (<div key={field.id} className="space-y-3 border border-white/20 p-4 rounded-md mb-4 relative"><input {...register(`experience.${index}.position`)} placeholder="Position *" className={inputStyle} /><input {...register(`experience.${index}.company`)} placeholder="Company *" className={inputStyle} /><input {...register(`experience.${index}.years`)} placeholder="Years *" className={inputStyle} /><textarea {...register(`experience.${index}.description`)} placeholder="Description..." rows={3} className={inputStyle} /><button type="button" onClick={() => removeExperience(index)} className={removeButtonStyle}><RemoveIcon /></button></div>))}
          <button type="button" onClick={() => appendExperience({ company: "", position: "", years: "", description: "" })} className={addButtonStyle}><AddIcon /></button>
        </div>
        <div>
          <SectionHeader title="Projects" />
          {projectFields.map((field, index) => (<div key={field.id} className="space-y-3 border border-white/20 p-4 rounded-md mb-4 relative"><input {...register(`projects.${index}.name`)} placeholder="Project Name *" className={inputStyle} /><input {...register(`projects.${index}.technologies`)} placeholder="Technologies" className={inputStyle} /><textarea {...register(`projects.${index}.description`)} placeholder="Description..." rows={3} className={inputStyle} /><button type="button" onClick={() => removeProject(index)} className={removeButtonStyle}><RemoveIcon /></button></div>))}
          <button type="button" onClick={() => appendProject({ name: "", description: "", technologies: "" })} className={addButtonStyle}><AddIcon /></button>
        </div>
        <div>
          <SectionHeader title="Education" />
          {educationFields.map((field, index) => (<div key={field.id} className="space-y-3 border border-white/20 p-4 rounded-md mb-4 relative"><input {...register(`education.${index}.institution`)} placeholder="Institution *" className={inputStyle} /><input {...register(`education.${index}.degree`)} placeholder="Degree *" className={inputStyle} /><input {...register(`education.${index}.years`)} placeholder="Years" className={inputStyle} /><button type="button" onClick={() => removeEducation(index)} className={removeButtonStyle}><RemoveIcon /></button></div>))}
          <button type="button" onClick={() => appendEducation({ institution: "", degree: "", years: "" })} className={addButtonStyle}><AddIcon /></button>
        </div>
        <div>
          <SectionHeader title="Skills" />
          {skillFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 mb-2 relative"><input {...register(`skills.${index}.value`)} placeholder="e.g., TypeScript *" className={`${inputStyle} w-full`} /><button type="button" onClick={() => removeSkill(index)} className={removeButtonStyle}><RemoveIcon /></button></div>))}
          <button type="button" onClick={() => appendSkill({ value: "" })} className={addButtonStyle}><AddIcon /></button>
        </div>
        <div>
          <SectionHeader title="Achievements" />
          {achievementFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 mb-2 relative"><input {...register(`achievements.${index}.value`)} placeholder="e.g., Won an award..." className={`${inputStyle} w-full`} /><button type="button" onClick={() => removeAchievement(index)} className={removeButtonStyle}><RemoveIcon /></button></div>))}
          <button type="button" onClick={() => appendAchievement({ value: "" })} className={addButtonStyle}><AddIcon /></button>
        </div>
        <div>
          <SectionHeader title="Certifications" />
          {certificationFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 mb-2 relative"><input {...register(`certifications.${index}.value`)} placeholder="e.g., Certified Scrum Master" className={`${inputStyle} w-full`} /><button type="button" onClick={() => removeCertification(index)} className={removeButtonStyle}><RemoveIcon /></button></div>))}
          <button type="button" onClick={() => appendCertification({ value: "" })} className={addButtonStyle}><AddIcon /></button>
        </div>
        <div>
          <SectionHeader title="Trainings" />
          {trainingFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 mb-2 relative"><input {...register(`trainings.${index}.value`)} placeholder="e.g., Agile & Scrum Workshop" className={`${inputStyle} w-full`} /><button type="button" onClick={() => removeTraining(index)} className={removeButtonStyle}><RemoveIcon /></button></div>))}
          <button type="button" onClick={() => appendTraining({ value: "" })} className={addButtonStyle}><AddIcon /></button>
        </div>
        <div>
          <SectionHeader title="Languages" />
          {languageFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 mb-2 relative"><input {...register(`languages.${index}.language`)} placeholder="Language *" className={`${inputStyle} flex-grow`} /><input {...register(`languages.${index}.proficiency`)} placeholder="Proficiency *" className={`${inputStyle} flex-grow`} /><button type="button" onClick={() => removeLanguage(index)} className={removeButtonStyle}><RemoveIcon /></button></div>))}
          <button type="button" onClick={() => appendLanguage({ language: "", proficiency: "" })} className={addButtonStyle}><AddIcon /></button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 !mt-10">
          <button type="submit" className="card-button w-full">Generate Resume</button>
          <button type="button" onClick={handleAssess} disabled={isAssessing} className="card-button w-full">
            {isAssessing ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Assess Resume'}
          </button>
        </div>
      </form>
      
      {isAssessing && <p className="mt-4 text-center text-white/70">Assessing your resume, please wait...</p>}
      
      {assessmentError && (
        <div className="mt-4 p-4 border border-red-500 bg-red-50/10 rounded-lg">
          <h3 className="text-lg font-semibold text-red-500">Assessment Error</h3>
          <p className="text-red-400">{assessmentError}</p>
        </div>
      )}

      {assessmentResult && (
        <div className="mt-6 p-6 border border-white/20 rounded-lg shadow-lg bg-black/20">
            <h2 className="text-2xl font-bold text-center mb-4 text-white">Resume Assessment</h2>

            <div className="mb-6 p-4 rounded-md bg-white/5 text-center">
              <p className="text-lg font-semibold text-white">{assessmentResult.message}</p>
            </div>
            
            <div className="flex flex-col items-center gap-y-8">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-xl font-semibold text-white/90 mb-4">Confidence Score</h3>
                <ScoreCircle score={assessmentResult.confidenceScore} />
              </div>
              
              <div className="w-full">
                <h3 className="text-xl font-semibold text-white/90 text-center mb-4">Recommendations for Improvement</h3>
                <div className="space-y-4">
                  {assessmentResult.recommendations.map((rec, index) => (
                      <div key={index} className="prose prose-invert max-w-none text-white/80 p-4 border border-white/10 rounded-lg bg-white/5 prose-p:my-2 prose-strong:text-neonCyan">
                        <ReactMarkdown>{rec}</ReactMarkdown>
                      </div>
                  ))}
                </div>
              </div>
            </div>
        </div>
      )}
    </>
  );
}