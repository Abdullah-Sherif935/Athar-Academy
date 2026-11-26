import { ArrowLeft, ArrowRight, FolderSearch, Send } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Button, Card, EmptyState } from '../../../components/ui';
import { getCourseBySlug, getInstructorBySlug } from '../../../data/mock';
import { ConversationListItem } from '../components/ConversationListItem';
import { MessageBubble } from '../components/MessageBubble';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function ConversationPage() {
  const { conversationId = '' } = useParams();
  const { t, locale, dir } = useI18n();
  const { conversations, sendMessage, markConversationRead } = useStudentDemo();
  const [draft, setDraft] = useState('');

  const conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      markConversationRead(conversation.id);
    }
  }, [conversation, markConversationRead]);

  if (!conversation) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('student.messages.emptySearch')}
        description={t('student.messages.selectPrompt')}
        action={
          <Link to="/student/messages" className="ui-btn ui-btn--primary ui-btn--md">
            {t('student.messages.backToList')}
          </Link>
        }
      />
    );
  }

  const instructor = getInstructorBySlug(conversation.instructorSlug);
  const course = getCourseBySlug(conversation.courseSlug);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    sendMessage(conversation.id, draft);
    setDraft('');
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={instructor?.name[locale] ?? t('student.messages.title')}
        subtitle={course?.title[locale]}
        breadcrumbs={[
          { label: t('student.nav.messages'), to: '/student/messages' },
          { label: instructor?.name[locale] ?? conversation.id },
        ]}
        action={
          <Link to="/student/messages" className="ui-btn ui-btn--secondary ui-btn--sm">
            {dir === 'rtl' ? <ArrowRight size={15} aria-hidden="true" /> : <ArrowLeft size={15} aria-hidden="true" />}{' '}
            {t('student.messages.backToList')}
          </Link>
        }
      />

      <div className="messages-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {conversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === conversation.id}
            />
          ))}
        </div>

        <Card className="details-stack" style={{ gap: 16 }}>
          <div className="chat-thread">
            {conversation.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="ui-field__control"
              style={{ flex: 1, minWidth: 200 }}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t('student.messages.composerPlaceholder')}
              aria-label={t('student.messages.composerPlaceholder')}
            />
            <Button type="submit" variant="primary" size="md" disabled={!draft.trim()}>
              <Send size={15} aria-hidden="true" /> {t('student.messages.sendBtn')}
            </Button>
          </form>

          <Alert variant="info" title={t('common.demoBadge')}>
            {t('student.messages.demoHint')}
          </Alert>
        </Card>
      </div>
    </div>
  );
}
