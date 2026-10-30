-- ============================================================================
-- SAVVY.AI — Supabase PostgreSQL Schema Migration
-- Versi: 3.0 (30 Oktober 2026)
-- Arsitektur: Meta Social Auth, PII Sanitized Chat, Memory Compacting, 
-- Client-Side Encrypted WebCrypto Vault, Two-Tier Coach Cache & Juknis RAG.
-- ============================================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABEL: profiles
-- Sinkronisasi otomatis data profil dari Supabase Auth (Facebook / Instagram OAuth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    auth_provider TEXT DEFAULT 'facebook',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger otomatis membuat profile saat user login/signup via OAuth (Google, Facebook, Instagram)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_avatar TEXT;
    user_email TEXT;
BEGIN
    -- 1. Tangkap Nama (Google: name/full_name, Facebook: name, Instagram: username/name)
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'user_name',
        'Pengguna Savvy'
    );
    
    -- 2. Tangkap Email
    user_email := COALESCE(
        NEW.email,
        NEW.raw_user_meta_data->>'email',
        NULL
    );

    -- 3. Tangkap Foto Profil (Google: picture/avatar_url, Facebook: picture.data.url / picture)
    user_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        NEW.raw_user_meta_data->'picture'->'data'->>'url',
        NULL
    );

    INSERT INTO public.profiles (id, email, full_name, avatar_url, auth_provider)
    VALUES (
        NEW.id,
        user_email,
        user_name,
        user_avatar,
        COALESCE(NEW.raw_app_meta_data->>'provider', 'oauth')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, profiles.email),
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. TABEL: chat_sessions
-- Sesi percakapan per user & per portal dengan Rolling Compacting Memory.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tab_id TEXT NOT NULL,                                -- ID tab browser unik
    portal_domain TEXT NOT NULL,                         -- Domain portal aktif (mis. beasiswalpdp.kemenkeu.go.id)
    title TEXT DEFAULT 'Percakapan Baru',
    compacted_summary TEXT DEFAULT NULL,                 -- Rangkuman profil & konteks user dari percakapan >10 pesan
    message_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_portal ON public.chat_sessions(portal_domain);

-- ============================================================================
-- 3. TABEL: chat_messages
-- Riwayat percakapan. Catatan: Data sensitif (NIK/NPWP) telah disensor sebelum disimpan.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at ASC);

-- ============================================================================
-- 4. TABEL: user_vault
-- Brankas Data Pribadi. Klien mengenkripsi data secara lokal via WebCrypto AES-256-GCM.
-- Server Supabase HANYA menyimpan ciphertext & IV (Zero-Knowledge, aman dari kebocoran).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('KTP', 'NPWP', 'PASPOR', 'TRANSKRIP', 'SERTIFIKAT', 'PROFIL_DATA')),
    label TEXT NOT NULL,                                 -- Label dokumen (mis. 'KTP Utama', 'Sertifikat IELTS')
    ciphertext TEXT NOT NULL,                            -- Base64 payload terenkripsi AES-256-GCM
    iv TEXT NOT NULL,                                    -- Base64 96-bit Initialization Vector
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_vault_user ON public.user_vault(user_id);

-- ============================================================================
-- 5. TABEL: coach_cache
-- L1/L2 Shared Cache publik panduan 4-elemen formulir (Meaning, How, Example, Pitfalls).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coach_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,                      -- SHA-256 hash(portal_domain + field_key + lang)
    portal_domain TEXT NOT NULL,
    field_key TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'id',
    explanation_json JSONB NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'ai_guidance',     -- 'official' | 'curated' | 'ai_guidance'
    confirmation_ref TEXT,                               -- Nomor halaman / bab dokumen resmi
    hit_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_coach_cache_lookup ON public.coach_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_coach_cache_portal ON public.coach_cache(portal_domain);

-- ============================================================================
-- 6. TABEL: juknis_chunks
-- Basis pengetahuan RAG panduan resmi portal publik untuk sitasi kutipan resmi.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.juknis_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portal_key TEXT NOT NULL,                            -- 'lpdp', 'schengen', 'casn', dll
    document_title TEXT NOT NULL,                        -- 'Buku Panduan Pendaftaran Beasiswa LPDP 2026'
    section_title TEXT NOT NULL,                         -- 'Bab IV: Persyaratan Khusus Beasiswa Afirmasi'
    page_number INT,
    chunk_text TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_juknis_portal ON public.juknis_chunks(portal_key);

-- Seed awal panduan resmi LPDP 2026
INSERT INTO public.juknis_chunks (portal_key, document_title, section_title, page_number, chunk_text, tags)
VALUES
(
    'lpdp',
    'Buku Panduan Beasiswa LPDP 2026',
    'Persyaratan Umum Pendaftar Beasiswa Reguler',
    14,
    'Pendaftar Beasiswa Reguler wajib memiliki Indeks Prestasi Kumulatif (IPK) jenjang sebelumnya minimal 3.00 pada skala 4.00 untuk program Magister (S2), dan minimal 3.25 untuk program Doktor (S3). Dokumen transkrip asli atau legalisir wajib dilampirkan.',
    ARRAY['ipk', 'reguler', 'persyaratan', 'transkrip']
),
(
    'lpdp',
    'Buku Panduan Beasiswa LPDP 2026',
    'Persyaratan Khusus Beasiswa Afirmasi Daerah 3T',
    22,
    'Pendaftar kategori Afirmasi Daerah 3T (Tertinggal, Terdepan, Terluar) mendapatkan relaksasi syarat IPK minimal 2.50 untuk Magister (S2). Pendaftar wajib melampirkan KTP dan Kartu Keluarga yang membuktikan domisili resmi di wilayah 3T minimal 3 tahun berturut-turut.',
    ARRAY['afirmasi', '3t', 'ipk', 'ktp', 'kartu keluarga']
),
(
    'lpdp',
    'Buku Panduan Beasiswa LPDP 2026',
    'Ketentuan Sertifikat Bahasa Inggris',
    18,
    'Sertifikat kemampuan bahasa Inggris yang diterima untuk tujuan luar negeri adalah TOEFL iBT (skor min 80) atau IELTS (skor min 6.5). TOEFL ITP hanya diperbolehkan untuk pendaftaran universitas dalam negeri dengan skor minimal 500.',
    ARRAY['toefl', 'ielts', 'bahasa', 'skor']
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. TABEL: feedback_reports
-- Laporan crowdsource jika pengguna menemukan petunjuk panduan yang keliru.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    portal_domain TEXT NOT NULL,
    field_key TEXT NOT NULL,
    issue_type TEXT NOT NULL,                            -- 'outdated' | 'wrong_format' | 'broken_rule'
    user_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. KEBIJAKAN KEAMANAN ROW-LEVEL SECURITY (RLS)
-- Menjamin setiap user HANYA bisa mengakses datanya sendiri!
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juknis_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- 8.1 Policies Profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 8.2 Policies Chat Sessions
CREATE POLICY "Users can manage their own sessions"
    ON public.chat_sessions FOR ALL
    USING (auth.uid() = user_id);

-- 8.3 Policies Chat Messages
CREATE POLICY "Users can manage messages in their own sessions"
    ON public.chat_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- 8.4 Policies User Vault (Zero-Knowledge Ciphertext)
CREATE POLICY "Users can manage their own encrypted vault"
    ON public.user_vault FOR ALL
    USING (auth.uid() = user_id);

-- 8.5 Policies Coach Cache & Juknis Chunks (Publik Boleh Membaca)
CREATE POLICY "Public read coach_cache"
    ON public.coach_cache FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Public read juknis_chunks"
    ON public.juknis_chunks FOR SELECT
    TO anon, authenticated
    USING (true);

-- 8.6 Policies Feedback Reports
CREATE POLICY "Authenticated users can submit feedback"
    ON public.feedback_reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
