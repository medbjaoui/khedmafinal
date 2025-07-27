import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobMatchingRequest {
  userId: string;
  jobId: string;
  saveResult?: boolean;
}

interface MatchingResult {
  overallScore: number;
  detailedScores: {
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    locationScore: number;
    salaryScore: number;
    languageScore: number;
    culturalFitScore: number;
  };
  explanation: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidenceLevel: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, jobId, saveResult = true }: JobMatchingRequest = await req.json();

    if (!userId || !jobId) {
      throw new Error('userId and jobId are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting job matching for user ${userId} and job ${jobId}`);

    // 1. Récupérer les données utilisateur
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        skills(*),
        experiences(*),
        education(*),
        languages(*),
        certifications(*)
      `)
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      throw new Error(`User profile not found: ${userError?.message}`);
    }

    // 2. Récupérer les détails du job
    const { data: jobDetails, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !jobDetails) {
      throw new Error(`Job not found: ${jobError?.message}`);
    }

    // 3. Appeler l'agent de matching
    const agentUrl = Deno.env.get('MATCHING_AGENT_URL') || 'http://localhost:8001/matching-agent';
    
    const agentResponse = await fetch(agentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('AGENT_API_KEY') || 'dev-key'}`
      },
      body: JSON.stringify({
        taskType: 'perform_matching',
        inputData: {
          candidateProfile: {
            id: userProfile.id,
            personalInfo: {
              fullName: `${userProfile.first_name} ${userProfile.last_name}`,
              email: userProfile.email,
              phone: userProfile.phone,
              location: userProfile.location
            },
            skills: userProfile.skills || [],
            experiences: userProfile.experiences || [],
            education: userProfile.education || [],
            languages: userProfile.languages || [],
            certifications: userProfile.certifications || []
          },
          jobOffer: {
            id: jobDetails.id,
            title: jobDetails.title,
            company: jobDetails.company,
            location: jobDetails.location,
            type: jobDetails.type,
            salary: jobDetails.salary,
            description: jobDetails.description,
            requirements: {
              requiredSkills: jobDetails.requirements || [],
              preferredSkills: [],
              experienceLevel: 'mid',
              education: []
            }
          },
          matchingCriteria: {
            skillsWeight: 0.4,
            experienceWeight: 0.3,
            educationWeight: 0.1,
            locationWeight: 0.1,
            salaryWeight: 0.05,
            languageWeight: 0.05
          }
        }
      })
    });

    if (!agentResponse.ok) {
      console.error('Agent response error:', await agentResponse.text());
      throw new Error(`Job matching agent failed: ${agentResponse.statusText}`);
    }

    const matchingResult: MatchingResult = await agentResponse.json();

    console.log('Job matching completed successfully');

    // 4. Sauvegarder le résultat si demandé
    if (saveResult) {
      const { error: saveError } = await supabase
        .from('job_matches')
        .upsert({
          user_id: userId,
          job_id: jobId,
          overall_score: matchingResult.overallScore,
          detailed_scores: matchingResult.detailedScores,
          explanation: matchingResult.explanation,
          strengths: matchingResult.strengths,
          weaknesses: matchingResult.weaknesses,
          recommendations: matchingResult.recommendations,
          confidence_level: matchingResult.confidenceLevel,
          updated_at: new Date().toISOString()
        });

      if (saveError) {
        console.error('Error saving matching result:', saveError);
        throw new Error(`Failed to save matching result: ${saveError.message}`);
      }
    }

    // 5. Créer une notification si le score est élevé
    if (matchingResult.overallScore >= 70) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'job',
          title: 'Excellente correspondance trouvée!',
          message: `Le poste "${jobDetails.title}" chez ${jobDetails.company} correspond à ${matchingResult.overallScore}% à votre profil`,
          priority: 'high',
          action_url: `/jobs/${jobId}`,
          read: false
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    // 6. Retourner les résultats
    return new Response(JSON.stringify({
      success: true,
      data: {
        ...matchingResult,
        jobDetails: {
          id: jobDetails.id,
          title: jobDetails.title,
          company: jobDetails.company,
          location: jobDetails.location
        }
      },
      message: 'Job matching completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Job matching error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message,
      message: 'Job matching failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 