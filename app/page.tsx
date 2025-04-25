"use client";
// Import necessary libraries and hooks
import * as webllm from "@mlc-ai/web-llm";
import { useEffect, useState, useRef, useCallback } from "react";

export default function Home() {
  // State to manage chat messages
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "I am your assistant, how can I help you?",
    },
  ]);

  // State to manage user input
  const [input, setInput] = useState("");

  // State to store the ML engine instance
  const [engine, setEngine] = useState();

  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false);

  // Ref for scrolling to the latest message
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Define the model to be used
    
    const selectedModel = "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC";
    // const selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

    // Initialize the ML engine with the selected model
    webllm.CreateMLCEngine(selectedModel,
      {
        initProgressCallback: (initProgress) => {
          console.log(initProgress); // Log initialization progress
        }
      })
      .then(engine => setEngine(engine)) // Set the engine instance in state
      .catch(error => console.log(error)); // Handle initialization errors

    console.log("Everything looks fine");
  }, []);

  const handleMessageSend = useCallback(async () => {
    if (input.trim() === "") return; // Prevent sending empty messages

    // Add user message to the chat
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput(""); // Clear the input field
    setIsLoading(true); // Set loading state

    try {
      if (!engine) throw new Error("Engine is not initialized"); // Ensure engine is defined

      // Generate a reply using the ML engine
      const reply = await engine.chat.completions.create({
        messages: newMessages,
      });
      console.log("REPLY ", reply);

      // Add assistant's reply to the chat
      const replyMessage = reply.choices[0].message.content;
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: replyMessage },
      ]);
    } catch (error) {
      console.error("Error generating reply:", error);
    } finally {
      setIsLoading(false); // Reset loading state
      scrollToBottom(); // Scroll to the latest message
    }
  }, [input, messages, engine]);

  useEffect(() => {
    scrollToBottom(); // Scroll to the latest message whenever messages change
  }, [messages]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-900 text-white">
      <div className="w-full  h-screen bg-gray-800 shadow-lg rounded-lg flex flex-col">
        {/* Header */}
        <div className="bg-gray-700 py-4 px-6 rounded-t-lg flex items-center justify-between">
          <h1 className="text-xl font-semibold">AI Model</h1>
        </div>

        {/* Chat messages display */}
        <div className="flex flex-col overflow-y-auto p-6 space-y-4 ">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg max-w-[50%] ${
                message.role === "user"
                  ? "bg-blue-600 text-white self-end"
                  : "bg-gray-700 text-gray-300 self-start"
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Added ref for scrolling */}
        </div>

        {/* Input field and send button */}
        <div className=" py-4 px-6 rounded-b-lg flex items-center space-x-4 fixed right-[25%] bottom-0 w-[50%]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleMessageSend();
              }
            }}
            aria-label="Message input"
            disabled={isLoading}
          />
          <button
            onClick={handleMessageSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Send message"
            disabled={isLoading}
          >
            {isLoading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
