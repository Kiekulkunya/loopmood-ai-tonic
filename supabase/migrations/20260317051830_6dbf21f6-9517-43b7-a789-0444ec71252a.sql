
-- Customer reviews table
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Anonymous',
  avatar_url TEXT,
  feature_id TEXT NOT NULL DEFAULT 'classifier',
  rating INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  review_text TEXT NOT NULL,
  enhanced_text TEXT,
  sentiment TEXT DEFAULT 'neutral',
  user_role TEXT DEFAULT 'User',
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  ai_enhanced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Reviews are publicly readable" ON public.customer_reviews
  FOR SELECT USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.customer_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews" ON public.customer_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Feedback survey responses table
CREATE TABLE IF NOT EXISTS public.feedback_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  feature_rankings JSONB,
  satisfaction INTEGER,
  nps_score INTEGER,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feedback_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own surveys" ON public.feedback_surveys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Surveys are publicly readable" ON public.feedback_surveys
  FOR SELECT USING (true);
