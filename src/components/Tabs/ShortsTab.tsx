/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Volume,
  Camera,
  CheckCircle2,
  Send,
  Trash2
} from "lucide-react";
import { Short, Channel, Comment } from "../../types";

interface ShortsTabProps {
  shorts: Short[];
  channels: Channel[];
  userChannel: Channel | null;
  onLikeShort: (shortId: string, isLike: boolean) => void;
  onAddShortComment: (shortId: string, text: string) => void;
  onDeleteShortComment: (shortId: string, commentId: string) => void;
}

export const ShortsTab: React.FC<ShortsTabProps> = ({
  shorts,
  channels,
  userChannel,
  onLikeShort,
  onAddShortComment,
  onDeleteShortComment,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeShort = shorts[currentIndex] || null;

  // Track video element references
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, currentIndex]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowComments(false);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowComments(false);
      setIsPlaying(true);
    }
  };

  const handleLikeToggle = () => {
    if (!activeShort) return;
    const isAlreadyLiked = likedShorts[activeShort.id];
    setLikedShorts((prev) => ({ ...prev, [activeShort.id]: !isAlreadyLiked }));
    onLikeShort(activeShort.id, !isAlreadyLiked);
  };

  // Support double click on video to trigger heart animation and automatically like
  const handleDoubleClick = () => {
    if (!activeShort) return;
    setShowHeartAnim(true);
    setTimeout(() => {
      setShowHeartAnim(false);
    }, 800);

    if (!likedShorts[activeShort.id]) {
      setLikedShorts((prev) => ({ ...prev, [activeShort.id]: true }));
      onLikeShort(activeShort.id, true);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShort || commentText.trim() === "") return;
    onAddShortComment(activeShort.id, commentText);
    setCommentText("");
  };

  const shareShort = () => {
    if (!activeShort) return;
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert("Link do Short copiado com sucesso!"))
      .catch(() => {});
  };

  if (!activeShort) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-zinc-500 font-sans">
        <Camera className="w-12 h-12 text-zinc-700 mb-4" />
        <span className="text-sm">Nenhum short disponível no momento.</span>
      </div>
    );
  }

  const activeChannel = channels.find((c) => c.id === activeShort.channelId);
  const isCurrentlyLiked = likedShorts[activeShort.id] || false;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-2 py-1 select-none" id="shorts-tab-view">
      {/* Container holding layout: Player Middle - Actions Sidebar Right */}
      <div className="relative w-full flex items-stretch justify-center gap-4 max-w-xl">
        {/* Navigation buttons Left - Floating indicators for easy desktop mouse scroll representation */}
        <div className="hidden sm:flex flex-col gap-3 justify-center text-zinc-500">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-3 bg-white border border-zinc-200 shadow-sm rounded-full hover:text-zinc-950 transition-colors cursor-pointer
              ${currentIndex === 0 ? "opacity-35 cursor-not-allowed" : "hover:bg-zinc-50"}
            `}
            title="Short Anterior"
            id="shorts-nav-prev"
          >
            <ChevronUp className="w-5 h-5 text-zinc-600" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === shorts.length - 1}
            className={`p-3 bg-white border border-zinc-200 shadow-sm rounded-full hover:text-zinc-950 transition-colors cursor-pointer
              ${currentIndex === shorts.length - 1 ? "opacity-35 cursor-not-allowed" : "hover:bg-zinc-50"}
            `}
            title="Próximo Short"
            id="shorts-nav-next"
          >
            <ChevronDown className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        {/* 9:16 Video Player Card Frame */}
        <div className="relative w-full max-w-[350px] aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-zinc-900 shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            src={activeShort.videoUrl}
            onClick={togglePlay}
            onDoubleClick={handleDoubleClick}
            loop
            playsInline
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Floating scaling Heart animate overlay (on double click) */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none scale-0 animate-bounce">
              <Heart className="w-24 h-24 text-red-500 fill-red-500 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-ping" />
            </div>
          )}

          {/* Mute indicator overlay */}
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 z-20 p-2.5 bg-black/55 text-white hover:bg-black/85 rounded-full transition-colors cursor-pointer"
            title={isMuted ? "Ativar Áudio" : "Tornar mudo"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Play/Pause icon indicator when paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/25 z-10 cursor-pointer"
            >
              <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center text-white">
                <Play className="w-6 h-6 fill-white pl-0.5" />
              </div>
            </div>
          )}

          {/* Bottom metadata panel overlay on video */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent p-4 z-15 flex flex-col gap-2">
            {/* Channel banner info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm border border-zinc-700">
                <span>{activeChannel?.avatar || "👤"}</span>
              </div>
              <span className="text-xs font-bold font-sans text-white truncate max-w-[130px]">
                {activeChannel?.name || "Criador"}
              </span>
              {activeChannel?.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              )}
            </div>

            {/* Title description */}
            <h2 className="text-xs sm:text-sm font-sans tracking-wide text-zinc-100 line-clamp-2 leading-relaxed">
              {activeShort.title}
            </h2>

            {/* Quick interactive stats */}
            <span className="text-[10px] font-mono text-zinc-400">
              {activeShort.views >= 1000
                ? `${(activeShort.views / 1000).toFixed(0)}mil`
                : activeShort.views}{" "}
              visualizações
            </span>
          </div>

          {/* Sliding Micro Comments Panel Overlay */}
          {showComments && (
            <div className="absolute inset-x-0 bottom-0 top-[25%] bg-zinc-950/95 border-t border-zinc-800 p-4 z-30 rounded-t-2xl flex flex-col gap-3 transition-transform duration-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <h3 className="text-xs sm:text-sm font-bold font-sans text-zinc-200">
                  Comentários ({activeShort.comments.length})
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer font-semibold"
                >
                  Fechar
                </button>
              </div>

              {/* Dynamic scroll list */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 pl-1 scrollbar-thin">
                {activeShort.comments.length > 0 ? (
                  activeShort.comments.map((sc) => (
                    <div key={sc.id} className="flex gap-2.5 text-xs select-text">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[11px] border border-zinc-700 flex-shrink-0">
                        <span>{sc.userAvatar || "👤"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-[10px] text-zinc-300 truncate">
                            {sc.userName}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500">
                            {sc.timestamp}
                          </span>
                        </div>
                        <p className="text-zinc-400 font-sans break-words leading-tight">
                          {sc.text}
                        </p>
                      </div>

                      {/* Delete option if matches custom channel */}
                      {userChannel && sc.userName === userChannel.name && (
                        <button
                          onClick={() => onDeleteShortComment(activeShort.id, sc.id)}
                          className="text-zinc-600 hover:text-red-500 self-start"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[11px] text-zinc-600 font-sans mt-8">
                    Seja o primeiro a comentar neste short!
                  </p>
                )}
              </div>

              {/* Input section */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2 border-t border-zinc-900">
                <input
                  type="text"
                  placeholder={userChannel ? "Escreva algo..." : "Crie um canal para poder comentar."}
                  value={commentText}
                  disabled={!userChannel}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-zinc-900 text-xs text-white border border-zinc-800 rounded-full px-3 py-1.5 focus:outline-none focus:border-red-600 font-sans"
                />
                <button
                  type="submit"
                  disabled={commentText.trim() === ""}
                  className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Vertical Actions Panel - Always docked on the right */}
        <div className="flex flex-col justify-end gap-5 font-sans text-xs pb-6 z-10 select-none">
          {/* Like button item */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLikeToggle}
              className={`p-3 bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm rounded-full hover:scale-105 active:scale-95 transition-all flex justify-center items-center cursor-pointer
                ${isCurrentlyLiked ? "bg-red-50 text-red-600 border-red-200" : "text-zinc-600 hover:text-zinc-900"}
              `}
              title="Gostei"
            >
              <Heart className={`w-5 h-5 ${isCurrentlyLiked ? "fill-red-500 text-red-650" : ""}`} />
            </button>
            <span className="text-[10px] font-mono font-bold text-zinc-500 mt-1">
              {activeShort.likes + (isCurrentlyLiked ? 1 : 0)}
            </span>
          </div>

          {/* Comments button item */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-3 bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm rounded-full hover:scale-105 active:scale-95 transition-all flex justify-center items-center cursor-pointer
                ${showComments ? "bg-red-50 text-red-600 border-red-200" : "text-zinc-600 hover:text-zinc-900"}
              `}
              title="Ver Comentários"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-zinc-500 mt-1">
              {activeShort.comments.length}
            </span>
          </div>

          {/* Share button item */}
          <div className="flex flex-col items-center">
            <button
              onClick={shareShort}
              className="p-3 bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm text-zinc-600 hover:text-zinc-900 rounded-full hover:scale-105 active:scale-95 transition-all flex justify-center items-center cursor-pointer"
              title="Compartilhar Short"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-zinc-500 mt-1">
              {activeShort.shares}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
