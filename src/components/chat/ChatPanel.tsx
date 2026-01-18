import { useEffect, useState } from "react";
import { getMessages, sendMessage, askAI } from "../../api/chat";
import { ChatMessage } from "../../models/Chat";
import { useAuth } from "../../context/AuthContext";

type Tab = "CHAT" | "AI";

export default function ChatPanel({ matchId, players, board, currentTurn }: { matchId: number; players: any; board: any; currentTurn: any }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<Tab>("CHAT");
  const [loadingAI, setLoadingAI] = useState(false);
  const [styles] = useState({
    container: {
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "4px",
    },
    tabs: {
      display: "flex",
      gap: "10px",
      marginBottom: "10px",
    },
    tab: {
      padding: "8px 16px",
      cursor: "pointer",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    activeTab: {
      padding: "8px 16px",
      cursor: "pointer",
      backgroundColor: "#007bff",
      color: "white",
      border: "1px solid #007bff",
      borderRadius: "4px",
    },
    messages: {
      maxHeight: "300px",
      overflowY: "auto" as const,
      marginBottom: "10px",
      padding: "10px",
      backgroundColor: "#000000ff",
      borderRadius: "4px",
    },
    message: {
      padding: "8px",
      marginBottom: "8px",
      backgroundColor: "black",
      borderRadius: "4px",
    },
    inputRow: {
      display: "flex",
      gap: "10px",
    },
    input: {
      flex: 1,
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
  });

  useEffect(() => {
    loadMessages();
  }, [matchId]);

  const loadMessages = async () => {
    const msgs = await getMessages(matchId);
    setMessages(msgs);
  };

  const handleSendChat = async () => {
  if (!input.trim()) return;

  const playerMessage: ChatMessage = {
    id: crypto.randomUUID(),
    senderId: String(user?.id || ""),
    senderName: user?.username || "Player",
    content: input,
    type: "PLAYER",
    tab: "CHAT",
    timestamp: new Date().toISOString(),
  };

  // 1️⃣ Show player message immediately
  setMessages(prev => [...prev, playerMessage]);

  setInput("");

  try {
    // 2️⃣ Persist it (MSW / backend)
    await sendMessage(matchId, playerMessage);
  } catch (err) {
    console.error("Failed to send message", err);
  }
};


const handleAskAI = async () => {
  if (!input.trim()) return;

  const playerMessage: ChatMessage = {
    id: crypto.randomUUID(),
    senderId: String(user?.id || ""),
    senderName: user?.username || "Player",
    content: input,
    type: "PLAYER",
    tab: "AI",
    timestamp: new Date().toISOString(),
  };

  // 1️⃣ show player's question in AI tab
  setMessages(prev => [...prev, playerMessage]);
  setInput("");
  setLoadingAI(true);

  try {
    const ai = await askAI(matchId.toString(), input, { board, currentTurn });

    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: "AI",
      senderName: "AI",
      content: ai.recommendation,
      type: "AI",
      tab: "AI",
      timestamp: new Date().toISOString(),
    };

    // 2️⃣ show AI response
    setMessages(prev => [...prev, aiMessage]);
  } catch (err) {
    console.error("Failed to get AI response", err);
  } finally {
    setLoadingAI(false);
  }
};



  const visibleMessages = messages.filter(
  m => m.tab === (tab === "CHAT" ? "CHAT" : "AI")
);


  return (
    <div style={styles.container}>
      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={tab === "CHAT" ? styles.activeTab : styles.tab}
          onClick={() => setTab("CHAT")}
        >
          Player Chat
        </button>
        <button
          style={tab === "AI" ? styles.activeTab : styles.tab}
          onClick={() => setTab("AI")}
        >
          Ask AI
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {visibleMessages.map(m => (
          <div key={m.id} style={styles.message}>
            <strong>{m.senderName}:</strong> {m.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            tab === "CHAT"
              ? "Type a message..."
              : "Ask the AI for advice..."
          }
          style={styles.input}
        />
        <button
          onClick={tab === "CHAT" ? handleSendChat : handleAskAI}
          disabled={tab === "AI" && loadingAI}
        >
          {tab === "CHAT" ? "Send" : loadingAI ? "Thinking..." : "Ask"}
        </button>
      </div>
    </div>
  );
}
