import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace with your frontend URL for production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { applicationId } = await req.json()

    if (!applicationId) {
      throw new Error('Application ID is required.')
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch application details
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('*, jobs(*), user_profiles(*)')
      .eq('id', applicationId)
      .single()

    if (appError) throw appError

    // 2. Fetch user's CV file path
    const cvFilePath = application.user_profiles.cv_file_path
    if (!cvFilePath) {
      throw new Error('CV file path not found for this user.')
    }

    // 3. Download the CV from storage (this is a simplified example)
    // In a real scenario, you would use the file content directly
    const { data: cvFile, error: cvError } = await supabaseAdmin.storage
      .from('cvs')
      .download(cvFilePath)

    if (cvError) throw cvError

    // 4. Download the cover letter if it exists
    let coverLetterFile: Blob | null = null
    if (application.cover_letter_file_path) {
      const { data: clFile, error: clError } = await supabaseAdmin.storage
        .from('cover_letters')
        .download(application.cover_letter_file_path)
      if (clError) throw clError
      coverLetterFile = clFile
    }

    // 5. Send the email (using a mock service for now)
    // Replace with a real email provider like Resend, SendGrid, etc.
    console.log('--- Sending Email ---')
    console.log('To:', application.company_email)
    console.log('Subject:', `Candidature pour ${application.jobs.title}`)
    console.log('Body:', application.cover_letter)
    console.log('CV Attached:', cvFile ? `${cvFile.size} bytes` : 'No')
    console.log('Cover Letter Attached:', coverLetterFile ? `${coverLetterFile.size} bytes` : 'No')
    console.log('---------------------')

    // Mock success response
    const emailId = `email_${Date.now()}`

    // 6. Update the application status to 'sent'
    const { error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ status: 'sent', email_id: emailId })
      .eq('id', applicationId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, emailId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
