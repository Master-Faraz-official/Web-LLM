"use client"
import * as webllm from "@mlc-ai/web-llm";
import { useEffect, useState } from "react";


export default function Home() {

  const [messages, setmessages] = useState([])
  const [engine, setEngine] = useState()

  useEffect(() => {

    const selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

    webllm.CreateMLCEngine(selectedModel,
      {
        initProgressCallback: (initProgress) => {
          console.log( initProgress)
        }
      })
      .then(engine => setEngine(engine)).catch(error => console.log("error while loading engine"))

    console.log("Everything looks fine")

  }, [])

  return (
    <div className=" w-full min-h-screen">
      <h1>this is home</h1>
    </div>
  );
}
