# CreditGuardAI

CreditGuardAI is an advanced, AI-powered financial assistant designed to empower users with deep insights into their credit health and loan fairness. By leveraging the power of Google's Gemini models, it provides detailed comparisons, fairness checks, and personalized financial advice.

## 🚀 Features

- **Financial Profile Wizard**: An intuitive step-by-step interface to collect and structure your financial data.
- **AI-Powered Credit Analysis**: In-depth analysis of credit factors using LLM agents to verify logic and fairness.
- **Loan Fairness Engine**: Analyzes loan offers against market standards to detect predatory terms.
- **Market Comparison**: Compares your offers with standard market rates to ensure you get the best deal.
- **Interactive Dashboards**: Visualizations using Chart.js to track score improvements and financial health.
- **Accessibility Friendly**: Includes Text-to-Speech (TTS) capabilities for accessible reports.

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: React 19, Lucide React
- **Visualization**: Chart.js, React-Chartjs-2

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **AI Model**: Google Gemini (`google-genai`)
- **Utilities**: `fpdf2` (PDF Reporting), `edge-tts` (Text-to-Speech), `pypdf`

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **npm** or **yarn**
- A **Google Gemini API Key**

## 🏁 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cred-guard-ai
   ```

2. **Backend Setup**
   Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   pip install -r ../requirements.txt
   ```
   *Note: It is recommended to use a virtual environment.*
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r ../requirements.txt
   ```

3. **Frontend Setup**
   Install the Node.js dependencies:
   ```bash
   # From the root directory
   npm install
   ```

4. **Environment Configuration**
   - Create a `.env` file in the `backend/` directory or set the environment variable directly.
   - Variable required: `GEMINI_API_KEY`

## 🏃‍♂️ Running Locally

To run the full application, you need to start both the backend and frontend servers.

### 1. Start the Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`.

### 2. Start the Frontend
Open a new terminal window:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.


## 📂 Project Structure

```
cred-guard-ai/
├── app/                  # Next.js App Router pages
├── backend/              # FastAPI backend application
│   ├── agents/           # AI Agent logic (Loan Analyzer, etc.)
│   └── main.py           # API Entry point
├── components/           # React UI components
├── public/               # Static assets
└── requirements.txt      # Python dependencies
```
