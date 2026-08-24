import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/presentation/auth.routes';
import storeRoutes from './modules/onboarding/presentation/store.routes';
import suggestionRoutes from './modules/onboarding/presentation/suggestion.routes';
import preferenceRoutes from './modules/onboarding/presentation/preference.routes';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép tất cả các domain (kể cả localhost lẫn Cloudflare) gọi API
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/onboarding/suggestions', suggestionRoutes);
app.use('/api/onboarding/preference', preferenceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
