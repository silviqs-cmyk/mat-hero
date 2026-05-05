# MatHero Admin CMS

## Goal
The admin CMS manages real course content while preserving the same dark neon MatHero product language.

## Content Ownership
- Courses define the top-level learning product.
- Days define the 10-day pacing layer.
- Lessons store theory, video links, and long-form lesson content.
- Lesson sections structure theory, examples, formulas, warnings, and tips.
- Questions and options power both practice and quiz flows.

## Planned Admin Areas
- `/admin`
- `/admin/courses`
- `/admin/courses/new`
- `/admin/courses/[courseId]/edit`
- `/admin/courses/[courseId]/days`
- `/admin/days/[dayId]/edit`
- `/admin/lessons/[lessonId]/edit`
- `/admin/questions`
- `/admin/questions/new`
- `/admin/questions/[questionId]/edit`
- `/admin/users`
- `/admin/results`
- `/admin/preview/course/[courseId]/day/[dayNumber]`

## Current Foundation
- Shared admin-safe services exist in `src/services/admin.ts`
- Shared Supabase access lives in `src/lib/supabase/*`
- Existing neon UI primitives remain the base visual system

## Next Implementation Chunks
- replace demo-only admin graph with schema-backed forms
- add create/edit/delete flows with validation
- add admin-only route protection
- wire preview routes to the same student components
