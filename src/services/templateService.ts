import { ApplicationTemplate } from '../store/slices/applicationsSlice';
import { supabase } from './supabaseService';
import { defaultApplicationTemplates } from '../data/defaultTemplates';

export class TemplateService {
  // Initialize default templates for a user
  static async initializeDefaultTemplates(userId: string): Promise<ApplicationTemplate[]> {
    try {
      // Check if user already has templates
      const existingTemplates = await this.getUserTemplates(userId);
      
      if (existingTemplates.length === 0) {
        // Insert default templates
        for (const template of defaultApplicationTemplates) {
          await this.createTemplate(userId, template);
        }
        return defaultApplicationTemplates;
      }
      
      return existingTemplates;
    } catch (error) {
      console.error('Error initializing default templates:', error);
      return defaultApplicationTemplates; // Return default templates as fallback
    }
  }

  // Get user templates from database
  static async getUserTemplates(userId: string): Promise<ApplicationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('application_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        content: template.content,
        isDefault: template.is_default,
        createdDate: template.created_at
      }));
    } catch (error) {
      console.error('Error fetching user templates:', error);
      return defaultApplicationTemplates; // Return default templates as fallback
    }
  }

  // Create a new template
  static async createTemplate(userId: string, template: Omit<ApplicationTemplate, 'id'>): Promise<ApplicationTemplate> {
    try {
      const { data, error } = await supabase
        .from('application_templates')
        .insert({
          user_id: userId,
          name: template.name,
          subject: template.subject,
          content: template.content,
          is_default: template.isDefault
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        isDefault: data.is_default,
        createdDate: data.created_at
      };
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Update a template
  static async updateTemplate(templateId: string, updates: Partial<ApplicationTemplate>): Promise<void> {
    try {
      const { error } = await supabase
        .from('application_templates')
        .update({
          name: updates.name,
          subject: updates.subject,
          content: updates.content,
          is_default: updates.isDefault
        })
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  // Delete a template
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('application_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
}