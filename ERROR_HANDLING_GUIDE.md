# Error Handling Guide

Store Service Management & POS Application

------------------------------------------------------------------------

# 1. Core Principles

Error handling must be:

✅ Consistent\
✅ Predictable\
✅ Secure\
✅ Debuggable\
✅ Non-leaking sensitive data

System must NEVER expose:

🚫 Stack traces to client\
🚫 Database errors directly\
🚫 Internal implementation details

------------------------------------------------------------------------

# 2. Error Categories

Errors must be classified:

1.  Validation Errors (400)
2.  Authentication Errors (401)
3.  Authorization Errors (403)
4.  Not Found Errors (404)
5.  Business Logic Errors (409 / 422)
6.  Server Errors (500)

------------------------------------------------------------------------

# 3. Standard Error Response (MANDATORY)

All errors must follow:

``` json
{
  "success": false,
  "message": "Error description"
}
```

Validation Error:

``` json
{
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

------------------------------------------------------------------------

# 4. Backend Error Handling

------------------------------------------------------------------------

## Global Error Handling Middleware (MANDATORY)

Backend must use centralized error handler.

Example:

``` js
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  })

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
}
```

Rules:

✅ Always last middleware\
✅ Never expose stack trace\
✅ Always log error

------------------------------------------------------------------------

## Custom Error Class (RECOMMENDED)

``` js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}
```

Usage:

``` js
throw new AppError('Product not found', 404)
```

------------------------------------------------------------------------

# 5. Validation Error Handling

Use express-validator.

Example:

``` js
import { validationResult } from 'express-validator'

export const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    logger.warn({
      type: 'validation_error',
      errors: errors.array()
    })

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    })
  }

  next()
}
```

------------------------------------------------------------------------

# 6. Authentication Error Handling

Examples:

Invalid Token → 401\
Expired Token → 401

Rules:

🚫 Never reveal token details\
🚫 Never reveal auth internals

------------------------------------------------------------------------

# 7. Logger Standards 📜 (CRITICAL)

------------------------------------------------------------------------

## Logger Requirements

System must support:

✅ Error logging\
✅ Warning logging\
✅ Info logging\
✅ Structured logging

------------------------------------------------------------------------

## Logger Levels

-   error → system failure
-   warn → recoverable issue
-   info → normal flow
-   debug → development only

------------------------------------------------------------------------

## Logger Rules

✅ Use structured logs (object आधारित)\
✅ Never log sensitive data\
✅ Never log passwords\
✅ Never log tokens

Forbidden:

🚫 console.log in production\
🚫 Plain string logs\
🚫 Sensitive data exposure

------------------------------------------------------------------------

## Logger Example (Basic)

Example using simple abstraction:

``` js
export const logger = {
  error: (payload) => console.error(payload),
  warn: (payload) => console.warn(payload),
  info: (payload) => console.info(payload),
  debug: (payload) => console.debug(payload)
}
```

Recommended Production Tools:

-   Winston
-   Pino

------------------------------------------------------------------------

# 8. Backend Error Rules

------------------------------------------------------------------------

Controllers:

✅ Use try/catch\
✅ Throw AppError for known cases

Example:

``` js
export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id)

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    return res.json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}
```

Rules:

🚫 No res.json inside catch\
🚫 Always next(error)

------------------------------------------------------------------------

# 9. Frontend Error Handling

------------------------------------------------------------------------

## Core Rules

Frontend must handle:

✅ Loading state\
✅ Error state\
✅ Network failure\
✅ Auth failure

------------------------------------------------------------------------

## Axios Interceptor (MANDATORY)

``` ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data.message)
    } else {
      console.error('Network Error')
    }

    return Promise.reject(error)
  }
)
```

------------------------------------------------------------------------

## UI Error Handling

Components must:

✅ Show user-friendly messages\
🚫 Never show raw server errors

Example:

``` tsx
{error && <div className="text-red-500">Something went wrong</div>}
```

------------------------------------------------------------------------

# 10. Security Considerations 🛡️

------------------------------------------------------------------------

System must avoid:

🚫 Error detail leakage\
🚫 SQL error exposure\
🚫 Stack trace exposure\
🚫 Sensitive log data

Logs must be safe.

Responses must be generic.

------------------------------------------------------------------------

# 11. Forbidden Patterns 🚫

------------------------------------------------------------------------

Backend:

🚫 Throwing raw database errors\
🚫 Sending stack trace to client\
🚫 Missing global error handler\
🚫 Missing validation handling

Frontend:

🚫 Ignoring API errors\
🚫 Displaying raw backend messages\
🚫 Silent failures

------------------------------------------------------------------------

# 12. AI Behavior Rules

------------------------------------------------------------------------

AI must:

✅ Use AppError for controlled errors\
✅ Use centralized error handler\
✅ Log errors via logger\
✅ Never expose stack trace\
✅ Follow response format

AI must NOT:

❌ Leak sensitive data\
❌ Use console.log randomly\
❌ Return inconsistent error structure

------------------------------------------------------------------------

END OF GUIDE
