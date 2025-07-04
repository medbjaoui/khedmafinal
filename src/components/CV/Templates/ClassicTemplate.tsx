import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { UserProfile } from '../../../store/slices/profileSlice';

// Register fonts
// Remplacez les chemins par les URL des polices que vous souhaitez utiliser
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  title: {
    fontSize: 14,
    color: '#555555',
  },
  contactInfo: {
    fontSize: 10,
    color: '#555555',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    borderBottomWidth: 2,
    borderBottomColor: '#1a237e',
    paddingBottom: 3,
    marginBottom: 10,
  },
  entry: {
    marginBottom: 10,
  },
  entryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  entrySubTitle: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  entryDescription: {
    fontSize: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skill: {
    backgroundColor: '#e8eaf6',
    color: '#1a237e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    margin: 3,
    fontSize: 10,
  },
});

interface ClassicTemplateProps {
  profile: UserProfile;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ profile }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{`${profile.firstName} ${profile.lastName}`}</Text>
        <Text style={styles.title}>{profile.title}</Text>
        <Text style={styles.contactInfo}>
          {`${profile.email} | ${profile.phone} | ${profile.location}`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Résumé</Text>
        <Text style={styles.entryDescription}>{profile.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
        {profile.experiences.map((exp, index) => (
          <View key={index} style={styles.entry}>
            <Text style={styles.entryTitle}>{exp.position}</Text>
            <Text style={styles.entrySubTitle}>{`${exp.company} | ${exp.startDate} - ${exp.endDate || 'Actuel'}`}</Text>
            <Text style={styles.entryDescription}>{exp.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Formation</Text>
        {profile.education.map((edu, index) => (
          <View key={index} style={styles.entry}>
            <Text style={styles.entryTitle}>{edu.degree}</Text>
            <Text style={styles.entrySubTitle}>{`${edu.institution} | ${edu.endDate}`}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compétences</Text>
        <View style={styles.skillsContainer}>
          {profile.skills.map((skill, index) => (
            <Text key={index} style={styles.skill}>{skill.name}</Text>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
