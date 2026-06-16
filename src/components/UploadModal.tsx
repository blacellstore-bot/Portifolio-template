/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, UploadCloud, Film, Image, Sparkles } from "lucide-react";
import { Channel } from "../types";

interface UploadModalProps {
  onClose: () => void;
  userChannel: Channel;
  onPublishVideo: (
    title: string,
    desc: string,
    videoUrl: string,
    thumbnailUrl: string,
    category: string,
    duration: string,
    isShort: boolean
  ) => void;
}

const CATEGORIES = ["Tecnologia", "Música", "Culinária", "Viagem & Natureza"];

export const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  userChannel,
  onPublishVideo,
}) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<"video" | "short">("video");
  const [category, setCategory] = useState("Tecnologia");
  const [duration, setDuration] = useState("03:45");

  // Local object URLs for real files
  const [videoFileUrl, setVideoFileUrl] = useState("");
  const [thumbFileUrl, setThumbFileUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setVideoFileUrl(objUrl);
    }
  };

  const handleThumbFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setThumbFileUrl(objUrl);
    }
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === "") return;

    setIsPublishing(true);

    // Fallbacks if no local file was loaded (using premium royalty free templates)
    const finalVideoUrl =
      videoFileUrl ||
      (type === "video"
        ? "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-developer-typing-on-a-keyboard-40314-large.mp4"
        : "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-thick-green-forest-42202-large.mp4");

    const finalThumbUrl =
      thumbFileUrl ||
      (category === "Música"
        ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80"
        : category === "Culinária"
        ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
        : category === "Viagem & Natureza"
        ? "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=80"); // Tech

    setTimeout(() => {
      onPublishVideo(
        title,
        desc,
        finalVideoUrl,
        finalThumbUrl,
        category,
        duration,
        type === "short"
      );
      setIsPublishing(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans select-none animate-fade-in" id="upload-modal-overlay">
      <div className="bg-black border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl relative" id="upload-modal-form-box">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
          title="Fecar Formulário"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form Body Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900 rounded-t-3xl">
          <div className="w-8 h-8 bg-red-650/10 rounded-lg flex items-center justify-center border border-red-500/20 text-red-500">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-100 uppercase tracking-wider">
              Central do Criador - Novinhas Brasileiras
            </h2>
            <span className="text-[10px] text-zinc-500 font-mono block">
              Iniciado sob canal: {userChannel.name} {userChannel.handle}
            </span>
          </div>
        </div>

        {/* Content Form submission */}
        <form onSubmit={handlePublishSubmit} className="p-6 flex flex-col gap-5 text-left">
          {/* Format Selection slider tab */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-bold font-sans">
              Formato de Publicação
            </label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setType("video")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer
                  ${type === "video"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-50 bg-transparent"
                  }
                `}
              >
                Vídeo Horizontal Longo
              </button>
              <button
                type="button"
                onClick={() => setType("short")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer
                  ${type === "short"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-50 bg-transparent"
                  }
                `}
              >
                Short Vertical Rápido
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-bold">Título de Apresentação</label>
            <input
              type="text"
              required
              placeholder={type === "video" ? "Diga o tema principal do seu vídeo longo..." : "Hashtags ajudam a impulsionar seu short #tutorial #dev"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-zinc-100 px-3 py-2 rounded-xl focus:outline-none focus:border-red-650 focus:bg-zinc-800 transition-colors"
            />
          </div>

          {type === "video" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold">Descrição do Conteúdo</label>
              <textarea
                placeholder="Introduza os pontos chaves do seu vídeo de formato longo..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-zinc-100 px-3 py-2 rounded-xl focus:outline-none focus:border-red-650 focus:bg-zinc-800 h-20 resize-none font-sans transition-colors"
              ></textarea>
            </div>
          )}

          {/* Interactive Upload Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Horizontal or Vertical Video Selection loader */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-400 font-bold">Carregar Arquivo Mp4</span>
              <label className="flex flex-col items-center justify-center h-28 bg-zinc-900 hover:bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-red-650/30 rounded-2xl cursor-pointer transition-colors p-4 text-center relative overflow-hidden group">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
                {videoFileUrl ? (
                  <div className="flex flex-col items-center gap-1">
                    <Film className="w-6 h-6 text-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold truncate max-w-[150px]">
                      Vídeo Pronto!
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono">Toque para substituir</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-zinc-500">
                    <UploadCloud className="w-7 h-7 text-zinc-450 group-hover:text-red-500 transition-colors" />
                    <span className="text-[10px] font-sans font-bold">Importar Vídeo</span>
                    <span className="text-[8px] text-zinc-500 font-mono">Formatos suportados: mp4, webm</span>
                  </div>
                )}
              </label>
            </div>

            {/* Thumbnail selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-400 font-bold">Miniatura / Capa (Thumbnail)</span>
              <label className="flex flex-col items-center justify-center h-28 bg-zinc-900 hover:bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-red-655/30 rounded-2xl cursor-pointer transition-colors p-4 text-center relative overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbFileChange}
                  className="hidden"
                />
                {thumbFileUrl ? (
                  <div className="absolute inset-0">
                    <img
                      src={thumbFileUrl}
                      alt="Thumbnail Carregada"
                      className="w-full h-full object-cover blur-xs opacity-70"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Image className="w-5 h-5 text-white filter drop-shadow animate-ping" />
                      <span className="text-[10px] font-bold text-white drop-shadow mt-1">
                        Capa Ativa!
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-zinc-500">
                    <Image className="w-7 h-7 text-zinc-455 group-hover:text-red-500 transition-colors" />
                    <span className="text-[10px] font-sans font-bold">Importar Thumbnail</span>
                    <span className="text-[8px] text-zinc-500 font-mono">Formatos: jpg, png, webp</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Secondary Details inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded-xl px-3 py-2 focus:outline-none focus:border-red-650 focus:bg-zinc-800 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold">Duração Estimada</label>
              <input
                type="text"
                required
                placeholder="Ex: 08:34"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 font-mono text-center text-xs text-zinc-100 px-3 py-2 rounded-xl focus:outline-none focus:border-red-650 focus:bg-zinc-800"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-40 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              {isPublishing ? "Publicando..." : "Publicar no Feed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
