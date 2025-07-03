
-- Triggers pour les notifications automatiques

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  notification_priority TEXT DEFAULT 'medium',
  notification_action_url TEXT DEFAULT NULL,
  notification_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    priority,
    action_url,
    metadata,
    read,
    created_at
  ) VALUES (
    gen_random_uuid(),
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_priority,
    notification_action_url,
    notification_metadata,
    false,
    now()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour notifications d'applications
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notification quand le statut d'une candidature change
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM create_notification(
      NEW.user_id,
      'application',
      'Mise à jour de candidature',
      'Le statut de votre candidature a changé : ' || NEW.status,
      CASE 
        WHEN NEW.status IN ('accepté', 'entretien') THEN 'high'
        WHEN NEW.status = 'refusé' THEN 'medium'
        ELSE 'low'
      END,
      '/applications/' || NEW.id::text
    );
  END IF;
  
  -- Notification pour nouvelle candidature
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      NEW.user_id,
      'application',
      'Candidature envoyée',
      'Votre candidature a été envoyée avec succès',
      'medium',
      '/applications/' || NEW.id::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour notifications de nouveaux jobs
CREATE OR REPLACE FUNCTION notify_new_job_match()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
  job_skills TEXT[];
  user_skills TEXT[];
  match_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Extraire les compétences du job
    job_skills := ARRAY(SELECT jsonb_array_elements_text(NEW.requirements));
    
    -- Trouver les utilisateurs avec des compétences correspondantes
    FOR user_record IN 
      SELECT DISTINCT up.id, up.first_name, up.last_name
      FROM user_profiles up
      JOIN skills s ON s.user_id = up.id
      WHERE s.name = ANY(job_skills)
    LOOP
      -- Compter les compétences correspondantes
      SELECT COUNT(*) INTO match_count
      FROM skills s
      WHERE s.user_id = user_record.id
      AND s.name = ANY(job_skills);
      
      -- Notifier si au moins 2 compétences correspondent
      IF match_count >= 2 THEN
        PERFORM create_notification(
          user_record.id,
          'job',
          'Nouvelle opportunité correspondante',
          'Un nouveau poste "' || NEW.title || '" chez ' || NEW.company || ' correspond à votre profil (' || match_count || ' compétences)',
          'medium',
          '/jobs/' || NEW.id::text,
          jsonb_build_object('match_score', match_count, 'job_id', NEW.id)
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour rappels d'entretiens
CREATE OR REPLACE FUNCTION notify_interview_reminder()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.interview_date IS NOT NULL AND OLD.interview_date IS DISTINCT FROM NEW.interview_date THEN
    -- Notification immédiate
    PERFORM create_notification(
      NEW.user_id,
      'interview',
      'Entretien programmé',
      'Votre entretien est programmé le ' || to_char(NEW.interview_date, 'DD/MM/YYYY à HH24:MI'),
      'high',
      '/applications/' || NEW.id::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
DROP TRIGGER IF EXISTS application_status_notification ON applications;
CREATE TRIGGER application_status_notification
  AFTER INSERT OR UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();

DROP TRIGGER IF EXISTS new_job_notification ON jobs;
CREATE TRIGGER new_job_notification
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_job_match();

DROP TRIGGER IF EXISTS interview_reminder_notification ON applications;
CREATE TRIGGER interview_reminder_notification
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_interview_reminder();

-- Fonction pour marquer une notification comme lue
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications 
  SET read = true, read_at = now()
  WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql;
