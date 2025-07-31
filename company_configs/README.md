# Company Configurations Directory

⚠️ **IMPORTANT: This directory contains sensitive personal data and should NEVER be committed to git!**

## What Goes Here

This directory stores company-specific configuration files that contain:

- **Employee personal information** (names, email addresses)
- **Company-specific settings** (crop areas, processing parameters)
- **Business-sensitive data** (organizational structure)

## File Structure

```
company_configs/
├── {company-id}.json       # Company configuration files
├── config.json            # Main/default company config
└── README.md              # This file (safe to commit)
```

## Example Configuration File

Each company configuration file contains:

```json
{
  "company_id": "example-company",
  "company_name": "Example Company Ltd",
  "name_crop_area": {
    "x": 100,
    "y": 200, 
    "width": 300,
    "height": 80
  },
  "employee_emails": {
    "John Doe": "john@company.com",
    "Jane Smith": "jane@company.com"
  },
  "created_at": "2025-01-01T00:00:00.000000",
  "updated_at": null
}
```

## Security Notes

- ✅ **This README.md is safe to commit** (contains no personal data)
- ❌ **All .json files in this directory are excluded from git**
- ❌ **Never commit employee names or email addresses**
- ❌ **Company-specific data should remain private**

## Deployment

In production:
- This directory is created automatically by the application
- Data persists via Docker volumes or platform storage
- Backup this directory separately from your code repository
- Use secure file transfer methods for data migration

## Privacy Compliance

This data may be subject to privacy regulations (GDPR, CCPA, etc.):
- Ensure proper consent for email processing
- Implement data retention policies  
- Provide mechanisms for data deletion
- Maintain audit logs for data access