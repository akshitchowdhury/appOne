# Cloud Deployment Architecture — React on AWS EC2

An interactive architecture reference application that documents and visualises the full deployment pipeline for a React single-page application hosted on AWS EC2. Built as both a working cloud project and a self-describing portfolio artifact.

---

## Overview

This project serves a dual purpose. It is a React application that is itself deployed to AWS EC2, and it interactively explains how that deployment works — the infrastructure components involved, the decisions behind each one, the request lifecycle from browser to server, and the exact shell commands required to reproduce the setup from scratch.

The interface is structured across four interactive tabs: an annotated architecture diagram with clickable nodes, a phase-by-phase deployment breakdown, a technology stack reference, and a live request-flow walkthrough with key commands.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  AWS Account (Free Tier)                                        │
│                                                                 │
│  ┌──────────────┐     ┌─────────────────────────────────────┐  │
│  │   CloudWatch  │     │  EC2 Instance  (t2.micro / Ubuntu)  │  │
│  │  Billing Alert│     │                                     │  │
│  │  → SNS → Email│     │  ┌─────────────┐  ┌─────────────┐  │  │
│  └──────────────┘     │  │    Nginx     │  │ Security    │  │  │
│                        │  │  (port 80)  │  │   Group     │  │  │
│                        │  │             │  │  22/80/443  │  │  │
│                        │  │  /var/www/  │  └─────────────┘  │  │
│                        │  │  html/dist  │                   │  │
│                        │  └──────┬──────┘                   │  │
│                        │         │ serves                   │  │
│                        │  ┌──────▼──────┐                   │  │
│                        │  │  React SPA  │                   │  │
│                        │  │  (static)   │                   │  │
│                        │  └─────────────┘                   │  │
│                        └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              ▲
              │  HTTP request (port 80)
              │
        ┌─────┴──────┐
        │  Internet  │
        │   User     │
        └────────────┘

GitHub Repo ←── screenshots, README, source (proof of work)
```

---

## Architecture Decisions

### Why AWS EC2 over a managed platform (Vercel, Netlify, Render)?

Managed platforms abstract away the infrastructure layer entirely. That abstraction is appropriate for production SaaS products, but it forfeits the learning outcomes that come from operating a real server: understanding Linux, configuring a web server, managing a firewall, reading cloud billing, and reasoning about network topology. EC2 was chosen deliberately because it exposes every layer of the stack.

There is also a cost argument. The `t2.micro` instance is covered under the AWS Free Tier for 750 hours per month across the first 12 months — effectively zero cost for a single running instance. A static site on EC2 with Nginx can comfortably handle thousands of concurrent users at this tier, which is more than sufficient for a portfolio or learning project.

### Why Nginx over other serving options?

When `npm run build` completes, the output is a folder of static assets — HTML, JavaScript, and CSS. No Node.js process is required at runtime. Nginx is purpose-built for serving static files efficiently: it uses asynchronous, event-driven handling, which means it consumes negligible memory on a 1 GB RAM instance.

The single-page application routing requirement also favours Nginx. React Router handles navigation client-side, but a direct browser request to `/dashboard` would 404 on a naive file server because no file at that path exists on disk. The `try_files $uri /index.html` directive in Nginx catches all such requests and returns `index.html`, allowing React Router to take over — this is the canonical SPA fallback pattern.

Apache and Caddy were considered. Apache carries legacy configuration complexity. Caddy auto-provisions TLS certificates and would be the right choice if HTTPS were a requirement here, but it adds a daemon with a larger footprint and more configuration surface area. Nginx was chosen for its simplicity and industry prevalence.

### Why a Security Group over no firewall or a host-level firewall?

AWS Security Groups operate at the VPC (Virtual Private Cloud) level — packets that do not match the inbound rules are dropped before they reach the instance. This means the firewall is enforced by AWS infrastructure, not by software running on the instance itself. A compromised or misconfigured process on the instance cannot bypass it.

The inbound rules applied here follow the principle of least privilege:

- **Port 22 (SSH):** Restricted to the operator's public IP address. Wide-open SSH is one of the most common vectors for automated brute-force attacks on public EC2 instances.
- **Port 80 (HTTP):** Open to `0.0.0.0/0` — required for the app to be publicly accessible.
- **Port 443 (HTTPS):** Open to `0.0.0.0/0` — reserved for future TLS configuration.
- **All other ports:** Denied by default.

### Why CloudWatch Billing Alerts?

AWS charges are accrued silently. A misconfigured service, a forgotten resource, or an unexpected traffic spike can produce a bill that is only discovered at the end of the billing cycle. A CloudWatch alarm watching the `EstimatedCharges` metric set to a threshold of $1 provides an early-warning signal — it fires via SNS email before any meaningful cost is incurred. This is standard practice for any AWS account, not just free-tier usage.

### Why GitHub for source control and documentation?

Beyond version control, GitHub serves as the canonical public record of the project. Committing the architecture diagram, screenshots of the running infrastructure, and a detailed README alongside the application source creates an auditable, shareable proof-of-work artifact. For portfolio purposes this is more valuable than a deployment link alone, which can go offline.

---

## Technology Stack

| Component | Technology | Version | Role |
|---|---|---|---|
| Frontend framework | React | 19.x | Component model, client-side rendering |
| Language | TypeScript | 6.x | Static typing across the entire codebase |
| Build tool | Vite | 8.x | Fast dev server, optimised production bundle |
| Animation | Framer Motion | 12.x | Declarative enter/exit and layout animations |
| Icons | Lucide React | 1.x | Consistent, tree-shakeable SVG icon set |
| Styling | CSS Modules + custom properties | — | Scoped styles, no runtime overhead |
| Web server | Nginx | 1.24 | Static file serving, SPA routing fallback |
| Compute | AWS EC2 t2.micro | — | Ubuntu 22.04, 1 vCPU, 1 GB RAM |
| Networking | AWS VPC + Security Group | — | Packet-level firewall |
| Observability | AWS CloudWatch + SNS | — | Billing alarm, email notification |
| Source control | GitHub | — | Code, documentation, proof of work |

### Why React 19 and TypeScript?

React 19 introduces improvements to concurrent rendering and server components. TypeScript provides compile-time type safety across component props, state shapes, and SVG data structures — especially valuable in the architecture diagram where node and arrow data is defined as typed constants that drive the rendered output. Errors in data shape are caught at build time rather than at runtime in the browser.

### Why Vite?

Vite's development server uses native ES module imports, which means the browser requests only the modules it needs rather than waiting for a full bundle. Cold starts are measured in milliseconds. The production build uses Rolldown (Vite 8's Rust-based bundler) and produces a compact, tree-shaken output. The `dist/` folder is the only artefact that reaches the server — no Node.js runtime, no build tooling, no dependencies.

### Why Framer Motion?

The architecture diagram requires animated state transitions: nodes dimming on selection, a detail panel sliding in, tab content crossfading. Framer Motion's `AnimatePresence` component handles mount/unmount animations declaratively without requiring manual management of timers or CSS class toggles. The `layoutId` prop on the tab underline produces a shared-element transition between tabs using a single line of JSX.

### Why Lucide React?

Lucide provides a comprehensive, consistently-styled SVG icon set where each icon is a standalone React component. Icons are tree-shaken at build time — only the icons actually imported are included in the bundle. The icon size is a prop rather than a CSS override, which keeps usage readable at the call site.

---

## Deployment Phases

### Phase 1 — AWS Account Setup

1. Create an AWS account at [aws.amazon.com](https://aws.amazon.com). Free tier applies for the first 12 months.
2. Create an IAM user with `AdministratorAccess`. Do not use the root account for day-to-day operations.
3. Enable MFA on both the root account and the IAM user.
4. In **CloudWatch → Alarms**, create a billing alarm: metric `EstimatedCharges`, threshold `$1`, action `SNS topic → email`.

### Phase 2 — EC2 Instance and Application Deployment

1. In **EC2 → Launch Instance**: Ubuntu 22.04 LTS, `t2.micro`, 8 GB gp2 storage. Generate a `.pem` key pair and download it.
2. In **EC2 → Security Groups**, configure inbound rules: port 22 (your IP), port 80 (anywhere), port 443 (anywhere).
3. Allocate an **Elastic IP** and associate it with the instance. This prevents the public IP from changing on stop/start.
4. SSH into the instance and install the required software:

```bash
ssh -i your-key.pem ubuntu@<ELASTIC-IP>
sudo apt update && sudo apt install -y nginx nodejs npm
```

5. Clone the repository, install dependencies, and build:

```bash
git clone <REPO_URL> app
cd app && npm install && npm run build
sudo cp -r dist/* /var/www/html/
```

6. Configure Nginx for SPA routing:

```bash
sudo tee /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    root /var/www/html;
    index index.html;
    try_files $uri /index.html;
}
EOF
sudo systemctl reload nginx
```

The application is now accessible at `http://<ELASTIC-IP>`.

### Phase 3 — Proof of Work

1. Take screenshots: the running app in a browser showing the public IP, the EC2 console showing the running instance, and the CloudWatch billing alarm.
2. Add a `screenshots/` directory to the repository with these images.
3. Commit and push. The public GitHub repository now serves as the complete project record.

---

## Request Lifecycle

When a user navigates to the application URL, the following sequence occurs:

```
Browser → DNS / IP resolution → TCP connection to EC2 Elastic IP
       → AWS routes to EC2 instance
       → Security Group evaluates inbound packet (port 80, passes)
       → Nginx receives HTTP request on port 80
       → Nginx looks up file in /var/www/html/
       → If file exists: serve it (JS chunks, CSS, images)
       → If file doesn't exist: return index.html (SPA fallback)
       → Browser receives index.html, parses and executes bundle
       → React initialises, React Router reads the URL
       → Correct component tree renders in the browser
       → All subsequent navigation is client-side — no further server requests
```

This is a pure static-serving model. The server has no application logic, no database connection, no session management. Every subsequent page navigation after the initial load is handled entirely in the browser by React Router.

---

## Local Development

**Prerequisites:** Node.js 20+, npm 10+

```bash
# Clone the repository
git clone <REPO_URL>
cd appOne

# Install dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:5173

# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## Project Structure

```
appOne/
├── src/
│   ├── components/
│   │   ├── ArchDiagram.tsx   # Interactive SVG architecture diagram
│   │   └── TabPanel.tsx      # Phase, stack, and flow tab content
│   ├── App.tsx               # Root component, tab navigation
│   ├── App.css               # Component styles
│   ├── index.css             # Global reset and base styles
│   └── main.tsx              # React DOM entry point
├── public/                   # Static assets served as-is
├── dist/                     # Production build output (git-ignored)
├── index.html                # HTML shell
├── vite.config.ts            # Vite configuration
├── tsconfig.app.json         # TypeScript configuration
└── package.json
```

---

## Security Posture

| Concern | Mitigation |
|---|---|
| Root account exposure | IAM user with MFA; root account credentials not used after initial setup |
| Unrestricted SSH | Security Group port 22 restricted to operator IP |
| Unexpected AWS charges | CloudWatch billing alarm at $1 threshold with SNS email delivery |
| Supply chain | Dependencies pinned in `package-lock.json`; no server-side runtime in production |
| Data exposure | Application is entirely static; no user data is collected or stored |

---

## Potential Next Steps

- **TLS / HTTPS** — Obtain a domain, point it to the Elastic IP, and use Certbot with the Nginx plugin to provision a free Let's Encrypt certificate.
- **CI/CD pipeline** — GitHub Actions workflow that SSHes into the instance and redeployes on push to `main`, eliminating the manual build-and-copy step.
- **CloudFront CDN** — Place AWS CloudFront in front of the EC2 origin for global edge caching, DDoS mitigation, and automatic HTTPS.
- **Auto Scaling Group** — Replace the single instance with an ASG behind an Application Load Balancer for fault tolerance and horizontal scalability.
- **Infrastructure as Code** — Define all AWS resources (EC2, Security Group, Elastic IP, CloudWatch alarm) in Terraform or AWS CDK for reproducible, version-controlled infrastructure.

---

*Built with React 19, TypeScript, Vite, Framer Motion, and Lucide React. Hosted on AWS EC2 (t2.micro, Ubuntu 22.04) behind Nginx.*
