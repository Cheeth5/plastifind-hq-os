
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','engineering','business','mentor','viewer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  title TEXT,
  locale TEXT NOT NULL DEFAULT 'fr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles self write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'admin',
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles read" ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- COMPANY
CREATE TABLE public.company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL DEFAULT 'PlastiFind',
  commercial_name TEXT NOT NULL DEFAULT 'PlastiFind',
  tagline TEXT,
  logo_url TEXT,
  cover_url TEXT,
  status TEXT DEFAULT 'En création',
  creation_date DATE,
  legal_structure TEXT,
  siren TEXT, siret TEXT,
  address TEXT, website TEXT, email TEXT, phone TEXT,
  linkedin TEXT, instagram TEXT, github TEXT,
  mission TEXT, vision TEXT, founder_story TEXT,
  goals_1y TEXT, goals_3y TEXT, goals_5y TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, code_name TEXT, category TEXT, status TEXT DEFAULT 'En développement',
  description TEXT, target_users TEXT, owner TEXT, stage TEXT,
  progress INT NOT NULL DEFAULT 0, estimated_cost NUMERIC DEFAULT 0, target_price NUMERIC DEFAULT 0,
  expected_launch DATE, image_url TEXT, privacy_note TEXT,
  progress_detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, objective TEXT, product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  owner TEXT, status TEXT NOT NULL DEFAULT 'Planifié', priority TEXT NOT NULL DEFAULT 'Moyenne',
  start_date DATE, target_date DATE, progress INT NOT NULL DEFAULT 0, budget NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT,
  status TEXT NOT NULL DEFAULT 'À faire', priority TEXT NOT NULL DEFAULT 'Moyenne',
  deadline DATE, assignee TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  category TEXT, estimated_effort NUMERIC, actual_effort NUMERIC, notes TEXT,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Entreprise', horizon TEXT DEFAULT '90 jours',
  date DATE, status TEXT NOT NULL DEFAULT 'Planifié', progress INT NOT NULL DEFAULT 0,
  owner TEXT, dependencies TEXT, evidence TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, type TEXT, city TEXT, country TEXT DEFAULT 'France', website TEXT,
  relevance TEXT, relationship TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL, organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  organization_name TEXT, role TEXT, email TEXT, phone TEXT, linkedin TEXT,
  category TEXT, stage TEXT NOT NULL DEFAULT 'Identifié',
  last_interaction DATE, next_action TEXT, owner TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.funding_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL, organization TEXT, type TEXT NOT NULL DEFAULT 'Subvention',
  amount NUMERIC DEFAULT 0, min_amount NUMERIC, max_amount NUMERIC,
  repayment_required BOOLEAN DEFAULT false, equity_required BOOLEAN DEFAULT false,
  deadline DATE, eligibility TEXT, company_required BOOLEAN DEFAULT false, prototype_required BOOLEAN DEFAULT false,
  region TEXT, link TEXT, status TEXT NOT NULL DEFAULT 'Recherche', probability INT DEFAULT 0,
  next_action TEXT, owner TEXT, notes TEXT,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE, category TEXT NOT NULL DEFAULT 'Composants',
  supplier TEXT, description TEXT, amount NUMERIC NOT NULL DEFAULT 0, tax NUMERIC DEFAULT 0,
  payment_method TEXT, project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  receipt_url TEXT, reimbursable BOOLEAN DEFAULT false, status TEXT DEFAULT 'Payé',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, planned NUMERIC DEFAULT 0, actual NUMERIC DEFAULT 0,
  funding_source TEXT, period TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, date TIMESTAMPTZ NOT NULL DEFAULT now(), organization TEXT,
  participants TEXT, type TEXT DEFAULT 'Mentor', objective TEXT, agenda TEXT, notes TEXT,
  decisions TEXT, next_meeting DATE, preparation_status TEXT DEFAULT 'À préparer',
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  action TEXT NOT NULL, owner TEXT, due_date DATE, done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Autre', version TEXT DEFAULT 'v1',
  status TEXT DEFAULT 'Brouillon', owner TEXT, confidentiality TEXT NOT NULL DEFAULT 'Interne',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  file_url TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, category TEXT, date DATE, description TEXT, usage_rights TEXT,
  source TEXT, tags TEXT[], product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  file_url TEXT, is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.engineering_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  discipline TEXT NOT NULL DEFAULT 'Mécanique', doc_type TEXT NOT NULL DEFAULT 'Spécification',
  status TEXT NOT NULL DEFAULT 'Brouillon', author TEXT, version TEXT DEFAULT 'v1',
  related_component TEXT, related_requirement TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  notes TEXT, decision TEXT, file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT NOT NULL, title TEXT NOT NULL, category TEXT, description TEXT,
  priority TEXT DEFAULT 'Haute', source TEXT, verification TEXT, status TEXT DEFAULT 'Proposée',
  related_component TEXT, version TEXT DEFAULT 'V2',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, category TEXT, supplier TEXT, reference TEXT,
  quantity INT NOT NULL DEFAULT 1, unit_price NUMERIC NOT NULL DEFAULT 0,
  weight NUMERIC, power_consumption NUMERIC, availability TEXT, lead_time TEXT,
  status TEXT DEFAULT 'À commander', alternative TEXT, datasheet_url TEXT, version TEXT DEFAULT 'V2',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT, title TEXT NOT NULL, product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  version TEXT, requirement_ref TEXT, environment TEXT, procedure TEXT,
  expected_result TEXT, actual_result TEXT, status TEXT DEFAULT 'Planifié',
  date DATE, evidence TEXT, responsible TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, category TEXT, probability INT NOT NULL DEFAULT 3, impact INT NOT NULL DEFAULT 3,
  mitigation TEXT, owner TEXT, status TEXT DEFAULT 'Ouvert', review_date DATE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, date DATE DEFAULT CURRENT_DATE, context TEXT, alternatives TEXT,
  chosen TEXT, rationale TEXT, consequences TEXT, owner TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, date DATE, category TEXT, event TEXT, location TEXT,
  result TEXT, description TEXT, evidence TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.research_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, category TEXT, source TEXT, link TEXT, summary TEXT,
  key_insight TEXT, relevance TEXT DEFAULT 'Moyenne', tags TEXT[], author TEXT,
  date DATE DEFAULT CURRENT_DATE, file_url TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, role TEXT, department TEXT, email TEXT, phone TEXT,
  status TEXT DEFAULT 'Actif', start_date DATE, skills TEXT, availability TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.job_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, department TEXT, status TEXT NOT NULL DEFAULT 'Poste prévu',
  candidate TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, organization TEXT, category TEXT, location TEXT, date DATE,
  registration_deadline DATE, eligibility TEXT, cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Identifiée', team TEXT, robot TEXT, objectives TEXT, result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.university_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'Cours', course TEXT, date DATE,
  status TEXT DEFAULT 'À venir', hours NUMERIC DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, platform TEXT DEFAULT 'LinkedIn', format TEXT, date DATE,
  status TEXT DEFAULT 'Idée', objective TEXT, caption TEXT, link TEXT, metrics TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.legal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'Création', status TEXT NOT NULL DEFAULT 'À faire',
  owner TEXT, due_date DATE, notes TEXT, sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.business_canvas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas TEXT NOT NULL, section TEXT NOT NULL, content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL, country TEXT, product TEXT, segment TEXT, technology TEXT,
  price TEXT, strengths TEXT, weaknesses TEXT, website TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, body TEXT, kind TEXT DEFAULT 'info', link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT, action TEXT NOT NULL, entity TEXT, entity_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grants, RLS + workspace policies + updated_at triggers for all workspace tables
DO $$
DECLARE t TEXT;
DECLARE tbls TEXT[] := ARRAY['company','products','projects','tasks','milestones','organizations','contacts',
  'funding_opportunities','expenses','budgets','meetings','meeting_actions','documents','media_assets',
  'engineering_records','requirements','components','tests','risks','decisions','achievements','research_notes',
  'team_members','job_roles','competitions','university_items','marketing_posts','legal_items','business_canvas',
  'competitors','notifications','activity_log'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "workspace members full access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE TRIGGER touch_%s BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t, t);
  END LOOP;
END $$;

CREATE TRIGGER touch_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ SEED ============
INSERT INTO public.company (legal_name, commercial_name, tagline, status, legal_structure, siren, siret, address, website, email, phone, linkedin, instagram, github, mission, vision, founder_story, goals_1y, goals_3y, goals_5y)
VALUES ('PlastiFind SAS (en cours)','PlastiFind','Finding waste. Protecting nature.','En création','SAS (à confirmer)','En attente','En attente','Brest, Bretagne, France','plastifind.com','contact@plastifind.com','+33 (à définir)','linkedin.com/company/plastifind','instagram.com/plastifind','github.com/plastifind',
'Développer des solutions robotiques autonomes utilisant l''intelligence artificielle pour protéger l''environnement et améliorer la gestion des espaces publics.',
'Faire de PlastiFind une entreprise européenne de référence dans la robotique environnementale et les solutions autonomes pour les villes intelligentes.',
'Après plusieurs années de compétitions robotiques (Eurobot 2023 et 2024, Forum DSI 10e édition), le premier prototype Labi-Bot a remporté la première place au Robofest Tunisie 2025 puis la deuxième place internationale au Robofest de Michigan, États-Unis. Ce premier prototype a ensuite été vendu. Installé en France et étudiant à l''UBO, l''objectif est désormais de créer PlastiFind à Brest et de développer la nouvelle génération de Labi-Bot.',
'Créer juridiquement PlastiFind, finaliser le dossier de financement et livrer le prototype Labi-Bot V2.',
'Déployer Labi-Bot chez 10 collectivités pilotes et industrialiser la production.',
'Devenir la référence européenne de la robotique environnementale pour les villes intelligentes.');

INSERT INTO public.products (id, name, code_name, category, status, description, target_users, owner, stage, progress, estimated_cost, target_price, expected_launch, privacy_note, progress_detail)
VALUES ('11111111-1111-1111-1111-111111111111','Labi-Bot','LB-V2','Robot environnemental autonome','En développement',
'Robot environnemental autonome utilisant l''IA, la vision par ordinateur et la robotique pour détecter et collecter les déchets, surveiller les incivilités et fournir des données environnementales via un tableau de bord privé.',
'Municipalités, autorités littorales, gestionnaires de plages, resorts et hôtels, sociétés de nettoyage, ONG environnementales, universités, programmes smart-city, sites industriels.',
'Cheith','Preuve de concept validée / préparation V2',34,8500,24000,'2026-09-30',
'Le mode surveillance doit être conçu dans le respect du RGPD, des principes de privacy-by-design et des règles applicables à la captation d''images dans l''espace public : traitement local, rétention limitée, accès contrôlé et revue humaine.',
'{"mecanique":45,"electronique":30,"embarque":25,"ia_vision":55,"navigation":20,"dashboard":40,"tests":10,"industrialisation":5}'::jsonb);

INSERT INTO public.projects (id, name, objective, product_id, owner, status, priority, start_date, target_date, progress, budget) VALUES
('22222222-0000-0000-0000-000000000001','Création de la société PlastiFind','Créer juridiquement PlastiFind en France',NULL,'Cheith','En cours','Critique','2026-06-01','2026-11-30',35,1200),
('22222222-0000-0000-0000-000000000002','Candidature SNEE','Obtenir le Statut National Étudiant-Entrepreneur',NULL,'Cheith','En cours','Critique','2026-06-15','2026-09-15',70,0),
('22222222-0000-0000-0000-000000000003','Spécification Labi-Bot V2','Rédiger la spécification technique complète de la V2','11111111-1111-1111-1111-111111111111','Cheith','En cours','Haute','2026-07-01','2026-10-15',40,0),
('22222222-0000-0000-0000-000000000004','Dossier de financement','Constituer le dossier complet de financement',NULL,'Cheith','En cours','Critique','2026-07-10','2026-10-31',25,0),
('22222222-0000-0000-0000-000000000005','Site web PlastiFind','Créer le site vitrine et le nom de domaine',NULL,'Cheith','Planifié','Moyenne','2026-08-01','2026-10-01',10,300),
('22222222-0000-0000-0000-000000000006','Pitch deck','Construire le pitch deck investisseurs et jurys',NULL,'Cheith','En cours','Haute','2026-07-05','2026-09-20',45,0),
('22222222-0000-0000-0000-000000000007','Business plan','Rédiger le business plan sur 3 ans',NULL,'Cheith','En cours','Haute','2026-07-05','2026-10-10',30,0),
('22222222-0000-0000-0000-000000000008','Découverte client','Interviewer 20 collectivités et gestionnaires de plages',NULL,'Cheith','Planifié','Haute','2026-08-15','2026-12-15',5,0),
('22222222-0000-0000-0000-000000000009','Vérification juridique et immigration','Valider la compatibilité du titre de séjour avec la création d''entreprise',NULL,'Cheith','En cours','Critique','2026-06-20','2026-09-01',60,0),
('22222222-0000-0000-0000-00000000000a','Lancement de marque','Finaliser identité, logo, charte et réseaux sociaux',NULL,'Cheith','En cours','Moyenne','2026-07-01','2026-09-30',55,150),
('22222222-0000-0000-0000-00000000000b','Développement prototype V2','Concevoir et assembler le prototype Labi-Bot V2','11111111-1111-1111-1111-111111111111','Cheith','Planifié','Haute','2026-11-01','2027-06-30',5,8500),
('22222222-0000-0000-0000-00000000000c','Acquisition clients pilotes','Signer 2 projets pilotes avec des collectivités',NULL,'Cheith','Idée','Moyenne','2027-01-01','2027-09-30',0,0);

INSERT INTO public.tasks (name, description, status, priority, deadline, assignee, project_id, product_id, category, estimated_effort) VALUES
('Finaliser le pitch deck V1','Structurer 12 slides : problème, solution, marché, traction, équipe, financement.','En cours','Critique','2026-08-20','Cheith','22222222-0000-0000-0000-000000000006',NULL,'Business',12),
('Rédiger le business plan financier','Prévisionnel 3 ans, hypothèses de vente et de coûts.','À faire','Haute','2026-09-10','Cheith','22222222-0000-0000-0000-000000000007',NULL,'Finance',16),
('Compléter le dossier de financement','Rassembler CV, preuves de prix, attestation de vente du prototype.','En cours','Critique','2026-08-31','Cheith','22222222-0000-0000-0000-000000000004',NULL,'Financement',10),
('Préparer l''entretien du comité SNEE','Préparer la présentation de 10 minutes et les questions du jury.','En cours','Critique','2026-08-12','Cheith','22222222-0000-0000-0000-000000000002',NULL,'Université',6),
('Choisir la structure juridique','Comparer SAS, SASU et micro-entreprise avec Pépite.','À faire','Haute','2026-09-05','Cheith','22222222-0000-0000-0000-000000000001',NULL,'Juridique',4),
('Spécifier le système de collecte V2','Définir le mécanisme de préhension et le bac de stockage.','À faire','Haute','2026-09-30','Cheith','22222222-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Mécanique',20),
('Benchmark modèles YOLO pour déchets','Comparer YOLOv8n / YOLOv11 sur dataset plage.','En cours','Haute','2026-09-15','Cheith','22222222-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','IA & Vision',14),
('Réserver le nom de domaine plastifind.com','Vérifier la disponibilité et réserver le domaine.','À faire','Moyenne','2026-08-25','Cheith','22222222-0000-0000-0000-000000000005',NULL,'Marketing',1),
('Lister 15 communes littorales bretonnes','Identifier les contacts services techniques et environnement.','À faire','Moyenne','2026-09-20','Cheith','22222222-0000-0000-0000-000000000008',NULL,'CRM',8),
('Estimer le budget prototype V2','Construire la BOM chiffrée complète.','En cours','Haute','2026-09-25','Cheith','22222222-0000-0000-0000-00000000000b','11111111-1111-1111-1111-111111111111','Finance',6),
('Rédiger la note RGPD du mode surveillance','Base légale, minimisation, rétention, revue humaine.','À faire','Critique','2026-10-05','Cheith','22222222-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Juridique',8),
('Finaliser la charte graphique PlastiFind','Logo, couleurs, typographies, templates réseaux sociaux.','Revue','Moyenne','2026-08-18','Cheith','22222222-0000-0000-0000-00000000000a',NULL,'Marketing',5),
('Vérifier la compatibilité du titre de séjour','Confirmer auprès de la préfecture et de Pépite.','En cours','Critique','2026-08-29','Cheith','22222222-0000-0000-0000-000000000009',NULL,'Juridique',3),
('Concevoir le châssis tout-terrain sable','CAO du châssis et sélection des roues.','Backlog','Haute','2026-11-15','Cheith','22222222-0000-0000-0000-00000000000b','11111111-1111-1111-1111-111111111111','Mécanique',30),
('Publier le premier post LinkedIn PlastiFind','Annoncer la création du projet et le palmarès Robofest.','À faire','Basse','2026-09-01','Cheith','22222222-0000-0000-0000-00000000000a',NULL,'Marketing',2),
('Rédiger le résumé exécutif (1 page)','Version FR et EN pour les dossiers de financement.','Terminé','Haute','2026-07-30','Cheith','22222222-0000-0000-0000-000000000004',NULL,'Business',4);

INSERT INTO public.milestones (title, category, horizon, date, status, progress, owner) VALUES
('Entretien du comité SNEE','Université','30 jours','2026-08-14','En cours',70,'Cheith'),
('Finaliser l''identité PlastiFind','Marketing','30 jours','2026-08-22','En cours',55,'Cheith'),
('Valider le parcours juridique de création','Juridique','30 jours','2026-08-29','En cours',60,'Cheith'),
('Choisir la structure juridique','Juridique','90 jours','2026-09-05','Planifié',10,'Cheith'),
('Business plan terminé','Entreprise','90 jours','2026-10-10','En cours',30,'Cheith'),
('Pitch deck terminé','Entreprise','90 jours','2026-09-20','En cours',45,'Cheith'),
('Dossier de financement finalisé','Financement','90 jours','2026-10-31','En cours',25,'Cheith'),
('Site web en ligne','Marketing','90 jours','2026-10-01','Planifié',10,'Cheith'),
('Nom de domaine réservé','Marketing','30 jours','2026-08-25','Planifié',0,'Cheith'),
('Spécifications Labi-Bot V2 prêtes','Produit','90 jours','2026-10-15','En cours',40,'Cheith'),
('Budget prototype estimé','Financement','90 jours','2026-09-25','En cours',35,'Cheith'),
('Communes pilotes identifiées','Ventes','90 jours','2026-11-15','Planifié',5,'Cheith'),
('Première candidature de financement soumise','Financement','90 jours','2026-11-05','Planifié',0,'Cheith'),
('Création juridique de PlastiFind','Entreprise','12 mois','2026-12-15','Planifié',0,'Cheith'),
('Premiers contributeurs recrutés','Équipe','12 mois','2027-03-01','Planifié',0,'Cheith'),
('Démarrage du développement V2','Ingénierie','12 mois','2026-11-01','Planifié',0,'Cheith');

INSERT INTO public.organizations (name, type, city, country, website, relevance, relationship) VALUES
('Brest Métropole','Collectivité','Brest','France','brest.fr','Élevée','Prospect pilote'),
('Ville de Plougonvelin','Collectivité','Plougonvelin','France',NULL,'Élevée','Identifiée'),
('Conservatoire du littoral','Organisme public','Rochefort','France','conservatoire-du-littoral.fr','Moyenne','Identifiée'),
('Pépite Bretagne','Accompagnement','Rennes','France','pepite-bretagne.fr','Élevée','Partenaire'),
('Bpifrance','Financeur','Paris','France','bpifrance.fr','Élevée','Identifiée'),
('UBO - Université de Bretagne Occidentale','Université','Brest','France','univ-brest.fr','Élevée','Partenaire'),
('Région Bretagne','Collectivité','Rennes','France','bretagne.bzh','Élevée','Identifiée'),
('Technopôle Brest-Iroise','Incubateur','Brest','France','tech-brest-iroise.fr','Élevée','Contact planifié');

INSERT INTO public.contacts (full_name, organization_name, role, email, category, stage, next_action, owner) VALUES
('Responsable service propreté','Brest Métropole','Responsable propreté urbaine','contact@brest-metropole.fr','Client potentiel','Contact planifié','Envoyer une présentation Labi-Bot','Cheith'),
('Référent Pépite','Pépite Bretagne','Chargé d''accompagnement','contact@pepite-bretagne.fr','Mentor','Qualifié','Préparer l''entretien SNEE','Cheith'),
('Chargé d''innovation','Technopôle Brest-Iroise','Chargé d''innovation','innovation@tech-brest-iroise.fr','Incubateur','Contacté','Planifier un rendez-vous incubation','Cheith'),
('Conseiller Bpifrance','Bpifrance','Conseiller entreprises','contact@bpifrance.fr','Financeur','Identifié','Vérifier l''éligibilité Bourse French Tech','Cheith'),
('Directeur technique','Ville de Plougonvelin','Directeur des services techniques',NULL,'Client potentiel','Identifié','Identifier le bon interlocuteur','Cheith'),
('Enseignant-chercheur robotique','UBO - Université de Bretagne Occidentale','Enseignant-chercheur',NULL,'Université','Contacté','Discuter d''un partenariat de recherche','Cheith');

INSERT INTO public.funding_opportunities (program_name, organization, type, amount, deadline, status, probability, region, company_required, prototype_required, next_action, owner, eligibility) VALUES
('Bourse French Tech Émergence','Bpifrance','Subvention',30000,'2026-11-15','À préparer',45,'National',true,false,'Finaliser le business plan et le dossier technique','Cheith','Jeune entreprise innovante de moins d''un an'),
('Prix Pépite Tremplin','Ministère / Pépite','Prix de concours',10000,'2026-10-01','Éligible',55,'National',false,false,'Déposer le dossier étudiant-entrepreneur','Cheith','Étudiant-entrepreneur titulaire du SNEE'),
('Innov''Amorçage Bretagne','Région Bretagne','Subvention',50000,'2026-12-10','Recherche',30,'Bretagne',true,true,'Vérifier les critères d''éligibilité régionaux','Cheith','Entreprise implantée en Bretagne'),
('Aide au développement deeptech','Bpifrance','Prêt',80000,'2027-02-28','Recherche',20,'National',true,true,'Attendre la création de la société','Cheith','Société créée avec preuve de concept'),
('Green Tech Innovation','ADEME','Subvention',40000,'2026-11-30','Recherche',25,'National',true,false,'Étudier l''appel à projets','Cheith','Projet à impact environnemental mesurable'),
('Incubation Technopôle Brest-Iroise','Technopôle Brest-Iroise','Incubation',0,'2026-09-30','Éligible',60,'Bretagne',false,false,'Prendre rendez-vous avec le chargé d''innovation','Cheith','Projet innovant sur le territoire brestois');

INSERT INTO public.expenses (date, category, supplier, description, amount, payment_method, project_id) VALUES
('2026-07-04','Composants','Amazon','Caméra USB de test pour dataset déchets',89.90,'Carte','22222222-0000-0000-0000-000000000003'),
('2026-07-12','Abonnements','Figma','Abonnement design charte PlastiFind',15.00,'Carte','22222222-0000-0000-0000-00000000000a'),
('2026-07-18','Marketing','OVH','Réservation nom de domaine et hébergement',48.00,'Carte','22222222-0000-0000-0000-000000000005'),
('2026-07-25','Prototypage','Impression 3D locale','Impression de pièces de test du bac de collecte',62.50,'Virement','22222222-0000-0000-0000-00000000000b'),
('2026-08-02','Juridique','Greffe (provision)','Provision frais de création de société',250.00,'Virement','22222222-0000-0000-0000-000000000001'),
('2026-08-05','Déplacements','SNCF','Déplacement Brest - Rennes (Pépite)',54.00,'Carte','22222222-0000-0000-0000-000000000002');

INSERT INTO public.budgets (name, planned, actual, funding_source, period) VALUES
('Prototype Labi-Bot V2',8500,62.5,'Autofinancement + subventions','2026-2027'),
('Création de société',1200,250,'Autofinancement','2026'),
('Marketing et marque',600,63,'Autofinancement','2026');

INSERT INTO public.meetings (title, date, organization, participants, type, objective, agenda, preparation_status, notes) VALUES
('Entretien comité SNEE','2026-08-14 10:00:00+02','Pépite Bretagne','Cheith, jury Pépite','Université','Obtenir le Statut National Étudiant-Entrepreneur','Présentation du projet, questions du jury, plan de charge universitaire','En préparation','Préparer une démonstration vidéo du prototype primé au Robofest.'),
('Point mentor robotique','2026-08-21 14:00:00+02','UBO','Cheith, enseignant-chercheur','Mentor','Valider les choix techniques de la V2','Architecture, navigation sur sable, vision','À préparer',NULL),
('Rendez-vous incubation','2026-09-03 09:30:00+02','Technopôle Brest-Iroise','Cheith, chargé d''innovation','Technique','Évaluer une entrée en incubation','Présentation, besoins, calendrier','À préparer',NULL);

INSERT INTO public.documents (title, category, version, status, owner, confidentiality) VALUES
('Pitch deck PlastiFind','Pitch deck','v0.9','Brouillon','Cheith','Confidentiel'),
('Business plan PlastiFind 2026-2029','Business plan','v0.4','Brouillon','Cheith','Confidentiel'),
('Résumé exécutif Labi-Bot','Résumé exécutif','v1.0','Validé','Cheith','Interne'),
('Spécification technique Labi-Bot V2','Spécification produit','v0.3','Brouillon','Cheith','Restreint'),
('Attestation de vente du prototype V1','Certificats','v1.0','Validé','Cheith','Restreint'),
('Diplôme Robofest Tunisie 2025 - 1re place','Documents de concours','v1.0','Validé','Cheith','Interne');

INSERT INTO public.engineering_records (title, product_id, discipline, doc_type, status, author, version, notes) VALUES
('Architecture système Labi-Bot V2','11111111-1111-1111-1111-111111111111','Systèmes embarqués','Architecture','Brouillon','Cheith','v0.3','Jetson pour la vision, Arduino pour les actionneurs, bus série entre les deux.'),
('Choix du modèle de détection de déchets','11111111-1111-1111-1111-111111111111','IA et vision par ordinateur','Décision de conception','En revue','Cheith','v0.2','Comparaison YOLOv8n vs YOLOv11n en edge sur Jetson Orin Nano.'),
('Étude de mobilité sur sable','11111111-1111-1111-1111-111111111111','Conception mécanique','Expérimentation','Brouillon','Cheith','v0.1','Roues larges basse pression vs chenilles.'),
('Bilan énergétique V2','11111111-1111-1111-1111-111111111111','Systèmes d''alimentation','Spécification','Brouillon','Cheith','v0.1','Objectif : 3 h d''autonomie en mode nettoyage.'),
('Protocole de test du mode surveillance','11111111-1111-1111-1111-111111111111','Confidentialité','Rapport de test','Brouillon','Cheith','v0.1','Validation de la détection de geste d''abandon de déchet et de la revue humaine.');

INSERT INTO public.requirements (ref, title, category, description, priority, verification, status, product_id) VALUES
('ENV-001','Fonctionner sur sable sec et humide','Environnement','Le robot doit se déplacer sans enlisement sur sable sec et humide.','Critique','Test terrain','Validée','11111111-1111-1111-1111-111111111111'),
('NAV-001','Détecter les obstacles','Navigation','Détection et évitement des obstacles fixes et mobiles à 1,5 m.','Critique','Test terrain','En cours','11111111-1111-1111-1111-111111111111'),
('AI-001','Détecter les déchets cibles en temps réel','IA','Détection à au moins 10 FPS avec précision supérieure à 85 %.','Critique','Test dataset','En cours','11111111-1111-1111-1111-111111111111'),
('PWR-001','Autonomie minimale de fonctionnement','Alimentation','Au moins 3 heures d''autonomie en mode nettoyage.','Haute','Mesure banc','Proposée','11111111-1111-1111-1111-111111111111'),
('SAF-001','Arrêt d''urgence','Sécurité','Bouton d''arrêt d''urgence physique et coupure logicielle.','Critique','Inspection','Proposée','11111111-1111-1111-1111-111111111111'),
('WEB-001','Tableau de bord local sécurisé','Logiciel','Dashboard accessible en réseau local avec authentification.','Haute','Test logiciel','En cours','11111111-1111-1111-1111-111111111111'),
('PRIV-001','Accès restreint aux évènements de surveillance','Confidentialité','Accès aux images d''incivilité réservé aux personnes autorisées avec journal d''audit.','Critique','Revue','Proposée','11111111-1111-1111-1111-111111111111');

INSERT INTO public.components (name, category, supplier, reference, quantity, unit_price, status, product_id) VALUES
('NVIDIA Jetson Orin Nano','Calculateur','NVIDIA','Orin Nano 8 Go',1,499,'À commander','11111111-1111-1111-1111-111111111111'),
('Arduino Mega 2560','Contrôleur','Arduino','A000067',1,42,'À commander','11111111-1111-1111-1111-111111111111'),
('Moteur brushless 24 V','Moteurs','Générique','BLDC-24V-150W',4,68,'À commander','11111111-1111-1111-1111-111111111111'),
('Driver moteur double','Drivers','Cytron','MDDS30',2,89,'À commander','11111111-1111-1111-1111-111111111111'),
('Caméra RGB grand angle','Caméras','Arducam','IMX477',2,79,'À commander','11111111-1111-1111-1111-111111111111'),
('Capteur ultrason étanche','Capteurs','Maxbotix','MB7360',4,52,'À commander','11111111-1111-1111-1111-111111111111'),
('Batterie LiFePO4 24 V 20 Ah','Batteries','Générique','LFP-24-20',1,320,'À commander','11111111-1111-1111-1111-111111111111'),
('Roues larges tout-terrain','Roues','Générique','WHL-300',4,45,'À commander','11111111-1111-1111-1111-111111111111'),
('Servomoteur haute couple','Servos','Dynamixel','MX-64',3,240,'À commander','11111111-1111-1111-1111-111111111111'),
('Châssis aluminium sur mesure','Châssis','Atelier local','CHS-V2',1,650,'À étudier','11111111-1111-1111-1111-111111111111'),
('Régulateur DC-DC 24V/5V','Régulateurs','Générique','DCDC-245',2,28,'À commander','11111111-1111-1111-1111-111111111111'),
('Faisceau de câblage et connectique','Câblage','Générique','WIRE-KIT',1,120,'À commander','11111111-1111-1111-1111-111111111111');

INSERT INTO public.risks (title, category, probability, impact, mitigation, owner, status, product_id) VALUES
('Mauvaise adhérence sur sable','Mécanique',4,4,'Roues larges basse pression, tests terrain précoces','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Exposition à l''eau et au sel','Mécanique',4,5,'Indice IP65 minimum, joints et carters étanches','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Surchauffe des batteries','Alimentation',2,5,'BMS, LiFePO4, capteurs de température','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Fausse détection d''incivilité','IA',4,5,'Seuils de confiance élevés, revue humaine obligatoire','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Non-conformité RGPD','Confidentialité',3,5,'Privacy-by-design, AIPD, consultation CNIL si nécessaire','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Coût de fabrication trop élevé','Finance',4,4,'Optimisation de la BOM, composants alternatifs','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Pénurie de composants','Approvisionnement',3,4,'Composants alternatifs identifiés pour chaque poste','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Navigation instable','Navigation',3,4,'Fusion de capteurs et tests progressifs','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Autonomie insuffisante','Alimentation',3,4,'Bilan énergétique et batterie dimensionnée','Cheith','Ouvert','11111111-1111-1111-1111-111111111111'),
('Blocage mécanique du système de collecte','Mécanique',3,3,'Capteurs de couple et procédure de dégagement','Cheith','Ouvert','11111111-1111-1111-1111-111111111111');

INSERT INTO public.decisions (title, date, context, alternatives, chosen, rationale, owner, product_id) VALUES
('Calculateur embarqué de la V2','2026-07-20','Besoin d''inférence temps réel en edge','Raspberry Pi 5 + accélérateur / Jetson Orin Nano','Jetson Orin Nano','Meilleur rapport performance/consommation pour la vision temps réel','Cheith','11111111-1111-1111-1111-111111111111'),
('Traitement local des images de surveillance','2026-07-28','Conformité RGPD et confiance des collectivités','Cloud / Local','Traitement local','Minimisation des données et conformité privacy-by-design','Cheith','11111111-1111-1111-1111-111111111111');

INSERT INTO public.achievements (title, date, category, event, location, result, description) VALUES
('Eurobot 2023','2023-05-15','Compétition robotique','Eurobot','France','Participation','Projet robotique distinct de Labi-Bot.'),
('Eurobot 2024','2024-05-20','Compétition robotique','Eurobot','France','Participation','Projet robotique distinct de Labi-Bot.'),
('Forum DSI 10e édition','2024-11-10','Concept','Forum DSI','Tunisie','Présentation','Premier concept de collecte de bouteilles.'),
('Robofest Tunisie 2025 - 1re place','2025-03-15','Compétition robotique','Robofest Tunisie','Tunisie','1re place','Première place nationale avec le prototype Labi-Bot.'),
('Robofest International 2025 - 2e place','2025-05-10','Compétition robotique','Robofest International','Michigan, États-Unis','2e place','Deuxième place internationale avec Labi-Bot.'),
('Vente du premier prototype Labi-Bot','2025-09-01','Commercial','—','Tunisie','Vendu','Le premier prototype Labi-Bot a été vendu.'),
('Candidature SNEE déposée','2026-06-20','Université','Pépite Bretagne','Brest, France','Déposée','Dossier de Statut National Étudiant-Entrepreneur déposé.');

INSERT INTO public.research_notes (title, category, source, summary, key_insight, relevance) VALUES
('État de l''art des robots de nettoyage de plage','Robotique de nettoyage de plage','Revue de littérature','Panorama des solutions existantes : BeBot, Searial Cleaners, solutions tractées.','La plupart des solutions sont tractées ou téléopérées : l''autonomie complète reste un différenciateur.','Élevée'),
('Modèles YOLO pour la détection de déchets','Modèles YOLO','Papers with Code','Comparaison des performances YOLOv8/YOLOv11 sur datasets TACO et plage.','YOLOv8n quantifié atteint plus de 20 FPS sur Jetson Orin Nano.','Élevée'),
('Reconnaissance d''action humaine pour incivilités','Reconnaissance d''action humaine','Recherche académique','Approches par pose estimation et détection de geste de jet.','Combiner pose estimation et disparition contextuelle de l''objet réduit les faux positifs.','Élevée'),
('RGPD et captation d''images dans l''espace public','RGPD','CNIL','Règles applicables à la vidéo dans l''espace public et obligations d''information.','Une AIPD est probablement nécessaire pour le mode surveillance.','Élevée'),
('Marché de la propreté urbaine en France','Étude de marché','Rapports sectoriels','Dépenses des collectivités en propreté et automatisation croissante.','Les cycles d''achat publics sont longs : viser d''abord les projets pilotes.','Moyenne');

INSERT INTO public.team_members (name, role, department, status, skills, availability) VALUES
('Cheith','Fondateur et CEO','Fondateur','Actif','Robotique, IA, vision par ordinateur, systèmes embarqués','Temps partiel (études UBO)');

INSERT INTO public.job_roles (title, department, status) VALUES
('Ingénieur mécanique','Mécanique','Poste prévu'),
('Ingénieur systèmes embarqués','Embarqué','Poste prévu'),
('Ingénieur électronique','Électronique','Poste prévu'),
('Ingénieur IA et vision par ordinateur','IA','Poste prévu'),
('Ingénieur navigation autonome','IA','Poste prévu'),
('Développeur frontend','Logiciel','Poste prévu'),
('Développeur backend','Logiciel','Poste prévu'),
('Business developer','Business','Poste prévu'),
('Spécialiste vente secteur public','Business','Poste prévu'),
('Designer industriel','Mécanique','Poste prévu');

INSERT INTO public.competitions (name, organization, category, location, date, status, robot) VALUES
('Eurobot 2027','Planète Sciences','Robotique étudiante','France','2027-05-15','Identifiée','Robot Eurobot (projet distinct)'),
('Robofest 2027','Lawrence Technological University','Robotique','Michigan, États-Unis','2027-05-10','Identifiée','Labi-Bot V2'),
('Pépite Tremplin','Ministère de l''Enseignement supérieur','Concours étudiant-entrepreneur','France','2026-10-01','À préparer','Labi-Bot'),
('Green Tech Challenge','Écosystème greentech','Concours greentech','France','2027-03-01','Identifiée','Labi-Bot V2');

INSERT INTO public.university_items (title, type, course, date, status, hours) VALUES
('Traitement du signal - examen','Examen','Traitement du signal','2026-12-15','À venir',3),
('Projet systèmes embarqués','Devoir','Systèmes embarqués','2026-11-20','En cours',25),
('Rendez-vous Pépite mensuel','Action SNEE','SNEE','2026-09-10','À venir',2),
('Semaine d''examens partiels','Examen','Tous','2026-12-14','À venir',20);

INSERT INTO public.marketing_posts (title, platform, format, date, status, objective) VALUES
('Annonce du projet PlastiFind','LinkedIn','Post texte + image','2026-09-01','Planifié','Notoriété'),
('Retour sur le Robofest International','LinkedIn','Carrousel','2026-09-15','Idée','Crédibilité'),
('Teaser Labi-Bot V2','Instagram','Vidéo courte','2026-10-05','Idée','Engagement');

INSERT INTO public.legal_items (title, kind, status, sort_order) VALUES
('Vérifier la compatibilité du titre de séjour','Création','En cours',1),
('Choisir la structure juridique','Création','À faire',2),
('Choisir le nom de la société','Création','Terminé',3),
('Vérifier la disponibilité du nom','Création','En cours',4),
('Définir l''activité','Création','À faire',5),
('Déterminer le capital social','Création','À faire',6),
('Choisir l''adresse du siège','Création','À faire',7),
('Rédiger les statuts','Création','À faire',8),
('Déposer le capital social','Création','À faire',9),
('Publier l''annonce légale','Création','À faire',10),
('Déposer la demande d''immatriculation','Création','À faire',11),
('Recevoir SIREN / SIRET','Création','À faire',12),
('Obtenir le Kbis','Création','À faire',13),
('Ouvrir un compte professionnel','Création','À faire',14),
('Souscrire une assurance','Création','À faire',15),
('Désigner un expert-comptable','Création','À faire',16),
('Marque PlastiFind (INPI)','PI','À faire',17),
('Protection du design Labi-Bot','PI','À faire',18),
('Droit d''auteur logiciel embarqué','PI','À faire',19),
('Base légale du mode surveillance','Confidentialité','À faire',20),
('Durée de conservation des images','Confidentialité','À faire',21),
('Contrôle d''accès et journal d''audit','Confidentialité','À faire',22),
('AIPD (analyse d''impact)','Confidentialité','À faire',23),
('Consultation CNIL si nécessaire','Confidentialité','À faire',24);

INSERT INTO public.business_canvas (canvas, section, content) VALUES
('BMC','Segments de clientèle','Municipalités littorales, gestionnaires de plages, resorts et hôtels, sociétés de nettoyage, ONG environnementales.'),
('BMC','Propositions de valeur','Nettoyage autonome des espaces publics, réduction des coûts de main-d''œuvre, données environnementales exploitables.'),
('BMC','Canaux','Vente directe aux collectivités, marchés publics, partenariats avec sociétés de nettoyage, salons greentech.'),
('BMC','Relations clients','Projets pilotes accompagnés, contrat de maintenance, support technique local.'),
('BMC','Sources de revenus','Vente du robot, leasing, abonnement logiciel, maintenance, projets pilotes.'),
('BMC','Ressources clés','Expertise robotique et IA, prototypes, propriété intellectuelle, palmarès Robofest.'),
('BMC','Activités clés','R&D robotique, vision par ordinateur, industrialisation, vente au secteur public.'),
('BMC','Partenaires clés','UBO, Pépite Bretagne, Technopôle Brest-Iroise, fournisseurs de composants, collectivités pilotes.'),
('BMC','Structure de coûts','Composants, fabrication, R&D, salaires, assurance, déplacements.'),
('LEAN','Problème','Le nettoyage des plages et espaces publics est coûteux, pénible et peu instrumenté.'),
('LEAN','Solution','Robot autonome de détection et collecte de déchets avec supervision environnementale.'),
('LEAN','Proposition de valeur unique','La robotique autonome au service d''un environnement plus propre.'),
('LEAN','Avantage déloyal','Prototype primé au niveau national et international, expertise robotique du fondateur.'),
('LEAN','Indicateurs clés','Kg de déchets collectés, heures de fonctionnement autonome, projets pilotes signés.'),
('SWOT','Forces','Historique de prototype fonctionnel; prix national et international; expérience robotique du fondateur; premier prototype vendu; mission environnementale claire; intégration IA et robotique.'),
('SWOT','Faiblesses','Pas de prototype actuel; financement initial limité; fondateur encore étudiant; coûts de développement matériel; équipe réduite; industrialisation incomplète.'),
('SWOT','Opportunités','Villes intelligentes; réglementation environnementale; nettoyage du littoral; subventions greentech; automatisation municipale; marché robotique en croissance; partenariats tourisme et resorts.'),
('SWOT','Menaces','Matériel coûteux; contraintes réglementaires et de confidentialité; concurrents établis; cycles de vente publics longs; besoins de maintenance; complexité de fabrication.');

INSERT INTO public.competitors (company, country, product, segment, technology, strengths, weaknesses) VALUES
('Searial Cleaners','Pays-Bas','BeBot','Plages et littoral','Robot électrique téléopéré','Notoriété, déploiements existants','Téléopéré, pas d''autonomie IA'),
('Nordic Beach Cleaner','Suède','Machine tractée','Plages','Mécanique tractée','Robuste et éprouvé','Nécessite un opérateur et un véhicule'),
('Urban cleaning robots','Chine','Robots de voirie','Voirie urbaine','Navigation autonome','Coût réduit à l''échelle','Peu adapté au sable et au littoral');

INSERT INTO public.notifications (title, body, kind) VALUES
('Entretien SNEE dans quelques jours','Préparez la présentation et les questions du jury.','warning'),
('Échéance de financement proche','Prix Pépite Tremplin : dossier à déposer avant le 1er octobre 2026.','warning'),
('Nouveau document ajouté','Le résumé exécutif Labi-Bot a été validé en v1.0.','info');

INSERT INTO public.activity_log (actor, action, entity, entity_label) VALUES
('Cheith','a validé le document','document','Résumé exécutif Labi-Bot'),
('Cheith','a mis à jour la tâche','task','Finaliser le pitch deck V1'),
('Cheith','a ajouté une opportunité de financement','funding','Bourse French Tech Émergence'),
('Cheith','a créé la décision technique','decision','Calculateur embarqué de la V2'),
('Cheith','a planifié la réunion','meeting','Entretien comité SNEE');
