// src/components/pdf/ResumePDF.tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ResumeFormData } from '@/lib/validators';
import { formatExperienceDate } from '@/lib/placeholder-data';

// --- РЕГИСТРАЦИЯ ШРИФТОВ ДЛЯ КИРИЛЛИЦЫ ---
Font.register({
  family: 'Noto Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNb4g.ttf' }, // Regular
    { src: 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFlYw.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontSize: 10, 
    fontFamily: 'Noto Sans',
    color: '#333'
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  fullName: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 4 
  },
  jobTitle: { 
    fontSize: 14, 
    color: '#6B7280' 
  },
  contactLine: {
    fontSize: 9,
    color: '#4B5563',
    marginTop: 8,
  },
  section: { 
    marginBottom: 10 
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
    color: '#111827',
  },
  entry: {
    marginBottom: 10,
  },
  jobPosition: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  jobCompany: {
    fontSize: 10,
  },
  jobDate: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4,
  },
  // Убрали 'whiteSpace' отсюда
  jobDescription: {
    fontSize: 10,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skill: {
    backgroundColor: '#F3F4F6',
    color: '#1F2937',
    padding: '4px 8px',
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 9,
  }
});

export default function ResumePDF({ data }: { data: ResumeFormData }) {
  const hasContent = (arr: any[] | undefined) => arr && arr.length > 0;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.fullName}>{data.fullName}</Text>
          <Text style={styles.jobTitle}>{data.jobTitle}</Text>
          <Text style={styles.contactLine}>
            {data.contact.email}
            {data.contact.phone ? ` | ${data.contact.phone}` : ''}
            {data.contact.linkedin ? ` | ${data.contact.linkedin}` : ''}
          </Text>
        </View>

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            {/* Убрали стиль отсюда */}
            <Text>{data.summary}</Text>
          </View>
        )}

        {hasContent(data.skills) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skills}>
              {data.skills?.map((skill, i) => (
                <Text key={i} style={styles.skill}>{skill.value}</Text>
              ))}
            </View>
          </View>
        )}
        
        {hasContent(data.experience) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.experience?.map((job, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.jobPosition}>{job.position}</Text>
                <Text style={styles.jobCompany}>{job.company}</Text>
                <Text style={styles.jobDate}>{formatExperienceDate(job as any)}</Text>
                <Text style={styles.jobDescription}>{job.description}</Text>
              </View>
            ))}
          </View>
        )}

        {hasContent(data.projects) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects?.map((project, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.jobPosition}>{project.name}</Text>
                <Text style={styles.jobDate}>{project.technologies}</Text>
                <Text style={styles.jobDescription}>{project.description}</Text>
              </View>
            ))}
          </View>
        )}
        
        {hasContent(data.education) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education?.map((edu, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.jobPosition}>{edu.degree} - {edu.institution}</Text>
                <Text style={styles.jobDate}>{edu.years}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}