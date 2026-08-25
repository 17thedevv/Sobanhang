"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionController = exports.SuggestionController = void 0;
const suggestion_service_1 = require("../domain/suggestion.service");
class SuggestionController {
    async getSuggestions(req, res) {
        try {
            const industry = req.query.industry;
            if (!industry) {
                return res.status(400).json({ error: 'Thiếu tham số industry' });
            }
            const suggestions = await suggestion_service_1.suggestionService.getSuggestionsByIndustry(industry);
            return res.status(200).json({ suggestions });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.SuggestionController = SuggestionController;
exports.suggestionController = new SuggestionController();
