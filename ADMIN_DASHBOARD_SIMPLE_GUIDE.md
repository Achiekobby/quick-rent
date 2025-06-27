# Admin Dashboard API - Quick Implementation Guide

## Endpoint Required
```
GET /api/admin/dashboard
```

## JSON Response Structure Needed
```json
{
  "status_code": "000",
  "message": "Action Successful",
  "in_error": false,
  "reason": "Stats Retrieved Successfully",
  "data": {
    "stats": {
      "totalUsers": 2847,
      "totalLandlords": 1256,
      "totalRenters": 1591,
      "totalProperties": 1834,
      "verifiedProperties": 1542,
      "pendingProperties": 292,
      "activeListings": 1687,
      "newUsersToday": 15,
      "propertiesListedToday": 8
    },
    "propertyCategories": [
      {
        "category": "Single Room",
        "count": 847,
        "percentage": 46.2
      }
    ],
    "regionStats": [
      {
        "region": "Greater Accra",
        "properties": 847,
        "percentage": 46.2
      }
    ]
  },
  "point_in_time": "2025-06-26T15:34:37.271883Z"
}
```

## What Each Field Means

### Stats Object
- **totalUsers**: Count of all active users (landlords + renters)
- **totalLandlords**: Count of active landlords
- **totalRenters**: Count of active renters
- **totalProperties**: Count of all properties
- **verifiedProperties**: Count of approved/verified properties
- **pendingProperties**: Count of properties awaiting approval
- **activeListings**: Count of properties currently listed
- **newUsersToday**: Count of users registered today
- **propertiesListedToday**: Count of properties added today


### Property Categories
- Group properties by category and calculate percentages
- Percentage = `(category_count / total_properties) * 100`

### Region Stats
- Group properties by region and calculate percentages
