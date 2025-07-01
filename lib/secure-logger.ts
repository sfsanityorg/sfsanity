class SecureLogger {
  /**
   * Fields that should be redacted from logs to protect PII
   */
  private static readonly REDACT_FIELDS = [
    'email',
    'ip',
    'password',
    'token',
    'authorization',
    'cookie',
    'session',
    'ssn',
    'phone',
    'address',
    'credit_card',
    'api_key',
    'secret',
    'private_key'
  ]

  /**
   * Logs an info message
   * @param message The message to log
   * @param data Optional data to log
   * @param context Optional context to log
   */
  static info(message: string, data?: any, context?: any): void {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data: this.redactSensitiveData(data),
      context: this.redactSensitiveData(context)
    }))
  }

  /**
   * Logs a warning message
   * @param message The message to log
   * @param data Optional data to log
   * @param context Optional context to log
   */
  static warn(message: string, data?: any, context?: any): void {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      data: this.redactSensitiveData(data),
      context: this.redactSensitiveData(context)
    }))
  }

  /**
   * Logs an error message
   * @param message The message to log
   * @param error The error to log
   * @param context Optional context to log
   */
  static error(message: string, error: any, context?: any): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: this.redactSensitiveData(error),
      context: this.redactSensitiveData(context)
    }))
  }

  /**
   * Logs a debug message
   * @param message The message to log
   * @param data Optional data to log
   * @param context Optional context to log
   */
  static debug(message: string, data?: any, context?: any): void {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      message,
      data: this.redactSensitiveData(data),
      context: this.redactSensitiveData(context)
    }))
  }

  /**
   * Redact sensitive data from objects to prevent PII leakage
   */
  private static redactSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data
    }

    if (Array.isArray(data)) {
      return data.map(item => this.redactSensitiveData(item))
    }

    const redacted = { ...data }
    
    for (const key of Object.keys(redacted)) {
      const lowerKey = key.toLowerCase()
      
      // Check if field should be redacted
      if (this.REDACT_FIELDS.some(field => lowerKey.includes(field))) {
        redacted[key] = '[REDACTED]'
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redactSensitiveData(redacted[key])
      }
    }
    
    return redacted
  }
}
