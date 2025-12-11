# Study-o!

Experimenting with Kotlin gRPC, Next.js, and Envoy Proxy to build a prototype for a shared-study session web app.

Users can create and share rooms to others, where common material can be uploaded and discussed. Individual notes can also be taken.

## Steps to Run

### 1. Start Postgres, Envoy and the Kotlin server

In the root `study-o` folder:

```bash
docker compose up --build
```

### 2. Generate frontend code

```bash
cd frontend
npm install
npx grpc_tools_node_protoc \
  --js_out=import_style=commonjs,binary:./src \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src \
  --plugin=protoc-gen-grpc-web=.\node_modules\.bin\protoc-gen-grpc-web.cmd \
  -I ../proto \
  ../proto/study.proto
```

### 3. Run the frontend

```bash
npm run dev
```

### 4. Usage

- App loads on `http://localhost:3000`
- Enter a name, click "New Room" for new session
- In a different window, click "Join Room" and paste the Room ID (like `room-1234`)
- Click "Upload PDF" to sync documents across all users
- Type in the notes box to auto-save to Postgres
