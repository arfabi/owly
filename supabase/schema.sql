-- ============================================================================
-- SAVVY.AI — Supabase PostgreSQL Schema Migration
-- Versi: 2.1 (28 Oktober 2026)
-- Deskripsi: Skema terpadu untuk Stateful Multi-Chain Sessions, Shared Cache,
-- Vector Stores Directory, Crowdsourced Feedback, & User Preferences.
-- ============================================================================

-- Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABEL: savvy_sessions
-- Pengelolaan sesi stateful per user per tab browser via Meta Responses API.
-- Memungkinkan percakapan multi-turn tanpa mengirim ulang seluruh riwayat chat.
-- ============================================================================
CREATE TABLE IF NOT EXISTS savvy_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tab_id TEXT NOT NULL,                          -- ID tab unik browser (mis. 'tab_lpdp_kemenkeu_go_id')
    portal_key TEXT NOT NULL,                      -- Domain aktif portal formulir (mis. 'beasiswalpdp.kemenkeu.go.id')
    current_chain_id TEXT NOT NULL,                -- Identifier chain sesi aktif
    current_response_id TEXT NOT NULL,             -- ID respons Meta terbaru (resp_xxx) untuk previous_response_id
    token_count INT DEFAULT 0,                     -- Akumulasi token sesi untuk pemantauan kuota
    message_count INT DEFAULT 0,                   -- Jumlah pertukaran pesan dalam sesi
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours', -- TTL sesi sesuai cache window Meta API
    UNIQUE(user_id, tab_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_tab ON savvy_sessions(user_id, tab_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON savvy_sessions(expires_at);

-- ============================================================================
-- 2. TABEL: coach_cache
-- Shared Two-Tier Cache publik untuk kartu panduan 4-elemen Field Coach.
-- Menghindari pemanggilan ulang LLM untuk field formulir yang sama (hemat s/d 80% token).
-- ============================================================================
CREATE TABLE IF NOT EXISTS coach_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,                -- SHA-256 hash(portal_key + section + field_key + role)
    portal_domain TEXT NOT NULL,                   -- Normalisasi domain portal formulir
    field_key TEXT NOT NULL,                       -- Identifier semantik field (mis. 'nik', 'apostille')
    language TEXT NOT NULL DEFAULT 'id',           -- Bahasa output panduan ('id', 'en', dll)
    explanation_json JSONB NOT NULL,               -- Payload 4-elemen: { meaning, how_to_fill, example, pitfalls }
    source_type TEXT NOT NULL DEFAULT 'ai_guidance',-- 'official' (dari juknis) | 'curated' | 'ai_guidance'
    confirmation_ref TEXT,                         -- Sitasi bab/halaman juknis resmi atau URL referensi
    model_used TEXT NOT NULL DEFAULT 'muse-spark-1.3', -- Versi model Meta yang menghasilkan cache
    prompt_ver TEXT NOT NULL DEFAULT 'v1',         -- Versi prompt untuk invalidasi terarah
    hit_count INT DEFAULT 1,                       -- Frekuensi pemakaian kartu panduan
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days' -- TTL cache publik
);

CREATE INDEX IF NOT EXISTS idx_coach_cache_key ON coach_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_coach_cache_portal ON coach_cache(portal_domain);

-- ============================================================================
-- 3. TABEL: vector_stores
-- Katalog pemetaan portal formulir resmi ke Meta Vector Store ID untuk tool file_search.
-- ============================================================================
CREATE TABLE IF NOT EXISTS vector_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL UNIQUE,                   -- Domain web portal resmi (mis. 'beasiswalpdp.kemenkeu.go.id')
    vector_store_id TEXT NOT NULL,                 -- ID Vector Store resmi di Meta Model API (vs_xxx)
    portal_name TEXT NOT NULL,                     -- Nama resmi portal (mis. 'Beasiswa LPDP 2026')
    document_title TEXT NOT NULL,                  -- Judul juknis (mis. 'Buku Panduan Pendaftaran LPDP 2026')
    doc_version TEXT NOT NULL DEFAULT '2026',      -- Versi rilis juknis
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vector_stores_domain ON vector_stores(domain);

-- ============================================================================
-- 4. TABEL: feedback_reports
-- Penampung pelaporan anomali panduan atau juknis usang dari pengguna.
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT NOT NULL,                        -- 'wrong_guidance' | 'outdated_juknis' | 'ui_bug' | 'other'
    portal_url TEXT NOT NULL,                      -- URL formulir saat kendala dialami
    field_signature TEXT,                          -- Signature field terkait (bila ada)
    report_data JSONB NOT NULL,                    -- Detail kendala & screenshot masking
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_reports(created_at);

-- ============================================================================
-- 5. TABEL: user_preferences (Profil & Konteks Pengguna)
-- Sinkronisasi identitas dasar (nama, goals aplikasi), preset aksesibilitas,
-- dan preferensi bahasa akun lintas perangkat untuk personalisasi bimbingan AI.
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,                                -- Nama panggilan/lengkap pengguna (mis. 'Budi Santoso')
    goals TEXT,                                    -- Target aplikasi aktif (mis. 'Beasiswa LPDP 2026', 'Visa Schengen')
    accessibility_preset JSONB DEFAULT '{}'::jsonb,-- Konfigurasi preset 14 tools Accessibility HUB
    default_language TEXT DEFAULT 'id',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- KEBIJAKAN ROW-LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE savvy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 1. Sesi privat: User hanya dapat membaca & memodifikasi sesinya sendiri
DROP POLICY IF EXISTS "Users own their sessions" ON savvy_sessions;
CREATE POLICY "Users own their sessions" ON savvy_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 2. Cache publik: Dibaca oleh seluruh user terautentikasi & anonim
DROP POLICY IF EXISTS "Public read for coach cache" ON coach_cache;
CREATE POLICY "Public read for coach cache" ON coach_cache
    FOR SELECT USING (true);

-- Backend Service Role dapat mengelola cache
DROP POLICY IF EXISTS "Service role manage coach cache" ON coach_cache;
CREATE POLICY "Service role manage coach cache" ON coach_cache
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Vector stores katalog: Dibaca oleh seluruh user
DROP POLICY IF EXISTS "Public read for vector stores" ON vector_stores;
CREATE POLICY "Public read for vector stores" ON vector_stores
    FOR SELECT USING (true);

-- 4. Feedback reports: Pengguna dapat mengirim feedback
DROP POLICY IF EXISTS "Users insert feedback" ON feedback_reports;
CREATE POLICY "Users insert feedback" ON feedback_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 5. User preferences: Pengguna mengelola preferensinya sendiri
DROP POLICY IF EXISTS "Users manage preferences" ON user_preferences;
CREATE POLICY "Users manage preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- CONTOH DATA AWAL (SEED DATA: Vector Store LPDP)
-- ============================================================================
INSERT INTO vector_stores (domain, vector_store_id, portal_name, document_title, doc_version)
VALUES (
    'beasiswalpdp.kemenkeu.go.id',
    'vs_lpdp_2026_official',
    'Portal Pendaftaran Beasiswa LPDP 2026',
    'Buku Panduan Pendaftaran Beasiswa LPDP Tahap 1 2026',
    '2026.1'
)
ON CONFLICT (domain) DO UPDATE 
SET vector_store_id = EXCLUDED.vector_store_id,
    document_title = EXCLUDED.document_title,
    updated_at = NOW();
