/**
 * Client-side field validators with helpful hints
 * Provides instant feedback without API calls
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  hint?: string;
  severity: 'error' | 'warning' | 'success';
}

// Summary validation
export function validateSummary(summary: string): ValidationResult {
  if (!summary || summary.trim().length === 0) {
    return {
      isValid: false,
      message: 'Professional summary is required',
      hint: 'Write 2-3 sentences about your experience and what you bring to the role',
      severity: 'error',
    };
  }

  const wordCount = summary.trim().split(/\s+/).length;

  if (wordCount < 30) {
    return {
      isValid: false,
      message: `Too short (${wordCount}/30 words minimum)`,
      hint: 'Add more details about your skills, experience, and career goals',
      severity: 'warning',
    };
  }

  if (wordCount > 150) {
    return {
      isValid: false,
      message: `Too long (${wordCount}/150 words maximum)`,
      hint: 'Keep it concise - recruiters spend only 6 seconds on initial review',
      severity: 'warning',
    };
  }

  if (wordCount >= 50 && wordCount <= 100) {
    return {
      isValid: true,
      message: `Perfect length (${wordCount} words)`,
      severity: 'success',
    };
  }

  return {
    isValid: true,
    message: `Good (${wordCount} words)`,
    hint: '50-100 words is optimal for summary',
    severity: 'success',
  };
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return {
      isValid: false,
      message: 'Email is required',
      hint: 'Use a professional email address',
      severity: 'error',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Invalid email format',
      hint: 'Example: john.doe@gmail.com',
      severity: 'error',
    };
  }

  // Check for unprofessional email patterns
  const unprofessionalPatterns = /(sexy|cool|hotmail|aol)/i;
  if (unprofessionalPatterns.test(email)) {
    return {
      isValid: true,
      message: 'Consider using a more professional email',
      hint: 'Gmail or custom domain emails work best',
      severity: 'warning',
    };
  }

  return {
    isValid: true,
    message: 'Valid email',
    severity: 'success',
  };
}

// Phone validation
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return {
      isValid: false,
      message: 'Phone number is required',
      hint: 'Include country code for international applications',
      severity: 'error',
    };
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  if (!/^\+?\d{10,15}$/.test(cleaned)) {
    return {
      isValid: false,
      message: 'Invalid phone format',
      hint: 'Use format: +1 (555) 123-4567 or +44 20 1234 5678',
      severity: 'error',
    };
  }

  return {
    isValid: true,
    message: 'Valid phone number',
    severity: 'success',
  };
}

// Experience description validation
export function validateExperienceDescription(description: string): ValidationResult {
  if (!description || description.trim().length === 0) {
    return {
      isValid: false,
      message: 'Job description is required',
      hint: 'Use bullet points to list your key achievements',
      severity: 'error',
    };
  }

  const bulletPatterns = /[•\-\*]/;
  if (!bulletPatterns.test(description)) {
    return {
      isValid: true,
      message: 'Consider using bullet points',
      hint: 'Bullet points improve readability and ATS parsing',
      severity: 'warning',
    };
  }

  // Check for action verbs
  const actionVerbs = ['achieved', 'improved', 'increased', 'developed', 'led', 'managed', 'created', 'delivered'];
  const hasActionVerb = actionVerbs.some(verb =>
    description.toLowerCase().includes(verb)
  );

  if (!hasActionVerb) {
    return {
      isValid: true,
      message: 'Use action verbs',
      hint: 'Start bullet points with: achieved, improved, developed, led',
      severity: 'warning',
    };
  }

  // Check for numbers (quantifiable achievements)
  const hasNumbers = /\d+%|\$\d+|\d+\s*(users|customers|projects|team|members)/i.test(description);

  if (!hasNumbers) {
    return {
      isValid: true,
      message: 'Add quantifiable achievements',
      hint: 'Include numbers: "Increased sales by 40%" or "Led team of 5"',
      severity: 'warning',
    };
  }

  return {
    isValid: true,
    message: 'Well-written description',
    severity: 'success',
  };
}

// Skills count validation
export function validateSkillsCount(skillsCount: number): ValidationResult {
  if (skillsCount === 0) {
    return {
      isValid: false,
      message: 'Add at least 3 skills',
      hint: 'Include both technical and soft skills',
      severity: 'error',
    };
  }

  if (skillsCount < 5) {
    return {
      isValid: true,
      message: `${skillsCount} skills - add more`,
      hint: '8-12 skills is optimal for most roles',
      severity: 'warning',
    };
  }

  if (skillsCount > 15) {
    return {
      isValid: true,
      message: `${skillsCount} skills - too many`,
      hint: 'Focus on most relevant skills (8-12 recommended)',
      severity: 'warning',
    };
  }

  return {
    isValid: true,
    message: `${skillsCount} skills - perfect`,
    severity: 'success',
  };
}

// Date validation
export function validateDates(startYear: string, endYear: string, isCurrent: boolean): ValidationResult {
  if (!startYear) {
    return {
      isValid: false,
      message: 'Start date is required',
      hint: 'Enter the year you started this position',
      severity: 'error',
    };
  }

  const currentYear = new Date().getFullYear();
  const start = parseInt(startYear);

  if (start < 1970 || start > currentYear) {
    return {
      isValid: false,
      message: 'Invalid start year',
      hint: `Year should be between 1970 and ${currentYear}`,
      severity: 'error',
    };
  }

  if (!isCurrent && !endYear) {
    return {
      isValid: false,
      message: 'End date is required',
      hint: 'Check "Current" if still working here',
      severity: 'error',
    };
  }

  if (!isCurrent && endYear) {
    const end = parseInt(endYear);

    if (end < start) {
      return {
        isValid: false,
        message: 'End date before start date',
        hint: 'Check your dates',
        severity: 'error',
      };
    }

    if (end > currentYear) {
      return {
        isValid: false,
        message: 'End date in future',
        hint: 'Check "Current" if still working here',
        severity: 'error',
      };
    }
  }

  return {
    isValid: true,
    message: 'Valid dates',
    severity: 'success',
  };
}
