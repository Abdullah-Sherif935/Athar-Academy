import { Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { SearchBar } from '../../../components/shared';
import { Card, EmptyState } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { InstructorConversationListItem } from '../components/InstructorConversationListItem';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorMessagesPage() {
  const { t, locale } = useI18n();
  const { conversations, getStudentById, getAssignedCourse } = useInstructorDemo();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      const stu = getStudentById(conv.studentId);
      const course = getAssignedCourse(conv.courseSlug);
      return (
        stu?.fullName[locale].toLowerCase().includes(q) ||
        course?.title[locale].toLowerCase().includes(q) ||
        stu?.fullName.en.toLowerCase().includes(q)
      );
    });
  }, [conversations, getAssignedCourse, getStudentById, locale, query]);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.messages.title')}
        subtitle={t('instructor.messages.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.messages') },
        ]}
      />

      <div className="messages-layout">
        <div className="details-stack" style={{ gap: 12 }}>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t('instructor.messages.searchPlaceholder')}
          />
          {filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((conv) => (
                <InstructorConversationListItem key={conv.id} conversation={conv} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-small">{t('student.messages.emptySearch')}</p>
            </Card>
          )}
        </div>

        <EmptyState
          icon={<Mail size={24} />}
          title={t('instructor.messages.title')}
          description={t('instructor.messages.selectPrompt')}
        />
      </div>
    </div>
  );
}
