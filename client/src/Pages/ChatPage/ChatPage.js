import React, { useState, useEffect, useLayoutEffect, useRef, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import ChatProductCard from '../../Components/ChatProductCard/ChatProductCard';
import './ChatPage.css';
import API_URL from '../../apiUrl';

// Правило для малювання карток товарів
const markdownRenderers = {
  p: ({ node, children, ...props }) => <div className="md-p" {...props}>{children}</div>,
  a: ({ node, ...props }) => {
    if (props.href && props.href.includes('/product/')) {
      const urlParts = props.href.split('/product/');
      const productId = urlParts[urlParts.length - 1].replace(/[^a-zA-Z0-9-]/g, '');
      return <ChatProductCard productId={productId} />;
    }
    return <a {...props} target="_blank" rel="noopener noreferrer" className="chat-regular-link">{props.children}</a>;
  }
};

// Створюємо оптимізований (мемоізований) компонент для одного повідомлення.
const ChatMessageBubble = memo(({ msg }) => {
  return (
    <div className={`chat-message-wrapper ${msg.role}`}>
      <div className="chat-message-bubble">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} 
          components={markdownRenderers}
        >
          {msg.parts[0].text}
        </ReactMarkdown>
      </div>
    </div>
  );
});

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  
  const chatContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const isHistoryLoad = useRef(false);

  const scrollToBottom = (instant = false) => {
    if (chatContainerRef.current) {
      const el = chatContainerRef.current;
      if (instant) {
        el.scrollTop = el.scrollHeight;
      } else {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  // Після завантаження історії — миттєвий скрол після рендеру DOM
  useLayoutEffect(() => {
    if (isHistoryLoad.current && messages.length > 0) {
      scrollToBottom(true);
      isHistoryLoad.current = false;
    }
  }, [messages]);

  // Розумний скрол при живому спілкуванні
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!isHistoryLoad.current && (isLoading || (lastMessage && lastMessage.role === 'user'))) {
      scrollToBottom(false);
    }
  }, [messages, isLoading]);

  // Завантаження історії при відкритті сторінки
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/chat/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
          setIsAuthorized(false);
          return;
        }

        const data = await response.json();
        if (data.history) {
          isHistoryLoad.current = true;
          setMessages(data.history);
        }
      } catch (error) {
        console.error('Помилка завантаження історії:', error);
      }
    };

    fetchHistory();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const token = localStorage.getItem('token');
    
    const newUserMsg = { role: 'user', parts: [{ text: inputMessage }] };
    setMessages(prev => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
      } else if (response.status === 503) {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: "ШІ-асистент зараз перевантажений. Спробуйте надіслати повідомлення ще раз через кілька секунд." }] }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Вибачте, сталася помилка. Спробуйте ще раз." }] }]);
      }
    } catch (error) {
      console.error('Помилка відправки:', error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Вибачте, сталася помилка з'єднання з сервером." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="chat-page-container">
        <div className="chat-unauth-card">
          <h2>🤖 Ваш персональний ШІ-стиліст</h2>
          <p>Щоб спілкуватися зі стилістом та зберігати історію підбору образів, будь ласка, увійдіть у свій акаунт.</p>
          <Link to="/login" className="login-link-btn">Увійти в акаунт</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      <div className="chat-main-window">
        <div className="chat-page-header">
          <div className="stylist-avatar">
            {/* Твоя SVG іконка ШІ */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
              <path d="M20 3v4"/>
              <path d="M22 5h-4"/>
              <path d="M4 17v2"/>
              <path d="M5 18H3"/>
            </svg>
          </div>
          <div className="stylist-info">
            <h2>ШІ-Стиліст FashionStore</h2>
            <span>Завжди онлайн</span>
          </div>
        </div>

        <div className="chat-page-messages" ref={chatContainerRef}>
          {messages.length === 0 && (
            <div className="chat-welcome-banner">
              <h3>Привіт! Я радий вас бачити.</h3>
              <p>Напишіть мені, для якої події ви шукаєте одяг, який у вас бюджет або стиль, і я запропоную найкращі варіанти з нашого каталогу!</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <ChatMessageBubble key={index} msg={msg} />
          ))}

          {isLoading && (
            <div className="chat-message-wrapper model">
              <div className="chat-message-bubble loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-page-input-area" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Опишіть, що ви шукаєте..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputMessage.trim()}>
            Відправити
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;