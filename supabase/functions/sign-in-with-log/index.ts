/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for preflight and actual requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    // The Supabase Admin client is required to securely sign in users
    // and to write to the login_history table.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Sign in the user using their credentials
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) throw signInError
    if (!signInData.user) throw new Error('User not found after sign-in.')

    const user = signInData.user

    // 2. Log the successful sign-in event
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]
    const userAgent = req.headers.get('user-agent')

    const { error: logError } = await supabaseAdmin.from('login_history').insert({
      user_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    if (logError) {
      // Log the error to the console but don't block the login process
      console.error('Error logging sign-in event:', logError)
    }

    // 3. Return the session data to the client
    return new Response(JSON.stringify(signInData), {
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
