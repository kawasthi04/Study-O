Study-o!

Experimenting with Kotlin gRPC, Next.js, and Envoy Proxy to build a prototype for a shared-study session web app. 
Users can create and share rooms to others, where common material can be uploaded and discussed. Individual notes can also be taken.

Steps to run:
1. start Postgres, Envoy and the Kotlin server.
  (in the root 'study-o' folder)
  docker compose up --build

2. generate frontend code
  cd frontend
  npm install

  npx grpc_tools_node_protoc `
  --js_out=import_style=commonjs,binary:./src `
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src `
  --plugin=protoc-gen-grpc-web=.\node_modules\.bin\protoc-gen-grpc-web.cmd `
  -I ../proto `
  ../proto/study.proto

3. run the frontend
   npm run dev

4. usage
  Apps loads on http://localhost:3000.
  Enter a name, "New Room" for new session
  In a different window, "Join Room" and paste the Room ID (like room-1234)
  "Upload PDF" to sync documents across all users
  Type in the notes box to auto-save to Postgres
