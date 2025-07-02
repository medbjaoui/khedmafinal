import { supabase } from './supabaseService';

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  transactionValue: number;
  conversionRate: number;
  alertsCount: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'subscription' | 'one-time' | 'refund';
  created_at: string;
  user?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: string;
  created_at: string;
  resolved: boolean;
}

export class AdminService {
  // Fetch dashboard metrics
  static async getDashboardMetrics(): Promise<AdminMetrics> {
    try {
      // Get total users from user_profiles
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get active users from user_profiles (all are considered active for now)
      const activeUsers = totalUsers || 0;
      
      // Get transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, status');
      
      const totalTransactions = transactions?.length || 0;
      
      // Calculate transaction value
      const transactionValue = transactions
        ?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      
      // Calculate conversion rate
      const conversionRate = totalUsers && totalUsers > 0
        ? Math.round((transactions?.filter(t => t.status === 'completed').length || 0) / totalUsers * 100)
        : 0;
      
      // Get unresolved alerts count
      const { count: alertsCount } = await supabase
        .from('system_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);
      
      return {
        totalUsers: totalUsers || 0,
        activeUsers,
        totalTransactions,
        transactionValue,
        conversionRate,
        alertsCount: alertsCount || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  // Fetch users with pagination and filters
  static async getUsers(options: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<{ data: User[]; count: number }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        // status,
        search,
        startDate,
        endDate,
        sortBy = 'created_at',
        sortDirection = 'desc'
      } = options;
      
      // Get user profiles
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data: profiles, error: profileError, count } = await query;
      
      if (profileError) throw profileError;
      
      // Transform profile data to User interface
      const users: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: '', // Email not available in user_profiles
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: 'User', // Default role since not in user_profiles
        created_at: profile.created_at,
        last_sign_in_at: null, // Not available in user_profiles
        status: 'active' // Default status
      }));
      
      return {
        data: users,
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Fetch transactions with pagination and filters
  static async getTransactions(options: {
    page?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<{ data: Transaction[]; count: number }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        status,
        type,
        search,
        startDate,
        endDate,
        sortBy = 'created_at',
        sortDirection = 'desc'
      } = options;
      
      let query = supabase
        .from('transactions')
        .select('id, user_id, amount, status, type, created_at, payment_method, description', { count: 'exact' });
      
      // Apply filters
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      if (type && type !== 'all') {
        query = query.eq('type', type);
      }
      
      if (search) {
        query = query.or(`id.ilike.%${search}%,user_id.ilike.%${search}%`);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data: transactions, error, count } = await query;
      
      if (error) throw error;
      
      // Get user profiles for the transactions
      const userIds = [...new Set(transactions?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      // Merge transaction data with user data
      const enrichedTransactions: Transaction[] = (transactions || []).map(transaction => {
        const profile = profiles?.find(p => p.id === transaction.user_id);
        
        return {
          ...transaction,
          user: profile ? {
            email: '', // Email not available in user_profiles
            first_name: profile.first_name,
            last_name: profile.last_name
          } : undefined
        };
      });
      
      return {
        data: enrichedTransactions,
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Fetch system alerts with pagination and filters
  static async getSystemAlerts(options: {
    page?: number;
    pageSize?: number;
    level?: string;
    resolved?: boolean;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<{ data: SystemAlert[]; count: number }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        level,
        resolved,
        search,
        startDate,
        endDate,
        sortBy = 'created_at',
        sortDirection = 'desc'
      } = options;
      
      let query = supabase
        .from('system_alerts')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (level && level !== 'all') {
        query = query.eq('level', level);
      }
      
      if (resolved !== undefined) {
        query = query.eq('resolved', resolved);
      }
      
      if (search) {
        query = query.or(`message.ilike.%${search}%,source.ilike.%${search}%`);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  }

  // Get activity data for charts
  static async getActivityData(days: number = 7): Promise<any[]> {
    try {
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      });
      
      const result = [];
      
      for (const date of dates) {
        const startDate = `${date}T00:00:00`;
        const endDate = `${date}T23:59:59`;
        
        // Count user profiles created on this date
        const { count: userCount } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        // Count transactions on this date
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('amount')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        const transactionCount = transactionsData?.length || 0;
        const transactionValue = transactionsData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        
        // Format date for display
        const displayDate = new Date(date).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit' 
        });
        
        result.push({
          name: displayDate,
          users: userCount || 0,
          transactions: transactionCount,
          value: transactionValue
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      throw error;
    }
  }

  // Create a new user profile
  static async createUser(userData: {
    firstName: string;
    lastName: string;
  }): Promise<User> {
    try {
      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          first_name: userData.firstName,
          last_name: userData.lastName
        })
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      return {
        id: profileData.id,
        email: '', // Email not available in user_profiles
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'User',
        created_at: profileData.created_at,
        last_sign_in_at: null,
        status: 'active'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUser(userId: string, updates: {
    firstName?: string;
    lastName?: string;
  }): Promise<void> {
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          ...(updates.firstName && { first_name: updates.firstName }),
          ...(updates.lastName && { last_name: updates.lastName })
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user profile
  static async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Create a transaction
  static async createTransaction(transactionData: {
    userId: string;
    amount: number;
    type: 'subscription' | 'one-time' | 'refund';
    status: 'completed' | 'pending' | 'failed';
  }): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: transactionData.userId,
          amount: transactionData.amount,
          type: transactionData.type,
          status: transactionData.status,
          payment_method: 'card' // Default payment method
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Update transaction
  static async updateTransaction(transactionId: string, updates: {
    amount?: number;
    status?: 'completed' | 'pending' | 'failed';
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Create system alert
  static async createSystemAlert(alertData: {
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    source: string;
  }): Promise<SystemAlert> {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .insert({
          level: alertData.level,
          message: alertData.message,
          source: alertData.source,
          resolved: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating system alert:', error);
      throw error;
    }
  }

  // Resolve system alert
  static async resolveSystemAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({ resolved: true })
        .eq('id', alertId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error resolving system alert:', error);
      throw error;
    }
  }

  // Delete system alert
  static async deleteSystemAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .delete()
        .eq('id', alertId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting system alert:', error);
      throw error;
    }
  }
}