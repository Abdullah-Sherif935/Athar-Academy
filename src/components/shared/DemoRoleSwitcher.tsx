import { BookOpen, Globe, GraduationCap, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../app/providers/PlatformDemoContext';
import { useInstructorDemo } from '../../features/instructor/context/InstructorDemoContext';
import { useStudentDemo } from '../../features/student/context/StudentDemoContext';

export function DemoRoleSwitcher() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { enterDemoMode: enterStudent } = useStudentDemo();
  const { enterDemoMode: enterInstructor } = useInstructorDemo();
  const { enterAdminDemo } = usePlatformDemo();

  // Strictly development-only helper; never rendered in production builds
  if (!import.meta.env.DEV) {
    return null;
  }

  const active = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/instructor')
      ? 'instructor'
      : pathname.startsWith('/student')
        ? 'student'
        : 'public';

  return (
    <aside className="demo-role-switcher" aria-label={t('admin.roleSwitcher.label')}>
      <span className="demo-role-switcher__title">{t('admin.roleSwitcher.label')}</span>
      <div className="demo-role-switcher__btns">
        <button
          type="button"
          className={`demo-role-switcher__btn ${active === 'public' ? 'demo-role-switcher__btn--active' : ''}`}
          onClick={() => navigate('/')}
        >
          <Globe size={13} aria-hidden="true" />
          <span>{t('admin.roleSwitcher.public')}</span>
        </button>
        <button
          type="button"
          className={`demo-role-switcher__btn ${active === 'student' ? 'demo-role-switcher__btn--active' : ''}`}
          onClick={() => {
            enterStudent();
            navigate('/student');
          }}
        >
          <GraduationCap size={13} aria-hidden="true" />
          <span>{t('admin.roleSwitcher.student')}</span>
        </button>
        <button
          type="button"
          className={`demo-role-switcher__btn ${active === 'instructor' ? 'demo-role-switcher__btn--active' : ''}`}
          onClick={() => {
            enterInstructor();
            navigate('/instructor');
          }}
        >
          <BookOpen size={13} aria-hidden="true" />
          <span>{t('admin.roleSwitcher.instructor')}</span>
        </button>
        <button
          type="button"
          className={`demo-role-switcher__btn ${active === 'admin' ? 'demo-role-switcher__btn--active' : ''}`}
          onClick={() => {
            enterAdminDemo();
            navigate('/admin');
          }}
        >
          <Shield size={13} aria-hidden="true" />
          <span>{t('admin.roleSwitcher.admin')}</span>
        </button>
      </div>
    </aside>
  );
}
