import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CVAnalysisRequest {
  userId: string;
  fileUrl: string;
  analysisType?: 'basic' | 'advanced' | 'complete';
}

interface CVAnalysisResult {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  skills: Array<{
    name: string;
    level: string;
    category: string;
  }>;
  experiences: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
  }>;
  qualityScore: number;
  completenessScore: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, fileUrl, analysisType = 'complete' }: CVAnalysisRequest = await req.json();

    if (!userId || !fileUrl) {
      throw new Error('userId and fileUrl are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting CV analysis for user ${userId}`);

    // 1. Télécharger le fichier CV
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download CV file: ${fileResponse.statusText}`);
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const fileContent = new Uint8Array(fileBuffer);

    // 2. Appeler l'agent d'analyse CV
    const agentUrl = Deno.env.get('CV_ANALYZER_AGENT_URL') || 'http://localhost:8000/cv-analyzer';
    
    const agentResponse = await fetch(agentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('AGENT_API_KEY') || 'dev-key'}`
      },
      body: JSON.stringify({
        taskType: 'analyze_cv',
        inputData: {
          userId,
          fileContent: Array.from(fileContent),
          fileName: fileUrl.split('/').pop() || 'cv.pdf',
          analysisType
        }
      })
    });

    if (!agentResponse.ok) {
      console.error('Agent response error:', await agentResponse.text());
      throw new Error(`CV analysis agent failed: ${agentResponse.statusText}`);
    }

    const analysisResult: CVAnalysisResult = await agentResponse.json();

    console.log('CV analysis completed successfully');

    // 3. Sauvegarder les résultats dans la base de données
    const { error: updateError } = await supabase
      .from('cv_versions')
      .update({
        analysis_data: analysisResult,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (updateError) {
      console.error('Error updating CV analysis:', updateError);
      throw new Error(`Failed to save analysis results: ${updateError.message}`);
    }

    // 4. Mettre à jour le profil utilisateur avec les informations extraites
    if (analysisResult.personalInfo) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: analysisResult.personalInfo.fullName.split(' ')[0] || '',
          last_name: analysisResult.personalInfo.fullName.split(' ').slice(1).join(' ') || '',
          phone: analysisResult.personalInfo.phone || null,
          location: analysisResult.personalInfo.location || null,
          completion_score: analysisResult.completenessScore || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
      }
    }

    // 5. Sauvegarder les compétences extraites
    if (analysisResult.skills && analysisResult.skills.length > 0) {
      // Supprimer les anciennes compétences
      await supabase
        .from('skills')
        .delete()
        .eq('user_id', userId);

      // Insérer les nouvelles compétences
      const skillsToInsert = analysisResult.skills.map(skill => ({
        user_id: userId,
        name: skill.name,
        level: skill.level,
        category: skill.category,
        verified: false
      }));

      const { error: skillsError } = await supabase
        .from('skills')
        .insert(skillsToInsert);

      if (skillsError) {
        console.error('Error inserting skills:', skillsError);
      }
    }

    // 6. Sauvegarder les expériences extraites
    if (analysisResult.experiences && analysisResult.experiences.length > 0) {
      // Supprimer les anciennes expériences
      await supabase
        .from('experiences')
        .delete()
        .eq('user_id', userId);

      // Insérer les nouvelles expériences
      const experiencesToInsert = analysisResult.experiences.map(exp => ({
        user_id: userId,
        position: exp.title,
        company: exp.company,
        description: exp.description,
        start_date: new Date().toISOString().split('T')[0], // Date par défaut
        current: false
      }));

      const { error: expError } = await supabase
        .from('experiences')
        .insert(experiencesToInsert);

      if (expError) {
        console.error('Error inserting experiences:', expError);
      }
    }

    // 7. Créer des recommandations basées sur l'analyse
    if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
      // Supprimer les anciennes recommandations d'analyse CV
      await supabase
        .from('recommendations')
        .delete()
        .eq('user_id', userId)
        .eq('category', 'cv_analysis');

      // Insérer les nouvelles recommandations
      const recommendationsToInsert = analysisResult.recommendations.map(rec => ({
        user_id: userId,
        type: rec.type,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        action: 'review',
        category: 'cv_analysis',
        completed: false,
        dismissed: false
      }));

      const { error: recError } = await supabase
        .from('recommendations')
        .insert(recommendationsToInsert);

      if (recError) {
        console.error('Error inserting recommendations:', recError);
      }
    }

    // 8. Créer une notification pour l'utilisateur
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'system',
        title: 'Analyse CV terminée',
        message: `Votre CV a été analysé avec succès. Score de qualité: ${analysisResult.qualityScore}%`,
        priority: 'medium',
        read: false
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // 9. Retourner les résultats
    return new Response(JSON.stringify({
      success: true,
      data: analysisResult,
      message: 'CV analysis completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('CV analysis error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'CV analysis failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 