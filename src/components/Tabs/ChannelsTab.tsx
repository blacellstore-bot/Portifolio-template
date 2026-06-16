/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Video as VideoIcon,
  Zap,
  Edit2,
  Tv,
  Check
} from "lucide-react";
import { Channel, Video, Short } from "../../types";
import { APARENCIA_TAGS, ATIVIDADES_TAGS } from "../../tags";

interface ChannelsTabProps {
  channels: Channel[];
  videos: Video[];
  shorts: Short[];
  userChannel: Channel | null;
  selectedChannel: Channel | null;
  onSelectChannel: (chan: Channel | null) => void;
  onSelectVideo: (video: Video) => void;
  onCreateChannelSubmit: (
    name: string,
    handle: string,
    desc: string,
    avatar: string,
    banner: string,
    country?: string,
    language?: string,
    ageRating?: string,
    appearanceTags?: string[],
    activityTags?: string[]
  ) => void;
  onUpdateChannelMeta: (chanId: string, desc: string, banner: string) => void;
}

const GRADIENTS = [
  "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", // Blue
  "linear-gradient(135deg, #78350f 0%, #d97706 100%)", // Orange Amber
  "linear-gradient(135deg, #064e3b 0%, #10b981 100%)", // Green Eco
  "linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)", // Red Warm
  "linear-gradient(135deg, #581c87 0%, #a855f7 100%)", // Purple Wave
  "linear-gradient(135deg, #0f172a 0%, #334155 100%)", // Slate Tech
];

const EMOJIS = ["💻", "🍿", "🍳", "☕", "🌿", "🎮", "🎵", "📷", "💡", "✈️", "🏀", "🎨"];

export const ChannelsTab: React.FC<ChannelsTabProps> = ({
  channels,
  videos,
  shorts,
  userChannel,
  selectedChannel,
  onSelectChannel,
  onSelectVideo,
  onCreateChannelSubmit,
  onUpdateChannelMeta,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [desc, setDesc] = useState("");
  const [avatar, setAvatar] = useState("💻");
  const [banner, setBanner] = useState(GRADIENTS[0]);
 
  // Selected Country, Language & Age tags for channel creation
  const [country, setCountry] = useState("Brasil");
  const [language, setLanguage] = useState("Português");
  const [ageRating, setAgeRating] = useState("Geral");

  // Selection states for custom tags
  const [selectedAppearance, setSelectedAppearance] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string | null>(null);
 
  // Editing profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editBanner, setEditBanner] = useState("");
 
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "" || handle.trim() === "") return;
 
    if (selectedAppearance.length === 0) {
      setTagError("Selecione pelo menos uma tag de Aparência! (Obrigatório) ⚠️");
      return;
    }

    setTagError(null);
    // Standardize handle with prefix @
    const formattedHandle = handle.startsWith("@") ? handle.toLowerCase() : `@${handle.toLowerCase()}`;
 
    onCreateChannelSubmit(
      name, 
      formattedHandle, 
      desc, 
      avatar, 
      banner, 
      country, 
      language, 
      ageRating, 
      selectedAppearance, 
      selectedActivities
    );
 
    // Clear inputs
    setName("");
    setHandle("");
    setDesc("");
    setCountry("Brasil");
    setLanguage("Português");
    setAgeRating("Geral");
    setSelectedAppearance([]);
    setSelectedActivities([]);
    setShowForm(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChannel) return;
    onUpdateChannelMeta(userChannel.id, editDesc, editBanner);
    setIsEditing(false);
    // Refresh selected channel info reference
    if (selectedChannel && selectedChannel.id === userChannel.id) {
      onSelectChannel({
        ...selectedChannel,
        description: editDesc,
        banner: editBanner
      });
    }
  };

  const initEditMode = () => {
    if (!userChannel) return;
    setEditDesc(userChannel.description);
    setEditBanner(userChannel.banner);
    setIsEditing(true);
  };

  // If a channel is selected, display that unique Channel Profile Home
  if (selectedChannel) {
    const channelVideos = videos.filter((v) => v.channelId === selectedChannel.id);
    const channelShorts = shorts.filter((s) => s.channelId === selectedChannel.id);
    const isOwner = userChannel && userChannel.id === selectedChannel.id;

    return (
      <div className="w-full flex flex-col font-sans mb-12 select-none" id="channel-details-wrapper">
        {/* Detail Navbar back pointer */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => onSelectChannel(null)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-950 bg-zinc-50 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
            id="channel-back-catalog-btn"
          >
            ← Voltar para Canais
          </button>
        </div>

        {/* Brand Banner */}
        <div
          style={{ background: selectedChannel.banner }}
          className="w-full h-32 sm:h-44 rounded-2xl relative shadow-sm"
          id="channel-profile-banner"
        >
          {isOwner && (
            <button
              onClick={initEditMode}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white hover:text-yellow-400 rounded-full border border-zinc-800 backdrop-blur-md transition-colors cursor-pointer flex items-center justify-center animate-pulse"
              title="Editar Tema e Canal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Profile Card specs */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-3 sm:px-6 -mt-10 sm:-mt-6 relative z-10 mb-8 pb-6 border-b border-zinc-150">
          {/* Large Avatar container */}
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white hover:scale-105 border-4 border-white rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-xl transition-all">
            <span>{selectedChannel.avatar || "👤"}</span>
          </div>

          <div className="flex-1 flex flex-col gap-1 sm:pt-11">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold font-sans text-zinc-900 tracking-tight">
                {selectedChannel.name}
              </h1>
              {selectedChannel.verified && (
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 fill-blue-500/10" />
              )}
              {isOwner && (
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold px-2 py-0.5 bg-red-50 text-red-650 rounded border border-red-200">
                  Meu Canal
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono flex-wrap">
              <span className="font-sans font-bold text-zinc-700">{selectedChannel.handle}</span>
              <span>•</span>
              <span>
                {selectedChannel.subscribers >= 1000
                  ? `${(selectedChannel.subscribers / 1000).toFixed(0)}mil`
                  : selectedChannel.subscribers}{" "}
                inscritos
              </span>
              <span>•</span>
              <span>{channelVideos.length} vídeos</span>
            </div>

            <p className="text-sm text-zinc-600 line-clamp-2 max-w-2xl mt-1.5 leading-relaxed font-sans font-medium">
              {selectedChannel.description}
            </p>

            {/* Display custom Appearance and Activity tags if present on the channel */}
            {((selectedChannel.appearanceTags && selectedChannel.appearanceTags.length > 0) || 
              (selectedChannel.activityTags && selectedChannel.activityTags.length > 0)) && (
              <div className="flex flex-col gap-3 mt-4 max-w-2xl border-t border-zinc-100 pt-3">
                {selectedChannel.appearanceTags && selectedChannel.appearanceTags.length > 0 && (
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-red-600 font-sans bg-red-50 px-2 py-0.5 rounded">
                        Aparência
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedChannel.appearanceTags.map((t) => (
                        <span key={t} className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border border-zinc-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedChannel.activityTags && selectedChannel.activityTags.length > 0 && (
                  <div className="flex flex-col gap-1.5 text-left mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-600 font-sans bg-zinc-100 px-2 py-0.5 rounded">
                        Atividades mediante solicitação
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedChannel.activityTags.map((t) => (
                        <span key={t} className="text-[11px] bg-zinc-900 text-zinc-50 hover:bg-zinc-850 px-2.5 py-1 rounded-b-md rounded-t-sm font-bold transition-all cursor-pointer border border-zinc-950">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Customize Channel Metadata floating Form inline */}
        {isEditing && (
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 mb-6 max-w-xl self-start w-full shadow-sm animate-fade-in">
            <h3 className="text-xs sm:text-sm font-bold font-sans text-zinc-800 uppercase tracking-wider mb-4">
              Personalizar Canal
            </h3>
            <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 font-sans font-medium">Descrição do Canal</label>
                <textarea
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="bg-white text-xs sm:text-sm text-zinc-900 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-red-650 h-20 font-sans"
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 font-sans font-medium">Escolha a cor do Banner</label>
                <div className="grid grid-cols-6 gap-2">
                  {GRADIENTS.map((g) => (
                    <div
                      key={g}
                      onClick={() => setEditBanner(g)}
                      style={{ background: g }}
                      className={`h-7 rounded-sm cursor-pointer border flex items-center justify-center
                        ${editBanner === g ? "border-zinc-900 scale-105" : "border-transparent opacity-80 hover:opacity-100"}
                      `}
                    >
                      {editBanner === g && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-zinc-550 hover:text-zinc-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-650 hover:bg-red-600 rounded-full text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Salvar Mudanças
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Channel Video & Shorts feed layout tab blocks */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold font-sans text-zinc-500 uppercase tracking-wider border-b border-zinc-150 pb-2 flex items-center gap-2">
            <VideoIcon className="w-4 h-4 text-red-500" /> Publicações do Canal
          </h2>

          {/* Videos Grid */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-sans text-zinc-400 font-bold uppercase tracking-widest mb-3">Vídeos Longos ({channelVideos.length})</h3>
              {channelVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {channelVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => onSelectVideo(video)}
                      className="group flex flex-col gap-2.5 cursor-pointer bg-white p-2 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 shadow-xs transition-all duration-200"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] font-mono font-semibold px-1 rounded text-white px-1.5 py-0.5">
                          {video.duration}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold leading-tight font-sans text-zinc-900 group-hover:text-red-650 line-clamp-2 transition-colors">
                        {video.title}
                      </h4>
                      <div className="flex gap-1.5 text-[10px] font-mono text-zinc-500">
                        <span>{video.views >= 1000 ? `${(video.views / 1000).toFixed(0)}mil` : video.views} views</span>
                        <span>•</span>
                        <span>{new Date(video.uploadDate).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-sans italic py-4">Este canal ainda não possui vídeos de formato horizontal.</p>
              )}
            </div>

            {/* Shorts Segment */}
            <div className="mt-4">
              <h3 className="text-xs font-sans text-zinc-500 font-bold uppercase tracking-widest mb-3">Vídeos Curtos / Shorts ({channelShorts.length})</h3>
              {channelShorts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {channelShorts.map((short) => (
                    <div
                      key={short.id}
                      className="group aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden relative cursor-pointer border border-zinc-200 hover:border-red-600/30 transition-all p-1"
                    >
                      <video
                        src={short.videoUrl}
                        className="w-full h-full object-cover rounded-lg"
                        muted
                        playsInline
                      />
                      {/* Interactive overlay info */}
                      <div className="absolute inset-x-2 bottom-2 bg-black/60 border border-zinc-950 backdrop-blur-xs p-2 rounded-lg z-10">
                        <h4 className="text-[11px] font-bold text-zinc-100 line-clamp-2 font-sans">{short.title}</h4>
                        <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">{short.likes} curtidas</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-sans italic py-4">Estes canais ainda não publicaram nenhum Short vertical.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic channel directory listing view
  return (
    <div className="w-full flex flex-col gap-6" id="canais-directory-panel">
      {/* Promotion bar for channel creator flow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-150 shadow-xs">
        <div className="flex flex-col">
          <h2 className="text-sm font-sans font-bold text-zinc-700 uppercase tracking-widest">
            Comunidade de Criadores
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Explore mentes incríveis publicando diariamente ou crie sua própria marca em poucos segundos.
          </p>
        </div>

        {userChannel ? (
          <button
            onClick={() => onSelectChannel(userChannel)}
            className="flex items-center gap-2 px-4.5 py-2 bg-white hover:bg-zinc-105 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-950 text-xs font-bold font-sans rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
            id="channels-btn-view-my-channel"
          >
            Acessar Meu Canal <ChevronRight className="w-4 h-4 text-red-500" />
          </button>
        ) : (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-sans rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
            id="channels-btn-trigger-signup"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse animate-pulse" /> Criar Meu Canal
          </button>
        )}
      </div>

      {/* Creation form modal block */}
      {showForm && (
        <div className="bg-white border border-zinc-200 p-5 sm:p-7 rounded-2xl max-w-4xl w-full shadow-xl" id="create-channel-form-element">
          <h3 className="text-sm font-bold font-sans text-zinc-950 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
            🎙️ Formulário de Candidatura a Criador de Conteúdo e Tags
          </h3>

          {tagError && (
            <div className="text-xs bg-red-50 text-red-650 p-3 rounded-lg border border-red-200 font-extrabold flex items-center gap-2 mb-4 animate-bounce">
              <span>⚠️</span>
              <span>{tagError}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6">
            {/* Secção 1: Dados Gerais do Canal */}
            <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-150">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-3 font-sans">
                Identificação e Audiência
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs text-zinc-600 font-sans font-bold">Nome de Exibição</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vida Selvagem Tours"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white border border-zinc-200 text-xs text-zinc-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-red-650 focus:bg-white font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs text-zinc-600 font-sans font-bold">Identificador Único</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: @vidadeselvagem"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="bg-white border border-zinc-200 text-xs text-zinc-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-red-650 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left mt-3">
                <label className="text-xs text-zinc-600 font-sans font-bold">Descrição de Apresentação</label>
                <textarea
                  placeholder="Conte sobre os temas do seu canal, frequência de uploads e o que esperar dos seus conteúdos..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="bg-white border border-zinc-200 text-xs text-zinc-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-red-625 focus:bg-white h-16 resize-none font-medium"
                ></textarea>
              </div>

              {/* Country, Language & Age Rating Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500 font-sans font-semibold">País do Canal</label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (e.target.value === "Brasil" || e.target.value === "Portugal" || e.target.value === "Angola") {
                        setLanguage("Português");
                      } else if (e.target.value === "EUA") {
                        setLanguage("Inglês");
                      } else if (e.target.value === "Espanha") {
                        setLanguage("Espanhol");
                      }
                    }}
                    className="bg-white border border-zinc-200 text-xs text-zinc-800 px-2.5 py-2 rounded-lg focus:outline-none focus:border-red-650 cursor-pointer"
                  >
                    <option value="Brasil">🇧🇷 Brasil</option>
                    <option value="Portugal">🇵🇹 Portugal</option>
                    <option value="EUA">🇺🇸 EUA</option>
                    <option value="Angola">🇦🇴 Angola</option>
                    <option value="Espanha">🇪🇸 Espanha</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500 font-sans font-semibold">Idioma Principal</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white border border-zinc-200 text-xs text-zinc-800 px-2.5 py-2 rounded-lg focus:outline-none focus:border-red-650 cursor-pointer"
                  >
                    <option value="Português">Português (PT)</option>
                    <option value="Inglês">Inglês (EN)</option>
                    <option value="Espanhol">Espanhol (ES)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500 font-sans font-semibold">Classificação</label>
                  <select
                    value={ageRating}
                    onChange={(e) => setAgeRating(e.target.value)}
                    className="bg-white border border-zinc-200 text-xs text-zinc-800 px-2.5 py-2 rounded-lg focus:outline-none focus:border-red-650 cursor-pointer font-sans"
                  >
                    <option value="Geral">🌐 Conteúdo Geral</option>
                    <option value="Conteúdo Adulto">🔞 Conteúdo Adulto (18+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Secção 2: Aparência (OBRIGATÓRIO) */}
            <div className={`p-4 rounded-xl border border-dashed transition-all ${selectedAppearance.length === 0 ? "bg-red-50/20 border-red-300" : "bg-zinc-50/50 border-zinc-200"}`}>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex flex-col text-left">
                  <span className="text-[12px] uppercase font-extrabold tracking-widest text-zinc-900 font-sans">
                    Aparência <span className="text-red-600 text-sm font-black">*</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">
                    Selecione as tags de aparência física para prosseguir (Obrigatório selecionar ao menos uma)
                  </span>
                </div>
                <span className={`text-[9px] px-2.5 py-1 rounded font-extrabold uppercase tracking-widest border ${selectedAppearance.length === 0 ? "bg-red-100 text-red-650 border-red-300 animate-pulse" : "bg-green-100 text-green-700 border-green-300"}`}>
                  {selectedAppearance.length === 0 ? "Obrigatório" : `${selectedAppearance.length} selecionadas`}
                </span>
              </div>

              <div className="flex flex-col gap-4 text-left">
                {Object.entries(APARENCIA_TAGS).map(([groupName, tagList]) => (
                  <div key={groupName} className="border-b border-zinc-100 last:border-none pb-3 last:pb-0">
                    <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                      {groupName}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tagList.map((tag) => {
                        const isChosen = selectedAppearance.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => {
                              setSelectedAppearance((prev) =>
                                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                              );
                              setTagError(null);
                            }}
                            className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all border font-sans font-semibold active:scale-95
                              ${isChosen 
                                ? "bg-red-650 border-red-700 text-white shadow-xs font-bold" 
                                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                              }
                            `}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secção 3: Atividades mediante solicitação (OPCIONAL) */}
            <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-150">
              <div className="flex flex-col mb-3 text-left">
                <span className="text-[12px] uppercase font-bold tracking-widest text-zinc-800 font-sans">
                  Atividades mediante solicitação
                </span>
                <span className="text-[10px] text-zinc-500 mt-0.5">
                  Assinale os tipos de ações ou dispositivos sob encomenda habilitados para este perfil de criador
                </span>
              </div>

              <div className="flex flex-col gap-4 text-left">
                {Object.entries(ATIVIDADES_TAGS).map(([groupName, tagList]) => (
                  <div key={groupName} className="border-b border-zinc-100 last:border-none pb-3 last:pb-0">
                    <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                      {groupName}
                    </span>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-zinc-150 rounded-lg max-h-36 overflow-y-auto">
                      {tagList.map((tag) => {
                        const isChosen = selectedActivities.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => {
                              setSelectedActivities((prev) =>
                                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={`px-2.5 py-1 text-[11px] rounded transition-all border font-semibold active:scale-95 cursor-pointer
                              ${isChosen 
                                ? "bg-zinc-900 border-zinc-950 text-white font-bold" 
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300"
                              }
                            `}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection loops */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-4 bg-zinc-50/40 rounded-xl border border-zinc-150">
              <div>
                <label className="text-xs text-zinc-500 font-sans font-semibold block mb-2">Avatar Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setAvatar(e)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border hover:bg-zinc-100 cursor-pointer transition-colors
                        ${avatar === e ? "border-red-650 bg-red-50" : "border-zinc-200 bg-white"}
                      `}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-sans font-semibold block mb-2">Banner Padrão</label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENTS.map((g, idx) => (
                    <div
                      key={idx}
                      onClick={() => setBanner(g)}
                      style={{ background: g }}
                      className={`h-7 rounded-sm border cursor-pointer flex justify-center items-center transition-all
                        ${banner === g ? "border-zinc-900 scale-[1.04]" : "border-transparent opacity-85"}
                      `}
                    >
                      {banner === g && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-150 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-650 hover:bg-red-600 rounded-lg font-bold text-xs text-white transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Criar Canal e Iniciar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid listing index directories */}
      {channels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="channels-main-grid-index">
          {channels.map((chan) => {
            const chanVideoCount = videos.filter((v) => v.channelId === chan.id).length;
            return (
              <div
                key={chan.id}
                onClick={() => onSelectChannel(chan)}
                className="group flex flex-col items-center justify-center p-6 bg-white border border-zinc-150 rounded-2xl hover:border-zinc-350 hover:bg-zinc-50/40 hover:shadow-xs transition-all text-center cursor-pointer"
                id={`channel-directory-card-${chan.id}`}
              >
                {/* Profile Bubble */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-xs group-hover:scale-105 transition-transform mb-4">
                  <span>{chan.avatar || "👤"}</span>
                </div>

                {/* Title & badge */}
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-bold font-sans text-zinc-900 group-hover:text-red-650 transition-colors truncate max-w-[130px]">
                    {chan.name}
                  </h3>
                  {chan.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>

                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-widest mt-1">
                  {chan.handle}
                </span>

                {/* Localized Country & Age Classification Badges */}
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap justify-center">
                  <span className="text-[9px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <span>
                      {chan.country === "Brasil" ? "🇧🇷" : 
                       chan.country === "Portugal" ? "🇵🇹" : 
                       chan.country === "EUA" ? "🇺🇸" : 
                       chan.country === "Angola" ? "🇦🇴" : 
                       chan.country === "Espanha" ? "🇪🇸" : "🌐"}
                    </span>
                    <span>{chan.country || "Brasil"}</span>
                  </span>
                  
                  {chan.ageRating === "Conteúdo Adulto" ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border bg-red-50 text-red-650 border-red-200">
                      🔞 Adulto (18+)
                    </span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide border bg-zinc-50 text-zinc-500 border-zinc-200">
                      🌐 Geral
                    </span>
                  )}
                </div>

                {/* Micro capsule preview of custom Appearance tags */}
                {chan.appearanceTags && chan.appearanceTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mt-2 max-w-[210px]">
                    {chan.appearanceTags.slice(0, 4).map((t) => (
                      <span key={t} className="text-[9px] bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                    {chan.appearanceTags.length > 4 && (
                      <span className="text-[9px] bg-red-50 text-red-600 px-1 py-0.5 rounded font-extrabold uppercase">
                        +{chan.appearanceTags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-[11px] font-sans text-zinc-500 line-clamp-2 mt-2 leading-relaxed min-h-[32px]">
                  {chan.description}
                </p>

                {/* Statistics counter footer bar */}
                <div className="w-full border-t border-zinc-150 pt-3 mt-4 flex items-center justify-around font-mono text-[10px] text-zinc-400">
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-zinc-800">
                      {chan.subscribers >= 1000
                        ? `${(chan.subscribers / 1000).toFixed(0)}k`
                        : chan.subscribers}
                    </span>
                    <span>Inscritos</span>
                  </div>
                  <div className="w-px h-5 bg-zinc-200"></div>
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-zinc-800">{chanVideoCount}</span>
                    <span>Vídeos</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl bg-zinc-50 border border-zinc-150" id="channels-empty-directory">
          <Users className="w-10 h-10 text-zinc-400 mb-3" />
          <h3 className="text-sm font-bold font-sans text-zinc-700">Comunidade em crescimento</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            Nenhum canal público foi criado na plataforma até o instante. Seja o(a) primeiro(a) a estabelecer um canal informativo!
          </p>
        </div>
      )}
    </div>
  );
};
