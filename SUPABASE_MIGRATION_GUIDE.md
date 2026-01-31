# Supabase Migration Guide - Channex to Beds24

Bu rehber, Supabase veritabanınızda Channex'ten Beds24'e geçiş için yapmanız gereken adımları detaylı olarak açıklar.

## Adım 1: Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://app.supabase.com/) adresine gidin
2. Projenizi seçin (URL'de `gjgiykewaxmylnwdvikz` project ID'si görünmeli)
3. Sol menüden **SQL Editor**'ü seçin

## Adım 2: Migration Dosyalarını Çalıştırma

### 2.1 Channex Kolonlarını Kaldırma

SQL Editor'de **New Query** butonuna tıklayın ve aşağıdaki SQL kodunu yapıştırın:

```sql
-- Remove Channex integration columns and indexes
-- This migration removes all Channex-specific fields as we migrate to Beds24

-- Drop indexes first
DROP INDEX IF EXISTS "idx_rooms_channex_id";
DROP INDEX IF EXISTS "idx_reservations_channex_booking_id";

-- Remove columns from Rooms_Information
ALTER TABLE "Rooms_Information" 
DROP COLUMN IF EXISTS "channex_room_type_id",
DROP COLUMN IF EXISTS "channex_rate_plan_id";

-- Remove column from Reservation_Information
ALTER TABLE "Reservation_Information" 
DROP COLUMN IF EXISTS "channex_booking_id";
```

**Run** butonuna tıklayarak çalıştırın. Başarılı olursa "Success. No rows returned" mesajı görmelisiniz.

### 2.2 Beds24 Kolonlarını Ekleme

Yeni bir query açın ve aşağıdaki SQL kodunu yapıştırın:

```sql
-- Add Beds24 integration columns
-- This migration adds Beds24-specific fields for channel manager integration

-- Add beds24_room_id to Rooms_Information
-- This will store the Beds24 room ID for mapping local rooms to Beds24 rooms
ALTER TABLE "Rooms_Information" 
ADD COLUMN IF NOT EXISTS "beds24_room_id" text;

-- Add index for performance when querying by Beds24 room ID
CREATE INDEX IF NOT EXISTS "idx_rooms_beds24_id" 
ON "Rooms_Information" ("beds24_room_id");

-- Add beds24_booking_id to Reservation_Information
-- This will store the Beds24 booking reference ID
ALTER TABLE "Reservation_Information" 
ADD COLUMN IF NOT EXISTS "beds24_booking_id" text;

-- Add unique index to ensure no duplicate Beds24 bookings
-- and for fast lookups when processing webhooks
CREATE UNIQUE INDEX IF NOT EXISTS "idx_reservations_beds24_booking_id" 
ON "Reservation_Information" ("beds24_booking_id");

-- Optional: Add comment to document the purpose
COMMENT ON COLUMN "Rooms_Information"."beds24_room_id" IS 'Beds24 room ID for channel manager integration';
COMMENT ON COLUMN "Reservation_Information"."beds24_booking_id" IS 'Beds24 booking reference ID from channel manager';
```

**Run** butonuna tıklayarak çalıştırın.

## Adım 3: Oda ID'lerini Güncelleme

Şimdi her odanız için Beds24 room ID'lerini tanımlamanız gerekiyor. Önce mevcut odalarınızı görelim:

```sql
SELECT id, name, type_name, beds24_room_id 
FROM "Rooms_Information" 
ORDER BY id;
```

Bu sorguyu çalıştırın ve odalarınızın listesini görün. Ardından, her oda için Beds24'teki karşılık gelen room ID'yi güncelleyin:

```sql
-- Örnek: Deluxe Room için Beds24 Room ID'yi güncelleme
UPDATE "Rooms_Information"
SET "beds24_room_id" = 'BEDS24_ROOM_ID_BURAYA'
WHERE id = 1; -- Oda ID'nizi buraya yazın

-- Diğer odalar için tekrarlayın
UPDATE "Rooms_Information"
SET "beds24_room_id" = 'BEDS24_ROOM_ID_BURAYA'
WHERE id = 2;
```

**ÖNEMLİ:** `'BEDS24_ROOM_ID_BURAYA'` kısmını Beds24 dashboard'unuzdan aldığınız gerçek room ID ile değiştirin.

## Adım 4: Doğrulama

Migration'ların başarılı olduğunu doğrulamak için:

### 4.1 Tablo Yapısını Kontrol Edin

```sql
-- Rooms_Information tablosundaki kolonları kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Rooms_Information' 
AND column_name LIKE '%24%' OR column_name LIKE '%channex%';
```

Bu sorgu sadece `beds24_room_id` kolonunu göstermeli, `channex_room_type_id` veya `channex_rate_plan_id` göstermemeli.

```sql
-- Reservation_Information tablosundaki kolonları kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Reservation_Information' 
AND column_name LIKE '%24%' OR column_name LIKE '%channex%';
```

Bu sorgu sadece `beds24_booking_id` kolonunu göstermeli, `channex_booking_id` göstermemeli.

### 4.2 Index'leri Kontrol Edin

```sql
-- Beds24 index'lerinin oluşturulduğunu doğrula
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('Rooms_Information', 'Reservation_Information')
AND indexname LIKE '%beds24%';
```

Bu sorgu şu index'leri göstermeli:
- `idx_rooms_beds24_id`
- `idx_reservations_beds24_booking_id`

### 4.3 Oda ID'lerinin Güncellendiğini Kontrol Edin

```sql
-- Beds24 Room ID'si olan odaları listele
SELECT id, name, type_name, beds24_room_id 
FROM "Rooms_Information" 
WHERE beds24_room_id IS NOT NULL;
```

Tüm odalarınızın `beds24_room_id` değeri olmalı.

## Adım 5: Yedekleme (Opsiyonel ama Önerilen)

Migration'dan önce veritabanınızın yedeğini almak isterseniz:

1. Supabase Dashboard'da **Database** > **Backups** bölümüne gidin
2. **Create Backup** butonuna tıklayın
3. Backup tamamlanana kadar bekleyin

## Sorun Giderme

### Hata: "column already exists"

Eğer "column already exists" hatası alırsanız, bu normal. `IF NOT EXISTS` komutu sayesinde kod güvenli bir şekilde çalışır.

### Hata: "cannot drop column because other objects depend on it"

Bu durumda, önce bağımlı view'ları veya function'ları kaldırmanız gerekebilir. Hangi objelerin bağımlı olduğunu görmek için:

```sql
SELECT * FROM pg_depend 
WHERE refobjid = 'Rooms_Information'::regclass;
```

### Migration Geri Alma (Rollback)

Eğer bir sorun olursa ve geri almak isterseniz:

```sql
-- Beds24 kolonlarını kaldır
ALTER TABLE "Rooms_Information" DROP COLUMN IF EXISTS "beds24_room_id";
ALTER TABLE "Reservation_Information" DROP COLUMN IF EXISTS "beds24_booking_id";

-- Channex kolonlarını geri ekle
ALTER TABLE "Rooms_Information" 
ADD COLUMN IF NOT EXISTS "channex_room_type_id" text,
ADD COLUMN IF NOT EXISTS "channex_rate_plan_id" text;

ALTER TABLE "Reservation_Information" 
ADD COLUMN IF NOT EXISTS "channex_booking_id" text;
```

## Sonraki Adımlar

Migration tamamlandıktan sonra:

1. ✅ Uygulamanızı yeniden başlatın
2. ✅ `/api/test-beds24` endpoint'ini test edin
3. ✅ Test rezervasyonu oluşturun
4. ✅ Beds24 dashboard'unda rezervasyonun göründüğünü kontrol edin

Herhangi bir sorunla karşılaşırsanız, Supabase SQL Editor'deki hata mesajlarını kontrol edin.
