"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/presentation/auth.routes"));
const store_routes_1 = __importDefault(require("./modules/onboarding/presentation/store.routes"));
const suggestion_routes_1 = __importDefault(require("./modules/onboarding/presentation/suggestion.routes"));
const preference_routes_1 = __importDefault(require("./modules/onboarding/presentation/preference.routes"));
const products_routes_1 = __importDefault(require("./modules/products/presentation/products.routes"));
const categories_routes_1 = __importDefault(require("./modules/categories/presentation/categories.routes"));
const orders_routes_1 = __importDefault(require("./modules/orders/presentation/orders.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/presentation/dashboard.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Cho phép tất cả các domain (kể cả localhost lẫn Cloudflare) gọi API
        callback(null, true);
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', products_routes_1.default);
app.use('/api/categories', categories_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/stores', store_routes_1.default);
app.use('/api/onboarding/suggestions', suggestion_routes_1.default);
app.use('/api/onboarding/preference', preference_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
