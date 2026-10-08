-- Messaging upgrade: favorites / archive per member, richer conversation metadata.
ALTER TABLE public.conversation_members
  ADD COLUMN IF NOT EXISTS favorited boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS last_message_preview text,
  ADD COLUMN IF NOT EXISTS last_message_at timestamptz;

-- Keep last_message_at in sync on message insert.
CREATE OR REPLACE FUNCTION public.touch_conversation_last_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        last_message_preview = left(NEW.body, 120),
        updated_at = now()
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_touch_last_message ON public.messages;
CREATE TRIGGER messages_touch_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_last_message();

GRANT SELECT, UPDATE ON public.conversations TO authenticated;
