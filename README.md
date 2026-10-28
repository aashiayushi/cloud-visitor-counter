\# Cloud Visitor Counter on Azure Kubernetes Service



\## 1. Project Overview



The Cloud Visitor Counter is a containerized web application built using Node.js and Redis. It records the number of visits and displays the updated count on a web page. The application is deployed on Azure Kubernetes Service (AKS) and uses Horizontal Pod Autoscaling (HPA) to scale the frontend according to CPU utilization.



\## 2. Technologies Used



\- \*\*Node.js and Express.js:\*\* Web application and API.

\- \*\*Redis:\*\* Stores the visitor count.

\- \*\*Docker:\*\* Containerizes the application.

\- \*\*Docker Compose:\*\* Runs the frontend and Redis locally.

\- \*\*Azure Container Registry (ACR):\*\* Stores the Docker image.

\- \*\*Azure Kubernetes Service (AKS):\*\* Runs and manages the application containers.

\- \*\*Kubernetes HPA:\*\* Automatically scales the frontend replicas.

\- \*\*Azure Monitor:\*\* Monitors cluster health and resource utilization.

\- \*\*Prometheus:\*\* Exposes application metrics for monitoring.



\## 3. Project Architecture



The application follows this workflow:



1\. A user opens the visitor counter web page.

2\. The Node.js application receives the request.

3\. Redis increments and stores the visitor count.

4\. The application displays the updated count.

5\. Docker packages the application into a container image.

6\. Azure Container Registry stores the image.

7\. AKS deploys and manages the application.

8\. HPA adjusts frontend replicas according to CPU utilization.

9\. Azure Monitor provides information about cluster and resource performance.



\## 4. Project Files



\- `app.js` — Node.js application and HTTP endpoints.

\- `package.json` — Application dependencies and start command.

\- `package-lock.json` — Locked dependency versions.

\- `Dockerfile` — Multi-stage Docker image build.

\- `docker-compose.yml` — Local frontend and Redis configuration.

\- `redis-deployment.yaml` — Redis deployment and service.

\- `visitor-counter.yaml` — Frontend Kubernetes deployment and service.

\- `visitor-counter-hpa.yaml` — Horizontal Pod Autoscaler configuration.

\- `.dockerignore` — Excludes unnecessary files from Docker builds.

\- `.gitignore` — Excludes local and sensitive files from Git.

\- `Screenshots/` — Evidence collected during implementation and testing.



\## 5. Running Locally



Requirements: Docker Desktop and Git.



Clone the repository:



```bash

git clone https://github.com/aashiayushi/cloud-visitor-counter.git

cd cloud-visitor-counter

```



Start the application:



```bash

docker compose up --build -d

```



Open `http://localhost:3000` in a browser.



Useful endpoints:



\- `/` — Visitor counter web page.

\- `/api/visits` — Visitor count in JSON format.

\- `/health/live` — Liveness health check.

\- `/health/ready` — Readiness health check.



Check container status:



```bash

docker compose ps

```



Stop the local containers when finished:



```bash

docker compose down

```



\## 6. Azure Deployment



The application image is stored in Azure Container Registry and deployed to Azure Kubernetes Service.



\- Container Registry: `visitorcounterayu26.azurecr.io`

\- Image repository: `visitor-counter`

\- Image tags: `1.0` and `1.1`

\- AKS cluster: `visitor-counter-aks`

\- Resource group: `visitor-counter-rg`



The AKS cluster uses the image stored in ACR to run the frontend container, while Redis runs as a separate Kubernetes workload.



\## 7. Autoscaling and Testing



The Horizontal Pod Autoscaler is configured with:



\- Minimum replicas: 1

\- Maximum replicas: 5

\- Target CPU utilization: 50%



A load test was performed against the application. During increased traffic, the frontend scaled up to five replicas and later returned to one replica after the load was stopped.



The application also provides liveness and readiness endpoints for health checking.



\## 8. Monitoring



Azure Monitor was used to inspect cluster CPU utilization, memory utilization, node count, active pod count, and controller information. A CPU utilization alert rule was also created.



Application-level HTTP request counts and P95 latency require application telemetry or suitable metrics integration; they should only be reported as implemented if the corresponding data has been configured and verified.



\## 9. Security



\- Secrets, passwords, access tokens, and local credential files should not be committed to the repository.

\- The application image is stored in Azure Container Registry.

\- Kubernetes manifests are maintained as code for reproducible deployment.



\## 10. Conclusion



This project demonstrates containerization, multi-container development, cloud image storage, Kubernetes deployment, automatic scaling, health checks, and cloud monitoring using Microsoft Azure.



\## 11. Evidence



Implementation screenshots are available in the `Screenshots/` directory.



\## 12. Repository



GitHub: https://github.com/aashiayushi/cloud-visitor-counter



