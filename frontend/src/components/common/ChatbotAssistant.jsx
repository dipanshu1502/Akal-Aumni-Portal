import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  FileText,
  Link as LinkIcon,
  MessageCircle,
  Minus,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import './ChatbotAssistant.css';

const API_BASE_URL = (
  import.meta.env.VITE_CHATBOT_API_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

const suggestions = [
  'How can I collect my DMC?',
  'How can I apply for a transcript?',
  'What is the process for a migration certificate?',
  'How can I contact the examination branch?',
];

function ChatbotAssistant() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, assistantOpen]);

  useEffect(() => {
    let active = true;
    let controller;

    const checkApiStatus = async () => {
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        if (active) {
          setApiStatus(data.status === 'ok' ? 'online' : 'degraded');
        }
      } catch (error) {
        if (active && error.name !== 'AbortError') setApiStatus('offline');
      }
    };

    checkApiStatus();
    const intervalId = window.setInterval(checkApiStatus, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      controller?.abort();
    };
  }, []);

  const sendMessage = async (text) => {
    const userQuestion = text.trim();
    if (!userQuestion || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: 'user', content: userQuestion },
    ]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.error || `Server error: ${response.status}`,
        );
      }
      if (typeof data.answer !== 'string' || !Array.isArray(data.sources)) {
        throw new Error('The AI server returned an invalid response.');
      }

      setMessages((previous) => [
        ...previous,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: `I couldn’t reach the university assistant. ${error.message}`,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(question);
  };

  return (
    <>
      {!assistantOpen && (
        <button
          className="assistant-launcher"
          type="button"
          onClick={() => setAssistantOpen(true)}
          aria-label="Open Akal AI Assistant"
        >
          <MessageCircle size={22} />
          <span>Ask Akal AI</span>
          <i />
        </button>
      )}

      {assistantOpen && (
        <aside
          className="assistant-panel"
          aria-label="Akal University AI Assistant"
        >
          <header className="assistant-header">
            <div className="assistant-brand-icon">
              <Sparkles size={20} />
            </div>
            <div className="assistant-heading">
              <strong>Akal AI Assistant</strong>
              <span>
                <i className={`status-dot ${apiStatus}`} />
                {apiStatus === 'online'
                  ? 'Here to help'
                  : apiStatus === 'degraded'
                    ? 'Some sources unavailable'
                    : apiStatus === 'offline'
                      ? 'Connection unavailable'
                      : 'Connecting to university'}
              </span>
            </div>
            <button
              className="assistant-header-button"
              type="button"
              onClick={() => setAssistantOpen(false)}
              aria-label="Minimize assistant"
            >
              <Minus size={19} />
            </button>
            <button
              className="assistant-header-button close-assistant"
              type="button"
              onClick={() => setAssistantOpen(false)}
              aria-label="Close assistant"
            >
              <X size={19} />
            </button>
          </header>

          <div className="assistant-thread">
            {messages.length === 0 ? (
              <div className="assistant-welcome">
                <div className="welcome-orb">
                  <Sparkles size={23} />
                </div>
                <span className="assistant-kicker">YOUR UNIVERSITY GUIDE</span>
                <h2>How can I help<br />you today?</h2>
                <p>
                  Ask me about admissions, academics, exams, campus life, and
                  more.
                </p>
                <div className="suggestion-label">POPULAR QUESTIONS</div>
                <div className="assistant-suggestions">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => sendMessage(item)}
                      disabled={loading}
                    >
                      <span>{item}</span>
                      <ArrowRight size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="assistant-messages">
                {messages.map((message, index) => (
                  <div
                    className={`chat-message ${message.role}`}
                    key={`${index}-${message.role}`}
                  >
                    {message.role === 'assistant' && (
                      <span className="chat-avatar">
                        <Bot size={15} />
                      </span>
                    )}
                    <div className="chat-message-body">
                      {message.role === 'assistant' && (
                        <span className="message-name">Akal AI</span>
                      )}
                      <div className="chat-bubble">{message.content}</div>
                      {message.role === 'assistant' &&
                        message.sources?.length > 0 && (
                          <div className="chat-sources">
                            <span className="chat-sources-title">
                              <LinkIcon size={12} /> Sources
                            </span>
                            {message.sources.map((source) => (
                              <span className="chat-source-chip" key={source}>
                                <FileText size={12} />
                                {source}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    {message.role === 'user' && (
                      <span className="chat-avatar user-avatar">
                        <User size={15} />
                      </span>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="chat-message assistant">
                    <span className="chat-avatar">
                      <Bot size={15} />
                    </span>
                    <div className="chat-message-body">
                      <span className="message-name">Akal AI</span>
                      <div className="chat-bubble typing">
                        <i />
                        <i />
                        <i />
                        <small>Looking that up…</small>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="assistant-compose-area">
            <form className="assistant-compose" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question…"
                maxLength={2000}
                disabled={loading}
                aria-label="Ask Akal AI a question"
              />
              <button
                type="submit"
                disabled={!question.trim() || loading}
                aria-label="Send question"
              >
                <Send size={17} />
              </button>
            </form>
            <div className="assistant-disclaimer">
              <ShieldCheck size={12} />
              Answers use university information. Please verify important
              details.
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

export default ChatbotAssistant;
