/**
 * ✅ Validation System - Production Input Validation
 * 
 * Comprehensive validation system for production:
 * - Type validation
 * - Range validation
 * - Format validation
 * - Custom validation rules
 * - Error message management
 * - Real-time validation
 */

export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T, context?: ValidationContext) => ValidationResult;
  message: string;
  priority?: number;
}

export interface ValidationContext {
  fieldName?: string;
  formData?: Record<string, any>;
  user?: any;
  options?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
  metadata?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
  value: any;
  timestamp: number;
}

export interface ValidationConfig {
  stopOnFirstError: boolean;
  includeWarnings: boolean;
  realTimeValidation: boolean;
  debounceMs: number;
  customMessages: Record<string, string>;
}

export class ValidationSystem {
  private static instance: ValidationSystem;
  
  private rules: Map<string, ValidationRule[]> = new Map();
  private config: ValidationConfig = {
    stopOnFirstError: false,
    includeWarnings: true,
    realTimeValidation: true,
    debounceMs: 300,
    customMessages: {}
  };
  
  private debounceTimers: Map<string, number> = new Map();
  private validationCache: Map<string, ValidationResult[]> = new Map();
  
  private constructor() {
    this.initializeDefaultRules();
  }
  
  public static getInstance(): ValidationSystem {
    if (!ValidationSystem.instance) {
      ValidationSystem.instance = new ValidationSystem();
    }
    return ValidationSystem.instance;
  }
  
  /**
   * Configure validation system
   */
  public configure(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Add validation rule
   */
  public addRule(fieldName: string, rule: ValidationRule): void {
    if (!this.rules.has(fieldName)) {
      this.rules.set(fieldName, []);
    }
    
    const fieldRules = this.rules.get(fieldName)!;
    fieldRules.push(rule);
    
    // Sort by priority (higher priority first)
    fieldRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  /**
   * Remove validation rule
   */
  public removeRule(fieldName: string, ruleName: string): void {
    const fieldRules = this.rules.get(fieldName);
    if (fieldRules) {
      const index = fieldRules.findIndex(rule => rule.name === ruleName);
      if (index !== -1) {
        fieldRules.splice(index, 1);
      }
    }
  }
  
  /**
   * Validate single field
   */
  public validateField(
    fieldName: string, 
    value: any, 
    context?: ValidationContext
  ): ValidationResult[] {
    const fieldRules = this.rules.get(fieldName) || [];
    const results: ValidationResult[] = [];
    
    for (const rule of fieldRules) {
      try {
        const result = rule.validate(value, context);
        results.push(result);
        
        if (!result.isValid && this.config.stopOnFirstError) {
          break;
        }
      } catch (error) {
        results.push({
          isValid: false,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Validate multiple fields
   */
  public validateFields(
    data: Record<string, any>, 
    context?: ValidationContext
  ): Map<string, ValidationResult[]> {
    const results = new Map<string, ValidationResult[]>();
    
    for (const [fieldName, value] of Object.entries(data)) {
      const fieldResults = this.validateField(fieldName, value, context);
      results.set(fieldName, fieldResults);
    }
    
    return results;
  }
  
  /**
   * Validate with real-time feedback
   */
  public validateRealTime(
    fieldName: string,
    value: any,
    callback: (results: ValidationResult[]) => void,
    context?: ValidationContext
  ): void {
    if (!this.config.realTimeValidation) {
      callback(this.validateField(fieldName, value, context));
      return;
    }
    
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(fieldName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer
    const timer = window.setTimeout(() => {
      const results = this.validateField(fieldName, value, context);
      callback(results);
      this.debounceTimers.delete(fieldName);
    }, this.config.debounceMs);
    
    this.debounceTimers.set(fieldName, timer);
  }
  
  /**
   * Get validation errors
   */
  public getErrors(
    data: Record<string, any>, 
    context?: ValidationContext
  ): ValidationError[] {
    const results = this.validateFields(data, context);
    const errors: ValidationError[] = [];
    
    for (const [fieldName, fieldResults] of results) {
      for (const result of fieldResults) {
        if (!result.isValid && result.severity !== 'warning') {
          errors.push({
            field: fieldName,
            message: result.message || 'Invalid value',
            code: result.code || 'INVALID',
            severity: result.severity || 'error',
            value: data[fieldName],
            timestamp: Date.now()
          });
        }
      }
    }
    
    return errors;
  }
  
  /**
   * Check if data is valid
   */
  public isValid(data: Record<string, any>, context?: ValidationContext): boolean {
    const errors = this.getErrors(data, context);
    return errors.length === 0;
  }
  
  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Required field rule
    this.addRule('*', {
      name: 'required',
      validate: (value, context) => {
        if (context?.fieldName && this.rules.has(context.fieldName)) {
          const fieldRules = this.rules.get(context.fieldName)!;
          const hasRequiredRule = fieldRules.some(rule => rule.name === 'required');
          
          if (hasRequiredRule) {
            return {
              isValid: value !== null && value !== undefined && value !== '',
              message: this.config.customMessages.required || 'This field is required',
              code: 'REQUIRED',
              severity: 'error'
            };
          }
        }
        return { isValid: true };
      },
      message: 'This field is required',
      priority: 100
    });
    
    // String validation rules
    this.addRule('string', {
      name: 'type',
      validate: (value) => ({
        isValid: typeof value === 'string',
        message: this.config.customMessages.stringType || 'Must be a string',
        code: 'INVALID_TYPE',
        severity: 'error'
      }),
      message: 'Must be a string',
      priority: 90
    });
    
    this.addRule('string', {
      name: 'minLength',
      validate: (value, context) => {
        const minLength = context?.options?.minLength;
        if (minLength !== undefined) {
          return {
            isValid: typeof value === 'string' && value.length >= minLength,
            message: this.config.customMessages.minLength || `Must be at least ${minLength} characters`,
            code: 'MIN_LENGTH',
            severity: 'error'
          };
        }
        return { isValid: true };
      },
      message: 'Must meet minimum length requirement',
      priority: 80
    });
    
    this.addRule('string', {
      name: 'maxLength',
      validate: (value, context) => {
        const maxLength = context?.options?.maxLength;
        if (maxLength !== undefined) {
          return {
            isValid: typeof value === 'string' && value.length <= maxLength,
            message: this.config.customMessages.maxLength || `Must be no more than ${maxLength} characters`,
            code: 'MAX_LENGTH',
            severity: 'error'
          };
        }
        return { isValid: true };
      },
      message: 'Must meet maximum length requirement',
      priority: 80
    });
    
    this.addRule('string', {
      name: 'email',
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: typeof value === 'string' && emailRegex.test(value),
          message: this.config.customMessages.email || 'Must be a valid email address',
          code: 'INVALID_EMAIL',
          severity: 'error'
        };
      },
      message: 'Must be a valid email address',
      priority: 70
    });
    
    this.addRule('string', {
      name: 'url',
      validate: (value) => {
        try {
          new URL(value);
          return { isValid: true };
        } catch {
          return {
            isValid: false,
            message: this.config.customMessages.url || 'Must be a valid URL',
            code: 'INVALID_URL',
            severity: 'error'
          };
        }
      },
      message: 'Must be a valid URL',
      priority: 70
    });
    
    // Number validation rules
    this.addRule('number', {
      name: 'type',
      validate: (value) => ({
        isValid: typeof value === 'number' && !isNaN(value),
        message: this.config.customMessages.numberType || 'Must be a number',
        code: 'INVALID_TYPE',
        severity: 'error'
      }),
      message: 'Must be a number',
      priority: 90
    });
    
    this.addRule('number', {
      name: 'min',
      validate: (value, context) => {
        const min = context?.options?.min;
        if (min !== undefined) {
          return {
            isValid: typeof value === 'number' && value >= min,
            message: this.config.customMessages.min || `Must be at least ${min}`,
            code: 'MIN_VALUE',
            severity: 'error'
          };
        }
        return { isValid: true };
      },
      message: 'Must meet minimum value requirement',
      priority: 80
    });
    
    this.addRule('number', {
      name: 'max',
      validate: (value, context) => {
        const max = context?.options?.max;
        if (max !== undefined) {
          return {
            isValid: typeof value === 'number' && value <= max,
            message: this.config.customMessages.max || `Must be no more than ${max}`,
            code: 'MAX_VALUE',
            severity: 'error'
          };
        }
        return { isValid: true };
      },
      message: 'Must meet maximum value requirement',
      priority: 80
    });
    
    // Array validation rules
    this.addRule('array', {
      name: 'type',
      validate: (value) => ({
        isValid: Array.isArray(value),
        message: this.config.customMessages.arrayType || 'Must be an array',
        code: 'INVALID_TYPE',
        severity: 'error'
      }),
      message: 'Must be an array',
      priority: 90
    });
    
    this.addRule('array', {
      name: 'minLength',
      validate: (value, context) => {
        const minLength = context?.options?.minLength;
        if (minLength !== undefined) {
          return {
            isValid: Array.isArray(value) && value.length >= minLength,
            message: this.config.customMessages.arrayMinLength || `Must have at least ${minLength} items`,
            code: 'MIN_LENGTH',
            severity: 'error'
          };
        }
        return { isValid: true };
      },
      message: 'Must meet minimum length requirement',
      priority: 80
    });
    
    this.addRule('array', {
      name: 'maxLength',
      validate: (value, context) => {
        const maxLength = context?.options?.maxLength;
        if (maxLength !== undefined) {
          return {
            isValid: Array.isArray(value) && value.length <= maxLength,
            message: this.config.customMessages.arrayMaxLength || `Must have no more than ${maxLength} items`,
            code: 'MAX_LENGTH',
            severity: 'error'
          };
        }
        return { isValid: true };
      },
      message: 'Must meet maximum length requirement',
      priority: 80
    });
  }
  
  /**
   * Create field validator
   */
  public createFieldValidator(fieldName: string, rules: ValidationRule[]) {
    return {
      validate: (value: any, context?: ValidationContext) => {
        return this.validateField(fieldName, value, context);
      },
      validateRealTime: (value: any, callback: (results: ValidationResult[]) => void, context?: ValidationContext) => {
        return this.validateRealTime(fieldName, value, callback, context);
      }
    };
  }
  
  /**
   * Create form validator
   */
  public createFormValidator(schema: Record<string, ValidationRule[]>) {
    return {
      validate: (data: Record<string, any>, context?: ValidationContext) => {
        return this.validateFields(data, context);
      },
      isValid: (data: Record<string, any>, context?: ValidationContext) => {
        return this.isValid(data, context);
      },
      getErrors: (data: Record<string, any>, context?: ValidationContext) => {
        return this.getErrors(data, context);
      }
    };
  }
  
  /**
   * Clear validation cache
   */
  public clearCache(): void {
    this.validationCache.clear();
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    this.validationCache.clear();
    this.rules.clear();
  }
}

// Export singleton instance
export const validationSystem = ValidationSystem.getInstance();

// React hook for easy integration
export const useValidation = (fieldName: string, rules: ValidationRule[] = []) => {
  const system = validationSystem;
  
  // Add rules for this field
  React.useEffect(() => {
    rules.forEach(rule => {
      system.addRule(fieldName, rule);
    });
    
    return () => {
      rules.forEach(rule => {
        system.removeRule(fieldName, rule.name);
      });
    };
  }, [fieldName, rules]);
  
  return {
    validate: (value: any, context?: ValidationContext) => {
      return system.validateField(fieldName, value, context);
    },
    validateRealTime: (value: any, callback: (results: ValidationResult[]) => void, context?: ValidationContext) => {
      return system.validateRealTime(fieldName, value, callback, context);
    }
  };
};

export default ValidationSystem;

