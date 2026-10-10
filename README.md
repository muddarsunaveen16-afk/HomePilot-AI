\# 🏠 HomePilot AI — Intelligent Home Assistant



An AI-powered home assistant designed to simplify everyday home management through conversational interaction, automated routines, task tracking, shopping lists, personal work management, and energy usage analysis.



\## ✨ Features



\- 🏡 \*\*Smart Home Routines\*\* — Supports leaving-home, arriving-home, and bedtime routines.

\- 🤖 \*\*Conversational Assistant\*\* — Interact with HomePilot AI using a chat-based interface.

\- ✅ \*\*Task Management\*\* — View, add, and complete everyday tasks.

\- 🛒 \*\*Shopping Management\*\* — Manage shopping lists and remove items.

\- ⚡ \*\*Energy Analytics\*\* — Analyze household energy usage.

\- 💼 \*\*Personal Work Management\*\* — Organize personal work through a dedicated module.

\- 📊 \*\*Interactive Dashboard\*\* — View home information through a modern web interface.



\## 🛠️ Tech Stack



\*\*Frontend\*\*

\- React

\- JavaScript

\- Vite

\- CSS

\- Axios

\- Recharts



\*\*Backend\*\*

\- Python

\- FastAPI

\- Pydantic

\- REST API



\## 🏗️ Project Structure



```text

HomePilot-AI/

├── backend/

│   ├── main.py

│   └── tools/

│       ├── energy\_tool.py

│       ├── home\_tool.py

│       ├── personal\_work\_tool.py

│       ├── shopping\_tool.py

│       └── task\_tool.py

├── frontend/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   ├── PersonalWork.jsx

│   │   └── main.jsx

│   └── package.json

├── .gitignore

└── README.md

```



\## 🚀 Getting Started



\### Prerequisites



\- Python

\- Node.js and npm

\- Git



\### 1. Clone the repository



```bash

git clone https://github.com/muddarsunaveen16-afk/HomePilot-AI.git

cd HomePilot-AI

```



\### 2. Set up the backend



Create and activate a Python virtual environment.



\*\*Windows PowerShell:\*\*



```powershell

python -m venv .venv

.\\.venv\\Scripts\\Activate.ps1

python -m pip install fastapi uvicorn pydantic python-dotenv

```



Start the backend from the project root:



```powershell

uvicorn backend.main:app --reload

```



Backend API: http://127.0.0.1:8000



Interactive API documentation: http://127.0.0.1:8000/docs



\### 3. Set up the frontend



Open a second terminal:



```powershell

cd frontend

npm install

npm run dev

```



Open the local URL displayed by Vite, usually http://localhost:5173.



\## 🎯 Project Goal



HomePilot AI aims to bring common home-management activities together in one convenient interface, helping users organize routines, daily tasks, shopping, and energy information.



\## 🔮 Future Improvements



\- Integrate real smart-home devices and IoT sensors.

\- Add voice-based interaction.

\- Introduce personalized AI recommendations.

\- Improve energy-consumption insights.

\- Add secure authentication and user-specific profiles.

\- Deploy the application for online access.



\## 👨‍💻 Developer



\*\*Muddarsu Naveen\*\*



B.Tech — Artificial Intelligence and Machine Learning



GitHub: https://github.com/muddarsunaveen16-afk



\## 📄 License



A license has not yet been specified for this project.



