import { SupabaseService } from '../services/supabaseService';

interface AdminAccessInfo {
  currentUserId: string;
  hasAdminRole: boolean;
  userMetadata: any;
  errorMessage: string | null;
  isAuthenticated: boolean;
  email: string | null;
}

/**
 * Vérifie l'accès administrateur de l'utilisateur actuel
 * @returns Informations sur l'accès administrateur
 */
export const debugAdminAccess = async (): Promise<AdminAccessInfo> => {
  try {
    return await SupabaseService.debugAdminAccess();
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'accès admin:', error);
    return {
      currentUserId: '',
      hasAdminRole: false,
      userMetadata: null,
      errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
      isAuthenticated: false,
      email: null
    };
  }
};

/**
 * Tente de corriger le rôle administrateur pour un utilisateur donné
 * @param adminEmail Email de l'utilisateur à promouvoir en admin
 * @returns Message de résultat de l'opération
 */
export const fixAdminRole = async (adminEmail: string): Promise<string> => {
  try {
    return await SupabaseService.fixAdminRole(adminEmail);
  } catch (error) {
    console.error('Erreur lors de la correction du rôle admin:', error);
    return `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
  }
};

/**
 * Met à jour le rôle d'un utilisateur
 * @param userId ID de l'utilisateur
 * @param newRole Nouveau rôle à assigner
 * @returns true si la mise à jour a réussi, false sinon
 */
export const updateUserRole = async (userId: string, newRole: string): Promise<boolean> => {
  try {
    const { error } = await SupabaseService.updateUserRole(userId, newRole);

    if (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return false;
  }
};

/**
 * Vérifie si l'utilisateur actuel a le rôle Admin
 * @returns true si l'utilisateur est admin, false sinon
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await SupabaseService.checkIsAdmin();

    if (error) {
      console.error('Erreur lors de la vérification du rôle admin:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return false;
  }
};

/**
 * Récupère le rôle d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Le rôle de l'utilisateur ou 'User' par défaut
 */
export const getUserRole = async (userId: string): Promise<string> => {
  try {
    const { data, error } = await SupabaseService.getUserRole(userId);

    if (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      return 'User';
    }

    return data || 'User';
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return 'User';
  }
}; 