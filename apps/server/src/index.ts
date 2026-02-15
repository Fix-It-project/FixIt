import { env } from "@FixIt/env/server";
import app from './app.js';

app.listen(env.PORT, () => {
  console.log(`🚀 Server is running on port ${env.PORT}`);
});
