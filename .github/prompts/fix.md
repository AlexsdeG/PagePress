# Fix & Repair Prompts

## 🔧 Error Fixes

### **Fix Error**
```
Fix the following error:

Error message:
[PASTE FULL ERROR MESSAGE]

Context:
- File: [Filename]
- Line: [Line number]
- Action that caused error: [Description]

Requirements:
- Identify root cause
- Provide fix with explanation
- Add error handling to prevent recurrence
- Add logging if missing
- Update tests if needed

Show complete fixed code.
```

### **Fix Type Errors**
```
Fix all type errors in attached file(s):

Python:
- Add missing type hints
- Fix incorrect type annotations
- Resolve mypy/pyright errors

PHP:
- Add missing docblocks
- Fix incorrect type declarations
- Ensure PHP 8.0+ compatibility

Show all fixes with explanations.
```

### **Fix Import Errors**
```
Fix import/dependency errors:

Error: [Import error message]

Check:
- Module exists and installed
- Correct import path
- Circular import issues
- Virtual environment activated

Provide:
- Fixed import statements
- Installation commands if needed
- Restructuring if circular imports found
```

---

## 🐛 Bug Fixes

### **Fix Logic Bug**
```
Fix logic bug:

Bug description:
[Describe incorrect behavior]

Expected behavior:
[Describe correct behavior]

Test case that fails:
[Provide failing test case]

Requirements:
- Fix the logic error
- Explain what was wrong
- Add test to prevent regression
- Update documentation if needed

Show fixed code with tests.
```

### **Fix Race Condition**
```
Fix race condition in:

File: [Filename]
Function: [Function name]

Symptoms:
- [Symptom 1]
- [Symptom 2]

Requirements:
- Identify the race condition
- Add proper locking/synchronization
- Ensure thread safety
- Add tests for concurrent access

Show fixed code with explanation.
```

### **Fix Memory Leak**
```
Fix memory leak:

Symptoms:
- [Memory usage pattern]
- [When it occurs]

Profile data:
[If available]

Requirements:
- Identify leak source
- Fix resource cleanup
- Ensure proper disposal
- Add tests to verify fix

Show fixed code and verification method.
```

---

## 🔐 Security Fixes

### **Fix Security Vulnerability**
```
Fix security vulnerability:

Vulnerability type: [SQL injection / XSS / CSRF / etc.]
Location: [File and line]
Severity: [Critical / High / Medium / Low]

Requirements:
- Patch the vulnerability
- Explain the risk
- Add validation/sanitization
- Add security test
- Update security documentation

Show fixed code with security test.
```

### **Fix SQL Injection**
```
Fix SQL injection vulnerability:

Vulnerable code: [Line numbers]

Requirements:
WordPress:
- Use $wpdb->prepare()
- Parameterize all queries
- Never concatenate user input

Python:
- Use parameterized queries
- Add Pydantic validation

Show fixed queries with validation.
```

### **Fix XSS Vulnerability**
```
Fix XSS vulnerability:

Location: [File and line]
User input: [Variable name]

Requirements:
- Escape all outputs
- Use esc_html() / esc_url() / esc_attr() (PHP)
- Use DOMPurify (JavaScript)
- Validate inputs
- Add CSP headers if applicable

Show fixed code with proper escaping.
```

---

## ⚡ Performance Fixes

### **Fix Performance Issue**
```
Fix performance bottleneck:

Issue: [Slow operation description]
Current time: [Benchmark]
Target time: [Goal]

Profile data:
[If available]

Requirements:
- Optimize the slow operation
- Add caching if applicable
- Use async/await if I/O bound
- Add database indexes if needed
- Verify improvement with benchmarks

Show optimized code with before/after metrics.
```

### **Fix N+1 Query**
```
Fix N+1 query problem:

Location: [File and function]
Current queries: [Number]

Requirements:
- Use eager loading / JOIN
- Reduce queries to O(1) or O(log n)
- Maintain same functionality
- Verify with query logging

Show fixed code with query count comparison.
```

### **Fix Blocking Operation**
```
Fix blocking operation in async code:

Blocking call: [Function/operation]
Location: [File and line]

Requirements:
Python:
- Convert to async/await
- Use httpx for HTTP
- Use asyncio.to_thread for CPU-bound

PHP:
- Use background jobs (WP Cron)
- Implement queuing

Show async implementation.
```

---

## 🔄 Compatibility Fixes

### **Fix HPOS Incompatibility**
```
Fix WooCommerce HPOS incompatibility:

Incompatible code: [Line numbers]

Issues:
- Direct meta access
- Legacy database queries
- Order object assumptions

Requirements:
- Use CRUD methods (get_meta, update_meta_data, save)
- Remove direct database queries
- Test with HPOS enabled
- Maintain backward compatibility

Show HPOS-compatible code.
```

### **Fix Deprecated Function**
```
Fix deprecated function usage:

Deprecated: [Function name]
Replacement: [New function]
Removal version: [When it will be removed]

Requirements:
- Replace with current function
- Maintain same functionality
- Update tests
- Add deprecation notice if creating wrapper

Show updated code.
```

### **Fix Version Compatibility**
```
Fix version compatibility issue:

Current version: [Version]
Target version: [Version]
Breaking changes: [List changes]

Requirements:
- Update to compatible APIs
- Handle both versions if needed
- Update minimum version requirement
- Test on both versions

Show compatible code.
```

---

## 📝 Code Quality Fixes

### **Fix Code Smell**
```
Fix code smell:

Smell type: [Long function / Duplicate code / etc.]
Location: [File and lines]

Requirements:
- Refactor to eliminate smell
- Maintain functionality
- Add tests if missing
- Improve readability

Show refactored code with explanation.
```

### **Fix Naming Issues**
```
Fix naming convention violations:

Issues:
[List variables/functions with incorrect names]

Requirements:
- Follow project naming conventions
- Update all references
- Update tests
- Update documentation

Show renamed code with migration guide if breaking.
```

### **Fix Documentation**
```
Fix documentation issues:

Issues:
- [Missing docstrings]
- [Incorrect descriptions]
- [Outdated examples]

Requirements:
- Add missing documentation
- Correct inaccuracies
- Update examples
- Follow documentation standards

Show complete documentation.
```

---

## 🧪 Test Fixes

### **Fix Failing Test**
```
Fix failing test:

Test name: [Test function name]
Error: [Test error message]
Expected: [Expected result]
Actual: [Actual result]

Requirements:
- Fix the test or the code
- Explain what was wrong
- Ensure test is valid
- Add edge case tests

Show fixed code/test.
```

### **Fix Flaky Test**
```
Fix flaky test:

Test: [Test name]
Flakiness pattern: [When it fails]

Possible causes:
- Race conditions
- External dependencies
- Time-dependent logic
- Random data

Requirements:
- Make test deterministic
- Mock external dependencies
- Use fixed test data
- Ensure cleanup

Show fixed test.
```

### **Fix Test Coverage**
```
Fix low test coverage:

Current coverage: [X%]
Target coverage: [Y%]

Untested code:
[List untested functions/branches]

Requirements:
- Add tests for untested code
- Focus on critical paths
- Include edge cases
- Mock external dependencies

Generate complete test suite.
```

---

## 🔌 Integration Fixes

### **Fix API Integration**
```
Fix API integration issue:

API: [API name]
Error: [Error message/behavior]

Current code: [Relevant section]

Requirements:
- Fix API call/response handling
- Add proper error handling
- Add retry logic
- Update logging
- Test with API

Show fixed integration code.
```

### **Fix Webhook Handler**
```
Fix webhook handler:

Issue: [Problem description]
Webhook source: [Service name]

Requirements:
- Fix payload parsing
- Add signature verification
- Handle edge cases
- Add error responses
- Log all events

Show fixed handler code.
```

---

## 🗄️ Database Fixes

### **Fix Database Schema**
```
Fix database schema issue:

Problem: [Schema issue]
Table: [Table name]

Requirements:
- Create migration script
- Preserve existing data
- Add rollback option
- Test migration
- Update models/queries

Show migration code and updated schema.
```

### **Fix Data Corruption**
```
Fix data corruption:

Affected data: [Type of data]
Corruption pattern: [What's wrong]

Requirements:
- Identify corrupt records
- Create cleanup script
- Fix the bug causing corruption
- Add validation to prevent recurrence
- Backup before running

Show cleanup script and prevention fix.
```
