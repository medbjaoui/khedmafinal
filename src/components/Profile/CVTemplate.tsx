import React from 'react';
import { UserProfile } from '../../store/slices/profileSlice';

interface CVTemplateProps {
  profile: UserProfile;
}

const CVTemplate: React.FC<CVTemplateProps> = ({ profile }) => {
  return (
    <div id="cv-template" className="bg-white text-gray-800 p-8 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
      <header className="text-center mb-8 border-b-2 pb-4 border-gray-300">
        <h1 className="text-4xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
        <p className="text-lg text-blue-600 font-medium">{profile.title}</p>
        <div className="text-sm text-gray-600 mt-2">
          <span>{profile.email}</span> | <span>{profile.phone}</span> | <span>{profile.address}</span>
        </div>
      </header>

      <main>
        <section className="mb-6">
          <h2 className="text-xl font-semibold border-b-2 border-blue-500 pb-1 mb-3 text-blue-800">Résumé</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{profile.summary}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold border-b-2 border-blue-500 pb-1 mb-3 text-blue-800">Compétences</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(skill => (
              <span key={skill.name} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {skill.name}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold border-b-2 border-blue-500 pb-1 mb-3 text-blue-800">Expérience Professionnelle</h2>
          {profile.experiences.map((exp, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-bold text-md text-gray-900">{exp.title}</h3>
              <p className="text-sm text-blue-700 font-medium">{exp.company} | {exp.startDate} - {exp.endDate || 'Présent'}</p>
              <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-xl font-semibold border-b-2 border-blue-500 pb-1 mb-3 text-blue-800">Formation</h2>
          {profile.educations.map((edu, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-bold text-md text-gray-900">{edu.degree}</h3>
              <p className="text-sm text-blue-700 font-medium">{edu.institution} | {edu.year}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default CVTemplate;
