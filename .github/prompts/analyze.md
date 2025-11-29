# Analysis & Review Prompts

## 🔍 Code Analysis

### **Full Code Review**
```
Perform comprehensive code review of attached file(s):

Check:
1. **Code Quality**
   - Naming conventions
   - Code organization
   - DRY principle
   - Complexity (functions > 50 lines)

2. **Security**
   - Input validation
   - Output escaping
   - SQL injection risks
   - XSS vulnerabilities
   - Secrets exposure

3. **Error Handling**
   - Try-except coverage
   - Error logging
   - User-friendly messages
   - Proper error propagation

4. **Performance**
   - N+1 queries
   - Unnecessary loops
   - Async/await usage
   - Memory efficiency

5. **Standards Compliance**
   - Follows .github/instructions patterns
   - Type hints/annotations
   - Documentation
   - Testing

Provide prioritized recommendations with code examples.
```

### **Quick Health Check**
```
Quick health check of attached file(s):

✅ Pass / ⚠️ Warning / ❌ Fail

- [ ] No syntax errors
- [ ] All imports resolve
- [ ] Type hints present
- [ ] Error handling exists
- [ ] No hardcoded secrets
- [ ] Documentation present
- [ ] Follows naming conventions
- [ ] Security best practices

List any failures with quick fixes.
```

### **Dependency Analysis**
```
Analyze dependencies in attached file(s):

Check:
- All imports are used
- No circular dependencies
- Dependencies are up-to-date
- No deprecated functions used
- Proper version compatibility

Python: Check requirements.txt
PHP: Check WordPress/WooCommerce versions
JavaScript: Check package.json

List issues and update recommendations.
```

---

## 🆚 Comparison & Migration

### **Compare with Reference**
```
Compare attached file with reference implementation:

Reference: [Specify file/URL]

Analysis:
1. Feature parity - what's missing?
2. Better patterns in reference
3. Better patterns in current file
4. Compatibility differences
5. Performance differences

Recommend:
- Features to adopt
- Patterns to keep
- Improvements to make

Provide migration code if needed.
```

### **Plugin Comparison**
```
Compare custom plugin with original:

Original: [Plugin name/URL]
Custom: [Attached file]

Identify:
1. Customizations made
2. Features removed
3. Features added
4. Breaking changes
5. Upgrade path challenges

Assess:
- Can we upgrade base plugin?
- Should we merge updates?
- Should we fork permanently?

Recommend migration strategy.
```

### **Version Migration Check**
```
Check compatibility for migration:

From: [Current version]
To: [Target version]

Analyze:
- Deprecated features used
- Breaking changes impact
- New features to adopt
- Migration steps needed

Generate migration checklist and code updates.
```

---

## 🔬 Architecture Analysis

### **Analyze Architecture**
```
Analyze architecture of [component/plugin/service]:

Evaluate:
1. **Separation of Concerns**
   - Business logic vs. presentation
   - Service layer pattern
   - Clear responsibilities

2. **Dependencies**
   - Tight coupling issues
   - Dependency injection opportunities
   - Interface usage

3. **Scalability**
   - Performance bottlenecks
   - Caching opportunities
   - Background job candidates

4. **Maintainability**
   - Code organization
   - Documentation
   - Test coverage

Suggest architectural improvements with diagrams.
```

### **Find Code Smells**
```
Identify code smells in attached file(s):

Look for:
- Long functions (>50 lines)
- Deep nesting (>3 levels)
- Duplicate code
- Large classes
- Long parameter lists
- Primitive obsession
- Feature envy
- God objects

List smells with refactoring suggestions.
```

### **Complexity Analysis**
```
Measure code complexity:

Calculate:
- Cyclomatic complexity
- Lines of code per function
- Number of dependencies
- Test coverage percentage

Identify:
- Most complex functions
- Hardest to test areas
- Refactoring priorities

Recommend simplification strategies.
```

---

## 🐛 Bug & Issue Detection

### **Find Potential Bugs**
```
Scan for potential bugs in attached file(s):

Check for:
- Null/undefined handling
- Array/list boundary errors
- Type mismatches
- Race conditions
- Resource leaks (unclosed files/connections)
- Infinite loops
- Integer overflow
- Division by zero

List potential bugs with severity and fixes.
```

### **Find Logic Errors**
```
Analyze business logic for errors:

Context: [Describe expected behavior]

Check:
- Correct calculations
- Proper conditionals
- Edge case handling
- State management
- Data flow correctness

Identify logic errors with test cases to prove issue.
```

### **Find Memory Leaks**
```
Check for memory leaks:

Python:
- Large objects in global scope
- Circular references
- Unclosed file handles
- Long-lived caches

PHP:
- Large arrays in memory
- Unclosed database connections
- Session data accumulation

List potential leaks with fixes.
```

---

## 📊 Data Flow Analysis

### **Trace Data Flow**
```
Trace data flow for [DATA_TYPE]:

Start: [Entry point]
End: [Final destination]

Map:
1. Where data enters system
2. Transformations applied
3. Validation points
4. Storage locations
5. Output points

Identify:
- Missing validations
- Unnecessary transformations
- Data loss points
- Security exposure points

Provide data flow diagram and recommendations.
```

### **Find Data Inconsistencies**
```
Check for data consistency issues:

Analyze:
- Data format mismatches
- Type conversions
- Null/empty handling
- Default values
- Data synchronization

Identify inconsistencies with examples and fixes.
```

---

## 🔐 Security Audit

### **Full Security Audit**
```
Comprehensive security audit:

1. **Input Validation**
   - All user inputs validated
   - Type checking
   - Range/length checks

2. **Output Encoding**
   - HTML escaping
   - URL encoding
   - SQL parameterization

3. **Authentication & Authorization**
   - API key security
   - Nonce verification
   - Capability checks

4. **Data Protection**
   - Sensitive data encryption
   - Secure data transmission
   - No secrets in code

5. **Common Vulnerabilities**
   - SQL injection
   - XSS
   - CSRF
   - Path traversal
   - Command injection

Provide security report with severity ratings and fixes.
```

### **Check OWASP Top 10**
```
Check against OWASP Top 10:

1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Software/Data Integrity
9. Logging/Monitoring Failures
10. SSRF

List vulnerabilities found with CVSS scores and remediation.
```

---

## 📈 Performance Profiling

### **Performance Profile**
```
Profile performance of [FEATURE/FUNCTION]:

Measure:
- Execution time
- Memory usage
- Database queries count
- API calls count
- Cache hit rate

Identify:
- Slowest operations
- Most memory-intensive operations
- Optimization opportunities

Provide benchmark data and optimization plan.
```

### **Database Query Analysis**
```
Analyze database queries:

Check for:
- N+1 query problems
- Missing indexes
- Full table scans
- Inefficient JOINs
- Redundant queries

WordPress: Check for direct queries vs. WP API
Python: Check for ORM optimization

Suggest query optimizations with before/after examples.
```

---

## 📝 Documentation Analysis

### **Documentation Coverage**
```
Analyze documentation coverage:

Check:
- README exists and complete
- All public functions documented
- Complex logic explained
- Examples provided
- API documented
- Setup instructions clear
- Troubleshooting guide exists

Rate coverage: [0-100%]
List missing documentation with priority.
```

### **Code vs. Documentation Sync**
```
Verify code matches documentation:

Check:
- Function signatures match docs
- Parameters documented correctly
- Return values accurate
- Examples still work
- Deprecated features marked

List discrepancies and provide updates.
```
