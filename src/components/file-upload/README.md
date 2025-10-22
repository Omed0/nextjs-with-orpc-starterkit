# File Upload Components

A complete file upload and management system with MinIO S3 integration.

## Components

### FileManager
The main container component that orchestrates the entire file management system.

**Location:** `src/components/file-upload/file-manager.tsx`

**Features:**
- Fetches files from the database
- Handles data refetching after upload/delete operations
- Displays loading state
- Coordinates between upload form and file list

**Usage:**
```tsx
import { FileManager } from "@/components/file-upload"

export default function Page() {
  return <FileManager />
}
```

---

### UploadForm
A card-based form for uploading files to MinIO S3 storage.

**Location:** `src/components/file-upload/upload-form.tsx`

**Features:**
- Multiple file upload support
- File size validation
- Presigned URL generation for secure uploads
- Loading states with proper feedback
- Form reset after successful upload
- Toast notifications for success/error states

**Props:**
```tsx
interface UploadFormProps {
  onUploadSuccess: () => void
}
```

**Usage:**
```tsx
<UploadForm onUploadSuccess={() => refetch()} />
```

---

### FileList
Displays a list of uploaded files with empty state handling.

**Location:** `src/components/file-upload/file-list.tsx`

**Features:**
- Empty state with proper messaging
- Scrollable list for many files
- File count display
- Responsive design

**Props:**
```tsx
interface FileListProps {
  files: File[]
  onFileDeleted: () => void
}
```

**Usage:**
```tsx
<FileList 
  files={files} 
  onFileDeleted={() => refetch()} 
/>
```

---

### FileItem
Individual file item component with download and delete actions.

**Location:** `src/components/file-upload/file-item.tsx`

**Features:**
- File name display (truncated)
- File size formatting
- Download button with icon
- Delete button with confirmation
- Loading overlay during delete operation
- Hover effects for better UX
- Error handling with toast notifications

**Props:**
```tsx
interface FileItemProps {
  file: File
  onFileDeleted: () => void
}
```

**Usage:**
```tsx
<FileItem 
  file={file} 
  onFileDeleted={() => refetch()} 
/>
```

---

## Architecture

```
src/components/file-upload/
├── index.ts              # Barrel export file
├── file-manager.tsx      # Main container component
├── upload-form.tsx       # Upload form with validation
├── file-list.tsx         # List container with empty state
└── file-item.tsx         # Individual file item with actions
```

## Dependencies

- **@tanstack/react-query** - Data fetching and caching
- **oRPC** - Type-safe API calls
- **MinIO S3** - File storage backend
- **Prisma** - Database ORM
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## Features

### Upload System
1. User selects files via form input
2. Files are validated on client side
3. Presigned URLs are requested from server
4. Files are uploaded directly to MinIO S3
5. File metadata is saved to PostgreSQL via Prisma
6. UI updates automatically via React Query

### Download System
1. User clicks download button
2. Presigned download URL is generated
3. File is downloaded from MinIO S3
4. Toast notification confirms download

### Delete System
1. User clicks delete button
2. Delete mutation is triggered
3. File is removed from MinIO S3
4. Database record is deleted
5. UI updates automatically
6. Loading overlay prevents duplicate actions

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui component primitives
- Consistent spacing and colors
- Responsive design patterns
- Hover and focus states
- Loading and disabled states

## Error Handling

- Form validation errors
- Network request errors
- File size limit errors
- Upload failure handling
- Delete failure handling
- User-friendly error messages via toast

## Future Enhancements

Potential improvements:
- [ ] Drag and drop upload
- [ ] Upload progress indicators
- [ ] Bulk file operations
- [ ] File preview/thumbnail
- [ ] Search and filter functionality
- [ ] Sorting options (name, size, date)
- [ ] Pagination for large file lists
- [ ] File categories/folders
