"use client";
import * as webllm from "@mlc-ai/web-llm";
import { useEffect, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "I am your assistant, how can I help you?",
    },
    {
      role: "user",
      content: "hey there",
    },
  ]);
  const [input, setInput] = useState("");

  const [engine, setEngine] = useState();

  useEffect(() => {
    const selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

    webllm.CreateMLCEngine(selectedModel,
      {
        initProgressCallback: (initProgress) => {
          console.log( initProgress)
        }
      })
      .then(engine => setEngine(engine)).catch(error => console.log("error while loading engine"))

    console.log("Everything looks fine");
  }, []);

  const handleMessageSend = async () => {
    if (input.trim() === "") return;

    // Add user message
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const reply = await engine.chat.completions.create({
      messages: newMessages,
    });
    console.log("REPLY ", reply);

    // Add assistant message
    const replyMessage = reply.choices[0].message.content;
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: replyMessage },
    ]);
    setInput("");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-800 p-4">
      <div className="w-full h-screen bg-slate-900 shadow-md rounded-lg p-4 flex flex-col space-y-4">
        <div className="flex-1 overflow-y-auto max-h-[500px]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-md ${
                message.role === "user"
                  ? "bg-blue-100 text-blue-900 self-end"
                  : "bg-gray-200 text-gray-900 self-start"
              }`}
              style={{ marginBottom: "8px" }}
            >
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-md"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleMessageSend();
              }
            }}
          />
          <button
            onClick={handleMessageSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
