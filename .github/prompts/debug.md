# Debug & Troubleshooting Prompts

## 🐛 General Debugging

### **Quick Error Analysis**
```
Analyze the attached file(s) for errors, bugs, or issues. Check:
- Syntax errors
- Logic errors
- Type mismatches
- Potential runtime errors
- Security vulnerabilities

Provide a prioritized list of issues with line numbers and fix suggestions.
```

### **Compare with Working Reference**
```
Compare the attached file with the reference implementation.
Identify differences and explain:
- What's missing
- What's incorrect
- What's inefficient
- What could cause bugs

Suggest specific fixes to align with the reference.
```

### **Root Cause Analysis**
```
The following error occurs: [PASTE ERROR MESSAGE]

Analyze the attached file(s) and:
1. Identify the root cause
2. Explain why it happens
3. Provide step-by-step fix
4. Suggest prevention strategies

Include line numbers and code examples.
```

---

## 🔍 Specific Checks

### **Check Error Handling**
```
Review error handling in the attached file(s). Verify:
- All external operations are wrapped in try-except/try-catch
- Errors are logged with context
- User-friendly error messages
- Proper error propagation
- No silent failures

List missing error handlers with code examples.
```

### **Check Security Patterns**
```
Security audit for attached file(s):

Python/Backend:
- Input validation (Pydantic schemas)
- API key usage (environment variables)
- SQL injection prevention
- Rate limiting

WordPress/PHP:
- Input sanitization (sanitize_*)
- Output escaping (esc_*)
- Nonce verification
- SQL safety ($wpdb->prepare)
- Capability checks

List vulnerabilities with severity and fixes.
```

### **Check Type Safety**
```
Verify type safety in attached file(s):

Python:
- All functions have type hints
- Pydantic models for data validation
- No `Any` types (unless necessary)
- Proper return type annotations

PHP:
- Docblock annotations for all functions
- Type hints where possible (PHP 8.0+)

List missing or incorrect type annotations.
```

---

## 🧪 Testing & Validation

### **Check Test Coverage**
```
Analyze test coverage for attached file(s):
- Identify untested functions/methods
- Find missing edge cases
- Check error condition tests
- Verify mock usage for external dependencies

Suggest specific test cases to add with examples.
```

### **Generate Missing Tests**
```
Generate comprehensive tests for the attached file(s):

Python: pytest format
PHP: PHPUnit format
JavaScript: Jest format

Include:
- Happy path tests
- Edge cases (empty, null, boundary values)
- Error conditions
- Mock external dependencies

Provide complete test code ready to use.
```

---

## 📊 Performance Check

### **Performance Analysis**
```
Analyze performance of attached file(s):
- Identify slow operations (N+1 queries, large loops)
- Check async/await usage (Python)
- Database query optimization
- Memory-intensive operations
- Unnecessary data processing

Suggest optimizations with code examples.
```

### **Check Async Patterns**
```
Verify async/await usage in Python code:
- I/O operations use async
- Proper await usage
- No blocking operations in async functions
- Efficient concurrent operations

Suggest improvements with code examples.
```

---

## 🔧 Code Quality

### **Check Against Standards**
```
Verify code follows project standards:

Refer to:
- `.github/copilot-instructions.md` (general)
- `.github/instructions/backend.instructions.md` (Python)
- `.github/instructions/wordpress-plugins.instructions.md` (WordPress)

Check:
- Naming conventions
- Code formatting
- Documentation (docstrings)
- Error handling patterns
- Logging standards

List violations with fixes.
```

### **Refactoring Suggestions**
```
Suggest refactoring improvements for attached file(s):
- Extract reusable functions
- Reduce code duplication (DRY)
- Simplify complex logic
- Improve readability
- Better separation of concerns

Provide before/after code examples.
```

---

## 🔄 Compatibility Check

### **HPOS Compatibility** (WordPress)
```
Verify WooCommerce HPOS compatibility:
- Uses CRUD methods instead of direct meta access
- get_meta() / update_meta_data() / save()
- No direct database queries for orders
- Compatible with both legacy and HPOS

List incompatibilities with migration code.
```

### **Python Version Check**
```
Verify Python 3.11+ compatibility:
- Uses new type hint syntax (dict[str, Any])
- No deprecated features
- Takes advantage of new features where beneficial
- Compatible with project dependencies

List compatibility issues.
```

---

## 📝 Documentation Check

### **Check Documentation**
```
Verify documentation quality:
- All public functions have docstrings
- Docstrings include Args, Returns, Raises
- Examples provided for complex functions
- README exists and is up-to-date
- Inline comments explain "why" not "what"

List missing/inadequate documentation.
```
