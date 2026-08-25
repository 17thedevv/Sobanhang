"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionService = exports.SuggestionService = void 0;
class SuggestionService {
    staticMapping = {
        grocery: [
            { id: 'inventory', name: 'Quản lý tồn kho', icon: '📦', isRecommended: true },
            { id: 'cashflow', name: 'Quản lý thu chi', icon: '💰', isRecommended: true },
            { id: 'customer_debt', name: 'Ghi nợ khách hàng', icon: '📝', isRecommended: true },
            { id: 'loyalty', name: 'Tích điểm thành viên', icon: '⭐', isRecommended: false }
        ],
        fnb: [
            { id: 'table', name: 'Quản lý bàn', icon: '🍽️', isRecommended: true },
            { id: 'cashflow', name: 'Quản lý thu chi', icon: '💰', isRecommended: true },
            { id: 'kitchen', name: 'In báo bếp', icon: '🖨️', isRecommended: true },
            { id: 'staff', name: 'Quản lý nhân viên', icon: '👥', isRecommended: false }
        ],
        fashion: [
            { id: 'inventory', name: 'Quản lý tồn kho', icon: '📦', isRecommended: true },
            { id: 'barcode', name: 'Quét mã vạch', icon: '📷', isRecommended: true },
            { id: 'customer', name: 'Quản lý khách hàng', icon: '❤️', isRecommended: true },
            { id: 'cashflow', name: 'Quản lý thu chi', icon: '💰', isRecommended: false }
        ]
    };
    async getSuggestionsByIndustry(industry) {
        const defaultSuggestions = [
            { id: 'cashflow', name: 'Quản lý thu chi', icon: '💰', isRecommended: true },
            { id: 'inventory', name: 'Quản lý tồn kho', icon: '📦', isRecommended: true },
            { id: 'report', name: 'Báo cáo doanh thu', icon: '📊', isRecommended: true }
        ];
        return this.staticMapping[industry] || defaultSuggestions;
    }
}
exports.SuggestionService = SuggestionService;
exports.suggestionService = new SuggestionService();
