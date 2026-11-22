import { index, route, type RouteConfig } from '@react-router/dev/routes';

// One module per page so pages can be built independently. Keep in step with `paths.ts`.
export default [
  index('routes/home.tsx'),
  route('projects', 'routes/projects.tsx'),
  route('projects/pas', 'routes/project-pas.tsx'),
  route('projects/pas/atti', 'routes/project-pas-atti.tsx'),
  route('projects/pas/lifebox', 'routes/project-pas-lifebox.tsx'),
  route('projects/personal-brain', 'routes/project-personal-brain.tsx'),
  route('projects/ai-system', 'routes/project-ai-system.tsx'),
  route('projects/duo-decide', 'routes/project-duo-decide.tsx'),
  route('projects/thread-quest', 'routes/project-thread-quest.tsx'),
  route('work/titan-intake', 'routes/work-titan-intake.tsx'),
  route('about', 'routes/about.tsx'),
  route('beyond', 'routes/beyond.tsx'),
  route('contact', 'routes/contact.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
