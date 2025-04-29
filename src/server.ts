import app from './app';
import { AppConfig } from './config/config';

app.listen(AppConfig.port, () => {
  console.log(`Server running on port ${AppConfig.port}`);
});
