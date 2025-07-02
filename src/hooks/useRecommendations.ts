import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setRecommendations, updateRecommendation } from '../store/slices/profileSlice';
import { generateProfileRecommendations } from '../services/aiService';
import { ProfileRecommendation } from '../store/slices/profileSlice';

export const useRecommendations = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.profile);
  const recommendations = useSelector((state: RootState) => state.profile.recommendations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIRecommendations = async () => {
    if (!profile) return;

    setLoading(true);
    setError(null);

    try {
      const aiRecommendations = await generateProfileRecommendations(profile, 'user-id');
      dispatch(setRecommendations(aiRecommendations));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération des recommandations');
      console.error('Error generating AI recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const markRecommendationCompleted = (id: string) => {
    dispatch(updateRecommendation({
      id,
      updates: { completed: true }
    }));
  };

  const dismissRecommendation = (id: string) => {
    dispatch(updateRecommendation({
      id,
      updates: { dismissed: true }
    }));
  };

  const getActiveRecommendations = () => {
    return recommendations.filter(rec => !rec.completed && !rec.dismissed);
  };

  const getCompletedRecommendations = () => {
    return recommendations.filter(rec => rec.completed);
  };

  const getDismissedRecommendations = () => {
    return recommendations.filter(rec => rec.dismissed);
  };

  // Auto-generate recommendations when profile changes
  useEffect(() => {
    if (profile && recommendations.length === 0) {
      generateAIRecommendations();
    }
  }, [profile]);

  return {
    recommendations,
    activeRecommendations: getActiveRecommendations(),
    completedRecommendations: getCompletedRecommendations(),
    dismissedRecommendations: getDismissedRecommendations(),
    loading,
    error,
    generateAIRecommendations,
    markRecommendationCompleted,
    dismissRecommendation,
  };
}; 