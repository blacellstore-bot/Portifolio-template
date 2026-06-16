/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Trash2,
  Send,
  Minimize2,
  ArrowLeft
} from "lucide-react";
import { Video, Channel, Comment } from "../types";

interface VideoDetailViewProps {
  selectedVideo: Video;
  channels: Channel[];
  onSelectVideo: (video: Video) => void;
  onClose: () => void;
  onLikeVideo: (videoId: string, isLike: boolean) => void;
  onAddComment: (videoId: string, commentText: string) => void;
  onDeleteComment: (videoId: string, commentId: string) => void;
  userChannel: Channel | null;
  allVideos: Video[];
}

export const VideoDetailView: React.FC<VideoDetailViewProps> = ({
  selectedVideo,
  channels,
  onSelectVideo,
  onClose,
  onLikeVideo,
  onAddComment,
  onDeleteComment,
  userChannel,
  allVideos,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [localSubscribers, setLocalSubscribers] = useState(0);
  const [hasLiked, setHasLiked] = useState<"like" | "dislike" | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentChannel = channels.find((c) => c.id === selectedVideo.channelId);

  // Sync state on video change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasLiked(null);
    setCommentText("");
    if (currentChannel) {
      setLocalSubscribers(currentChannel.subscribers);
    }
  }, [selectedVideo, currentChannel]);

  // Handle Play/Pause
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

  // Handle Mute/Unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle Video Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle Video Loaded Metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Skip video timeline on click on track
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  // Request native fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  // Format time (mm:ss)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSubscribeToggle = () => {
    if (isSubscribed) {
      setLocalSubscribers((prev) => prev - 1);
    } else {
      setLocalSubscribers((prev) => prev + 1);
    }
    setIsSubscribed(!isSubscribed);
  };

  const handleLikeClick = () => {
    if (hasLiked === "like") {
      setHasLiked(null);
      onLikeVideo(selectedVideo.id, false); // Cancel like
    } else {
      setHasLiked("like");
      onLikeVideo(selectedVideo.id, true);
    }
  };

  const handleDislikeClick = () => {
    if (hasLiked === "dislike") {
      setHasLiked(null);
    } else {
      setHasLiked("dislike");
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() === "") return;
    onAddComment(selectedVideo.id, commentText);
    setCommentText("");
  };

  // Filter other videos for sidebar recommendations
  const recommendedVideos = allVideos.filter((v) => v.id !== selectedVideo.id);

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 pb-20 pt-2 px-1" id="video-detail-view-container">
      {/* Back button */}
      <div className="w-full xl:hidden flex items-center justify-start pb-2">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-semibold py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </button>
      </div>

      {/* Main Column - Video Player & Information */}
      <div className="flex-1 min-w-0" id="video-detail-main-col">
        {/* Immersive Responsive Custom Video Player Container */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-900 group/player select-none">
          <video
            ref={videoRef}
            src={selectedVideo.videoUrl}
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
          />

          {/* Player controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col gap-3 opacity-0 group-hover/player:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
            {/* Timeline Progress Bar */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative w-full h-1.5 bg-zinc-700 rounded-full cursor-pointer hover:h-2 transition-all group"
            >
              <div
                className="absolute top-0 left-0 bottom-0 bg-red-600 rounded-full flex items-center justify-end"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="w-3 h-3 bg-white rounded-full translate-x-1.5 shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between text-white text-xs font-medium font-sans">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="hover:scale-115 transition-transform text-zinc-100 hover:text-white"
                  title={isPlaying ? "Pausar" : "Reproduzir"}
                >
                  {isPlaying ? <Pause className="w-4.5 h-4.5 fill-white" /> : <Play className="w-4.5 h-4.5 fill-white" />}
                </button>

                {/* Mute/Unmute */}
                <button
                  onClick={toggleMute}
                  className="hover:scale-115 transition-transform text-zinc-100 hover:text-white"
                  title={isMuted ? "Ativar Áudio" : "Mudar para Mudo"}
                >
                  {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                </button>

                {/* Time Display */}
                <div className="text-[11px] font-mono text-zinc-300">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1 text-zinc-500">/</span>
                  <span>{formatTime(duration || parseFloat(selectedVideo.duration.split(":")[0]) * 60 + parseFloat(selectedVideo.duration.split(":")[1]))}</span>
                </div>
              </div>

              {/* Fulscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="hover:scale-115 transition-transform text-zinc-100 hover:text-white"
                title="Tela Cheia"
              >
                <Maximize2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Play/Pause Center Indicator overlays for micro interaction */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer"
            >
              <div className="w-16 h-16 bg-red-600/90 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl transition hover:scale-105 active:scale-95">
                <Play className="w-8 h-8 fill-white pl-1" />
              </div>
            </div>
          )}
        </div>

        {/* Title details */}
        <h1 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-white mt-4 leading-snug">
          {selectedVideo.title}
        </h1>

        {/* Row with channel avatar, subscribe button and action buttons (like, share) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-4 border-b border-zinc-900">
          {/* Creator detail */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-xl select-none border border-zinc-800">
              <span>{currentChannel?.avatar || "👤"}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold font-sans text-white hover:text-red-500 transition-colors">
                  {currentChannel?.name || "Canal Removido"}
                </span>
                {currentChannel?.verified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {localSubscribers >= 1000
                  ? `${(localSubscribers / 1000).toFixed(0)}mil`
                  : localSubscribers}{" "}
                inscritos
              </span>
            </div>

            {/* Subscribe toggle */}
            <button
              onClick={handleSubscribeToggle}
              className={`ml-3 px-4 py-2 text-xs font-bold font-sans rounded-full tracking-wide transition-all scale-100 active:scale-95 cursor-pointer
                ${isSubscribed
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : "bg-white text-zinc-950 hover:bg-zinc-100 shadow-md"
                }
              `}
            >
              {isSubscribed ? "Inscrito" : "Inscrever-se"}
            </button>
          </div>

          {/* Interaction indicators */}
          <div className="flex items-center gap-2" id="video-action-buttons">
            <div className="flex items-center bg-zinc-900 rounded-full p-0.5 border border-zinc-800">
              {/* Like Button */}
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-l-full hover:bg-zinc-800 transition-colors text-xs font-semibold cursor-pointer
                  ${hasLiked === "like" ? "text-red-500" : "text-zinc-300"}
                `}
                title="Gostei"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked === "like" ? "fill-red-500/20" : ""}`} />
                <span>{selectedVideo.likes + (hasLiked === "like" ? 1 : 0)}</span>
              </button>

              <div className="w-px h-4 bg-zinc-800"></div>

              {/* Dislike button */}
              <button
                onClick={handleDislikeClick}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-r-full hover:bg-zinc-800 transition-colors text-xs font-semibold cursor-pointer
                  ${hasLiked === "dislike" ? "text-red-500" : "text-zinc-400"}
                `}
                title="Não Gostei"
              >
                <ThumbsDown className={`w-3.5 h-3.5 ${hasLiked === "dislike" ? "fill-red-500/20" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => {
                const textToCopy = window.location.href;
                navigator.clipboard.writeText(textToCopy)
                  .then(() => alert("Link copiado para a área de transferência!"))
                  .catch(() => {});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Copiar Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </button>
          </div>
        </div>

        {/* Collapsible video description widget */}
        <div className="mt-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-900 p-4 rounded-xl transition-all">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 font-mono">
            <span>
              {selectedVideo.views >= 1000
                ? `${(selectedVideo.views / 1000).toFixed(0)}mil`
                : selectedVideo.views}{" "}
              visualizações
            </span>
            <span>•</span>
            <span>
              {new Date(selectedVideo.uploadDate).toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[10px]">
              {selectedVideo.category}
            </span>
          </div>

          <p
            className={`text-sm mt-2 text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap
              ${isDescExpanded ? "" : "line-clamp-2"}
            `}
          >
            {selectedVideo.description}
          </p>

          <button
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-500 transition-all mt-3 cursor-pointer select-none"
          >
            {isDescExpanded ? (
              <>
                Mostrar menos <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Mostrar mais <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Comments Panel */}
        <div className="mt-6" id="video-comments-block">
          <h2 className="text-base font-bold font-sans text-white mb-4">
            {selectedVideo.comments.length} Comentários
          </h2>

          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-indigo-600 text-base flex-shrink-0 flex items-center justify-center font-bold">
              <span>{userChannel ? userChannel.avatar : "👤"}</span>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <input
                type="text"
                placeholder={userChannel ? "Adicione um comentário público..." : "Crie um canal na aba 'Canais' para comentar!"}
                disabled={!userChannel}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-transparent text-white py-1.5 text-sm border-b border-zinc-800 focus:outline-none focus:border-red-600 font-sans"
              />
              {commentText.trim() !== "" && (
                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCommentText("")}
                    className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 font-semibold rounded-full text-xs text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Comentar
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Comments List */}
          <div className="flex flex-col gap-4">
            {selectedVideo.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-sm group" id={`comment-${comment.id}`}>
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-base border border-zinc-800 flex-shrink-0">
                  <span>{comment.userAvatar || "👤"}</span>
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">
                      {comment.userName}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm font-sans leading-relaxed">
                    {comment.text}
                  </p>
                </div>

                {/* Option to delete own comment */}
                {(userChannel && comment.userName === userChannel.name) && (
                  <button
                    onClick={() => onDeleteComment(selectedVideo.id, comment.id)}
                    className="p-1 text-zinc-600 hover:text-red-500 rounded-lg hover:bg-zinc-900 transition-colors"
                    title="Excluir comentário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Recommended sidebar */}
      <div className="w-full xl:w-80 flex-shrink-0" id="video-detail-sidebar">
        <h2 className="text-sm font-bold font-sans text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-900 pb-2">
          Recomendados a Seguir
        </h2>

        <div className="flex flex-col gap-4">
          {recommendedVideos.map((video) => {
            const chan = channels.find((c) => c.id === video.channelId);
            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="flex gap-3 cursor-pointer group bg-zinc-950 p-1.5 rounded-lg border border-transparent hover:border-zinc-900 hover:bg-zinc-900/10 transition-all"
                id={`rec-sidebar-card-${video.id}`}
              >
                {/* Micro Thumbnail */}
                <div className="relative w-28 aspect-video bg-zinc-950 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/85 text-[9px] font-mono font-semibold px-1 rounded">
                    {video.duration}
                  </span>
                </div>

                {/* Micro Meta info */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <h3 className="text-xs font-bold font-sans text-zinc-100 group-hover:text-red-500 line-clamp-2 leading-tight transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium text-zinc-400 truncate">
                      {chan?.name || "Canal Removido"}
                    </span>
                    {chan?.verified && (
                      <CheckCircle2 className="w-3 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">
                    {video.views >= 1000 ? `${(video.views/1000).toFixed(0)}mil` : video.views} visualizações
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
