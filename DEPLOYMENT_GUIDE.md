# 100% Free Deployment & Cloud Storage Guide (No Credit Card Required)

This guide shows you how to deploy the **Dhritam Knowledge Base** completely **free without any credit card or billing account**:
- **Hosting**: **Vercel** (Free Hobby plan)
- **Database**: **Firebase Cloud Firestore** (100% Free Spark plan, NO credit card)
- **File Storage (PDFs, Docs, Images, Media)**: **Cloudinary** (100% Free, 25 GB credit/mo, NO credit card)

---

## Part 1: Firebase Firestore Setup (Free Spark Plan)

> **Important**: Cloud Firestore is **100% free** on the Spark plan and does **not** require the Blaze billing upgrade! Only Firebase Cloud Storage asks for Blaze. By using Cloudinary for files and Firestore for database records, you stay 100% free with no credit card.

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**.
2. Name your project (e.g., `dhritam-knowledge-base`).
3. Click **Create project** (keep the default free **Spark** tier).

### 2. Register Web App & Get API Credentials
1. In your Firebase Project Overview, click the **Web icon (`</>`)**.
2. Nickname: `dhritam-web` -> click **Register app**.
3. Copy the values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `messagingSenderId`
   - `appId`

### 3. Create Firestore Database
1. In the left menu, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g. `asia-south1`, `nam5`, or `eur3`).
4. Select **Start in test mode** and click **Enable**.
5. Go to the **Rules** tab, paste the rules below, and click **Publish**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /dhritam_documents/{documentId} {
         allow read, write: if true;
       }
     }
   }
   ```

---

## Part 2: Cloudinary Setup (Free File Storage, No Credit Card)

Cloudinary provides 25GB of monthly storage/bandwidth completely free without requiring a credit card.

### 1. Create a Free Account
1. Go to [Cloudinary Sign Up](https://cloudinary.com/users/register_free) and create a free account.
2. Once in your Cloudinary Dashboard, copy your **Cloud Name** (e.g. `dhritam-team` or `dxy12345`).

### 2. Create an "Unsigned" Upload Preset (Takes 30 seconds)
1. In Cloudinary, click the **Settings (gear icon)** at the bottom left.
2. Click **Upload** in the settings menu.
3. Scroll down to **Upload presets** and click **Add upload preset**.
4. Set **Signing Mode** to **Unsigned** (crucial!).
5. You can name the preset `dhritam_kb` (or note whatever name Cloudinary generates).
6. (Optional) Set folder name to `dhritam_kb`.
7. Click **Save**.

### 3. Enable PDF & ZIP Files Delivery (Crucial to prevent 401 ACL error!)
By default, new Cloudinary accounts restrict PDF downloads. To allow downloads:
1. In Cloudinary, go to **Settings (gear icon)** > **Security** tab.
2. Scroll down to **"Restricted media types"**.
3. **Uncheck** the box next to **"PDF and ZIP files delivery"** (or enable allow delivery of PDF and ZIP files).
4. Scroll to the bottom and click **Save**.

Now you have:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = your Cloud Name
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` = your Preset Name (e.g. `dhritam_kb`)

---

## Part 3: Local Testing (.env.local)

Create a `.env.local` file in your project folder:
```env
# Firebase Firestore (Free)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef

# Cloudinary File Storage (Free)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=dhritam_kb
```

Run:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and try uploading a document or PDF. The file will upload to Cloudinary, and its record (title, tags, category, author, version, and view count) will be synced to Firestore!

---

## Part 4: Deploying to Vercel (100% Free)

### Deploy via GitHub (Recommended)
1. Initialize git and push your repository:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit for Dhritam Knowledge Base"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
3. Click **Add New... > Project** and import your repository.
4. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
5. Click **Deploy**. Vercel will build and assign you your live production URL (e.g. `https://dhritam-knowledge-base.vercel.app`).
