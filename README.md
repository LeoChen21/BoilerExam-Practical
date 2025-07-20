# BoilerExam-Practical 

## Practical

### Instructions 📝
Make a docker-compose stack consisting of:
A dead-simple React frontend with an upload button for PDFs
A Postgres + your S3 service of choice backend that accepts those PDFs
A button on the frontend that lets you view the object you just uploaded (querying the s3 service for it).

We should be able to look at your work by cloning your github repo and running a single `docker compose up –-build` to run the web app locally.

### Architecture 🏠
4 Docker containers
- Frontend (react frontend with upload button for pdfs)
- Backend (upload endpoint and fetch for pdfs)
- Postgres (database containing metadata for objects stored in MiniO)
- MiniO (local S3 stack containing uploaded pdfs)

### Manual 📖
- git clone https://github.com/LeoChen21/BoilerExam-Practical
- run docker compose up --build
- go to localhost:3000
- upload image, then click upload pdf, then click on uploaded files to view

## Proposal 📜

### Instructions 📝
a) Make a selection based on ease of setup (single docker container ideally), simplicity (we don’t need some crazy geo-distributed service), and license (one that lets us reuse without requiring us to publish the rest of the Boilerexams source code).

b) Write up an argument for why you chose the service you did, along with any challenges you forsee for making the switch from AWS. Put this in the README of the repo you’ll submit.

### First Choice: MiniO ✅ 
- Lightweight local S3 mimic. 
- Kubernetes support.
- Fully compatible with S3 API.
- Apache 2.0 License, free for use, modification, distribution, closed-source.

### Alternative: LocalStack ❌
- Full AWS stack mimic including S3, DynamoDB, API Gateway, etc.
- Better if planning to deploy wider range of AWS services locally in future.
- Heavier and is outperformed by standard AWS services. 
- Apache 2.0 only for free version. LocalStack Pro uses Proprietary License which is not suitable for BoilerExams.

### Explanation ✨
I believe that MiniO is the superior choice considering the planned extent of changes. MiniO is a lightweight service that does exactly what is required in the planned migration and nothing more. This allows MiniO to outperform LocalStack and greatly reduces difficulty in deployment.

### Possible Issues in migration ⚠️
- !!! Will be outperformed by AWS for Purdue Global students due to geographical limitations of local server.
- Unclear how current S3 upload works. If using presigned URLs, may be difficult.
- Will have to manually manage data security & lose access to AWS DDOS mitigation.
- Lose integration tools if planning to use more AWS services in the future.
- Requires manual setup for monitoring.

### Migration Steps 👣
- Write up migration & integrity code and test locally.
- Test migration code on subset of production data & verify integrity.
- Update references for upload & test. (ideally just modifying one API file/folder)
- Migrate current data to onsite & verify integrity.
- Update references for pulling data & test.

### Steps after 👣
- Back up data with external Drive pref, then clean wipe AWS to prevent future costs.
- Set up Monitoring for local S3.
- Monitor AWS S3 for possible errors in reference causing uploads to AWS.
- Set up new CI/CD for local S3 upload/pull code.

## License 📝
MiniO uses Apache License 2.0
- Free to use, modify, distribute.
- Free use in closed-source.

## AI Usage
- Documentation for all files
- MiniO/Postgres setup
- General Debugging