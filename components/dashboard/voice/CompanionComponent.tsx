"use client";

import { useEffect, useRef, useState } from "react";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import { addToSessionHistory } from "@/actions/companion.actions";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Sparkles,
  Zap,
  MessageCircle,
} from "lucide-react";

interface CompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  name: string;
  userName: string;
  userImage: string;
  style: string;
  voice: string;
}

interface SavedMessage {
  role: "assistant" | "user";
  content: string;
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const CompanionComponent = ({
  companionId,
  subject,
  topic,
  name,
  userName,
  userImage,
  style,
  voice,
}: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking, lottieRef]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      addToSessionHistory(companionId);
    };
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role =
          typeof message.role === "string"
            ? message.role
            : String(message.role);
        const newMessage: SavedMessage = {
          role: role as "assistant" | "user",
          content: message.transcript,
        };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error", error);
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);

  const toggleMicrophone = () => {
    const isMuted = vapi.isMuted();
    vapi.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };
    // @ts-expect-error vapi.start may have a type mismatch with configureAssistant return type
    vapi.start(configureAssistant(voice, style), assistantOverrides);
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Main interaction area: companion and user info */}
      <div className="flex flex-col md:flex-row gap-8 w-full p-8 pb-0">
        {/* Companion Card */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50/80 via-white/80 to-blue-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-blue-900/80 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl p-8 group hover:shadow-2xl transition-all duration-300">
          <div className="relative mb-6">
            <div className="rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-4 border-slate-200/60 dark:border-slate-600/60 flex items-center justify-center w-40 h-40 shadow-xl group-hover:scale-105 transition-all duration-300">
              <div className="relative">
                <Image
                  src={`/icons/${subject}.svg`}
                  alt={subject}
                  width={120}
                  height={120}
                  className="object-contain"
                />
                {/* Gradient overlay for speaking state */}
                {callStatus === CallStatus.ACTIVE && isSpeaking && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
                )}
              </div>
              {/* Soundwaves overlay when speaking */}
              {callStatus === CallStatus.ACTIVE && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lottie
                    lottieRef={lottieRef}
                    animationData={soundwaves}
                    autoplay={false}
                    className="w-40 h-40"
                  />
                </div>
              )}
            </div>
            {/* Status indicator */}
            {callStatus === CallStatus.ACTIVE && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg animate-pulse flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-2xl mb-2 text-center bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
            {name}
          </h3>
          <div className="text-center text-slate-600 dark:text-slate-400 text-lg mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            {topic}
          </div>
        </div>

        {/* User Card and Controls */}
        <div className="flex flex-col items-center gap-6 w-full md:w-80 bg-gradient-to-br from-slate-50/80 via-white/80 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-purple-900/80 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <Image
                src={userImage}
                alt={userName}
                width={80}
                height={80}
                className="rounded-full border-4 border-slate-200/60 dark:border-slate-600/60 shadow-lg group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <p className="font-bold text-xl mt-3 bg-gradient-to-r from-slate-900 to-purple-900 dark:from-slate-100 dark:to-purple-100 bg-clip-text text-transparent">
              {userName}
            </p>
          </div>

          {/* Microphone Control */}
          <button
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl border border-slate-200/60 dark:border-slate-600/60 transition-all duration-300 w-full justify-center font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] group",
              isMuted
                ? "bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-300 hover:from-red-200 hover:to-red-300"
                : "bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 text-green-700 dark:text-green-300 hover:from-green-200 hover:to-emerald-300",
              callStatus !== CallStatus.ACTIVE &&
                "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            onClick={toggleMicrophone}
            disabled={callStatus !== CallStatus.ACTIVE}
          >
            <div className="relative">
              {isMuted ? (
                <MicOff className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Mic className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              {!isMuted && callStatus === CallStatus.ACTIVE && (
                <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 animate-pulse"></div>
              )}
            </div>
            {isMuted ? "Turn on microphone" : "Turn off microphone"}
          </button>

          {/* Call Control Button */}
          <button
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 group",
              callStatus === CallStatus.ACTIVE
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",
              callStatus === CallStatus.CONNECTING && "animate-pulse"
            )}
            onClick={
              callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall
            }
          >
            <div className="relative">
              {callStatus === CallStatus.ACTIVE ? (
                <PhoneOff className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Phone className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              )}
              <div className="absolute inset-0 bg-white rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            {callStatus === CallStatus.ACTIVE
              ? "End Session"
              : callStatus === CallStatus.CONNECTING
              ? "Connecting..."
              : "Start Session"}
          </button>
        </div>
      </div>

      {/* Transcript/Chat Area */}
      <div className="w-full max-w-3xl mx-auto mt-8 bg-gradient-to-br from-white/90 via-slate-50/90 to-blue-50/90 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-blue-900/90 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl p-6 min-h-[120px]">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          <h4 className="font-semibold text-lg bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
            Conversation
          </h4>
        </div>
        <div className="overflow-y-auto max-h-48 space-y-3">
          {messages.length === 0 && (
            <div className="text-slate-400 dark:text-slate-500 text-center py-8 flex flex-col items-center gap-2">
              <Sparkles className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <span>
                No messages yet. Start a session to begin the conversation!
              </span>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl px-4 py-3 w-fit max-w-[85%] shadow-md backdrop-blur-sm border transition-all duration-200 hover:shadow-lg",
                message.role === "assistant"
                  ? "bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-900 dark:text-blue-100 ml-0 border-blue-200/50 dark:border-blue-700/50"
                  : "bg-gradient-to-r from-green-50/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-800/30 text-green-900 dark:text-green-100 ml-auto border-green-200/50 dark:border-green-700/50"
              )}
            >
              <span className="font-semibold mr-2 text-sm opacity-75">
                {message.role === "assistant" ? name.split(" ")[0] : userName}:
              </span>
              <span className="text-sm leading-relaxed">{message.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanionComponent;
