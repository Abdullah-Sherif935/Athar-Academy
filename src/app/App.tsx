import { AuthProvider } from './providers/AuthProvider';
import { I18nProvider } from './providers/I18nProvider';
import { PlatformDemoProvider } from './providers/PlatformDemoContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppRouter } from './router/AppRouter';
import { InstructorDemoProvider } from '../features/instructor/context/InstructorDemoContext';
import { StudentDemoProvider } from '../features/student/context/StudentDemoContext';

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <PlatformDemoProvider>
            <StudentDemoProvider>
              <InstructorDemoProvider>
                <AppRouter />
              </InstructorDemoProvider>
            </StudentDemoProvider>
          </PlatformDemoProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
