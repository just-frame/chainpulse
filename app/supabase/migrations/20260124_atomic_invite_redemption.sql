-- Atomic invite code redemption function
-- Prevents race condition by doing check and update in single atomic operation

CREATE OR REPLACE FUNCTION public.redeem_invite_code(code_input TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  normalized_code TEXT;
  updated_row RECORD;
BEGIN
  -- Normalize the code (uppercase, remove dashes/spaces)
  normalized_code := UPPER(REGEXP_REPLACE(code_input, '[-\s]', '', 'g'));

  -- Atomic update: only succeeds if code exists AND has uses remaining
  UPDATE invite_codes
  SET
    current_uses = current_uses + 1,
    used_at = NOW()
  WHERE
    code = normalized_code
    AND current_uses < max_uses
  RETURNING id, code, current_uses, max_uses INTO updated_row;

  -- Build result based on whether update succeeded
  IF updated_row.id IS NOT NULL THEN
    result := json_build_object(
      'success', true,
      'code', updated_row.code,
      'uses_remaining', updated_row.max_uses - updated_row.current_uses
    );
  ELSE
    -- Check if code exists but is exhausted vs doesn't exist
    IF EXISTS (SELECT 1 FROM invite_codes WHERE code = normalized_code) THEN
      result := json_build_object(
        'success', false,
        'error', 'Code has been fully redeemed'
      );
    ELSE
      result := json_build_object(
        'success', false,
        'error', 'Invalid invite code'
      );
    END IF;
  END IF;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.redeem_invite_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_invite_code(TEXT) TO anon;

-- Add a comment for documentation
COMMENT ON FUNCTION public.redeem_invite_code IS 'Atomically redeems an invite code, preventing race conditions. Returns JSON with success status.';
