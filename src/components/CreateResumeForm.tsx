// src/components/CreateResumeForm.tsx
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema } from "@/lib/validators";
import type { z } from "zod";
import type { TemplateName } from "./TemplateSelector";

type ResumeFormData = z.infer<typeof resumeSchema>;

interface CreateResumeFormProps {
  onGenerate: (data: any) => void;
  template: TemplateName;
}

// Стили для инпутов и кнопок, чтобы не повторяться
const inputStyle = "mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet";
const labelStyle = "block text-sm font-medium text-white/80";
const buttonStyle = "px-3 py-1 text-sm bg-neonViolet text-white rounded-md hover:bg-opacity-80 transition-all";
const removeButtonStyle = "px-3 py-1 text-sm bg-red-500/50 text-white rounded-md hover:bg-red-500/80 transition-all";


export function CreateResumeForm({ onGenerate, template }: CreateResumeFormProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    // Устанавливаем значения по умолчанию, чтобы useFieldArray работал
    defaultValues: {
      experience: [{ company: "", position: "", years: "", description: "" }],
      projects: [{ name: "", description: "", technologies: "" }],
      skills: [{ value: "React" }],
      // Добавь другие defaultValues по аналогии, если нужно
    },
  });

  // --- Используем useFieldArray для каждой динамической секции ---
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "experience",
  });
  
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: "projects",
  });
  
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: "skills",
  });


  const onSubmit = async (data: ResumeFormData) => {
    // Преобразуем данные в формат, который ожидает наш API
    const formattedData = {
      ...data,
      skills: data.skills?.map(s => s.value),
      achievements: data.achievements?.map(a => a.value),
      trainings: data.trainings?.map(t => t.value),
      certifications: data.certifications?.map(c => c.value),
    };

    console.log("Submitting data:", formattedData);

    try {
      // Здесь мы можем использовать fetch для отправки данных на API
      // const response = await fetch(...)
      // onGenerate(await response.json())

      // Пока что просто выведем в превью то, что заполнили
      onGenerate({ result: JSON.stringify(formattedData) });

    } catch (error) {
      console.error('Failed to generate resume:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* --- Summary & Contact --- */}
      <div>
        <label htmlFor="summary" className={labelStyle}>Summary</label>
        <textarea {...register("summary")} id="summary" rows={4} className={inputStyle} placeholder="John Doe: Senior Frontend Developer..."/>
        {errors.summary && <p className="mt-1 text-red-400 text-sm">{errors.summary.message}</p>}
      </div>
      <div>
        <label htmlFor="contact.email" className={labelStyle}>Email</label>
        <input {...register("contact.email")} id="contact.email" className={inputStyle} placeholder="john.doe@email.com"/>
        {errors.contact?.email && <p className="mt-1 text-red-400 text-sm">{errors.contact.email.message}</p>}
      </div>
      
      {/* --- Work Experience (Динамическая секция) --- */}
      <div>
        <h3 className="font-display text-xl mb-2">Work Experience</h3>
        {experienceFields.map((field, index) => (
          <div key={field.id} className="space-y-2 border border-white/20 p-4 rounded-md mb-4">
            <input {...register(`experience.${index}.position`)} placeholder="Position" className={inputStyle} />
            <input {...register(`experience.${index}.company`)} placeholder="Company" className={inputStyle} />
            <input {...register(`experience.${index}.years`)} placeholder="Years (e.g., 2020 - Present)" className={inputStyle} />
            <textarea {...register(`experience.${index}.description`)} placeholder="Description..." rows={3} className={inputStyle} />
            <button type="button" onClick={() => removeExperience(index)} className={removeButtonStyle}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => appendExperience({ company: "", position: "", years: "", description: "" })} className={buttonStyle}>
          Add Experience
        </button>
      </div>
      
      {/* --- Projects (Динамическая секция) --- */}
      <div>
        <h3 className="font-display text-xl mb-2">Projects</h3>
        {projectFields.map((field, index) => (
          <div key={field.id} className="space-y-2 border border-white/20 p-4 rounded-md mb-4">
            <input {...register(`projects.${index}.name`)} placeholder="Project Name" className={inputStyle} />
            <input {...register(`projects.${index}.technologies`)} placeholder="Technologies (e.g., React, Next.js)" className={inputStyle} />
            <textarea {...register(`projects.${index}.description`)} placeholder="Description..." rows={3} className={inputStyle} />
            <button type="button" onClick={() => removeProject(index)} className={removeButtonStyle}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => appendProject({ name: "", description: "", technologies: "" })} className={buttonStyle}>
          Add Project
        </button>
      </div>
      
      {/* --- Skills (Простая динамическая секция) --- */}
      <div>
        <h3 className="font-display text-xl mb-2">Skills</h3>
        {skillFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
                <input {...register(`skills.${index}.value`)} placeholder="e.g., TypeScript" className={inputStyle} />
                <button type="button" onClick={() => removeSkill(index)} className={removeButtonStyle}>Remove</button>
            </div>
        ))}
        <button type="button" onClick={() => appendSkill({ value: "" })} className={buttonStyle}>
          Add Skill
        </button>
      </div>

      {/* ЗДЕСЬ ТЫ МОЖЕШЬ ДОБАВИТЬ ОСТАЛЬНЫЕ СЕКЦИИ
        (Education, Languages, Achievements, Trainings, Certifications)
        ПО ТОЧНО ТАКОМУ ЖЕ ПРИНЦИПУ, КАК "Projects" И "Skills"
      */}

      <button type="submit" className="card-button w-full !mt-8">
        Generate Resume
      </button>
    </form>
  );
}