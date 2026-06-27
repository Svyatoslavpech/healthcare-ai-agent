# 🤝 Contributing to Post-Discharge Patient Care Agent

Thank you for considering contributing to this project! 🎉

---

## 🧭 Project Status

- ✅ Backend: Production-ready (Flask, 4-layer safety, MLflow)
- 🚧 Frontend: In development (React)
- 📱 Mobile: Planned (Flutter)
- 📊 Monitoring: Planned (Prometheus + Grafana)

**High-priority areas:**

1. React frontend components (Login, Dashboard — in progress)
2. Flutter mobile app (basic screens)
3. Integration tests (mock watsonx API)
4. Documentation improvements

---

## 🛠️ Development Setup

```bash
git clone https://github.com/Svyatoslavpech/healthcare-ai-agent.git
cd healthcare-ai-agent

# Backend
cd src/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
flask run

# Frontend
cd frontend && npm install && npm start
```

---

## 🧪 Testing

```bash
# Backend unit tests
PYTHONPATH=src/backend pytest tests/unit -v

# Integration tests
PYTHONPATH=src/backend pytest tests/integration -v

# Frontend tests
cd frontend && npm test
```

---

## 📝 Pull Request Guidelines

1. **Fork** the repository
2. **Create a branch:** `git checkout -b feature/your-feature`
3. **Write tests** for new functionality
4. **Commit:** `git commit -m "feat: add Login component"`
5. **Push** and open a Pull Request

---

## 🔒 Security

For security vulnerabilities, email **svyatoslavpech@gmail.com** directly — do NOT open a public issue.

---

**Project Lead:** Sviatoslav Pechenevskyi | svyatoslavpech@gmail.com
