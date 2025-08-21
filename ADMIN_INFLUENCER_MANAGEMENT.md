# Admin Influencer Management System

## Overview

The Admin Influencer Management System provides comprehensive control over influencers in the USSD AutoPay platform. Admins can create, manage, and monitor influencers with full CRUD operations and status management.

## Features

### 🎯 **Core Management Functions**
- **Create Influencers**: Add new influencers with required information
- **Edit Influencers**: Modify existing influencer details
- **Delete Influencers**: Remove influencers from the system
- **View All Influencers**: Comprehensive list with search and filtering

### 📱 **Shortcode Management**
- **Assign USSD Shortcodes**: Unique shortcode assignment for each influencer
- **Shortcode Validation**: Prevents duplicate shortcode assignments
- **Shortcode Reference**: Admin view of all assigned shortcodes

### 🔄 **Status Management**
- **Active**: Normal operation, can receive payments
- **Suspended**: Temporarily disabled, cannot receive payments
- **Terminated**: Permanently disabled, cannot be reactivated

### 🔍 **Advanced Features**
- **Search & Filter**: Find influencers by name, phone, or shortcode
- **Status Filtering**: View influencers by current status
- **Real-time Updates**: Immediate status changes and data updates
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

### Backend Routes

#### GET `/api/influencers`
- **Description**: List all influencers
- **Response**: Array of influencer objects with full details

#### GET `/api/influencers/<id>`
- **Description**: Get specific influencer by ID
- **Response**: Single influencer object

#### POST `/api/influencers`
- **Description**: Create new influencer
- **Required Fields**: `name`, `ussd_shortcode`
- **Optional Fields**: `phone`, `imageUrl`
- **Response**: Created influencer object

#### PUT `/api/influencers/<id>`
- **Description**: Update existing influencer
- **Fields**: Any combination of influencer fields
- **Response**: Updated influencer object

#### DELETE `/api/influencers/<id>`
- **Description**: Delete influencer
- **Response**: Success message

#### POST `/api/influencers/<id>/suspend`
- **Description**: Suspend influencer
- **Response**: Success message

#### POST `/api/influencers/<id>/activate`
- **Description**: Activate suspended influencer
- **Response**: Success message

#### POST `/api/influencers/<id>/terminate`
- **Description**: Permanently terminate influencer
- **Response**: Success message

#### GET `/api/influencers/shortcodes`
- **Description**: Get all shortcodes for admin reference
- **Response**: Array of shortcode objects

## Database Schema

### Influencer Model
```python
class Influencer(db.Model):
    __tablename__ = "influencers"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    phone = db.Column(db.String(20), nullable=True, index=True)
    name = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(512), nullable=True)
    ussd_shortcode = db.Column(db.String(32), nullable=True, unique=True, index=True)
    received = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(20), nullable=False, default="active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### Status Enum
```python
class InfluencerStatus(Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"
```

## Frontend Components

### AdminInfluencerManagement.tsx
- **Location**: `src/pages/AdminInfluencerManagement.tsx`
- **Features**: Full CRUD interface, status management, search/filter
- **Styling**: `src/pages/AdminInfluencerManagement.css`

### Navigation
- **Admin Dashboard**: Links to User Management and Influencer Management
- **Route**: `/admin/influencers`
- **Access**: Admin users only

## Usage Instructions

### For Admins

1. **Access the System**
   - Login as admin user
   - Navigate to Admin Dashboard
   - Click "🎯 Influencer Management"

2. **Create New Influencer**
   - Click "+ Add New Influencer"
   - Fill required fields (Name, USSD Shortcode)
   - Add optional fields (Phone, Image URL)
   - Click "Create"

3. **Manage Existing Influencers**
   - **Edit**: Click ✏️ button to modify details
   - **Suspend**: Click ⏸️ to temporarily disable
   - **Activate**: Click ▶️ to re-enable suspended influencer
   - **Terminate**: Click 🚫 to permanently disable
   - **Delete**: Click 🗑️ to remove from system

4. **Search and Filter**
   - Use search box to find by name, phone, or shortcode
   - Use status filter to view specific statuses
   - Results update in real-time

### For Developers

1. **Run Migration**
   ```bash
   cd server
   python migrations/add_influencer_status.py
   ```

2. **Test API Endpoints**
   - Use Postman or similar tool
   - Test all CRUD operations
   - Verify status management functions

3. **Frontend Development**
   - Component is fully responsive
   - Uses existing API infrastructure
   - Follows established design patterns

## Security Features

- **Admin-only Access**: Protected routes require admin user type
- **Input Validation**: Server-side validation of all inputs
- **Shortcode Uniqueness**: Prevents duplicate shortcode assignments
- **Status Validation**: Only valid status values accepted

## Error Handling

- **Duplicate Shortcodes**: Clear error message when shortcode exists
- **Required Fields**: Validation for mandatory information
- **Network Errors**: User-friendly error messages
- **Status Conflicts**: Proper handling of invalid status transitions

## Future Enhancements

- **Bulk Operations**: Select multiple influencers for batch actions
- **Audit Logging**: Track all status changes and modifications
- **Shortcode Templates**: Predefined shortcode patterns
- **Advanced Analytics**: Revenue tracking and performance metrics
- **Export Functionality**: Download influencer data as CSV/Excel

## Troubleshooting

### Common Issues

1. **Migration Errors**
   - Ensure database connection is working
   - Check if tables exist before migration
   - Verify model imports are correct

2. **Frontend Not Loading**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Ensure admin user is authenticated

3. **Status Not Updating**
   - Check API response for errors
   - Verify database updates are successful
   - Clear browser cache if needed

### Support

For technical support or feature requests, contact the development team or create an issue in the project repository.
