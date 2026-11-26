import { useI18n } from '../../../app/providers/I18nProvider';
import type { DirectMessageItem } from '../../../data/mock/student';

export function MessageBubble({ message }: { message: DirectMessageItem }) {
  const { locale } = useI18n();

  return (
    <div className={`message-bubble message-bubble--${message.sender}`}>
      <div className="text-small" style={{ color: 'inherit' }}>
        {message.content[locale]}
      </div>
      <div className="message-bubble__time">{message.timeLabel[locale]}</div>
    </div>
  );
}
