-- Seed Items Data Migration
-- This migration populates the items table with inventory data
-- RUNS AFTER: 20260106051720_add_items_description.sql

-- Category IDs (from categories_rows.json):
-- Sound System:       b7601f4b-9473-4c62-9520-ff4c7c2894c0
-- Stage & Rigging:    9c9deb77-b2d2-45e1-bd4e-781e348c9586
-- Lighting & Effects: 19e73b7b-8d3b-4200-b1f7-fce225777956
-- Visual Multimedia:  8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb
-- Manpower & Team:    aa178bcb-295d-417f-ac50-0d0dd5b3e40e

-- ==============================
-- 1. SOUND SYSTEM
-- ==============================
INSERT INTO public.items (category_id, name, description, price, unit) VALUES
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Line Array Speaker System', 'Speaker gantung utama untuk audiens besar (FOH), mencakup mid-high freq.', 1500000, 'Per Box'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Subwoofer Dual 18"', 'Speaker bass frekuensi rendah untuk hentakan suara yang kuat.', 1000000, 'Per Box'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Active Speaker 15" (Point Source)', 'Speaker portable dengan stand, cocok untuk event kecil atau seminar.', 350000, 'Per Unit'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Floor Monitor Speaker', 'Speaker lantai menghadap artis/MC untuk kontrol suara panggung.', 350000, 'Per Unit'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Digital Mixer Console (32 Channel)', 'Alat pengatur suara digital kapasitas 32 input (e.g., Midas/Allen & Heath).', 2500000, 'Per Unit'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Analog Mixer (12-16 Channel)', 'Mixer sederhana untuk akustik atau speech event kecil.', 500000, 'Per Unit'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Wireless Microphone (Handheld)', 'Mic tanpa kabel untuk MC atau penyanyi.', 300000, 'Per Set (2 Mic)'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Wireless Headset / Clip-on', 'Mic jepit/bando untuk presentasi hands-free atau teater.', 350000, 'Per Unit'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Band Mic Set', 'Set mikrofon lengkap untuk drum & instrumen musik (7-8 pcs).', 1000000, 'Per Set'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'DI Box (Direct Injection)', 'Alat koneksi instrumen (gitar/keyboard) ke mixer agar noise rendah.', 100000, 'Per Unit'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'In-Ear Monitor System (IEM)', 'Monitoring telinga nirkabel untuk artis/penyanyi.', 750000, 'Per Receiver'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Backline Amp: Guitar Cabinet', 'Amplifier gitar listrik (e.g., Marshall JCM/Fender Twin).', 750000, 'Per Unit'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Backline Amp: Bass Cabinet', 'Amplifier gitar bass (e.g., Ampeg/Gallien-Krueger).', 750000, 'Per Unit'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Drum Set Standard', 'Drum kit akustik lengkap dengan cymbal & hardware.', 1500000, 'Per Set'),
('b7601f4b-9473-4c62-9520-ff4c7c2894c0', 'Clearcom / Intercom System', 'Alat komunikasi tim produksi (headset kabel/wireless).', 250000, 'Per Station');

-- ==============================
-- 2. LIGHTING & EFFECTS
-- ==============================
INSERT INTO public.items (category_id, name, description, price, unit) VALUES
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Moving Head Beam', 'Lampu sorot tajam yang bisa bergerak, membuat motif garis cahaya di udara.', 450000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Moving Head Wash/Spot', 'Lampu sorot gerak dengan cahaya menyebar/fokus untuk mewarnai area.', 500000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'PAR LED 54x3W', 'Lampu statis untuk mewarnai panggung (warna dasar RGBW).', 150000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Fresnel / COB Light', 'Lampu kuning hangat (Warm White) untuk penerangan wajah agar natural di kamera.', 300000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Follow Spot Light', 'Lampu sorot manual jarak jauh untuk mengikuti pergerakan MC/Artis.', 1500000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Mini Brute / Blinder', 'Lampu sangat terang yang menghadap penonton untuk efek kejutan.', 350000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Smoke Machine / Fogger', 'Mesin asap tebal untuk efek dramatis sesaat.', 300000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Hazer Machine', 'Mesin asap tipis (embun) agar sinar lampu beam terlihat jelas.', 600000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Lighting Console (Digital)', 'Meja kontrol lampu (e.g., GrandMA/Avolites) untuk memprogram show.', 2000000, 'Per Unit'),
('19e73b7b-8d3b-4200-b1f7-fce225777956', 'Mixer Lighting Standard', 'Kontroler lampu sederhana untuk PAR LED biasa.', 300000, 'Per Unit');

-- ==============================
-- 3. STAGE & RIGGING
-- ==============================
INSERT INTO public.items (category_id, name, description, price, unit) VALUES
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Stage Module (Level)', 'Panggung modular (tinggi 40cm-100cm), permukaan multiplek hitam/karpet.', 125000, 'Per Meter Persegi'),
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Rigging Truss (Square)', 'Rangka besi gantung aluminium untuk lampu dan sound (dimensi 30x30cm).', 150000, 'Per Meter Lari'),
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Rigging Tower / Goal Post', 'Kaki tiang truss kiri-kanan & atas untuk gantung layar/backdrop.', 3500000, 'Per Set'),
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Chain Hoist Motor', 'Motor pengerek elektrik untuk mengangkat truss (kapasitas 1 ton).', 750000, 'Per Titik'),
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Manual Chain Block', 'Kerekan manual (rantai tangan) untuk beban ringan.', 200000, 'Per Titik'),
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Black Curtain (Backdrop)', 'Kain hitam tebal untuk menutup area belakang panggung.', 75000, 'Per Meter Lebar'),
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Stage Stairs (Tangga)', 'Tangga akses naik ke panggung lapis karpet.', 250000, 'Per Unit'),
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Barricade (Mojo Barrier)', 'Pagar pembatas besi heavy duty antara panggung dan penonton.', 350000, 'Per Meter'),
('9c9deb77-b2d2-45e1-bd4e-781e348c9586', 'Rooftop Rigging', 'Atap panggung semi-permanen (terpal & rangka) untuk event outdoor.', 15000000, 'Per Set');

-- ==============================
-- 4. VISUAL MULTIMEDIA
-- ==============================
INSERT INTO public.items (category_id, name, description, price, unit) VALUES
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'LED Videotron P3.9 (Indoor)', 'Layar LED raksasa resolusi tinggi untuk backdrop visual tajam.', 850000, 'Per Meter Persegi'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'LED Videotron P4.8 (Outdoor)', 'Layar LED tahan air dan sangat terang untuk event luar ruangan.', 750000, 'Per Meter Persegi'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'TV Plasma 50-55 Inch', 'TV monitor dengan standing floor untuk comfort monitor (contekan MC) atau display foyer.', 500000, 'Per Unit'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'Projector 5000 Lumens', 'Proyektor standar untuk layar ukuran 2x3m atau 3x4m (ruangan gelap).', 1500000, 'Per Unit'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'Projector 10.000+ Lumens', 'Proyektor high-brightness untuk mapping atau layar besar.', 5000000, 'Per Unit'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'Fastfold Screen 3x4m', 'Layar proyektor bentang dengan rangka lipat (Front/Rear).', 800000, 'Per Unit'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'Video Mixer / Switcher', 'Alat pengatur input gambar (e.g., vMix/ATEM) untuk pindah tampilan kamera/laptop.', 1500000, 'Per Unit'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'Laptop Multimedia', 'Laptop spek tinggi (Macbook Pro/Gaming) untuk play materi video/PPT.', 500000, 'Per Unit'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'Wireless Presentation Clicker', 'Remote slide pointer dengan jangkauan jauh.', 100000, 'Per Unit'),
('8aa1e4da-68a1-4522-bc0e-985c3f4bf5eb', 'Live Cam System (1 Cam)', 'Kamera video profesional + tripod + kabel tarik ke mixer visual.', 2500000, 'Per Unit');

-- ==============================
-- 5. MANPOWER & TEAM
-- ==============================
INSERT INTO public.items (category_id, name, description, price, unit) VALUES
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Show Director', 'Pimpinan artistik yang mengatur alur pertunjukan (cue-to-cue).', 5000000, 'Per Hari / Shift'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Stage Manager', 'Pengatur lalu lintas artis dan kru di area panggung.', 2500000, 'Per Hari / Shift'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Sound Engineer (FOH)', 'Operator utama yang mengatur mixing suara untuk audiens.', 2500000, 'Per Hari / Shift'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Lighting Designer / Operator', 'Operator yang memprogram dan memainkan lampu saat acara.', 2000000, 'Per Hari / Shift'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Visual Jockey (VJ) / Operator', 'Operator yang mengatur tampilan visual LED/Screen.', 2000000, 'Per Hari / Shift'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Cameraman', 'Juru kamera video untuk live feed.', 1500000, 'Per Hari / Shift'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'General Crew / Loader', 'Tenaga bantuan untuk angkat barang (loading in/out) dan setup kabel.', 350000, 'Per Orang'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Runner', 'Asisten serabutan untuk kebutuhan mendadak saat acara.', 300000, 'Per Orang'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Genset Operator', 'Teknisi khusus penjaga generator listrik.', 500000, 'Per Orang'),
('aa178bcb-295d-417f-ac50-0d0dd5b3e40e', 'Liaison Officer (LO)', 'Pendamping artis/tamu VIP (opsional jika handling artis).', 750000, 'Per Orang');
