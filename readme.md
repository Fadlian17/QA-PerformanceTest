Tentu, ini dia versi `README.md` dengan bahasa Indonesia yang lebih kasual dan mudah dimengerti, cocok untuk GitHub:

# Tes Performa API Aplikasi Daftar Kontak

## Sekilas Proyek

Repositori ini isinya proyek **tes performa** buat API aplikasi Daftar Kontak, yang saya buat pakai **Apache JMeter**. Tujuan utama proyek ini adalah buat ngecek gimana sih performa API-nya pas dikasih beban yang beda-beda, biar ketahuan mana yang jadi "bottleneck" atau titik lemahnya.

-----

## Link Penting

  * **Dokumentasi API Aplikasi Daftar Kontak:** [https://documenter.getpostman.com/view/4012288/TzK2bEa8\#bcd848eb-d7ae-4b73-9a0c-59eb2254017e](https://documenter.getpostman.com/view/4012288/TzK2bEa8#bcd848eb-d7ae-4b73-9a0c-59eb2254017e)
  * **Website Aplikasi Daftar Kontak (Buat Referensi Tampilan):** [https://thinking-tester-contact-list.herokuapp.com/](https://thinking-tester-contact-list.herokuapp.com/)

-----

## Teknologi yang Dipakai

  * Cuma satu kok, **Apache JMeter**\!

-----

## Skenario Tes

Di proyek ini, saya bikin dua skenario tes performa utama:

1.  **Load Testing (Tes Beban):** Ini kayak nyimulasikan kalau banyak user masuk dan pakai aplikasi secara bertahap. Tujuannya biar tahu gimana API-nya nahan beban di kondisi "puncak" yang biasa.
2.  **Stress Testing (Tes Stres):** Nah, kalau ini kita dorong API-nya sampai "mentok" atau di luar batas normal. Ini buat cari tahu di titik mana API-nya mulai ngaco atau kapasitas maksimalnya berapa.

Tes ini mencakup endpoint API berikut, yang semuanya butuh **Bearer Token** buat otentikasi:

  * Login Pengguna (`POST /users/login`)
  * Ambil Profil Pengguna (`GET /users/me`)
  * Tambah Kontak (`POST /contacts`)
  * Ambil Daftar Kontak (`GET /contacts`)
  * Ambil Satu Kontak (`GET /contacts/{id}`)
  * Update Kontak (`PUT /contacts/{id}`)
  * Update Kontak Sebagian (`PATCH /contacts/{id}`)
  * Hapus Kontak (`DELETE /contacts/{id}`)

-----

## Cara Jalanin Tesnya

1.  **Siapin Dulu:**

      * Udah install **Apache JMeter** kan?
      * Pastikan kamu udah punya akun tes yang terdaftar di aplikasi Daftar Kontak.

2.  **Gandakan Repositori Ini:**

    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

3.  **Buka File JMeter:**

      * Buka file `jmeter-project/ContactListApp_PerformanceTest.jmx` pakai Apache JMeter.
      * **PENTING BANGET:** Jangan lupa **ganti** email dan password di bagian "Login" HTTP Request Sampler dengan akun tes kamu ya\!

4.  **Jalanin dari Command Line (Buat Bikin Laporan HTML):**

    **Buat Tes Beban (Load Test):**

    ```bash
    jmeter -n -t jmeter-project/ContactListApp_PerformanceTest.jmx -l results/load-test/results.jtl -e -o results/load-test/html-report
    ```

    **Buat Tes Stres (Stress Test):**
    (Mungkin kamu perlu ubah pengaturan Thread Group di JMeter buat tes stres sebelum ngejalanin perintah ini)

    ```bash
    jmeter -n -t jmeter-project/ContactListApp_PerformanceTest.jmx -l results/stress-test/results.jtl -e -o results/stress-test/html-report
    ```

    *Catatan: Pastikan folder `results/load-test/html-report` dan `results/stress-test/html-report` **kosong** ya sebelum jalanin perintahnya, kalau nggak nanti JMeter-nya error.*

-----

## Hasil Tes dan Dokumen

  * **Laporan Tes Performa (PDF):**
    Analisis detail dari hasil tes performa, termasuk temuan, kesimpulan, dan rekomendasi, bisa kamu lihat di sini:
    [Link ke Performance\_Test\_Report\_ContactListApp.pdf](https://www.google.com/search?q=documentation/Performance_Test_Report_ContactListApp.pdf)

  * **Laporan HTML:**

      * [Laporan HTML Tes Beban](https://www.google.com/search?q=results/load-test/html-report/index.html)
      * [Laporan HTML Tes Stres](https://www.google.com/search?q=results/stress-test/html-report/index.html)

  * **Video Demo:**
    Lihat langsung gimana tes performa ini dijalankan dan penjelasan detail tentang skenario JMeter-nya di sini:
    [Link ke ContactListApp\_PerformanceTest\_Demo.mp4](https://www.google.com/search?q=video/ContactListApp_PerformanceTest_Demo.mp4)

-----

## Temuan Penting (Contoh - Nanti Kamu Isi Sendiri Ya Setelah Tes)

  * API-nya lumayan cepet responsnya pas bebannya ringan sampai sedang (di Tes Beban).
  * Tapi, responsnya jadi jauh lebih lambat kalau jumlah user yang barengan lebih dari **[X]** (di Tes Stres).
  * Endpoint `Add Contact` (`POST /contacts`) responsnya lebih lama dibanding endpoint `GET` pas bebannya berat.
  * Angka error mulai naik pas jumlah user yang barengan udah nyampe **[Y]**.

-----