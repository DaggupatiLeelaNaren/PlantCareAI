# 🌱 PlantCareAI – AI-Powered Plant Disease Detection System

PlantCareAI is a web-based plant disease detection and analysis application that helps users identify possible plant diseases by uploading leaf images. It uses Google's Gemini 2.5 Pro API to analyze plant images and provides disease information, confidence scores, severity levels, and treatment recommendations.

The application supports both single-image analysis and batch dataset analysis, with visual reports to help users understand the results.

## ✨ Features

### 1. AI-Based Plant Disease Detection
- Upload a plant leaf image for disease analysis.
- Uses **Google Gemini 2.5 Pro** for image-based disease identification.
- Returns the predicted disease, confidence score, scientific name (when available), severity, and description.
- Includes retry handling for temporary Gemini API failures.

### 2. CNN-Based Prediction Module
- Includes a CNN classification module that generates disease predictions and alternative confidence scores.
- Provides a fallback when Gemini analysis is unavailable.
- The current CNN implementation is a **simulation**, not a trained deep learning model.

### 3. Dataset Analysis
- Upload multiple plant images for batch analysis.
- Supports up to 50 images per dataset request.
- Displays disease distribution and individual image results.
- Calculates average confidence values and model agreement statistics.

### 4. Disease Information
- Provides disease-related information through a disease database.
- Includes causes, symptoms, prevention methods, and treatment recommendations.
- Displays plant care requirements such as watering, soil, sunlight, temperature, and humidity.

### 5. Analysis Dashboard
- Displays Gemini and CNN prediction results.
- Visualizes confidence scores and prediction comparisons.
- Includes disease information and treatment panels.
- Supports downloading an analysis report in JSON format.

### 6. Image Upload
- Supports JPG, JPEG, and PNG images.
- Provides drag-and-drop image uploading.
- Displays image previews before analysis.
- Limits individual image uploads to 10 MB.

## 🧰 Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 18, TypeScript |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| AI Integration | Google Gemini API |
| AI Model | Gemini 2.5 Pro |
| Prediction Module | Simulated CNN classification |
| UI Components | Radix UI, shadcn-style components |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| API Communication | Fetch API |
| File Upload | Multer |
| Database Configuration | Drizzle ORM, PostgreSQL-compatible configuration |
| Validation | Zod |

## 🏗️ Project Architecture

```text
PlantCareAI/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   ├── visualizations/
│       │   ├── analysis-progress.tsx
│       │   ├── dataset-results.tsx
│       │   ├── disease-info.tsx
│       │   ├── results-dashboard.tsx
│       │   ├── treatment-panel.tsx
│       │   └── upload-zone.tsx
│       │
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       │   ├── home.tsx
│       │   └── not-found.tsx
│       ├── App.tsx
│       ├── index.css
│       └── main.tsx
│
├── server/
│   ├── cnn-model.ts
│   ├── disease-database.ts
│   ├── gemini.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
│
├── shared/
│   └── schema.ts
│
├── .gitignore
├── components.json
├── drizzle.config.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js (20 or later recommended)
- npm
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/DaggupatiLeelaNaren/PlantCareAI.git
```

### 2. Navigate to the Project Directory

```bash
cd PlantCareAI
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the Gemini API Key

The backend uses the Google Gemini API through the `@google/genai` package.

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
HOST=localhost
```

Get your API key from:

https://aistudio.google.com/app/apikey

**Important security notes:**
- Replace the placeholder with your own Gemini API key.
- Never share your API key publicly.
- Never put the API key in React frontend code.
- Never commit `.env` to GitHub.
- Keep API credentials on the backend only.

The application reads the key using:

```javascript
process.env.GEMINI_API_KEY
```

inside `server/gemini.ts`.

### 5. Start the Application

Run both the backend and frontend development servers:

```bash
npm run dev
```

The project defines separate development scripts:

```bash
npm run dev:server
```

```bash
npm run dev:client
```

### 6. Open the Application

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

The frontend is served by Vite, while the backend runs through Express.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analyze` | Analyze a single plant image |
| POST | `/api/analyze-dataset` | Analyze multiple plant images |
| GET | `/api/disease/:name` | Retrieve disease information |

### Single Image Analysis

Endpoint:

```http
POST /api/analyze
```

Form-data:

```text
image: plant-leaf.jpg
```

### Dataset Analysis

Endpoint:

```http
POST /api/analyze-dataset
```

Form-data:

```text
images: leaf1.jpg
images: leaf2.jpg
images: leaf3.jpg
```

Maximum: 50 images per request.

### Disease Information

Endpoint:

```http
GET /api/disease/Tomato%20Late%20Blight
```

Returns information about the requested disease.

## 🔄 Application Workflow

```text
User Uploads Plant Image
          |
          v
     React Frontend
          |
          v
     Express Backend
          |
          v
   Google Gemini 2.5 Pro
          |
          v
   Plant Disease Analysis
          |
          v
    CNN Simulation Module
          |
          v
  Combine Prediction Results
          |
          v
    Results Dashboard
          |
          v
 Disease Details and Treatment
```

If Gemini analysis fails, the backend attempts to use the CNN simulation as a fallback.

## 📊 Analysis Results

The application provides:

- Predicted plant disease
- Confidence score
- Disease severity
- Scientific name when available
- Disease description
- Alternative CNN predictions
- Model agreement information
- Treatment and prevention recommendations
- Dataset-level disease distribution

Users can also download an individual analysis report as a JSON file.

## 🛡️ Security and Configuration

- Gemini API credentials are accessed on the backend.
- Uploaded files are validated as images.
- Maximum upload size is 10 MB per image.
- Uploaded images are deleted after processing in the normal request flow.
- `.env`, `node_modules`, `.local`, and generated upload data should not be committed to Git.

## 🚀 Future Enhancements

- Integrate a genuinely trained CNN model for plant disease classification.
- Improve model evaluation using labeled datasets.
- Add more plant species and disease categories.
- Introduce persistent analysis history.
- Add user authentication and personalized plant management.
- Improve dataset evaluation using verified ground-truth labels.
- Deploy the application to a cloud platform.

## 👨‍💻 Author

**Leela Naren Daggupati**

GitHub: [DaggupatiLeelaNaren](https://github.com/DaggupatiLeelaNaren)

Project Repository: [PlantCareAI](https://github.com/DaggupatiLeelaNaren/PlantCareAI)

## 📄 License

This project currently declares the MIT license in `package.json`. Add a `LICENSE` file to the repository if you intend to distribute it under the MIT License.

---

⭐ If you find this project useful, consider giving the repository a star!
