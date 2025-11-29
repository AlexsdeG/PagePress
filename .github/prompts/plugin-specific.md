# WordPress Plugin-Specific Prompts

## 🔌 Plugin Development

### **Check Plugin Structure**
```
Verify WordPress plugin structure:

Check:
- Main plugin file with header
- Proper text domain for i18n
- Uninstall.php for cleanup
- Directory structure (admin/, includes/, assets/)
- No direct file access (ABSPATH check)
- Proper script/style enqueuing
- Activation/deactivation hooks

List missing elements with code to add.
```

### **Add Plugin Settings Page**
```
Add settings page to plugin:

Location: [WooCommerce Settings / Tools / Custom menu]

Settings needed:
- [Setting 1]: [type] - [description]
- [Setting 2]: [type] - [description]

Requirements:
- Use Settings API
- Add validation callbacks
- Sanitize on save
- Add help text
- Support import/export
- Add reset to defaults

Generate complete settings code.
```

### **Add Plugin Shortcode**
```
Create shortcode for plugin:

Shortcode: [shortcode_name]
Purpose: [Description]

Attributes:
- [attr1]: [type] - [default] - [description]
- [attr2]: [type] - [default] - [description]

Requirements:
- Attribute validation
- Escaped output
- Enqueue required assets
- Add usage documentation
- Support for visual editor

Generate shortcode implementation.
```

---

## 🛒 WooCommerce Integration

### **Check WooCommerce Compatibility**
```
Verify WooCommerce compatibility:

Plugin: [Attached file]

Check:
✓ HPOS compatible (CRUD methods)
✓ Uses WC hooks/filters correctly
✓ REST API integration proper
✓ Cart/checkout integration safe
✓ Product data handled correctly
✓ Order meta HPOS-compatible
✓ Emails use WC templates

List compatibility issues with fixes.
```

### **Add Custom Product Field**
```
Add custom field to products:

Field name: [field_name]
Field type: [text/number/select/checkbox]
Location: [General/Inventory/Advanced tab]

Requirements:
- Add to product edit page
- Save to product meta
- HPOS compatible
- Display on frontend (if needed)
- Include in REST API
- Validate on save

Generate complete implementation.
```

### **Customize WooCommerce Email**
```
Customize WooCommerce email:

Email: [Order completed / Order processing / etc.]

Customizations:
- [Add custom data]
- [Change template]
- [Add attachments]

Requirements:
- Override template properly
- Maintain WC update compatibility
- Add filters for dynamic content
- Test with SMTP plugins
- Support plain text version

Generate email customization code.
```

### **Add Custom Order Status**
```
Add custom order status:

Status: [status_slug]
Label: [Status Label]
Use case: [When to use this status]

Requirements:
- Register status
- Add to order actions dropdown
- Add status icon/color
- Include in reports
- Add email notification (optional)
- Handle status transitions

Generate complete implementation.
```

---

## 🎨 Frontend Customization

### **Add Product Loop Customization**
```
Customize WooCommerce product loop:

Changes needed:
- [Add custom element]
- [Remove default element]
- [Reorder elements]

Location: [Shop page / Category / Archive]

Requirements:
- Use WC hooks (woocommerce_before_shop_loop_item, etc.)
- Maintain theme compatibility
- Responsive design
- Performance optimized
- Cache-friendly

Generate hook implementations.
```

### **Add Custom Cart Field**
```
Add custom field to cart:

Field: [field_name]
Type: [text/select/checkbox]
Purpose: [Why customer needs this]

Requirements:
- Display in cart
- Validate on checkout
- Save to order meta
- Display in order details
- Include in emails
- HPOS compatible

Generate complete implementation.
```

### **Customize Checkout Fields**
```
Customize WooCommerce checkout:

Changes:
- Add fields: [List custom fields]
- Remove fields: [List fields to remove]
- Reorder sections: [New order]

Requirements:
- Validation on submit
- Sanitization on save
- Save to order meta
- Display in admin
- Include in emails
- HPOS compatible

Generate checkout customization code.
```

---

## 📊 Data & Meta Management

### **Check HPOS Migration**
```
Prepare plugin for HPOS migration:

Scan for:
- Direct meta table queries
- get_post_meta / update_post_meta on orders
- Direct $wpdb queries on order data
- Order meta not using CRUD methods

Provide:
- List of incompatible code
- HPOS-compatible replacements
- Migration strategy
- Testing checklist

Generate migration code.
```

### **Add Custom Meta Box**
```
Add meta box to [product/order/post]:

Title: [Meta Box Title]
Context: [side/normal/advanced]
Priority: [high/default/low]

Fields:
- [field_1]: [type] - [description]
- [field_2]: [type] - [description]

Requirements:
- Nonce verification
- Save callback
- Field validation
- HPOS compatible (if order meta)
- Responsive design

Generate meta box code.
```

### **Bulk Update Products**
```
Create bulk update function:

Update: [What to change]
Condition: [Which products]

Requirements:
- Process in batches (100 products)
- Show progress bar
- Handle errors gracefully
- Log all changes
- Add undo capability
- Background processing (WP Cron)

Generate bulk update code.
```

---

## 🔍 Search & Filter

### **Add Custom Product Filter**
```
Add product filter:

Filter by: [Attribute/Custom field]
Type: [Dropdown/Checkbox/Range]
Location: [Shop sidebar/Archive]

Requirements:
- AJAX filtering
- URL parameter support
- Work with WC pagination
- Clear filters button
- Mobile responsive
- SEO-friendly

Generate filter implementation.
```

### **Enhance Product Search**
```
Enhance WooCommerce search:

Improvements:
- Search in [SKU/Attributes/Custom fields]
- Add fuzzy matching
- Weight results by relevance
- Filter by [Categories/Tags]

Requirements:
- Performant queries
- Cache results
- Maintain WC compatibility
- Admin settings for search fields

Generate search enhancement code.
```

---

## 🔐 Security & Permissions

### **Add Capability Checks**
```
Add capability checks to plugin:

Features requiring permissions:
- [Feature 1]: [Required capability]
- [Feature 2]: [Required capability]

Check for:
- AJAX actions protected with nonces
- Admin pages check capabilities
- REST endpoints have permission_callback
- Direct function calls check permissions

Generate capability check code.
```

### **Sanitize Plugin Inputs**
```
Add input sanitization:

Inputs to sanitize:
- [Input 1]: [Type] → [Sanitize function]
- [Input 2]: [Type] → [Sanitize function]

Requirements:
- Use WordPress sanitize functions
- Validate data types
- Reject invalid input
- Log sanitization failures

Show sanitization for all inputs.
```

---

## 🧪 Plugin Testing

### **Test Plugin Activation**
```
Test plugin activation/deactivation:

Test cases:
1. Fresh activation
   - Database tables created
   - Default options set
   - Required directories created

2. Reactivation
   - Existing data preserved
   - Options merged correctly

3. Deactivation
   - Temporary data cleared
   - Permanent data preserved

4. Uninstall
   - All data removed
   - Database cleaned

Generate test scenarios and verification steps.
```

### **Test WooCommerce Integration**
```
Test WooCommerce integration:

Test scenarios:
1. Product creation/update
2. Cart operations
3. Checkout process
4. Order processing
5. Order completion
6. Order refund

For each:
- Expected behavior
- Actual behavior
- Edge cases to test
- Error handling

Generate test checklist and test code.
```

---

## 📦 Plugin Distribution

### **Prepare Plugin for Release**
```
Prepare plugin for distribution:

Checklist:
- [ ] Version numbers updated (plugin file + readme)
- [ ] Changelog updated
- [ ] All TODOs resolved
- [ ] Code commented
- [ ] Translation ready (i18n)
- [ ] Assets optimized (minified JS/CSS)
- [ ] Security audit passed
- [ ] Tested on WP minimum version
- [ ] Tested with WC minimum version
- [ ] Documentation complete
- [ ] uninstall.php implemented

Generate release checklist and missing items.
```

### **Generate Plugin Documentation**
```
Generate plugin documentation:

Include:
1. Installation instructions
2. Configuration guide
3. Feature documentation
4. Shortcode reference (if applicable)
5. Hook/filter reference
6. Troubleshooting guide
7. FAQ
8. Changelog

Format: WordPress README.txt standard

Generate complete documentation.
```
