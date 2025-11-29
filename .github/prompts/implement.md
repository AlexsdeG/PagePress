# Implementation Prompts

## ✨ New Feature Implementation

### **Add New Feature**
```
Implement [FEATURE NAME] with the following requirements:

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Technical constraints:
- Follow patterns in `.github/instructions/[backend|wordpress-plugins].instructions.md`
- Include error handling and logging
- Add comprehensive tests
- Update relevant documentation

Provide complete implementation with explanations.
```

### **Add API Endpoint** (Backend)
```
Create new FastAPI endpoint:

Path: [e.g., /api/products/{id}/pricing]
Method: [GET/POST/PUT/DELETE]
Purpose: [Brief description]

Input:
- [Parameter 1]: [Type] - [Description]
- [Parameter 2]: [Type] - [Description]

Output:
- Success: [Response structure]
- Error: [Error codes and messages]

Requirements:
- Pydantic validation
- Error handling
- Structured logging
- API key authentication
- Unit tests

Generate complete code following backend.instructions.md patterns.
```

### **Add WordPress Hook/Filter**
```
Implement WordPress hook/filter:

Type: [action/filter]
Hook name: [e.g., b2b_after_price_calculation]
Purpose: [Description]

Parameters:
- [Param 1]: [Type] - [Description]
- [Param 2]: [Type] - [Description]

Requirements:
- Follow WordPress naming conventions
- Include docblock
- Add usage example
- Implement callback example

Generate complete code with documentation.
```

---

## 🔄 Update & Modify

### **Refactor Function**
```
Refactor the [FUNCTION_NAME] function to:
- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

Constraints:
- Maintain backwards compatibility
- Improve performance
- Add type hints/validation
- Keep existing tests passing

Show before/after comparison and explain changes.
```

### **Add Validation**
```
Add input validation to the attached file(s):

Python:
- Create Pydantic models
- Add type hints
- Validate early, fail fast

PHP:
- Use sanitize_* functions
- Add type checks
- Return WP_Error on failure

Generate complete validation code.
```

### **Add Logging**
```
Add structured logging to the attached file(s):

Python:
- Use structlog
- Log key operations (INFO)
- Log errors with context (ERROR/EXCEPTION)
- Include relevant identifiers

PHP:
- Use b2b_log() helper
- JSON format with context
- Include product_id, order_id, etc.

Show where to add logs with code examples.
```

---

## 🔌 Plugin Development

### **Create New Plugin** (WordPress)
```
Create new WordPress plugin:

Name: [Plugin Name]
Purpose: [Description]

Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Requirements:
- HPOS compatible
- WooCommerce integration
- Security best practices (nonces, sanitization, escaping)
- Admin settings page
- REST API endpoint (if applicable)

Generate complete plugin structure with all files.
```

### **Add Plugin Settings**
```
Add settings page to WordPress plugin:

Settings:
- [Setting 1]: [Type] - [Description] - [Default]
- [Setting 2]: [Type] - [Description] - [Default]

Location: WooCommerce > Settings > [Tab Name]

Requirements:
- Settings API
- Validation on save
- Sanitization
- Help text for each setting

Generate complete settings code.
```

### **Add Custom Meta Fields**
```
Add custom meta fields to [product/order/customer]:

Fields:
- [field_1]: [Type] - [Description]
- [field_2]: [Type] - [Description]

Requirements:
- HPOS compatible (use CRUD methods)
- Exposed via WooCommerce REST API
- Validation on save
- Admin UI for editing

Generate complete implementation.
```

---

## 🔗 Integration Tasks

### **Integrate Third-Party API**
```
Integrate [API NAME]:

Endpoint: [URL]
Authentication: [Type - API key, OAuth, etc.]
Purpose: [What data to fetch/send]

Requirements:
Python:
- Use httpx (async)
- Retry logic (3 attempts, exponential backoff)
- Timeout: 30s
- Error handling and logging

PHP:
- Use wp_remote_post/get
- Error handling with WP_Error
- Timeout: 30s
- Logging

Generate complete API client code.
```

### **Add Webhook Handler**
```
Create webhook handler for [EVENT]:

Trigger: [When webhook is called]
Payload: [Expected data structure]
Action: [What to do with the data]

Requirements:
- Validate webhook signature
- Parse payload
- Process asynchronously (if long-running)
- Error handling
- Logging
- Return appropriate HTTP status

Generate complete webhook handler.
```

---

## 📦 Data Processing

### **Add CSV Processor**
```
Create CSV processor for [SUPPLIER_NAME]:

CSV Structure:
- [Column 1]: [Maps to field X]
- [Column 2]: [Maps to field Y]

Transformations:
- [Transformation 1]
- [Transformation 2]

Requirements:
- Add supplier mapping to config/supplier_mappings.json
- Handle missing columns gracefully
- Validate data with Pydantic
- Process in chunks (1000 rows)
- Progress logging

Generate complete processor code.
```

### **Add Data Validation**
```
Add data validation for [DATA_TYPE]:

Required fields:
- [Field 1]: [Type] - [Constraints]
- [Field 2]: [Type] - [Constraints]

Validation rules:
- [Rule 1]
- [Rule 2]

Python: Create Pydantic model
PHP: Create validation function with WP_Error

Generate complete validation code.
```

---

## 🧪 Testing Tasks

### **Add Integration Test**
```
Create integration test for [FEATURE]:

Test scenario:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected outcome:
- [Outcome 1]
- [Outcome 2]

Requirements:
- Mock external dependencies (API calls, database)
- Test happy path and error conditions
- Clean up test data after run

Generate complete test code.
```

### **Add E2E Test**
```
Create end-to-end test for [USER FLOW]:

User journey:
1. [Action 1]
2. [Action 2]
3. [Action 3]

Success criteria:
- [Criteria 1]
- [Criteria 2]

Generate test code with setup/teardown.
```

---

## 📚 Documentation

### **Generate Documentation**
```
Create comprehensive documentation for the attached file(s):

Include:
- Overview/purpose
- Installation/setup
- Configuration options
- Usage examples
- API reference (if applicable)
- Troubleshooting common issues

Follow README template from copilot-instructions.md.
Generate complete README.md.
```

### **Add Code Examples**
```
Add usage examples to documentation:

For: [Function/Class/Plugin]

Examples needed:
- Basic usage
- Advanced usage with options
- Error handling
- Integration with other components

Generate complete code examples with explanations.
```
