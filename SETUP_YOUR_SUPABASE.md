-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  video_type text NOT NULL CHECK (video_type = ANY (ARRAY['little_people'::text, 'explainer'::text, 'product_demo'::text, 'tutorial'::text, 'marketing'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'paused'::text, 'cancelled'::text])),
  budget_usd numeric,
  deadline date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_projects_pkey PRIMARY KEY (id),
  CONSTRAINT admin_projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.admin_settings (
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_settings_pkey PRIMARY KEY (setting_key)
);
CREATE TABLE public.ai_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  prompt_template text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_prompts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bunny_storage_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  video_id uuid,
  project_id uuid NOT NULL,
  file_type text NOT NULL CHECK (file_type = ANY (ARRAY['video'::text, 'audio'::text, 'image'::text, 'json'::text, 'zip'::text])),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size_bytes bigint,
  mime_type text,
  bunny_url text NOT NULL,
  storage_cost_usd numeric DEFAULT 0.0000,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bunny_storage_files_pkey PRIMARY KEY (id),
  CONSTRAINT bunny_storage_files_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id),
  CONSTRAINT bunny_storage_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  company text,
  phone text,
  address text,
  notes text,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'paused'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cost_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  project_id uuid NOT NULL,
  service_type text NOT NULL CHECK (service_type = ANY (ARRAY['openai'::text, 'elevenlabs'::text, 'image_generation'::text, 'video_generation'::text, 'storage'::text, 'processing'::text, 'other'::text])),
  service_provider text NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL,
  unit_cost_usd numeric NOT NULL,
  total_cost_usd numeric NOT NULL,
  raw_usage_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cost_entries_pkey PRIMARY KEY (id),
  CONSTRAINT cost_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT cost_entries_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type USER-DEFINED NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  balance_after integer NOT NULL DEFAULT 0,
  CONSTRAINT credit_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.credits (
  user_id uuid NOT NULL,
  balance integer DEFAULT 0 CHECK (balance >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT credits_pkey PRIMARY KEY (user_id),
  CONSTRAINT credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  project_id uuid,
  amount_usd numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['bank_transfer'::text, 'paypal'::text, 'stripe'::text, 'check'::text, 'cash'::text, 'other'::text])),
  payment_reference text,
  description text,
  payment_date date NOT NULL,
  status text NOT NULL DEFAULT 'received'::text CHECK (status = ANY (ARRAY['pending'::text, 'received'::text, 'refunded'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT payments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.project_ideas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  video_description text NOT NULL,
  status text NOT NULL DEFAULT 'generated'::text CHECK (status = ANY (ARRAY['generated'::text, 'selected'::text, 'in_production'::text, 'completed'::text, 'rejected'::text])),
  generated_scenes jsonb,
  generated_prompts jsonb,
  generated_assets jsonb,
  credits_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  visual_style_prompt text,
  background_music_prompt text,
  CONSTRAINT project_ideas_pkey PRIMARY KEY (id),
  CONSTRAINT project_ideas_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.admin_projects(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  topic text NOT NULL,
  keywords text NOT NULL,
  orientation text NOT NULL CHECK (orientation = ANY (ARRAY['vertical'::text, 'horizontal'::text])),
  video_type text NOT NULL CHECK (video_type = ANY (ARRAY['short'::text, 'full'::text])),
  target_platform ARRAY NOT NULL DEFAULT '{}'::text[],
  video_provider text NOT NULL DEFAULT 'kling'::text CHECK (video_provider = ANY (ARRAY['kling'::text, 'skyreels'::text])),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'in_progress'::text, 'completed'::text, 'paused'::text, 'cancelled'::text])),
  total_videos_requested integer DEFAULT 0,
  videos_completed integer DEFAULT 0,
  total_cost_usd numeric DEFAULT 0.00,
  estimated_cost_usd numeric DEFAULT 0.00,
  bunny_storage_path text,
  openai_previous_ideas jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  style jsonb NOT NULL,
  transitions jsonb DEFAULT '{}'::jsonb,
  preview_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  user_id uuid NOT NULL,
  preferences jsonb DEFAULT '{}'::jsonb,
  timezone text DEFAULT 'UTC'::text,
  language text DEFAULT 'en'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  country text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.video_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  order_index integer,
  duration_seconds real,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_assets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.video_generation_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  api_endpoint text NOT NULL,
  pricing_model jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_generation_providers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.video_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  idea_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'queued'::text CHECK (status = ANY (ARRAY['queued'::text, 'generating_scenes'::text, 'generating_prompts'::text, 'generating_images'::text, 'generating_videos'::text, 'completed'::text, 'failed'::text])),
  scene_breakdown jsonb,
  detailed_prompts jsonb,
  generated_images jsonb,
  generated_videos jsonb,
  final_video_url text,
  error_message text,
  credits_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_generations_pkey PRIMARY KEY (id),
  CONSTRAINT video_generations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.admin_projects(id),
  CONSTRAINT video_generations_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.project_ideas(id)
);
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  transcript text,
  status text NOT NULL DEFAULT 'queued'::text CHECK (status = ANY (ARRAY['queued'::text, 'generating_content'::text, 'generating_media'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  video_provider text NOT NULL DEFAULT 'kling'::text CHECK (video_provider = ANY (ARRAY['kling'::text, 'skyreels'::text])),
  orientation text NOT NULL CHECK (orientation = ANY (ARRAY['vertical'::text, 'horizontal'::text])),
  duration_seconds integer,
  slide_count integer,
  openai_prompt_sent text,
  openai_response jsonb,
  image_prompts ARRAY,
  text_overlays ARRAY,
  voiceover_url text,
  background_images_urls ARRAY,
  background_videos_urls ARRAY,
  final_video_url text,
  openai_cost_usd numeric DEFAULT 0.0000,
  elevenlabs_cost_usd numeric DEFAULT 0.0000,
  image_generation_cost_usd numeric DEFAULT 0.0000,
  video_generation_cost_usd numeric DEFAULT 0.0000,
  total_cost_usd numeric DEFAULT 0.0000,
  openai_usage_data jsonb,
  elevenlabs_usage_data jsonb,
  image_generation_usage_data jsonb,
  video_generation_usage_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT videos_pkey PRIMARY KEY (id),
  CONSTRAINT videos_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);