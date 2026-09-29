# Phase 5 — Documentation / Knowledge Management

Based on everything completed so far, **Phase 5 is the Documentation / Knowledge Management phase of the Internal Management System.**

The main objective of this phase was to give the system a centralized place to **create, organize, associate, and view documentation** across the Internal Management System.

---

# Phase 5 — What We Built

## 1. Documentation Data Model ✅

Added a `Document` model in Prisma.

The model supports:

* Title
* Type
* Content
* External URL
* Source type
* Manual / AI-generated source
* Sprint association
* Tags
* Timestamps

Conceptually:

```text
Document
├── id
├── title
├── type
├── content
├── url
├── sourceType
├── source (MANUAL / AI_GENERATED)
├── sprint
├── tags
├── createdAt
└── updatedAt
```

This provides the foundation for centralized knowledge management.

> **Groundwork only:** `SprintFunction` and `DocumentFunctionRelation` models exist in the schema (migration `add_sprint_functions`) so documents can later be linked to sprint functions. `SprintFunction` records are created when a sprint is saved, but no API or UI uses `DocumentFunctionRelation` yet.

---

## 2. Document Tagging ✅

Added document-tag relationships.

A document can have **multiple tags**.

For example:

```text
Document
│
├── Title: Sprint Planning Guide
│
├── Tags
│   ├── Sprint Planning
│   ├── Scrum
│   └── Process
│
└── Sprint
    └── Sprint 16
```

This creates the foundation for future document organization and filtering.

---

## 3. Create Document API ✅

Added:

```text
POST /api/documents
```

and:

```text
GET /api/documents
```

The APIs support:

* Manual documentation
* External links
* Sprint association
* Tags

> `POST /api/documents` accepts `multipart/form-data` (fields: `title`, `type`, `sourceType`, `content` or `url`, `sprintId`, and `tagNames` as a comma-separated string). `GET /api/documents` accepts an optional `?sprintId=` filter.

This allows documentation to be created and retrieved through the backend.

---

## 4. Sprint-Level Documentation ✅

Added a **Documentation** section inside the Sprint Detail page.

The section displays documents associated with that specific sprint.

Documents show:

* Document type
* Content or external link
* Tags

Conceptually:

```text
Sprint
│
├── Tasks
├── Progress
├── Team
│
└── Documentation
    ├── Sprint Notes
    ├── Requirements
    └── External References
```

We also added **Add Document** functionality directly from the sprint.

This allows users to create documentation while working within a specific sprint.

---

## 5. Central Documentation Page ✅

Created:

```text
/documentation
```

This serves as the **central documentation and knowledge management page** for the Internal Management System.

It displays documentation across the entire system.

Documents can be:

```text
Sprint Documentation
        or
General Documentation
```

So documentation is no longer limited to individual sprint pages.

---

## 6. Add Document Modal ✅

Added an **Add Document** modal for creating documentation.

The modal supports fields for:

* Title
* Document type
* Source type
* Content / URL
* Tags
* Sprint

The user can therefore create documentation from a single interface.

---

## 7. Document Source Types ✅

The current source options include:

```text
DOCUMENT
LINK
UPLOAD
```

These allow the system to distinguish between different documentation sources.

> **Implementation note:** the database enum `DocumentSourceType` only contains `DOCUMENT` and `LINK`. `UPLOAD` exists only at the UI / API-request level, where the API rejects it with `501` (see section 10), so no `UPLOAD` document is ever stored.

### DOCUMENT

Used for manually created documentation/content.

### LINK

Used for external documentation or references.

### UPLOAD

Provides the groundwork for future file-upload functionality.

---

## 8. Sprint Association ✅

The Central Documentation page allows users to select a sprint while creating a document.

A document can therefore be associated with:

```text
Specific Sprint
```

or:

```text
General Documentation
```

Existing documents display their sprint association:

```text
Sprint: Sprint Name
```

This makes it possible to understand the context in which documentation was created.

---

## 9. General Documentation ✅

Documents don't have to belong to a sprint.

The system supports documentation that is relevant across the entire Internal Management System.

For example:

```text
General Documentation
├── Development Guidelines
├── Team Processes
├── Architecture Notes
├── Coding Standards
└── Internal References
```

This separates **system-wide knowledge** from **sprint-specific knowledge**.

---

## 10. Upload Flow Groundwork ⏳

The UI already supports selecting a file.

The backend also detects:

```text
UPLOAD
```

However, actual file processing has not been implemented yet.

Currently, upload requests return:

```text
501 Not Implemented
```

So the upload architecture has been prepared, but the actual storage and processing pipeline is deferred.

---

# Current Phase 5 Status

| **Feature**                | **Status** |
| -------------------------- | ---------- |
| Document database model    | ✅ Done     |
| Tags                       | ✅ Done     |
| Create Document API        | ✅ Done     |
| Get Documents API          | ✅ Done     |
| Sprint documentation       | ✅ Done     |
| Central documentation page | ✅ Done     |
| General documentation      | ✅ Done     |
| Sprint association         | ✅ Done     |
| Document display           | ✅ Done     |
| Manual document creation   | ✅ Done     |
| External links             | ✅ Done     |
| File upload/storage        | ⏳ Deferred |
| Document extraction        | ⏳ Deferred |
| Search / tag filtering (only a `?sprintId=` filter exists) | ⏳ Deferred |

---

# Phase 5 Architecture

The documentation system now looks roughly like:

```text
                 INTERNAL MANAGEMENT SYSTEM
                           │
                           ▼
                    Documentation
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       General Documents         Sprint Documents
              │                         │
              └────────────┬────────────┘
                           ▼
                       Documents
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
            Tags        Content       Links
                           │
                           ▼
                      PostgreSQL
```

The system also has the foundation for:

```text
                    File Upload
                        │
                        ▼
                   File Storage
                        │
                        ▼
                 Document Extraction
                        │
                        ▼
                  Search / Retrieval
```

Those advanced capabilities have **not yet been implemented**.

---

# What Phase 5 Achieved

Phase 5 transformed the Internal Management System from a system focused primarily on **sprints, tasks, execution, and team assignment** into a system that can also **store and organize organizational knowledge**.

The current documentation workflow is:

```text
Create Document
      ↓
Add Content / Link
      ↓
Add Tags
      ↓
Optionally Associate Sprint
      ↓
Save to PostgreSQL
      ↓
View in Documentation
      ↓
View from Associated Sprint
```

The system now supports both:

```text
Sprint-specific Knowledge
```

and:

```text
General Organizational Knowledge
```

---

# What Remains for Advanced Documentation

The main implementation of Phase 5 is complete for:

* Manual documents
* External links
* Tags
* Sprint documentation
* General documentation

The remaining work is primarily advanced document-processing functionality:

```text
File Upload
     ↓
File Storage
     ↓
Document Extraction
     ↓
Search / Filtering
     ↓
Knowledge Retrieval
```

These features can be built later without changing the core documentation foundation.

---

## Phase 5 Status

**Phase 5 — Documentation / Knowledge Management: ✅ MAIN IMPLEMENTATION COMPLETE**

The remaining items are **deferred advanced features**, not blockers for the core documentation system.
