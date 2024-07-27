"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAtom } from "jotai";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { birthYearAtom, genderAtom, regionAtom } from "../../store/atom";
import styles from "./chatPage.module.css";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  text: string;
  sender: string;
  regions?: string[];
}

interface UserContext {
  birth: string | null;
  gender: string | null;
  mbti: string | null;
}

const predefinedMessages = [
  "혼자서 여행가기 좋은 여행지를 추천해줘",
  "둘이서 가기 좋은 여행지를 추천해줘",
  "가족과 함께 가기 좋은 여행지를 추천해줘",
];

const apiClient = axios.create({
  baseURL: "http://118.67.130.17:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

const ChatPage: React.FC = () => {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const [birthYear] = useAtom(birthYearAtom);
  const [gender] = useAtom(genderAtom);
  const [, setRegion] = useAtom(regionAtom);

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { userContext: UserContext; message: string }) =>
      apiClient.post("/initialChat", messageData),
    onSuccess: (data) => {
      const botMessage: Message = {
        id: Date.now(),
        text: data.data.message,
        sender: "bot",
        regions: data.data.regions ? data.data.regions.split(",").map((region: string) => region.trim()) : [],
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text: text,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const userContext = {
      birth: birthYear,
      gender,
      mbti: "ESTJ",
    };
    const messageWithContext = {
      userContext: userContext,
      message: text,
    };

    sendMessageMutation.mutate(messageWithContext);
    setInputMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() !== "") {
      handleSendMessage(inputMessage);
    }
  };

  const handleRegionClick = (region: string) => {
    setRegion(region); // 선택한 지역을 atom에 저장
    router.push("/trip"); // /trip 페이지로 이동
  };

  return (
    <div className={styles.chatRoom}>
      <div className={styles.messageListContainer}>
        <div className={styles.logoBackground}></div>
        <div className={styles.messageList}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageContainer} ${
                message.sender === "user" ? styles.userMessageContainer : styles.botMessageContainer
              }`}
            >
              {message.sender === "bot" && (
                <div className={styles.botProfilePic}>
                  <Image src="/logo.png" alt="Bot Profile" width={40} height={40} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  className={`${styles.message} ${message.sender === "user" ? styles.userMessage : styles.botMessage}`}
                >
                  <span className={styles.text}>{message.text}</span>
                </div>
                <div className={styles.regionsContainer}>
                  {message.regions?.map((region) => (
                    <button key={region} onClick={() => handleRegionClick(region)}>
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length === 0 && (
        <div className={styles.predefinedMessagesContainer}>
          <div className={styles.predefinedMessages}>
            {predefinedMessages.map((message, index) => (
              <button key={index} onClick={() => handleSendMessage(message)} className={styles.predefinedMessageButton}>
                {message}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="여행할 지역을 검색해볼까요?"
            className={styles.inputBox}
          />
          <button type="submit">
            <Image src="/icons/Send.svg" alt="메세지 전송" width={16} height={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
