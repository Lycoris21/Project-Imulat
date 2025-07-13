import aiSummaryService from '../services/aiSummaryService.js';

class AIController {
    async evaluateTruthIndex(req, res) {
        try {
            const { claimContent } = req.body;

            if (!claimContent) {
                return res.status(400).json({ message: 'claimContent is required' });
            }

            const aiTruthIndex = await aiSummaryService.generateTruthIndex(claimContent);

            res.json({ aiTruthIndex });
        } catch (error) {
            console.error('Error in evaluateTruthIndex:', error);
            res.status(500).json({ message: 'Failed to evaluate truth index' });
        }
    }
}

export default new AIController();
