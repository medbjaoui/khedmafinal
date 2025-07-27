import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  type: 'application' | 'job' | 'interview' | 'reminder' | 'system';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
  sendPush?: boolean;
  sendEmail?: boolean;
}

interface BulkNotificationRequest {
  userIds: string[];
  type: 'application' | 'job' | 'interview' | 'reminder' | 'system';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname;

    // Route: POST /notifications - Créer une notification
    if (req.method === 'POST' && path === '/notifications') {
      const body = await req.json();
      
      // Vérifier si c'est une notification bulk ou simple
      if ('userIds' in body) {
        return await handleBulkNotification(supabase, body as BulkNotificationRequest);
      } else {
        return await handleSingleNotification(supabase, body as NotificationRequest);
      }
    }

    // Route: GET /notifications/:userId - Récupérer les notifications d'un utilisateur
    if (req.method === 'GET' && path.startsWith('/notifications/')) {
      const userId = path.split('/')[2];
      const unreadOnly = url.searchParams.get('unread') === 'true';
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      return await getUserNotifications(supabase, userId, { unreadOnly, limit, offset });
    }

    // Route: PUT /notifications/:id/read - Marquer une notification comme lue
    if (req.method === 'PUT' && path.includes('/read')) {
      const notificationId = path.split('/')[2];
      return await markNotificationAsRead(supabase, notificationId);
    }

    // Route: DELETE /notifications/:id - Supprimer une notification
    if (req.method === 'DELETE' && path.startsWith('/notifications/')) {
      const notificationId = path.split('/')[2];
      return await deleteNotification(supabase, notificationId);
    }

    // Route: POST /notifications/cleanup - Nettoyer les anciennes notifications
    if (req.method === 'POST' && path === '/notifications/cleanup') {
      return await cleanupOldNotifications(supabase);
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404
    });

  } catch (error) {
    console.error('Notifications function error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message,
      message: 'Notifications function failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// Fonction pour créer une notification simple
async function handleSingleNotification(supabase: any, request: NotificationRequest) {
  const {
    userId,
    type,
    title,
    message,
    priority = 'medium',
    actionUrl,
    metadata,
    sendPush = false,
    sendEmail = false
  } = request;

  if (!userId || !type || !title || !message) {
    throw new Error('userId, type, title, and message are required');
  }

  // 1. Créer la notification dans la base de données
  const { data: notification, error: dbError } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      priority,
      action_url: actionUrl,
      metadata,
      read: false
    })
    .select()
    .single();

  if (dbError) {
    throw new Error(`Failed to create notification: ${dbError.message}`);
  }

  // 2. Récupérer les préférences utilisateur
  const { data: preferences } = await supabase
    .from('auto_application_settings')
    .select('notification_preferences')
    .eq('user_id', userId)
    .single();

  const userPrefs = preferences?.notification_preferences || {};

  // 3. Envoyer notification push si activée
  if (sendPush && userPrefs.push !== false) {
    try {
      await sendPushNotification(userId, { title, message, actionUrl });
    } catch (pushError) {
      console.error('Push notification failed:', pushError);
    }
  }

  // 4. Envoyer notification email si activée
  if (sendEmail && userPrefs.email !== false) {
    try {
      await sendEmailNotification(userId, { title, message, actionUrl });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    data: notification,
    message: 'Notification created successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

// Fonction pour créer des notifications en masse
async function handleBulkNotification(supabase: any, request: BulkNotificationRequest) {
  const {
    userIds,
    type,
    title,
    message,
    priority = 'medium',
    actionUrl,
    metadata
  } = request;

  if (!userIds || userIds.length === 0 || !type || !title || !message) {
    throw new Error('userIds, type, title, and message are required');
  }

  // Créer les notifications pour tous les utilisateurs
  const notificationsToInsert = userIds.map(userId => ({
    user_id: userId,
    type,
    title,
    message,
    priority,
    action_url: actionUrl,
    metadata,
    read: false
  }));

  const { data: notifications, error: dbError } = await supabase
    .from('notifications')
    .insert(notificationsToInsert)
    .select();

  if (dbError) {
    throw new Error(`Failed to create bulk notifications: ${dbError.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    data: notifications,
    message: `${notifications.length} notifications created successfully`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

// Fonction pour récupérer les notifications d'un utilisateur
async function getUserNotifications(
  supabase: any,
  userId: string,
  options: { unreadOnly: boolean; limit: number; offset: number }
) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(options.limit)
    .range(options.offset, options.offset + options.limit - 1);

  if (options.unreadOnly) {
    query = query.eq('read', false);
  }

  const { data: notifications, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  // Compter le nombre total de notifications non lues
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  return new Response(JSON.stringify({
    success: true,
    data: {
      notifications,
      unreadCount: unreadCount || 0,
      hasMore: notifications.length === options.limit
    },
    message: 'Notifications retrieved successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

// Fonction pour marquer une notification comme lue
async function markNotificationAsRead(supabase: any, notificationId: string) {
  const { data: notification, error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    data: notification,
    message: 'Notification marked as read'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

// Fonction pour supprimer une notification
async function deleteNotification(supabase: any, notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    throw new Error(`Failed to delete notification: ${error.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Notification deleted successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

// Fonction pour nettoyer les anciennes notifications
async function cleanupOldNotifications(supabase: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: deletedNotifications, error } = await supabase
    .from('notifications')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString())
    .eq('read', true)
    .select('id');

  if (error) {
    throw new Error(`Failed to cleanup notifications: ${error.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    data: { deletedCount: deletedNotifications?.length || 0 },
    message: 'Old notifications cleaned up successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

// Fonction pour envoyer une notification push
async function sendPushNotification(userId: string, notification: { title: string; message: string; actionUrl?: string }) {
  // Implémentation de la notification push
  // Ceci nécessiterait l'intégration avec un service comme Firebase Cloud Messaging
  console.log(`Sending push notification to user ${userId}:`, notification);
  
  // Placeholder pour l'implémentation réelle
  const pushServiceUrl = Deno.env.get('PUSH_SERVICE_URL');
  if (pushServiceUrl) {
    await fetch(pushServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: notification.title,
        body: notification.message,
        data: { actionUrl: notification.actionUrl }
      })
    });
  }
}

// Fonction pour envoyer une notification email
async function sendEmailNotification(userId: string, notification: { title: string; message: string; actionUrl?: string }) {
  // Implémentation de la notification email
  console.log(`Sending email notification to user ${userId}:`, notification);
  
  // Placeholder pour l'implémentation réelle
  const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL');
  if (emailServiceUrl) {
    await fetch(emailServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subject: notification.title,
        body: notification.message,
        actionUrl: notification.actionUrl
      })
    });
  }
} 