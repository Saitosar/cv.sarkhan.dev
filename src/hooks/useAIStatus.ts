import { useState, useEffect } from 'react';

const AI_STATUS_MESSAGES = [
  { message: 'Analyzing your experience...', duration: 2000 },
  { message: 'Identifying key achievements...', duration: 2500 },
  { message: 'Selecting power keywords...', duration: 2000 },
  { message: 'Optimizing for ATS systems...', duration: 2500 },
  { message: 'Crafting professional summary...', duration: 3000 },
  { message: 'Finalizing your resume...', duration: 2000 },
];

export function useAIStatus(isGenerating: boolean) {
  const [currentStatus, setCurrentStatus] = useState(AI_STATUS_MESSAGES[0].message);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setStatusIndex(0);
      setCurrentStatus(AI_STATUS_MESSAGES[0].message);
      return;
    }

    const currentMessage = AI_STATUS_MESSAGES[statusIndex];
    setCurrentStatus(currentMessage.message);

    const timer = setTimeout(() => {
      setStatusIndex((prev) => {
        const next = prev + 1;
        return next >= AI_STATUS_MESSAGES.length ? prev : next;
      });
    }, currentMessage.duration);

    return () => clearTimeout(timer);
  }, [isGenerating, statusIndex]);

  return currentStatus;
}
