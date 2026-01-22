-- Fix 1: Restrict profiles SELECT policy to own profile only (prevents email harvesting)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Fix 2: Update has_role function to only allow checking own roles (prevent information disclosure)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow checking own roles to prevent information disclosure about other users
  SELECT CASE 
    WHEN _user_id = auth.uid() THEN 
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
    ELSE FALSE
  END;
$$;