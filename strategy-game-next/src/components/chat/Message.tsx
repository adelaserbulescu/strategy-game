import { ChatMessage } from "../../models/Chat";

interface MessageProps {
  message: ChatMessage;
  isOwn?: boolean;
}

export default function Message({ message, isOwn = false }: MessageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        margin: "5px 0",
      }}
    >
      <span style={{ fontWeight: "bold", fontSize: 12 }}>
        {message.senderName} {isOwn ? "(You)" : ""}
      </span>
      <div
        style={{
          backgroundColor: isOwn ? "#DCF8C6" : "#ECECEC",
          padding: "6px 10px",
          borderRadius: "10px",
          maxWidth: "70%",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
      <span style={{ fontSize: 10, color: "#888" }}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}
