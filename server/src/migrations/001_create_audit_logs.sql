-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Authentication','User Management','Inventory','Orders')),
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs (category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON public.audit_logs (user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON public.audit_logs (success);
