const axios = require("axios");
const moment = require("moment-timezone");

/**
 * Exception thrown when project key is not found in configuration.
 */
class ProjectKeyNotFoundException extends Error {
  constructor() {
    super("Project key not found in configuration.");
    this.name = "ProjectKeyNotFoundException";
  }
}

/**
 * Exception thrown when an invalid project key is provided (422 response).
 */
class InvalidProjectKeyException extends Error {
  constructor() {
    super("Invalid project key provided.");
    this.name = "InvalidProjectKeyException";
  }
}

/**
 * Enum-like object for supported application environments.
 */
const AppEnv = Object.freeze({
  Local: "local",
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
});

/**
 * LogArcService is responsible for logging messages
 * to the external LogArc service.
 */
class LogArcService {
  /**
   * @param {object} config - App configuration
   * @param {string} config.project_key - Project key for authentication
   * @param {string} config.endpoint - Endpoint of the logging service
   * @param {string} config.env - App environment (must match AppEnv enum)
   * @param {string} config.timezone - App timezone (e.g., UTC, Asia/Kathmandu)
   * @param {object|null} user - Optional user object (similar to auth()->user())
   */
  constructor(config = {}, user = null) {
    this.projectKey = this.getProjectKey(config);
    this.endpoint = config.endpoint || "https://logarc.com/api";
    this.env = config.env || AppEnv.PRODUCTION;
    this.timezone = config.timezone || "UTC";
    this.user = user;

    // Validate environment against AppEnv enum
    if (!Object.values(AppEnv).includes(this.env)) {
      throw new Error(`Invalid environment: ${this.env}`);
    }
  }

  /**
   * Retrieves the project key from config or throws exception.
   */
  getProjectKey(config) {
    if (!config.project_key) {
      throw new ProjectKeyNotFoundException();
    }
    return config.project_key;
  }

  /**
   * Debug log
   */
  debug(message = null, data = null) {
    this.log("debug", message, data);
  }

  /**
   * Info log
   */
  info(message = null, data = null) {
    this.log("info", message, data);
  }

  /**
   * Error log
   */
  error(message = null, data = null) {
    this.log("error", message, data);
  }

  /**
   * Notice log
   */
  notice(message = null, data = null) {
    this.log("notice", message, data);
  }

  /**
   * Warning log
   */
  warning(message = null, data = null) {
    this.log("warning", message, data);
  }

  /**
   * Critical log
   */
  critical(message = null, data = null) {
    this.log("critical", message, data);
  }

  /**
   * Alert log
   */
  alert(message = null, data = null) {
    this.log("alert", message, data);
  }

  /**
   * Emergency log
   */
  emergency(message = null, data = null) {
    this.log("emergency", message, data);
  }

  /**
   * Internal method: builds log object with metadata and sends request.
   */
  async log(level, message = null, data = null) {
    // Grab stack trace to extract class/method/line info
    const stack = new Error().stack.split("\n");
    const callerLine = stack[3] || "";
    const match = callerLine.match(/at (.+?) \((.+?):(\d+):\d+\)/);

    const className = match ? match[1] : "UnknownClass";
    const lineNumber = match ? parseInt(match[3], 10) : 0;

    // Build log payload
    const logData = {
      project_key: this.projectKey,
      log_timestamp: moment().tz(this.timezone).format("YYYY-MM-DDTHH:mm:ss[Z]"),
      app_env: this.env,
      level,
      class_name: className,
      method_name: className, // JS stack doesn’t give separate method, reusing className
      line_number: lineNumber,
      message,
      data,
      user: this.user || null,
    };

    // Send to server
    await this.sendLogRequest(logData);
  }

  /**
   * Send log payload to external LogArc service.
   * Throws InvalidProjectKeyException if server responds with 422.
   */
  async sendLogRequest(data) {
    try {
      const response = await axios.post(`${this.endpoint}/log`, data, {
        headers: { Accept: "application/json" },
      });

      // If request succeeds (2xx), return response
      return response.data;
    } catch (err) {
      if (err.response) {
        // Handle server response errors
        if (err.response.status === 422) {
          throw new InvalidProjectKeyException();
        }

        console.error("LogArc request failed", {
          status: err.response.status,
          body: err.response.data,
        });
      } else {
        // Handle network or other unexpected errors
        console.error("LogArc request failed", {
          message: err.message,
          stack: err.stack,
        });
      }

      // Rethrow so caller can handle failure
      throw err;
    }
  }
}

// Export service and enum
module.exports = { LogArcService, AppEnv };
