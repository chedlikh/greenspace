<div align="center">

# 🌿 GreenSpace

**The social platform for discovering and sharing urban green spaces.**

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI/CD-FF6F61?style=for-the-badge&logo=jenkins&logoColor=white)](https://jenkins.io)

**Live Demo** → [greenspace.ddns.net:3000](http://greenspace.ddns.net:3000)

</div>

---

## ✨ Features

| Feature | Status |
|-------|--------|
| Social Feed with Media | Done |
| Groups (Public/Private) | Done |
| 24-Hour Stories | Done |
| Real-Time Notifications | Done |
| Likes, Reactions, Nested Comments | Done |
| File Uploads & Thumbnails | Done |
| Polls (Sondage) System | Done |
| Full Docker + Jenkins CI/CD | Done |

---

## 🛠 Tech Stack
Backend   → Spring Boot 3.4, JPA, JWT, WebSocket
Frontend  → React + Vite
Database  → MySQL 5.7 + phpMyAdmin
DevOps    → Docker, Jenkins, Nexus
Auth      → JWT + Spring Security

🚀 Quick Start (Docker)
bashgit clone https://github.com/chedlikh/greenspace.git
cd greenspace
docker compose up -d
Access


📡 API Examples
httpPOST   /api/auth/register
POST   /api/publications
GET    /api/groups
POST   /api/stories/media/user/{username}
GET    /api/notifications/user/{username}

🏗 CI/CD Pipeline
graph LR
    A[GitHub] --> B(Jenkins)
    B --> C[Maven Build]
    C --> D[Nexus Publish]
    D --> E[Docker Build]
    E --> F[Docker Push]
    F --> G[docker compose up -d]
    
📸 Screenshots (coming soon)
markdown<image-card alt="Feed" src="screenshots/feed.png" ></image-card>
<image-card alt="Group" src="screenshots/group.png" ></image-card>
<image-card alt="Story" src="screenshots/story.png" ></image-card>

🤝 Contributing
bashgit checkout -b feature/your-idea
git commit -m "Add amazing feature"
git push origin feature/your-idea
→ Open a Pull Request

📄 License
textMIT License © 2025 chedlikh


                                                                   Made with passion for green cities
                                                                    Email : chedli.khangui@gmail.com
                                                                     Star this repo if you love it!
