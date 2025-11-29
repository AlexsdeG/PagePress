# Backend (Python/FastAPI) Specific Prompts

## 🚀 FastAPI Development

### **Check FastAPI Endpoint**
```
Review FastAPI endpoint:

Endpoint: [Path and method]

Check:
✓ Pydantic models for validation
✓ Type hints on all parameters
✓ Error handling (HTTPException)
✓ Structured logging
✓ API key authentication
✓ Rate limiting
✓ Documentation (docstring)
✓ Response model defined
✓ Status codes correct

List issues with fixes.
```

### **Add FastAPI Endpoint**
```
Create FastAPI endpoint:

Path: [e.g., /api/v1/products/{product_id}/import]
Method: [GET/POST/PUT/DELETE/PATCH]
Purpose: [Brief description]

Request:
- Path params: [param1: type]
- Query params: [param1: type = default]
- Body: [Pydantic model structure]

Response:
- Success (200): [Response structure]
- Error (4xx/5xx): [Error structure]

Requirements:
- Async handler
- Pydantic validation
- Error handling
- Logging (structlog)
- API key auth
- OpenAPI docs
- Unit tests

Generate complete endpoint code.
```

### **Add Pydantic Model**
```
Create Pydantic model for [DATA_TYPE]:

Fields:
- [field1]: [type] - [constraints] - [description]
- [field2]: [type] - [constraints] - [description]

Validation rules:
- [Rule 1]
- [Rule 2]

Requirements:
- Use Pydantic v2 syntax
- Add field validators where needed
- Include example in schema
- Add docstrings
- Inherit from BaseModel

Generate Pydantic model with validators.
```

---

## ⚡ Async & Performance

### **Convert to Async**
```
Convert synchronous code to async:

Current: [Attached file/function]

Requirements:
- Use async/await for I/O operations
- Use httpx instead of requests
- Use asyncio.gather for parallel operations
- Handle async exceptions properly
- Add timeout handling
- Update tests to async

Show async version with explanations.
```

### **Optimize Async Operations**
```
Optimize async operations:

Code: [Attached file]

Check for:
- Sequential operations that could be parallel
- Blocking operations in async functions
- Missing asyncio.gather opportunities
- Inefficient await usage
- Missing timeout handling

Suggest optimizations with code examples.
```

### **Add Concurrent Processing**
```
Add concurrent processing:

Task: [Description]
Current: Sequential processing
Target: Concurrent processing

Requirements:
- Use asyncio.gather for I/O-bound
- Use ProcessPoolExecutor for CPU-bound
- Add progress tracking
- Handle partial failures
- Add timeout
- Log concurrent operations

Generate concurrent implementation.
```

---

## 🔄 Celery Tasks

### **Check Celery Task**
```
Review Celery task:

Task: [Task name]

Check:
✓ Task decorated correctly
✓ Retry logic implemented
✓ Error handling
✓ Logging with task_id
✓ Progress updates (if long-running)
✓ Idempotent (can retry safely)
✓ Timeout set
✓ Result stored properly

List issues with fixes.
```

### **Add Celery Task**
```
Create Celery task:

Task: [Task name]
Purpose: [Description]
Trigger: [When it runs]

Parameters:
- [param1]: [type] - [description]
- [param2]: [type] - [description]

Requirements:
- Retry on transient errors (3 attempts, exponential backoff)
- Structured logging
- Progress updates (for long tasks)
- Error notification
- Result storage
- Idempotent design
- Timeout: [X] seconds

Generate complete task implementation.
```

### **Optimize Celery Task**
```
Optimize Celery task:

Task: [Task name]
Current runtime: [X seconds]
Target runtime: [Y seconds]

Profile:
- Time breakdown
- Bottlenecks identified

Optimize:
- Batch operations
- Reduce database queries
- Add caching
- Parallelize where possible
- Optimize data processing

Show optimized task code.
```

---

## 🗄️ Data Processing

### **Add CSV Processor**
```
Create CSV processor for [SUPPLIER]:

CSV structure:
- [Column 1] → [Target field]
- [Column 2] → [Target field]

Transformations:
- [Transformation 1]
- [Transformation 2]

Requirements:
- Use Pandas for processing
- Add supplier to supplier_mappings.json
- Validate with Pydantic
- Process in chunks (1000 rows)
- Handle missing columns
- Log processing stats
- Return summary

Generate processor code and mapping config.
```

### **Optimize Pandas Operations**
```
Optimize Pandas operations:

Code: [Attached file]

Check for:
- Iterrows/apply that could be vectorized
- Chained assignments
- Memory inefficient operations
- Missing dtype specifications
- Unnecessary copies

Suggest optimizations with benchmarks.
```

### **Add Data Validation**
```
Add data validation for CSV import:

Data type: [Product/Order/Customer]

Validation rules:
- Required fields: [List]
- Format checks: [List]
- Range checks: [List]
- Uniqueness: [List]

Requirements:
- Pydantic model for validation
- Batch validation
- Collect all errors (not fail-fast)
- Return validation report
- Log validation failures

Generate validation code.
```

---

## 🌐 API Integration

### **Add WooCommerce Client**
```
Create WooCommerce API client for [OPERATION]:

Operation: [Create product / Update order / etc.]
Endpoint: [WooCommerce REST API endpoint]

Requirements:
- Use httpx (async)
- Authentication (consumer key/secret)
- Retry logic (3 attempts, exponential backoff)
- Rate limiting respect
- Error handling
- Structured logging
- Response validation (Pydantic)
- Timeout: 30s

Generate client code.
```

### **Add External API Client**
```
Integrate external API:

API: [API name]
Endpoint: [URL]
Authentication: [Type]
Purpose: [What data to fetch/send]

Requirements:
- Async implementation (httpx)
- Retry logic with exponential backoff
- Timeout handling (30s)
- Response caching (if applicable)
- Error handling and logging
- Pydantic response models
- Rate limiting
- API key from environment

Generate complete API client.
```

### **Add Webhook Handler**
```
Create webhook handler:

Source: [Service name]
Event: [Event type]
Payload: [Expected structure]

Requirements:
- Verify webhook signature
- Parse and validate payload (Pydantic)
- Process asynchronously (Celery task)
- Return 200 immediately
- Log all webhooks
- Handle duplicate events (idempotency)
- Error responses

Generate webhook endpoint and handler.
```

---

## 📊 Database & Caching

### **Add Redis Caching**
```
Add caching for [OPERATION]:

Data: [What to cache]
TTL: [Cache lifetime]
Invalidation: [When to clear cache]

Requirements:
- Use Redis
- Set appropriate TTL
- Handle cache misses
- Implement cache warming (if needed)
- Add cache invalidation logic
- Log cache hits/misses

Generate caching implementation.
```

### **Optimize Database Queries**
```
Optimize database queries:

Context: [Operation description]
Current queries: [Number]

Check for:
- N+1 query problems
- Missing eager loading
- Unnecessary queries
- Inefficient filters

Requirements:
- Reduce query count
- Add indexes where needed
- Use select_related/prefetch_related
- Benchmark improvements

Show optimized queries.
```

---

## 🔐 Security

### **Add API Key Auth**
```
Implement API key authentication:

Requirements:
- API key in Authorization header
- Use secrets.compare_digest for comparison
- Key stored in environment variable
- Rate limiting per key
- Log authentication failures
- Return 401 for invalid keys

Generate auth dependency for FastAPI.
```

### **Add Input Validation**
```
Add comprehensive input validation:

Endpoint: [Endpoint path]

Validate:
- All user inputs
- File uploads (type, size, content)
- URL parameters
- Request headers
- Request body

Requirements:
- Pydantic models
- Custom validators
- Clear error messages
- Reject early
- Log validation failures

Generate validation models and validators.
```

---

## 🧪 Testing

### **Add Pytest Tests**
```
Create pytest tests for:

Function/Endpoint: [Name]

Test coverage needed:
1. Happy path
2. Edge cases:
   - Empty inputs
   - Null values
   - Boundary conditions
3. Error conditions:
   - Invalid inputs
   - External service failures
   - Database errors

Requirements:
- Use fixtures for test data
- Mock external dependencies
- Async tests for async code
- Parametrize similar tests
- 80%+ coverage

Generate complete test suite.
```

### **Add Integration Tests**
```
Create integration test:

Scenario: [End-to-end flow]

Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Requirements:
- Test with real services (TestContainers)
- Setup/teardown fixtures
- Test database in transaction
- Mock external APIs
- Verify final state

Generate integration test code.
```

---

## 📝 Logging & Monitoring

### **Add Structured Logging**
```
Add logging to:

File: [Filename]
Operations: [What to log]

Requirements:
- Use structlog
- Log levels: INFO (operations), ERROR (failures), EXCEPTION (with traceback)
- Include context: task_id, user_id, product_id, etc.
- Correlation IDs for request tracking
- Performance metrics (duration_ms)
- No sensitive data (passwords, API keys)

Show where and what to log.
```

### **Add Performance Monitoring**
```
Add performance monitoring:

Monitor:
- Endpoint response times
- Celery task durations
- Database query times
- External API call times

Requirements:
- Use decorators for timing
- Log performance metrics
- Alert on slow operations
- Track over time

Generate monitoring code.
```

---

## 🔧 Configuration

### **Add Config Management**
```
Add configuration for [FEATURE]:

Config items:
- [setting1]: [type] - [default] - [description]
- [setting2]: [type] - [default] - [description]

Requirements:
- Environment variables
- Config file (JSON/YAML)
- Validation (Pydantic)
- Default values
- Hot reload (if applicable)
- Documentation

Generate config management code.
```

### **Environment Setup**
```
Set up development environment:

Requirements:
- Docker Compose for services
- .env file template
- Virtual environment setup
- Dependencies installation
- Database migrations
- Test data seeding
- README instructions

Generate setup files and documentation.
```
