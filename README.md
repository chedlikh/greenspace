# 🌿 GreenSpace

**The social platform for discovering and sharing urban green spaces.**

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-FF6F61?style=for-the-badge&logo=jenkins&logoColor=white)](https://jenkins.io)

**🌐 Live Demo:** [greenspace.ddns.net:3000](http://greenspace.ddns.net:3000)

---

## ✨ Features

| Feature | Status |
|----------|---------|
| 📰 Social Feed with Media | ✅ Done |
| 👥 Groups (Public/Private) | ✅ Done |
| 📸 24-Hour Stories | ✅ Done |
| 🔔 Real-Time Notifications | ✅ Done |
| 💬 Likes, Reactions, Nested Comments | ✅ Done |
| 📁 File Uploads & Thumbnails | ✅ Done |
| 📊 Poll (Sondage) System | ✅ Done |
| ⚙️ Full Docker + Jenkins CI/CD | ✅ Done |

---

## 🛠 Tech Stack

```text
Backend   → Spring Boot 3.4, JPA, JWT, WebSocket
Frontend  → React + Vite
Database  → MySQL 5.7 + phpMyAdmin
DevOps    → Docker, Jenkins, Nexus
Auth      → JWT + Spring Security

🚀 Quick Start (Docker)
git clone https://github.com/chedlikh/greenspace.git
cd greenspace
docker compose up -d
POST   /api/auth/register
POST   /api/publications
GET    /api/groups
POST   /api/stories/media/user/{username}
GET    /api/notifications/user/{username}

🏗 CI/CD Pipeline
![mermaid-diagram](https://github.com/user-attachments/assets/21260700-b1ee-4270-b8a8-3cd879468e96)<div align="center">

📸 Screenshots (coming soon)
📄 License

MIT License © 2025 chedlikh
💚 Made with passion for greener cities.
📧 Email: chedli.khangui@gmail.com

⭐ Star this repo if you love it!
