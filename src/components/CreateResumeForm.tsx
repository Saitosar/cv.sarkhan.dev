// src/components/CreateResumeForm.tsx
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema, type ResumeFormData } from "@/lib/validators";
import { Loader2 } from "lucide-react";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { FillSampleDataButton } from "./FillSampleDataButton";
import { AchievementsSuggestions } from "./AchievementsSuggestions";
import { ValidationMessage } from "./ValidationMessage";
import {
  validateSummary,
  validateEmail,
  validatePhone,
  validateSkillsCount,
} from "@/lib/field-validators";
import { useEffect, useState, useMemo } from "react";

interface CreateResumeFormProps {
  onGenerate: (data: ResumeFormData) => void;
  onAssess: (data: ResumeFormData) => void;
  isAssessing: boolean;
}

const addButtonStyle = "mt-2 flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-white/20 p-3 text-white/50 transition-all hover:border-white/40 hover:text-white/80";
const removeButtonStyle = "absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-red-400";
const inputStyle = "mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet";
const baseLabelStyle = "block text-sm font-medium text-white/80";
const errorTextStyle = "mt-1 text-red-400 text-sm";
const hintTextStyle = "mt-1 text-xs text-white/50";

const RemoveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="font-display text-xl mb-3">{title}</h3>
);

const Label = ({ htmlFor, children, required = true }: { htmlFor: string, children: React.ReactNode, required?: boolean }) => (
    <label htmlFor={htmlFor} className={baseLabelStyle}>
        {children} {required && <span className="text-red-400">*</span>}
    </label>
);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CreateResumeForm({ onGenerate, onAssess, isAssessing }: CreateResumeFormProps) {
  const { register, control, handleSubmit, formState: { errors }, getValues, watch, reset } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      fullName: "",
      jobTitle: "",
      summary: "",
      contact: { email: "", phone: "" },
      experience: [{
        company: "",
        position: "",
        description: "",
        startDate: { month: "", year: "" },
        endDate: { month: "", year: "", isCurrent: false }
      }],
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

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control, name: "experience" });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: "projects" });
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({ control, name: "education" });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: "skills" });
  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({ control, name: "languages" });
  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({ control, name: "achievements" });
  const { fields: trainingFields, append: appendTraining, remove: removeTraining } = useFieldArray({ control, name: "trainings" });
  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({ control, name: "certifications" });

  const experienceWatch = watch("experience");
  const jobTitleWatch = watch("jobTitle");
  const summaryWatch = watch("summary");
  const emailWatch = watch("contact.email");
  const phoneWatch = watch("contact.phone");
  const skillsWatch = watch("skills");

  // Watch all form data for auto-save
  const formData = watch();

  // Validation results
  const summaryValidation = useMemo(() => validateSummary(summaryWatch || ""), [summaryWatch]);
  const emailValidation = useMemo(() => validateEmail(emailWatch || ""), [emailWatch]);
  const phoneValidation = useMemo(() => validatePhone(phoneWatch || ""), [phoneWatch]);
  const skillsValidation = useMemo(() => validateSkillsCount(skillsWatch?.filter(s => s.value).length || 0), [skillsWatch]);

  // Handle Fill Sample Data
  const handleFillSample = (sampleData: Partial<ResumeFormData>) => {
    const currentValues = getValues();
    reset({
      ...currentValues,
      ...sampleData,
    });
  };

  // Auto-save hook
  const autoSave = useAutoSave(formData, {
    key: 'resume-draft',
    interval: 30000, // 30 seconds
    enabled: true,
  });

  // Restore saved data on mount
  useEffect(() => {
    const savedData = autoSave.restore();
    if (savedData) {
      reset(savedData);
    }
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* Header with auto-save and fill sample */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <FillSampleDataButton
          jobTitle={jobTitleWatch}
          onFill={handleFillSample}
        />
        <AutoSaveIndicator
          isSaving={autoSave.isSaving}
          lastSaved={autoSave.lastSaved}
          hasUnsavedChanges={autoSave.hasUnsavedChanges}
        />
      </div>

      <form onSubmit={handleSubmit(onGenerate)} className="space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <input {...register("fullName")} id="fullName" className={inputStyle} placeholder="e.g., John Doe"/>
            {errors.fullName && <p className={errorTextStyle}>{errors.fullName.message}</p>}
            <p className={hintTextStyle}>Your full name as you&apos;d like it to appear on the resume.</p>
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <input {...register("jobTitle")} id="jobTitle" className={inputStyle} placeholder="e.g., Senior Frontend Developer"/>
            {errors.jobTitle && <p className={errorTextStyle}>{errors.jobTitle.message}</p>}
             <p className={hintTextStyle}>Your current or desired job title.</p>
          </div>
        </div>

        <div className="border-t border-white/20"></div>
        <div>
          <h3 className="font-display text-xl mb-1">Target Vacancy (Optional)</h3>
          <p className="text-sm text-white/60 mb-4">Provide details of the job you&apos;re applying for to tailor the resume.</p>
          <div className="space-y-3 border border-white/20 p-4 rounded-md">
            <div><Label htmlFor="targetJob.title" required={false}>Vacancy Title</Label><input {...register("targetJob.title")} id="targetJob.title" className={inputStyle} placeholder="e.g., Senior Product Manager"/></div>
            <div><Label htmlFor="targetJob.description" required={false}>Vacancy Description</Label><textarea {...register("targetJob.description")} id="targetJob.description" rows={4} className={inputStyle} placeholder="Copy and paste the job description here..."/></div>
          </div>
        </div>
        <div className="border-t border-white/20"></div>
        <div>
          <Label htmlFor="summary">Professional Summary</Label>
          <textarea {...register("summary")} id="summary" rows={4} className={inputStyle} placeholder="A highly skilled and motivated developer..."/>
          {errors.summary && <p className={errorTextStyle}>{errors.summary.message}</p>}

          {/* Real-time validation */}
          {summaryWatch && <ValidationMessage result={summaryValidation} />}

          <p className={hintTextStyle}>A brief, 2-4 sentence summary of your skills and experience.</p>

          {/* AI Suggestions for Summary */}
          {jobTitleWatch && (
            <AchievementsSuggestions
              jobTitle={jobTitleWatch}
              currentField="summary"
              onSelect={(text) => {
                reset({
                  ...getValues(),
                  summary: text,
                });
              }}
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact.email">Email</Label>
            <input {...register("contact.email")} id="contact.email" className={inputStyle} placeholder="john.doe@email.com"/>
            {errors.contact?.email && <p className={errorTextStyle}>{errors.contact.email.message}</p>}
            {emailWatch && <ValidationMessage result={emailValidation} />}
          </div>
          <div>
            <Label htmlFor="contact.phone">Phone</Label>
            <input {...register("contact.phone")} id="contact.phone" className={inputStyle} placeholder="+1 (555) 123-4567"/>
            {errors.contact?.phone && <p className={errorTextStyle}>{errors.contact.phone.message}</p>}
            {phoneWatch && <ValidationMessage result={phoneValidation} />}
          </div>
          <div className="md:col-span-2"><Label htmlFor="contact.linkedin" required={false}>LinkedIn URL (Optional)</Label><input {...register("contact.linkedin")} id="contact.linkedin" className={inputStyle} placeholder="https://linkedin.com/in/johndoe"/>{errors.contact?.linkedin && <p className={errorTextStyle}>{errors.contact.linkedin.message}</p>}</div>
        </div>

        <div>
          <SectionHeader title="Work Experience" />
          {experienceFields.map((field, index) => (
            <div key={field.id} className="space-y-4 border border-white/20 p-4 rounded-md mb-4 relative">
              <input {...register(`experience.${index}.position`)} placeholder="Position *" className={inputStyle} />
              <input {...register(`experience.${index}.company`)} placeholder="Company *" className={inputStyle} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`experience.${index}.startDate.month`}>Start Month</Label>
                  <select {...register(`experience.${index}.startDate.month`)} id={`experience.${index}.startDate.month`} className={inputStyle}>
                    <option value="">Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor={`experience.${index}.startDate.year`}>Start Year</Label>
                  <input {...register(`experience.${index}.startDate.year`)} id={`experience.${index}.startDate.year`} placeholder="e.g., 2020" className={inputStyle} />
                </div>
              </div>

              {!experienceWatch?.[index]?.endDate?.isCurrent && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`experience.${index}.endDate.month`} required={false}>End Month</Label>
                     <select {...register(`experience.${index}.endDate.month`)} id={`experience.${index}.endDate.month`} className={inputStyle}>
                        <option value="">Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`experience.${index}.endDate.year`} required={false}>End Year</Label>
                    <input {...register(`experience.${index}.endDate.year`)} id={`experience.${index}.endDate.year`} placeholder="e.g., 2022" className={inputStyle} />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Controller
                    control={control}
                    name={`experience.${index}.endDate.isCurrent`}
                    render={({ field }) => (
                        <input
                            type="checkbox"
                            id={`experience.${index}.endDate.isCurrent`}
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 bg-white/10 text-neonViolet focus:ring-neonViolet"
                        />
                    )}
                />
                <label htmlFor={`experience.${index}.endDate.isCurrent`} className="text-sm text-white/80">
                    I currently work here
                </label>
              </div>

              <textarea {...register(`experience.${index}.description`)} placeholder="Description..." rows={3} className={inputStyle} />
              <button type="button" onClick={() => removeExperience(index)} className={removeButtonStyle}><RemoveIcon /></button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => appendExperience({ 
              company: "", position: "", description: "",
              startDate: { month: "", year: "" },
              endDate: { month: "", year: "", isCurrent: false }
            })} 
            className={addButtonStyle}
          >
            <AddIcon />
          </button>
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
          <button type="button" onClick={() => onAssess(getValues())} disabled={isAssessing} className="card-button w-full">
            {isAssessing ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Assess Resume'}
          </button>
        </div>
    </form>
    </div>
  );
}