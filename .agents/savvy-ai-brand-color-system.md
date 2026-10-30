# Savvy.AI --- Brand Color System

Panduan warna untuk logo dan antarmuka browser extension **Savvy.AI ---
Your AI Form-Filling Companion**.

## 1. Warna utama (Brand Identity)

  -----------------------------------------------------------------------
  Nama                    Hex                     Peran
  ----------------------- ----------------------- -----------------------
  Savvy Blue              `#398CF5`               Warna utama; teknologi,
                                                  kepercayaan, dan
                                                  kecerdasan

  Savvy Purple            `#7045ED`               Warna pendamping; AI,
                                                  kreativitas, dan
                                                  inovasi

  Cloud White             `#FFFFFF`               Karakter form, ruang
                                                  kosong, dan kesan
                                                  bersih
  -----------------------------------------------------------------------

### Gradient utama

`#35B8F5 → #398CF5 → #7045ED`

Gunakan gradient biru ke ungu pada latar atau elemen identitas logo.
Pertahankan transisi yang halus.

## 2. Warna status

  Nama          Hex         Peran
  ------------- ----------- -----------------------
  Savvy Green   `#12C98A`   Status ON / aktif
  Savvy Red     `#EF5350`   Status OFF / nonaktif

### Aturan status

-   **ON:** gunakan badge hijau dengan tulisan `ON` berukuran besar dan
    tebal.
-   **OFF:** gunakan badge merah dengan tulisan `OFF` berukuran besar
    dan tebal.
-   Warna dasar maskot dan gradient identitas tidak berubah ketika
    status berganti.
-   Hijau hanya digunakan untuk status ON; merah hanya digunakan untuk
    status OFF.

## 3. Warna pendukung UI

  Nama          Hex         Penggunaan
  ------------- ----------- ---------------------------------
  Navy Ink      `#171B3D`   Teks utama
  Soft Blue     `#EAF3FF`   Latar panel atau area informasi
  Soft Purple   `#F0EBFF`   Highlight fitur AI
  Soft Green    `#E5FAF1`   Latar lembut untuk status ON
  Soft Red      `#FDECEC`   Latar lembut untuk status OFF
  Light Gray    `#F5F7FA`   Latar aplikasi

## 4. Varian logo

### Default Logo

-   Maskot form putih.
-   Aksen dan latar gradient biru-ungu.
-   Tanpa badge status ON/OFF.

### Active Logo

-   Gunakan desain Default Logo.
-   Tambahkan badge hijau `ON`.
-   Pastikan tulisan tetap terbaca pada ukuran icon browser extension.

### Inactive Logo

-   Gunakan desain Default Logo.
-   Tambahkan badge merah `OFF`.
-   Pastikan tulisan tetap terbaca pada ukuran icon browser extension.

## 5. Proporsi warna yang disarankan

  Warna                               Proporsi
  --------------------------------- ----------
  Putih                                    60%
  Biru                                     25%
  Ungu                                     10%
  Warna status (hijau atau merah)           5%

Proporsi ini merupakan panduan visual, bukan aturan teknis yang kaku.

## 6. Prinsip konsistensi

1.  Jangan mengubah warna dasar karakter antara versi ON dan OFF.
2.  Biru-ungu selalu menjadi identitas utama Savvy.AI.
3.  Hijau menandakan ON; merah menandakan OFF.
4.  Tulisan ON/OFF harus tebal, besar, dan terbaca pada ukuran icon
    kecil.
5.  Hindari penggunaan warna aksen yang terlalu banyak.
6.  Jaga kontras teks dan badge agar tetap jelas pada latar terang
    maupun gelap.

## 7. Token warna (CSS)

``` css
:root {
  /* Brand */
  --savvy-blue: #398CF5;
  --savvy-purple: #7045ED;
  --savvy-white: #FFFFFF;
  --savvy-gradient: linear-gradient(
    110deg,
    #35B8F5 0%,
    #398CF5 48%,
    #7045ED 100%
  );

  /* Status */
  --savvy-green: #12C98A;
  --savvy-red: #EF5350;

  /* UI */
  --savvy-navy-ink: #171B3D;
  --savvy-soft-blue: #EAF3FF;
  --savvy-soft-purple: #F0EBFF;
  --savvy-soft-green: #E5FAF1;
  --savvy-soft-red: #FDECEC;
  --savvy-light-gray: #F5F7FA;
}
```

## 8. Ringkasan

**Identitas Savvy.AI:** biru + ungu + putih\
**Status aktif:** hijau `#12C98A` dengan label `ON`\
**Status nonaktif:** merah `#EF5350` dengan label `OFF`

Gunakan sistem ini secara konsisten pada logo, icon extension, badge
status, dan antarmuka produk.
