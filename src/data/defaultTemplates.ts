import { ApplicationTemplate } from '../store/slices/applicationsSlice';

export const defaultApplicationTemplates: ApplicationTemplate[] = [
  {
    id: 'default-formal',
    name: 'Lettre Formelle',
    subject: 'Candidature pour le poste de {jobTitle} - {firstName} {lastName}',
    content: `Madame, Monsieur,

Je vous écris pour exprimer mon vif intérêt pour le poste de {jobTitle} au sein de {company}.

{personalizedIntro}

Fort de {experience} années d'expérience dans le domaine de {field}, je maîtrise parfaitement {topSkills}. Mon parcours professionnel m'a permis de développer une expertise solide qui correspond parfaitement aux exigences de votre offre.

{specificMotivation}

Je serais ravi de pouvoir vous rencontrer pour discuter de ma candidature et vous démontrer comment mes compétences peuvent contribuer au succès de vos projets.

Dans l'attente de votre retour, je vous prie d'accepter, Madame, Monsieur, l'expression de mes salutations distinguées.

Cordialement,
{firstName} {lastName}
{phone}
{email}`,
    isDefault: true,
    createdDate: new Date().toISOString()
  },
  {
    id: 'modern-dynamic',
    name: 'Lettre Moderne',
    subject: '{firstName} {lastName} - Candidature {jobTitle} chez {company}',
    content: `Bonjour,

Votre offre pour le poste de {jobTitle} chez {company} a immédiatement retenu mon attention.

{personalizedIntro}

Avec {experience} années d'expérience et une maîtrise approfondie de {topSkills}, je suis convaincu de pouvoir apporter une réelle valeur ajoutée à votre équipe.

Ce qui me motive particulièrement dans cette opportunité :
• L'innovation et les défis techniques proposés
• La réputation d'excellence de {company} dans {industry}
• L'opportunité de contribuer à des projets d'envergure

{specificMotivation}

Je serais enchanté de vous rencontrer pour échanger sur cette opportunité et vous présenter concrètement comment je peux contribuer à vos objectifs.

Très cordialement,
{firstName} {lastName}
{phone} | {email}`,
    isDefault: false,
    createdDate: new Date().toISOString()
  },
  {
    id: 'tech-focused',
    name: 'Lettre Tech/IT',
    subject: 'Développeur {jobTitle} - Candidature de {firstName} {lastName}',
    content: `Bonjour,

En tant que développeur passionné avec {experience} années d'expérience, votre offre de {jobTitle} chez {company} correspond parfaitement à mon profil et à mes aspirations.

{personalizedIntro}

Mon expertise technique inclut :
• {topSkills}
• Méthodologies agiles et DevOps
• Résolution de problèmes complexes et optimisation

{specificMotivation}

Je suis particulièrement attiré par l'environnement technique innovant de {company} et l'opportunité de travailler sur des projets challengeants dans {industry}.

J'aimerais beaucoup discuter avec vous de la façon dont mes compétences techniques et ma passion pour l'innovation peuvent contribuer à vos projets.

Cordialement,
{firstName} {lastName}
Tech Lead & Développeur
{phone} | {email}`,
    isDefault: false,
    createdDate: new Date().toISOString()
  }
];