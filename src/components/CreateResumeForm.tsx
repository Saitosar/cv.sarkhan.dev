// src/components/CreateResumeForm.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema } from "@/lib/validators";
import type { z } from "zod";
import type { TemplateName } from "./TemplateSelector";

type ResumeFormData = z.infer<typeof resumeSchema>;

interface CreateResumeFormProps {
  onGenerate: (data: any) => void;
  template: TemplateName;
}

// --- ШАГ 2: ИЗМЕНЕНИЕ СТИЛЕЙ КНОПОК ---
// Старые стили закомментированы, новые - ниже.
// const buttonStyle = "px-3 py-1 text-sm bg-neonViolet text-white rounded-md hover:bg-opacity-80 transition-all";
// const removeButtonStyle = "px-3 py-1 text-sm bg-red-500/50 text-white rounded-md hover:bg-red-500/80 transition-all";

// Новые, элегантные стили для кнопок "Add" (стиль "ghost button")
const addButtonStyle = "cursor-pointer text-sm font-medium border border-white/30 rounded-md hover:bg-white/10 transition-all flex items-center justify-center gap-2 py-2 text-white/80 hover:text-white";
// Новые, минималистичные стили для кнопок "Remove" (иконка)
const removeButtonStyle = "cursor-pointer text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-full w-7 h-7 flex items-center justify-center transition-all";

const inputStyle = "mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet";
const labelStyle = "block text-sm font-medium text-white/80";


export function CreateResumeForm({ onGenerate, template }: CreateResumeFormProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      experience: [{ company: "", position: "", years: "", description: "" }],
      projects: [{ name: "", description: "", technologies: "" }],
      education: [{ institution: "", degree: "", years: "" }],
      skills: [{ value: "React" }],
      languages: [{ language: "English", proficiency: "Fluent" }],
      achievements: [{ value: "" }],
      trainings: [{ value: "" }],
      certifications: [{ value: "" }],
    },
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control, name: "experience" });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: "projects" });
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({ control, name: "education" });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: "skills" });
  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({ control, name: "languages" });

  const onSubmit = async (data: ResumeFormData) => {
    const formattedData = {
      ...data,
      summary: `${data.fullName}: ${data.jobTitle}\n${data.summary}`,
      skills: data.skills?.map(s => s.value),
      achievements: data.achievements?.map(a => a.value),
      trainings: data.trainings?.map(t => t.value),
      certifications: data.certifications?.map(c => c.value),
    };
    onGenerate({ result: JSON.stringify(formattedData, null, 2) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* --- Имя и Должность --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className={labelStyle}>Full Name</label>
          <input {...register("fullName")} id="fullName" className={inputStyle} placeholder="e.g., John Doe"/>
          {errors.fullName && <p className="mt-1 text-red-400 text-sm">{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor="jobTitle" className={labelStyle}>Job Title</label>
          <input {...register("jobTitle")} id="jobTitle" className={inputStyle} placeholder="e.g., Senior Frontend Developer"/>
          {errors.jobTitle && <p className="mt-1 text-red-400 text-sm">{errors.jobTitle.message}</p>}
        </div>
      </div>

      <div className="border-t border-white/20"></div>

      {/* --- Summary & Contact --- */}
      <div>
        <label htmlFor="summary" className={labelStyle}>Professional Summary</label>
        <textarea {...register("summary")} id="summary" rows={4} className={inputStyle} placeholder="A highly skilled and motivated developer..."/>
        {errors.summary && <p className="mt-1 text-red-400 text-sm">{errors.summary.message}</p>}
      </div>
      <div>
        <label htmlFor="contact.email" className={labelStyle}>Email</label>
        <input {...register("contact.email")} id="contact.email" className={inputStyle} placeholder="john.doe@email.com"/>
        {errors.contact?.email && <p className="mt-1 text-red-400 text-sm">{errors.contact.email.message}</p>}
      </div>
      
      {/* --- Work Experience --- */}
      <div>
        <h3 className="font-display text-xl mb-2">Work Experience</h3>
        {experienceFields.map((field, index) => (
          <div key={field.id} className="space-y-2 border border-white/20 p-4 rounded-md mb-4 relative">
            <input {...register(`experience.${index}.position`)} placeholder="Position" className={inputStyle} />
            <input {...register(`experience.${index}.company`)} placeholder="Company" className={inputStyle} />
            <input {...register(`experience.${index}.years`)} placeholder="Years (e.g., 2020 - Present)" className={inputStyle} />
            <textarea {...register(`experience.${index}.description`)} placeholder="Description..." rows={3} className={inputStyle} />
            {/* --- ШАГ 2: ЗАМЕНА КНОПКИ REMOVE НА ИКОНКУ --- */}
            <button type="button" onClick={() => removeExperience(index)} className={`${removeButtonStyle} absolute top-2 right-2`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        ))}
        {/* --- ШАГ 2: ЗАМЕНА КНОПКИ ADD НА СТИЛИЗОВАННУЮ С ИКОНКОЙ --- */}
        <button type="button" onClick={() => appendExperience({ company: "", position: "", years: "", description: "" })} className={addButtonStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Add Experience</span>
        </button>
      </div>
      
      {/* --- Projects --- */}
      <div>
        <h3 className="font-display text-xl mb-2">Projects</h3>
        {projectFields.map((field, index) => (
          <div key={field.id} className="space-y-2 border border-white/20 p-4 rounded-md mb-4 relative">
            <input {...register(`projects.${index}.name`)} placeholder="Project Name" className={inputStyle} />
            <input {...register(`projects.${index}.technologies`)} placeholder="Technologies" className={inputStyle} />
            <textarea {...register(`projects.${index}.description`)} placeholder="Description..." rows={3} className={inputStyle} />
            <button type="button" onClick={() => removeProject(index)} className={`${removeButtonStyle} absolute top-2 right-2`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        ))}
        <button type="button" onClick={() => appendProject({ name: "", description: "", technologies: "" })} className={addButtonStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Add Project</span>
        </button>
      </div>

      {/* --- Education --- */}
      <div>
        <h3 className="font-display text-xl mb-2">Education</h3>
        {educationFields.map((field, index) => (
          <div key={field.id} className="space-y-2 border border-white/20 p-4 rounded-md mb-4 relative">
            <input {...register(`education.${index}.institution`)} placeholder="Institution" className={inputStyle} />
            <input {...register(`education.${index}.degree`)} placeholder="Degree" className={inputStyle} />
            <input {...register(`education.${index}.years`)} placeholder="Years" className={inputStyle} />
            <button type="button" onClick={() => removeEducation(index)} className={`${removeButtonStyle} absolute top-2 right-2`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        ))}
        <button type="button" onClick={() => appendEducation({ institution: "", degree: "", years: "" })} className={addButtonStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Add Education</span>
        </button>
      </div>
      
      {/* --- Skills --- */}
      <div>
        <h3 className="font-display text-xl mb-2">Skills</h3>
        {skillFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
                <input {...register(`skills.${index}.value`)} placeholder="e.g., TypeScript" className={`${inputStyle} flex-grow`} />
                <button type="button" onClick={() => removeSkill(index)} className={removeButtonStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
        ))}
        <button type="button" onClick={() => appendSkill({ value: "" })} className={addButtonStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Add Skill</span>
        </button>
      </div>

      {/* --- Languages --- */}
      <div>
        <h3 className="font-display text-xl mb-2">Languages</h3>
        {languageFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
                <input {...register(`languages.${index}.language`)} placeholder="Language" className={`${inputStyle} w-1/2`} />
                <input {...register(`languages.${index}.proficiency`)} placeholder="Proficiency" className={`${inputStyle} w-1/2`} />
                <button type="button" onClick={() => removeLanguage(index)} className={removeButtonStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
        ))}
        <button type="button" onClick={() => appendLanguage({ language: "", proficiency: "" })} className={addButtonStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Add Language</span>
        </button>
      </div>

      <button type="submit" className="card-button w-full !mt-8">
        Generate Resume
      </button>
    </form>
  );
}