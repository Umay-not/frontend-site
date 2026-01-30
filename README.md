# FiftyOne Frontend Site

Müşteri-odaklı e-ticaret web sitesi.

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

Site `http://localhost:5173` adresinde çalışacaktır.

## Yapılandırma

`.env.example` dosyasını `.env` olarak kopyalayın ve değerleri güncelleyin:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000/api
```

## Production Build

```bash
npm run build
npm run preview
```

## Bağımlılıklar

- **Backend Server**: `http://localhost:3000` - API istekleri için
- **Supabase**: Veritabanı ve authentication için
