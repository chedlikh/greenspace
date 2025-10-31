<div align="center">

# GreenSpace

**The social platform for discovering and sharing urban green spaces.**

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI/CD-FF6F61?style=for-the-badge&logo=jenkins&logoColor=white)](https://jenkins.io)

**Live Demo** → [greenspace.ddns.net:3000](http://greenspace.ddns.net:3000)

</div>

---

## Features

| Feature | Status |
|--------|--------|
| Social Feed with Media | Done |
| Groups (Public/Private) | Done |
| 24-Hour Stories | Done |
| Real-Time Notifications | Done |
| Likes, Reactions, Nested Comments | Done |
| File Uploads & Thumbnails | Done |
| Polls (Sondage) System | Done |
| Full Docker + Jenkins CI/CD | Done |

---

## Tech Stack

```text
Backend   → Spring Boot 3.4, JPA, JWT, WebSocket
Frontend  → React + Vite
Database  → MySQL 5.7 + phpMyAdmin
DevOps    → Docker, Jenkins, Nexus
Auth      → JWT + Spring Security

Quick Start (Docker)
bashgit clone https://github.com/chedlikh/greenspace.git
cd greenspace
docker compose up -d
Access

























ServiceURLLoginFrontendhttp://localhost:3000RegisterAPIhttp://localhost:8089JWTphpMyAdminhttp://localhost:8099root / root

Production: http://192.168.0.187:3000


API Examples
httpPOST   /api/auth/register
POST   /api/publications
GET    /api/groups
POST   /api/stories/media/user/{username}
GET    /api/notifications/user/{username}

CI/CD Pipeline
#mermaid-diagram-mermaid-nrma68c{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;fill:#000000;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-diagram-mermaid-nrma68c .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-diagram-mermaid-nrma68c .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-diagram-mermaid-nrma68c .error-icon{fill:#552222;}#mermaid-diagram-mermaid-nrma68c .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-mermaid-nrma68c .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-mermaid-nrma68c .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-mermaid-nrma68c .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-mermaid-nrma68c .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-mermaid-nrma68c .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-mermaid-nrma68c .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-mermaid-nrma68c .marker{fill:#666;stroke:#666;}#mermaid-diagram-mermaid-nrma68c .marker.cross{stroke:#666;}#mermaid-diagram-mermaid-nrma68c svg{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;}#mermaid-diagram-mermaid-nrma68c p{margin:0;}#mermaid-diagram-mermaid-nrma68c .label{font-family:"trebuchet ms",verdana,arial,sans-serif;color:#000000;}#mermaid-diagram-mermaid-nrma68c .cluster-label text{fill:#333;}#mermaid-diagram-mermaid-nrma68c .cluster-label span{color:#333;}#mermaid-diagram-mermaid-nrma68c .cluster-label span p{background-color:transparent;}#mermaid-diagram-mermaid-nrma68c .label text,#mermaid-diagram-mermaid-nrma68c span{fill:#000000;color:#000000;}#mermaid-diagram-mermaid-nrma68c .node rect,#mermaid-diagram-mermaid-nrma68c .node circle,#mermaid-diagram-mermaid-nrma68c .node ellipse,#mermaid-diagram-mermaid-nrma68c .node polygon,#mermaid-diagram-mermaid-nrma68c .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-mermaid-nrma68c .rough-node .label text,#mermaid-diagram-mermaid-nrma68c .node .label text,#mermaid-diagram-mermaid-nrma68c .image-shape .label,#mermaid-diagram-mermaid-nrma68c .icon-shape .label{text-anchor:middle;}#mermaid-diagram-mermaid-nrma68c .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-mermaid-nrma68c .rough-node .label,#mermaid-diagram-mermaid-nrma68c .node .label,#mermaid-diagram-mermaid-nrma68c .image-shape .label,#mermaid-diagram-mermaid-nrma68c .icon-shape .label{text-align:center;}#mermaid-diagram-mermaid-nrma68c .node.clickable{cursor:pointer;}#mermaid-diagram-mermaid-nrma68c .root .anchor path{fill:#666!important;stroke-width:0;stroke:#666;}#mermaid-diagram-mermaid-nrma68c .arrowheadPath{fill:#333333;}#mermaid-diagram-mermaid-nrma68c .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-mermaid-nrma68c .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-mermaid-nrma68c .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-mermaid-nrma68c .edgeLabel p{background-color:white;}#mermaid-diagram-mermaid-nrma68c .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-mermaid-nrma68c .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-mermaid-nrma68c .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-mermaid-nrma68c .cluster text{fill:#333;}#mermaid-diagram-mermaid-nrma68c .cluster span{color:#333;}#mermaid-diagram-mermaid-nrma68c div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-mermaid-nrma68c .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-mermaid-nrma68c rect.text{fill:none;stroke-width:0;}#mermaid-diagram-mermaid-nrma68c .icon-shape,#mermaid-diagram-mermaid-nrma68c .image-shape{background-color:white;text-align:center;}#mermaid-diagram-mermaid-nrma68c .icon-shape p,#mermaid-diagram-mermaid-nrma68c .image-shape p{background-color:white;padding:2px;}#mermaid-diagram-mermaid-nrma68c .icon-shape rect,#mermaid-diagram-mermaid-nrma68c .image-shape rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-mermaid-nrma68c :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}GitHubJenkinsMaven BuildNexus PublishDocker BuildDocker Pushdocker compose up -d

Screenshots (coming soon)
markdown<image-card alt="Feed" src="screenshots/feed.png" ></image-card>
<image-card alt="Group" src="screenshots/group.png" ></image-card>
<image-card alt="Story" src="screenshots/story.png" ></image-card>

Contributing
bashgit checkout -b feature/your-idea
git commit -m "Add amazing feature"
git push origin feature/your-idea
→ Open a Pull Request

License
textMIT License © 2025 chedlikh


Made with passion for green cities
GitHub • Email
Star this repo if you love it!

```
