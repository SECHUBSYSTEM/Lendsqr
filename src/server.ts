import app from "./app";
import { config } from "./config";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Demo Credit API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API base URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});
