import { useState, useCallback } from "react";
import { AnalysisResults } from "../types";

export function useGeminiStream() {
  const [streamingText, setStreamingText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async (analysisData: AnalysisResults, userApiKey?: string) => {
    setIsLoading(true);
    setError(null);
    setStreamingText("");

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisData,
          userApiKey: userApiKey || "",
        }),
      });

      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.error || "خطایی در برقراری ارتباط با سرور تحلیل هوشمند رخ داد.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("امکان خواندن جریان داده (Stream) از سرور وجود ندارد.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith("data: ")) {
            const dataContent = cleanLine.substring(6).trim();
            if (dataContent === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                setStreamingText((prev) => prev + parsed.text);
              }
            } catch (jsErr: any) {
              // Ignore or handle parsing errors of partial streams
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Client Streaming Error:", err);
      setError(err.message || "خطایی در هنگام پردازش تحلیل هوشمند بوجود آمد.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetStream = useCallback(() => {
    setStreamingText("");
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    streamingText,
    isLoading,
    error,
    startAnalysis,
    resetStream,
  };
}
