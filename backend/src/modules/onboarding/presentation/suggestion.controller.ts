import { Request, Response } from 'express';
import { suggestionService } from '../domain/suggestion.service';

export class SuggestionController {
  async getSuggestions(req: Request, res: Response) {
    try {
      const industry = req.query.industry as string;
      
      if (!industry) {
        return res.status(400).json({ error: 'Thiếu tham số industry' });
      }

      const suggestions = await suggestionService.getSuggestionsByIndustry(industry);

      return res.status(200).json({ suggestions });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export const suggestionController = new SuggestionController();
