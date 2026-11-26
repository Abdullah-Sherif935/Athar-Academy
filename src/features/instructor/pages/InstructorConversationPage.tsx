import { ArrowLeft, ArrowRight, FolderSearch, Send } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Button, Card, EmptyState } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { InstructorConversationListItem } from '../components/InstructorConversationListItem';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorConversationPage() {
  const { conversationId = '' } = useParams();
  const { t, locale, dir } = useI18n();
  const { conversations, getStudentById, getAssignedCourse, sendMessage, markConversationRead } =
    useInstructorDemo();
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
        description={t('instructor.messages.selectPrompt')}
        action={
          <Link to="/instructor/messages" className="ui-btn ui-btn--primary ui-btn--md">
            {t('instructor.messages.backToList')}
          </Link>
        }
      />
    );
  }

  const student = getStudentById(conversation.studentId);
  const course = getAssignedCourse(conversation.courseSlug);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    sendMessage(conversation.id, draft);
    setDraft('');
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={student?.fullName[locale] ?? t('instructor.messages.title')}
        subtitle={course?.title[locale]}
        breadcrumbs={[
          { label: t('instructor.nav.messages'), to: '/instructor/messages' },
          { label: student?.fullName[locale] ?? conversation.id },
        ]}
        action={
          <Link to="/instructor/messages" className="ui-btn ui-btn--secondary ui-btn--sm">
            {dir === 'rtl' ? <ArrowRight size={15} aria-hidden="true" /> : <ArrowLeft size={15} aria-hidden="true" />}{' '}
            {t('instructor.messages.backToList')}
          </Link>
        }
      />

      <div className="messages-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {conversations.map((conv) => (
            <InstructorConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === conversation.id}
            />
          ))}
        </div>

        <Card className="details-stack" style={{ gap: 16 }}>
          <div className="chat-thread">
            {conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble ${
                  msg.sender === 'instructor'
                    ? 'message-bubble--student'
                    : 'message-bubble--instructor'
                }`}
              >
                <div className="text-small" style={{ color: 'inherit' }}>
                  {msg.content[locale]}
                </div>
                <div className="message-bubble__time">{msg.timeLabel[locale]}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="ui-field__control"
              style={{ flex: 1, minWidth: 200 }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('instructor.messages.composerPlaceholder')}
              aria-label={t('instructor.messages.composerPlaceholder')}
            />
            <Button type="submit" variant="primary" size="md" disabled={!draft.trim()}>
              <Send size={15} aria-hidden="true" /> {t('instructor.messages.sendBtn')}
            </Button>
          </form>

          <Alert variant="info" title={t('common.demoBadge')}>
            {t('instructor.messages.demoHint')}
          </Alert>
        </Card>
      </div>
    </div>
  );
}
