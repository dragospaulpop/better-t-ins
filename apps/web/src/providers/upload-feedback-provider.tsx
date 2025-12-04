import { createContext, useCallback, useContext, useReducer } from "react";

const MESSAGES_TO_KEEP = 10;

export const STATUSES = {
  pending: "pending",
  success: "success",
  error: "error",
  info: "info",
} as const;

export type Status = keyof typeof STATUSES;

export type MessageItem = {
  id: string;
  message: string;
  description?: string;
  progress?: number;
  status: Status;
};

const UploadFeedbackContext = createContext<{
  messages: MessageItem[];
  addMessage: (msg: MessageItem) => void;
  clearMessages: () => void;
  editMessage: (id: string, message: MessageItem) => void;
} | null>(null);

function uploadReducer(
  state: MessageItem[],
  action: { type: "ADD" | "CLEAR" | "EDIT"; message?: MessageItem }
) {
  switch (action.type) {
    case "ADD":
      return action.message
        ? [...state.slice(-MESSAGES_TO_KEEP), action.message]
        : state;
    case "CLEAR":
      return [];
    case "EDIT": {
      if (!action.message) {
        return state;
      }
      const index = state.findIndex((msg) => msg.id === action.message?.id);
      if (index === -1) {
        return state;
      }
      return [
        ...state.slice(0, index),
        action.message,
        ...state.slice(index + 1),
      ];
    }
    default:
      return state;
  }
}

export function UploadFeedbackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, dispatch] = useReducer(uploadReducer, []);

  const addMessage = useCallback((msg: MessageItem) => {
    dispatch({ type: "ADD", message: msg });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const editMessage = useCallback((id: string, message: MessageItem) => {
    dispatch({ type: "EDIT", message: { ...message, id } });
  }, []);

  return (
    <UploadFeedbackContext.Provider
      value={{ messages, addMessage, clearMessages, editMessage }}
    >
      {children}
    </UploadFeedbackContext.Provider>
  );
}

export function useUploadFeedback() {
  const context = useContext(UploadFeedbackContext);
  if (!context) {
    throw new Error("No UploadFeedbackProvider found");
  }
  return context;
}
