// src/components/pdf/ModernResumePDF.tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ResumeFormData } from '@/lib/validators';
import { formatExperienceDate } from '@/lib/placeholder-data';

Font.register({
  family: 'Noto Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNb4g.ttf' }, // Regular
    { src: 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFlYw.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'Noto Sans',
    fontSize: 10,
    color: '#374151', // text-gray-700
  },
  leftColumn: {
    width: '30%',
    backgroundColor: '#F9FAFB', // bg-gray-50
    padding: 20,
  },
  rightColumn: {
    width: '70%',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  fullName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-800
  },
  jobTitle: {
    fontSize: 14,
    color: '#6B7280', // text-gray-500
    marginTop: 4,
  },
  contactInfo: {
    marginTop: 8,
    fontSize: 9,
    color: '#0891B2', // accentColor.primary (cyan)
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#0891B2', // accentColor.primary (cyan)
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  section: {
    marginBottom: 16,
  },
  entry: {
    marginBottom: 12,
  },
  position: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  company: {
    fontSize: 11,
    color: '#4B5563',
  },
  date: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skill: {
    backgroundColor: '#E0F2F9', // bg-cyan-50
    color: '#0E7490', // text-cyan-800
    fontSize: 8,
    padding: '3px 6px',
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
});

export default function ModernResumePDF({ data }: { data: ResumeFormData }) {
  const hasContent = (arr: any[] | undefined) => arr && arr.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.rightColumn}>
          <View style={styles.header}>
            <Text style={styles.fullName}>{data.fullName}</Text>
            <Text style={styles.jobTitle}>{data.jobTitle}</Text>
            <Text style={styles.contactInfo}>
              {data.contact.email}
              {data.contact.phone ? ` • ${data.contact.phone}` : ''}
              {data.contact.linkedin ? ` • ${data.contact.linkedin}` : ''}
            </Text>
          </View>
          
          {data.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.description}>{data.summary}</Text>
            </View>
          )}

          {hasContent(data.experience) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {data.experience?.map((job, i) => (
                <View key={i} style={styles.entry}>
                  <Text style={styles.position}>{job.position}</Text>
                  <Text style={styles.company}>{job.company}</Text>
                  <Text style={styles.date}>{formatExperienceDate(job as any)}</Text>
                  <Text style={styles.description}>{job.description}</Text>
                </View>
              ))}
            </View>
          )}

          {hasContent(data.projects) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              {data.projects?.map((project, i) => (
                <View key={i} style={styles.entry}>
                  <Text style={styles.position}>{project.name}</Text>
                  <Text style={styles.date}>{project.technologies}</Text>
                  <Text style={styles.description}>{project.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.leftColumn}>
          {hasContent(data.skills) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {data.skills?.map((skill, i) => <Text key={i} style={styles.skill}>{skill.value}</Text>)}
              </View>
            </View>
          )}

          {hasContent(data.education) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {data.education?.map((edu, i) => (
                <View key={i} style={styles.entry}>
                  <Text style={styles.position}>{edu.degree}</Text>
                  <Text style={styles.company}>{edu.institution}</Text>
                  <Text style={styles.date}>{edu.years}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}