# LogArc

This npm package allows you to integrate logarc on your NodeJs Application.

## Quick Start

### Install Using Npm

```
npm i logarc
```

## Usage

```
// Import the LogArcService and AppEnv enum
const { LogArcService, AppEnv } = require("logarc");

// Initialize the logger
const logger = new LogArcService(
  {
    project_key: "your-project-key",        // Required
    endpoint: "https://logarc.com/api",     // Optional (defaults to LogArc endpoint)
    env: AppEnv.DEVELOPMENT,                // One of: local, development, staging, production
    timezone: "Asia/Kathmandu",             // Optional (defaults to UTC)
  },
  { id: 1, name: "Dipesh" }                 // Optional user object
);

// Log different levels
logger.debug("Debugging something", { foo: "bar" });
logger.info("Informational message");
logger.warning("This is a warning");
logger.error("Something went wrong", { error: "details" });
logger.critical("Critical failure in system");
logger.alert("Immediate action required!");
logger.emergency("Emergency! System down!");

```

## Log Levels Reference

| Method        | Level     | Description                             |
|---------------|-----------|-----------------------------------------|
| `debug()`     | debug     | Detailed information for debugging      |
| `info()`      | info      | General informational messages          |
| `notice()`    | notice    | Normal but significant events           |
| `warning()`   | warning   | Potential issues that need attention    |
| `error()`     | error     | Runtime errors or exceptions            |
| `critical()`  | critical  | Critical conditions                     |
| `alert()`     | alert     | Requires immediate action               |
| `emergency()` | emergency | System is unusable or in a severe state |

## Possible Errors & How to Handle Them

### ProjectKeyNotFoundException

* Cause: project_key is missing in the config.
* Fix: Make sure to pass project_key when initializing LogArcService:
    ```
  const logger = new LogArcService({ project_key: "your-key" });
    ```

### InvalidProjectKeyException

* Cause: Server responded with 422, meaning the project key is invalid.
* Fix: Verify your project key is correct and active on the LogArc dashboard. Catch the error if needed:
    ```
      try {
            logger.info("Test log");
        } catch (err) {
            if (err.name === "InvalidProjectKeyException") {
                console.error("Invalid project key! Check your configuration.");
            }
        }
    ```

### Network/Connection Errors

* Cause: Unable to reach the LogArc server (timeout, DNS, or offline).
* Fix: Ensure your server can access the endpoint and retry if necessary:

```
    try {
      logger.debug("Testing connection");
    } catch (err) {
      console.error("Failed to send log:", err.message);
    }
```

### Invalid Environment

* Cause: env is not one of the allowed values (local, development, staging, production).
* Fix: Use the AppEnv enum to set your environment:
    ```
    const logger = new LogArcService({ project_key: "your-key", env: AppEnv.DEVELOPMENT });
    ```

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Author

- [@Dipesh79](https://www.github.com/Dipesh79)

## Support

For support, email dipeshkhanal79[at]gmail[dot]com.