// src/components/pdf/CreativeResumePDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeFormData } from '@/lib/validators';
import { formatExperienceDate, type Experience } from '@/lib/placeholder-data';
import type { ColorScheme } from '@/lib/palettes';
import type { Theme } from '../ThemeToggle';

const createStyles = (accentColor: ColorScheme, theme: Theme) => {
  const isDark = theme === 'dark';
  return StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 10,
      fontFamily: 'Helvetica',
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      color: isDark ? '#D1D5DB' : '#111827',
    },
    header: {
      textAlign: 'center',
      marginBottom: 20,
    },
    fullName: {
      fontSize: 28,
      fontFamily: 'Helvetica-Bold',
      color: accentColor.primary,
      marginBottom: 4,
    },
    jobTitle: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    contactLine: {
      fontSize: 9,
      color: isDark ? '#9CA3AF' : '#6B7280',
      marginTop: 8,
    },
    summary: {
      textAlign: 'center',
      marginBottom: 20,
      color: isDark ? '#E5E7EB' : '#374151',
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: 'Helvetica-Bold',
      color: isDark ? '#D1D5DB' : '#111827',
      borderBottomWidth: 1,
      borderBottomColor: accentColor.primary,
      paddingBottom: 3,
      marginBottom: 8,
    },
    entry: {
      marginBottom: 10,
    },
    position: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    company: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    date: {
      fontSize: 9,
      color: accentColor.primary,
      marginBottom: 4,
    },
    description: {
      fontSize: 10,
    },
    skills: {
      fontSize: 10,
    }
  });
};

interface PdfProps {
  data: ResumeFormData;
  accentColor: ColorScheme;
  theme: Theme;
}

export default function CreativeResumePDF({ data, accentColor, theme }: PdfProps) {
  const styles = createStyles(accentColor, theme);
  const hasContent = (arr: unknown[] | undefined) => arr && arr.length > 0;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.fullName}>{data.fullName}</Text>
          <Text style={styles.jobTitle}>{data.jobTitle}</Text>
          <Text style={styles.contactLine}>
            {data.contact.email}
            {data.contact.phone ? ` // ${data.contact.phone}` : ''}
            {data.contact.linkedin ? ` // ${data.contact.linkedin}` : ''}
          </Text>
        </View>

        {data.summary && <Text style={styles.summary}>&quot;{data.summary}&quot;</Text>}
        
        {hasContent(data.experience) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Experience</Text>
            {data.experience?.map((job, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.position}>{job.position} <Text style={styles.company}>@ {job.company}</Text></Text>
                <Text style={styles.date}>{formatExperienceDate(job as Experience)}</Text>
                <Text style={styles.description}>{job.description}</Text>
              </View>
            ))}
          </View>
        )}

        {hasContent(data.projects) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Projects</Text>
            {data.projects?.map((project, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.position}>{project.name}</Text>
                <Text style={styles.date}>{project.technologies}</Text>
                <Text style={styles.description}>{project.description}</Text>
              </View>
            ))}
          </View>
        )}
        
        {hasContent(data.skills) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Skills</Text>
            <Text style={styles.skills}>{data.skills?.map(s => s.value).join(' | ')}</Text>
          </View>
        )}
        
        {hasContent(data.education) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Education</Text>
            {data.education?.map((edu, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.position}>{edu.degree} - {edu.institution}</Text>
                <Text style={styles.date}>{edu.years}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}