// src/components/pdf/CreativeResumePDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeFormData } from '@/lib/validators';
import { formatExperienceDate } from '@/lib/placeholder-data';

// Стили были исправлены: убран кастомный шрифт и 'fontStyle'
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    // Используем стандартный, надежный шрифт
    fontFamily: 'Helvetica', 
    backgroundColor: '#111827',
    color: '#D1D5DB',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  fullName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  contactLine: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 8,
  },
  summary: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#E5E7EB',
    // Убрали fontStyle: 'italic', который вызывал проблему
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#D1D5DB',
    borderBottomWidth: 1,
    borderBottomColor: '#8B5CF6',
    paddingBottom: 3,
    marginBottom: 8,
  },
  entry: {
    marginBottom: 10,
  },
  position: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#F9FAFB',
  },
  company: {
    color: '#9CA3AF',
  },
  date: {
    fontSize: 9,
    color: '#8B5CF6',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
  },
  skills: {
    fontSize: 10,
  }
});

export default function CreativeResumePDF({ data }: { data: ResumeFormData }) {
  const hasContent = (arr: any[] | undefined) => arr && arr.length > 0;
  
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

        {data.summary && <Text style={styles.summary}>"{data.summary}"</Text>}
        
        {hasContent(data.experience) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Experience</Text>
            {data.experience?.map((job, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.position}>{job.position} <Text style={styles.company}>@ {job.company}</Text></Text>
                <Text style={styles.date}>{formatExperienceDate(job as any)}</Text>
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