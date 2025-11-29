# B2B Shop Gerer - Prompts Directory

This directory contains reusable AI prompts for common development tasks. Copy and paste these prompts to accelerate development with AI assistants.

## 📁 Prompt Categories

### 🐛 **debug.md** - Debugging & Troubleshooting
Quick prompts for finding and analyzing bugs, errors, and issues.

**Use when:**
- Encountering errors
- Code not working as expected
- Performance issues
- Security concerns

**Key prompts:**
- Quick Error Analysis
- Root Cause Analysis
- Check Error Handling
- Check Security Patterns
- Performance Analysis

---

### 🔍 **analyze.md** - Code Analysis & Review
Comprehensive analysis prompts for code quality, architecture, and compliance.

**Use when:**
- Code review needed
- Checking code quality
- Architecture decisions
- Comparing implementations
- Security audits

**Key prompts:**
- Full Code Review
- Quick Health Check
- Compare with Reference
- Find Code Smells
- Security Audit
- Performance Profile

---

### ✨ **implement.md** - Implementation & Features
Prompts for creating new features, endpoints, and components.

**Use when:**
- Adding new features
- Creating API endpoints
- Building plugins
- Integrating APIs
- Adding tests

**Key prompts:**
- Add New Feature
- Add API Endpoint
- Create New Plugin
- Integrate Third-Party API
- Add CSV Processor
- Generate Documentation

---

### 🔧 **fix.md** - Fixes & Repairs
Targeted prompts for fixing specific types of issues.

**Use when:**
- Fixing errors
- Resolving bugs
- Patching security issues
- Optimizing performance
- Updating compatibility

**Key prompts:**
- Fix Error
- Fix Logic Bug
- Fix Security Vulnerability
- Fix Performance Issue
- Fix HPOS Incompatibility
- Fix Deprecated Function

---

### 🔌 **plugin-specific.md** - WordPress Plugin Development
WordPress and WooCommerce specific prompts.

**Use when:**
- Developing WordPress plugins
- WooCommerce integration
- Custom fields and meta
- Frontend customization
- Plugin testing

**Key prompts:**
- Check Plugin Structure
- Add Plugin Settings Page
- Check WooCommerce Compatibility
- Add Custom Product Field
- Check HPOS Migration
- Test Plugin Activation

---

### 🚀 **backend-specific.md** - Python/FastAPI Backend
Python backend and FastAPI specific prompts.

**Use when:**
- FastAPI development
- Celery tasks
- Data processing
- API integration
- Async operations

**Key prompts:**
- Check FastAPI Endpoint
- Add Celery Task
- Add CSV Processor
- Add WooCommerce Client
- Convert to Async
- Add Pytest Tests

---

## 🎯 How to Use These Prompts

### **1. Basic Usage**
1. Find the relevant prompt file
2. Copy the prompt text
3. Fill in placeholders with your specific details
4. Paste into AI chat
5. Attach relevant files

### **2. Customize for Your Context**
Replace placeholders:
- `[FEATURE NAME]` → Your feature name
- `[PASTE ERROR MESSAGE]` → Actual error
- `[Filename]` → Your file path
- `[Description]` → Your specific details

### **3. Combine Prompts**
Mix prompts for complex tasks:
```
First, [Quick Health Check from debug.md]

Then, [Add API Endpoint from implement.md]

Finally, [Generate Missing Tests from debug.md]
```

### **4. Attach Relevant Files**
Always attach:
- The file(s) you're working on
- Related test files
- Configuration files (if needed)
- Reference implementations (if comparing)

---

## 📊 Prompt Templates

### **Template Structure**
```
[ACTION] [SUBJECT]:

[Context/Requirements section]

Requirements:
- [Requirement 1]
- [Requirement 2]

[Expected output format]
```

### **Good Prompt Practices**

✅ **Do:**
- Be specific about requirements
- Provide context (file paths, error messages)
- Specify output format needed
- Reference project standards
- Attach relevant files

❌ **Don't:**
- Be vague ("fix my code")
- Skip context
- Ask multiple unrelated things
- Ignore project patterns

---

## 🔗 Quick Reference

### **Common Workflows**

#### **New Feature Development**
1. `implement.md` → Add New Feature
2. `debug.md` → Check Security Patterns
3. `implement.md` → Generate Missing Tests
4. `analyze.md` → Quick Health Check

#### **Bug Fixing**
1. `debug.md` → Quick Error Analysis
2. `fix.md` → Fix Error
3. `implement.md` → Add Integration Test
4. `analyze.md` → Find Code Smells

#### **Code Review**
1. `analyze.md` → Full Code Review
2. `debug.md` → Check Error Handling
3. `debug.md` → Check Security Patterns
4. `analyze.md` → Documentation Coverage

#### **Plugin Development**
1. `plugin-specific.md` → Check Plugin Structure
2. `plugin-specific.md` → Check WooCommerce Compatibility
3. `debug.md` → Check Security Patterns
4. `plugin-specific.md` → Test Plugin Activation

#### **Backend Development**
1. `backend-specific.md` → Check FastAPI Endpoint
2. `backend-specific.md` → Add Pydantic Model
3. `debug.md` → Check Error Handling
4. `backend-specific.md` → Add Pytest Tests

---

## 🛠️ Prompt Maintenance

### **When to Add New Prompts**
- New common task identified
- Repeated AI conversations for same topic
- New pattern or standard adopted
- New tool/library integrated

### **How to Add Prompts**
1. Identify the category (debug, implement, fix, etc.)
2. Create clear prompt with:
   - Action verb (Check, Add, Fix, Analyze)
   - Specific requirements
   - Expected output format
   - Reference to project standards
3. Test prompt with AI
4. Add to appropriate file
5. Update this README if new category

### **Prompt Quality Checklist**
- [ ] Clear and specific
- [ ] Includes all necessary context
- [ ] References project standards
- [ ] Specifies output format
- [ ] Has practical example (if complex)
- [ ] Tested with AI assistant

---

## 📚 Related Documentation

- [General Instructions](../.github/copilot-instructions.md)
- [Backend Instructions](../.github/instructions/backend.instructions.md)
- [WordPress Instructions](../.github/instructions/wordpress-plugins.instructions.md)
- [Main README](/README.md)

---

## 💡 Tips for Effective AI Prompting

1. **Be Specific:** "Fix error in line 45" beats "fix my code"
2. **Provide Context:** Attach files, paste errors, explain expected behavior
3. **Reference Standards:** Point to instruction files
4. **Ask for Explanations:** "Explain why" helps you learn
5. **Iterate:** Start with analysis, then implementation
6. **Verify:** Always review AI output before using

---

**Last Updated:** 2025-11-12  
**Total Prompts:** 100+  
**Categories:** 6
