
# 📇 Excel Contact Importer

**Excel Contact Importer**, Excel dosyalarını (XLSX formatında) okuyarak kişileri standart bir formata dönüştürmenizi sağlayan bir web uygulamasıdır. Kolon eşleştirme, şablon (template) kullanımı, JSON çıktısı alma ve önizleme gibi özellikler içerir.


---

## Özellikler

-  XLSX dosyası yükleme
-  Kolon eşleştirme (manuel veya şablon kullanarak)
-  Şablon kaydetme ve tekrar kullanma
-  JSON çıktısını önizleme
-  Gece/Gündüz modu desteği
-  JSON çıktısını indirme

---

##  Proje Yapısı

```
excel-contact-importer/
├── backend/              # Node.js (Express) backend API
│   └── routes/
│       ├── upload.ts
│       ├── map.ts
│       └── template.ts
├── frontend/             # React + TailwindCSS frontend
│   └── src/
│       ├── components/
│       ├── App.tsx
│       └── ...
├── .gitignore
├── README.md
└── package.json
```

---

## Kurulum

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend: `http://localhost:3001`  
> Backend API: `http://localhost:3000`

---

## 📦 API Uç Noktaları

| Yöntem | URL                                  | Açıklama |
|--------|--------------------------------------|----------|
| `POST` | `/api/upload`                        | Excel dosyası yükle |
| `POST` | `/api/map`                           | Kolon eşlemesi yap |
| `GET`  | `/api/template/list`                 | Kayıtlı şablonları getir |
| `GET`  | `/api/template/:name`                | Şablon detayını getir |
| `POST` | `/api/template/save`                 | Yeni şablon kaydet |

---

## Kullanım Adımları

1. XLSX dosyasını yükle
2. Kolonları manuel eşle veya bir şablon seç (Manuel olarak oluşturduğun eşleştirme konfigürasyonunu şablon olarak kaydedebilirsin.)
3. Eşleştirme sonucunu önizle
4. JSON çıktısını indir

---

## Kullanılan Teknolojiler

- **Frontend**: React, TypeScript, TailwindCSS, Zustand
- **Backend**: Node.js, Express, Multer, XLSX, SQLite
- **Diğer**: Dark/Light Mode, Vite, Toastify


## Katkıda Bulun

Pull request’ler, issue’lar ve öneriler her zaman memnuniyetle karşılanır!  
Projeyi beğendiysen ⭐ vermeyi unutma!

---

## 🧑‍💻 Geliştirici

**Arda Eymen Ulus**  
[GitHub Profilim](https://github.com/ardaeu) | [LinkedIn](https://linkedin.com/in/ardaeu)
