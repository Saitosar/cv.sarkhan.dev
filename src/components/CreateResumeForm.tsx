// src/components/CreateResumeForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema } from "@/lib/validators";
import type { z } from "zod";

type ResumeFormData = z.infer<typeof resumeSchema>;

// 1. Описываем тип для пропсов компонента
interface CreateResumeFormProps {
  onGenerate: (data: any) => void; // Указываем, что onGenerate - это функция
}

// 2. Применяем этот тип к пропсам
export function CreateResumeForm({ onGenerate }: CreateResumeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
  });

  const onSubmit = async (data: ResumeFormData) => {
    const input = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const result = await response.json();
      onGenerate(result); // Теперь TypeScript знает, что onGenerate - это функция
    } catch (error) {
      console.error('Failed to generate resume:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-white/80">
          Full Name
        </label>
        <input
          {...register("fullName")}
          id="fullName"
          className="mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet"
        />
        {errors.fullName && <p className="mt-1 text-red-400 text-sm">{errors.fullName.message}</p>}
      </div>
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-white/80">
          Job Title
        </label>
        <input
          {...register("jobTitle")}
          id="jobTitle"
          className="mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet"
        />
        {errors.jobTitle && <p className="mt-1 text-red-400 text-sm">{errors.jobTitle.message}</p>}
      </div>
      <button type="submit" className="card-button w-full">
        Generate Resume
      </button>
    </form>
  );
}