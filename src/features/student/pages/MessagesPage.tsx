import { Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { SearchBar } from '../../../components/shared';
import { Card, EmptyState } from '../../../components/ui';
import { getCourseBySlug, getInstructorBySlug } from '../../../data/mock';
import { ConversationListItem } from '../components/ConversationListItem';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function MessagesPage() {
  const { t, locale } = useI18n();
  const { conversations } = useStudentDemo();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      const inst = getInstructorBySlug(conv.instructorSlug);
      const course = getCourseBySlug(conv.courseSlug);
      return (
        inst?.name[locale].toLowerCase().includes(q) ||
        course?.title[locale].toLowerCase().includes(q) ||
        inst?.name.en.toLowerCase().includes(q) ||
        course?.title.en.toLowerCase().includes(q)
      );
    });
  }, [conversations, query, locale]);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.messages.title')}
        subtitle={t('student.messages.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.messages') },
        ]}
      />

      <div className="messages-layout">
        <div className="details-stack" style={{ gap: 12 }}>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t('student.messages.searchPlaceholder')}
          />

          {filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((conv) => (
                <ConversationListItem key={conv.id} conversation={conv} />
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
          title={t('student.messages.title')}
          description={t('student.messages.selectPrompt')}
        />
      </div>
    </div>
  );
}
