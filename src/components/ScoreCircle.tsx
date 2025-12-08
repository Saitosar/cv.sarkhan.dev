// src/components/ScoreCircle.tsx
"use client";

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ScoreCircleProps {
  score: number;
}

export function ScoreCircle({ score }: ScoreCircleProps) {
  // Определяем цвет в зависимости от оценки
  const scoreColor = score < 50 ? '#F97316' : score < 75 ? '#FDE047' : '#84CC16';

  return (
    <div style={{ width: 150, height: 150 }}>
      <CircularProgressbar
        value={score}
        text={`${score}%`}
        styles={buildStyles({
          // Цвет текста
          textColor: '#FFFFFF',
          // Цвет "заполненной" части круга
          pathColor: scoreColor,
          // Цвет "незаполненной" части
          trailColor: 'rgba(255, 255, 255, 0.1)',
          // Анимация
          pathTransitionDuration: 0.8,
        })}
      />
    </div>
  );
}