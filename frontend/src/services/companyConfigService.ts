import { CompanyTemplate } from '@/types';

const STORAGE_KEY = 'monthly_paycheck_company_configs';

export class CompanyConfigService {
  /**
   * Save company configuration to localStorage
   */
  static saveConfig(config: CompanyTemplate): void {
    try {
      const configs = this.getAllConfigs();
      configs[config.company_id] = config;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      console.log(`✅ Saved company config: ${config.company_name}`);
    } catch (error) {
      console.error('❌ Failed to save company config:', error);
      throw new Error('Failed to save company configuration');
    }
  }

  /**
   * Get company configuration by ID
   */
  static getConfig(companyId: string): CompanyTemplate | null {
    try {
      const configs = this.getAllConfigs();
      return configs[companyId] || null;
    } catch (error) {
      console.error('❌ Failed to load company config:', error);
      return null;
    }
  }

  /**
   * Get all company configurations
   */
  static getAllConfigs(): Record<string, CompanyTemplate> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Failed to load company configs:', error);
      return {};
    }
  }

  /**
   * Get list of company IDs
   */
  static getCompanyIds(): string[] {
    const configs = this.getAllConfigs();
    return Object.keys(configs);
  }

  /**
   * Get list of company templates
   */
  static getCompanyList(): CompanyTemplate[] {
    const configs = this.getAllConfigs();
    return Object.values(configs);
  }

  /**
   * Delete company configuration
   */
  static deleteConfig(companyId: string): boolean {
    try {
      const configs = this.getAllConfigs();
      if (configs[companyId]) {
        delete configs[companyId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
        console.log(`🗑️ Deleted company config: ${companyId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to delete company config:', error);
      return false;
    }
  }

  /**
   * Export company configurations as JSON file
   */
  static exportConfigs(): void {
    try {
      const configs = this.getAllConfigs();
      const dataStr = JSON.stringify(configs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `company-configs-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      console.log('📥 Company configs exported');
    } catch (error) {
      console.error('❌ Failed to export company configs:', error);
      throw new Error('Failed to export configurations');
    }
  }

  /**
   * Import company configurations from JSON file
   */
  static async importConfigs(file: File): Promise<number> {
    try {
      const text = await file.text();
      const importedConfigs = JSON.parse(text);
      
      // Validate imported data
      if (typeof importedConfigs !== 'object' || importedConfigs === null) {
        throw new Error('Invalid configuration file format');
      }

      // Merge with existing configs
      const existingConfigs = this.getAllConfigs();
      const mergedConfigs = { ...existingConfigs, ...importedConfigs };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedConfigs));
      
      const importedCount = Object.keys(importedConfigs).length;
      console.log(`📤 Imported ${importedCount} company configs`);
      
      return importedCount;
    } catch (error) {
      console.error('❌ Failed to import company configs:', error);
      throw new Error('Failed to import configurations');
    }
  }

  /**
   * Clear all company configurations
   */
  static clearAllConfigs(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🧹 Cleared all company configs');
    } catch (error) {
      console.error('❌ Failed to clear company configs:', error);
      throw new Error('Failed to clear configurations');
    }
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const configs = JSON.stringify(this.getAllConfigs());
      const used = new Blob([configs]).size;
      const available = 5 * 1024 * 1024; // Assume 5MB localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('❌ Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

