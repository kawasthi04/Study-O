import { StudyServiceClient } from './StudyServiceClientPb';

// Connect to Envoy (Port 8080), which forwards to Kotlin (Port 9090)
export const client = new StudyServiceClient('http://localhost:8080', null, null);