/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Users,
  Send,
  Zap,
  CheckCircle2,
  Video,
  VideoOff,
  Sparkles,
  ArrowLeft,
  Tv,
  Gamepad,
  Music,
  Tags,
  X,
  SlidersHorizontal
} from "lucide-react";
import { LiveStream, Channel, ChatMessage } from "../../types";
import { APARENCIA_TAGS, ATIVIDADES_TAGS } from "../../tags";

interface LiveTabProps {
  lives: LiveStream[];
  channels: Channel[];
  userChannel: Channel | null;
  onGoLive: (title: string, category: string) => LiveStream;
  onEndLive: (streamId: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  selectedTagType: "aparencia" | "atividades" | null;
  setSelectedTagType: (type: "aparencia" | "atividades" | null) => void;
  showTagExplorer: boolean;
  setShowTagExplorer: (val: boolean) => void;
}

const CHAT_TEMPLATES = [
  "Manda salve pra galera de SP! 🔥",
  "Nossa mano, esse site ficou sensacional de rápido",
  "Alguém aí programando a essa hora?",
  "Curvatura desse monitor que você mostrou é braba",
  "Caraca, que lofi gostosa de ouvir de fundo",
  "Qual teclado é esse da live?? 👀",
  "Adoro as ondas desse mar, transmite muita paz",
  "Essa receita de hambúrguer de hoje me deu muita fome",
  "Que transmissão insana!",
  "Estou assistindo no trabalho de fininho kkkkk",
  "Salve salve de Curitiba!",
  "Top de verdade! Parabéns",
  "Aulas de front-end, sério",
  "Luzes retro incríveis de sintetizador 🙌",
  "Se inscrevam no canal galera, o conteúdo é firme",
  "Cadê o link do repositório no Github?",
];

const CHAT_USERS = [
  { name: "DevGamer", avatar: "🎮" },
  { name: "Carla_Reis", avatar: "👩‍💼" },
  { name: "Felipe_Code", avatar: "💻" },
  { name: "AnaGourmet", avatar: "🍳" },
  { name: "EcoLucas", avatar: "🌿" },
  { name: "BateraBeat", avatar: "🥁" },
  { name: "Alek_Developer", avatar: "🧙‍♂️" },
  { name: "BrunaLins", avatar: "✨" },
];

export const LiveTab: React.FC<LiveTabProps> = ({
  lives,
  channels,
  userChannel,
  onGoLive,
  onEndLive,
  selectedTag,
  setSelectedTag,
  selectedTagType,
  setSelectedTagType,
  showTagExplorer,
  setShowTagExplorer,
}) => {
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [numViewers, setNumViewers] = useState(0);

  // Compute active & filtered live streams according to category tag criteria
  const activeAndFilteredLives = lives
    .filter((str) => str.isLive)
    .filter((str) => {
      if (!selectedTag) return true;
      const ch = channels.find((c) => c.id === str.channelId);
      if (!ch) return false;

      if (selectedTagType === "aparencia") {
        return ch.appearanceTags?.includes(selectedTag) || false;
      }
      if (selectedTagType === "atividades") {
        return ch.activityTags?.includes(selectedTag) || false;
      }
      return (
        ch.appearanceTags?.includes(selectedTag) ||
        ch.activityTags?.includes(selectedTag) ||
        false
      );
    });

  // Custom user broadcasting credentials
  const [newStreamTitle, setNewStreamTitle] = useState("");
  const [newStreamCategory, setNewStreamCategory] = useState("Tecnologia");
  const [showCreateStream, setShowCreateStream] = useState(false);

  // Web camera refs
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  // Handle periodic new chat message generation
  useEffect(() => {
    if (!activeStream) return;

    // Prepopulate first messages
    setChatMessages([
      {
        id: "chat_init_1",
        userName: "Mod_Geral",
        userAvatar: "🛡️",
        text: "Bem-vindo ao chat ao vivo! Respeite as regras da comunidade.",
        timestamp: "1m atrás",
        isModerator: true,
      },
    ]);

    // Set stable viewers
    setNumViewers(activeStream.viewerCount);

    const interval = setInterval(() => {
      // Pick random user
      const user = CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)];
      // Pick random text
      const msgText = CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];

      const newMsg: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random()}`,
        userName: user.name,
        userAvatar: user.avatar,
        text: msgText,
        timestamp: "Agora",
      };

      setChatMessages((prev) => [...prev.slice(-30), newMsg]); // Keep last 30 messages

      // Fluctuate viewers
      setNumViewers((prev) => Math.floor(prev * (0.95 + Math.random() * 0.1)));
    }, 2800);

    return () => clearInterval(interval);
  }, [activeStream]);

  // Clean webcam on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360 },
        audio: false,
      });
      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play().catch(() => {});
      }
      setWebcamActive(true);
    } catch (err) {
      console.warn("Camera access denied or unavailable, using retro simulation.", err);
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    setWebcamActive(false);
  };

  const handleStartCustomStreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChannel) return;
    if (newStreamTitle.trim() === "") return;

    // Trigger webcam setup
    await startWebcam();

    // Create stream
    const created = onGoLive(newStreamTitle, newStreamCategory);
    setActiveStream(created);
    setIsBroadcasting(true);
    setShowCreateStream(false);
  };

  const handleEndBroadcast = () => {
    if (activeStream) {
      onEndLive(activeStream.id);
      stopWebcam();
      setActiveStream(null);
      setIsBroadcasting(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    const userMsg: ChatMessage = {
      id: `chat_user_${Date.now()}`,
      userName: userChannel ? userChannel.name : "Visitante",
      userAvatar: userChannel ? userChannel.avatar : "💬",
      text: inputText,
      timestamp: "Agora",
      isCreator: isBroadcasting, // Highlighted text if they are streaming
      color: "text-red-500",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");
  };

  // Chat scroll anchor
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const activeChannel = activeStream
    ? channels.find((c) => c.id === activeStream.channelId)
    : null;

  return (
    <div className="w-full pb-16" id="live-tab-container">
      {/* 1. Streaming theater screen is active */}
      {activeStream ? (
        <div className="flex flex-col lg:flex-row gap-5 items-stretch h-auto" id="live-theater-block">
          {/* Main Broadcast panel */}
          <div className="flex-1 flex flex-col min-w-0" id="live-stream-panel">
            {/* Header info bar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150 mb-3.5">
              <button
                onClick={() => {
                  if (isBroadcasting) {
                    if (confirm("Deseja realmente encerrar sua transmissão ao vivo?")) {
                      handleEndBroadcast();
                    }
                  } else {
                    setActiveStream(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-zinc-200"
                id="live-back-button"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
              </button>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full text-xs font-extrabold animate-pulse">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> AO VIVO
                </span>
                <span className="flex items-center gap-1.5 bg-zinc-50 text-zinc-650 px-2.5 py-1 rounded-full text-xs font-mono font-bold border border-zinc-200">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />{" "}
                  {numViewers >= 1000
                    ? `${(numViewers / 1000).toFixed(1)}mil`
                    : numViewers}{" "}
                  espectadores
                </span>
              </div>
            </div>

            {/* Video container screen: WebCam feed (for broadcasting) or looping background */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-200 shadow flex items-center justify-center">
              {isBroadcasting ? (
                /* BROADCASTING CANVAS / CAMERA */
                webcamActive ? (
                  <video
                    ref={webcamVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Cool abstract animated coding representation */
                  <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden text-center p-6">
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-red-600/10 to-transparent"></div>
                    <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center border border-red-500/20 mb-4 animate-pulse">
                      <Zap className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-base font-bold font-sans text-red-500 tracking-wide uppercase">
                      Transmissão de Código Ativa
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm mt-1">
                      Câmera desativada ou recusada. Transmitindo fluxo de dados retro futurista direto no feed dos servidores.
                    </p>
                    {/* Retro matrix falling effect mock snippet */}
                    <div className="font-mono text-[10px] text-zinc-700/80 mt-5 w-full max-w-xs text-left bg-zinc-900/40 p-3 rounded-lg border border-zinc-900 overflow-hidden line-clamp-3 select-none">
                      {`import AppConfig from 'app-config';\nconst stream = AppConfig.createStream();\nstream.broadcast({ category: '${newStreamCategory}' });`}
                    </div>
                  </div>
                )
              ) : (
                /* VIEWER VIDEOLOOP */
                <video
                  src={activeStream.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}

              {/* Holographic overlay */}
              <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-black/65 backdrop-blur-md border border-zinc-850 text-[10px] uppercase font-mono tracking-widest rounded flex items-center gap-1.5 text-zinc-200">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span> Feed Principal
              </div>
            </div>

            {/* Bottom Stream Info Card */}
            <h1 className="text-base sm:text-lg font-extrabold font-sans text-zinc-900 tracking-tight mt-4 leading-snug">
              {activeStream.title}
            </h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-lg select-none border border-zinc-200">
                <span>{activeChannel?.avatar || "👤"}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold font-sans text-zinc-900">
                    {activeChannel?.name || "Criador"}
                  </span>
                  {activeChannel?.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Categoria: <span className="text-zinc-650 font-sans font-semibold">{activeStream.category}</span>
                </span>
              </div>

              {isBroadcasting && (
                <button
                  onClick={handleEndBroadcast}
                  className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full text-xs font-bold font-sans text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Encerrar Live
                </button>
              )}
            </div>
          </div>

          {/* Interactive Live Chat panel */}
          <div className="w-full lg:w-80 bg-white rounded-2xl border border-zinc-200 flex flex-col justify-between overflow-hidden h-[420px] lg:h-auto min-h-[400px]" id="live-chat-panel">
            {/* Header banner */}
            <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-150 flex items-center justify-between">
              <span className="text-xs font-bold font-sans text-zinc-700 uppercase tracking-widest">
                Chat da Transmissão
              </span>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 select-text select-none scrollbar-thin">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] flex items-center justify-center flex-shrink-0">
                    <span>{msg.userAvatar || "👤"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`font-semibold text-[10px] truncate
                          ${msg.isCreator ? "text-red-650 font-bold" : "text-zinc-705"}
                        `}
                      >
                        {msg.userName}
                      </span>
                      {msg.isModerator && (
                        <span className="text-[8px] bg-emerald-50 border border-emerald-200 text-emerald-600 px-1 py-0.2 rounded uppercase font-mono font-bold">
                          Mod
                        </span>
                      )}
                      {msg.isCreator && (
                        <span className="text-[8px] bg-red-50 border border-red-200 text-red-600 px-1 py-0.2 rounded uppercase font-mono font-bold">
                          Canal
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 font-sans break-words">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat sender inputs */}
            <form onSubmit={handleSendMessage} className="bg-zinc-50 p-3 flex gap-2 border-t border-zinc-150">
              <input
                type="text"
                placeholder={userChannel ? "Diga algo no chat..." : "Apenas canais podem interagir..."}
                disabled={!userChannel}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white border border-zinc-200 text-xs text-zinc-900 rounded-full px-3.5 py-2 focus:outline-none focus:border-red-650 font-sans shadow-inner"
              />
              <button
                type="submit"
                disabled={!userChannel || inputText.trim() === ""}
                className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* 2. Main Lives List view layout */
        <div className="flex flex-col gap-6" id="live-panel-grid">
          {/* Header block with Go Live triggers */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-5 rounded-2xl border border-zinc-150 shadow-xs">
            <div className="flex flex-col">
              <h2 className="text-sm font-sans text-zinc-700 font-bold uppercase tracking-widest">
                Transmissões em Tempo Real
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Assista a criadores em tempo real ou ligue sua própria câmera para iniciar seu programa com tags de conteúdo!
              </p>
            </div>

            {userChannel ? (
              <button
                onClick={() => setShowCreateStream(true)}
                className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-red-650 hover:bg-red-600 rounded-full text-xs font-bold font-sans text-white shadow-sm active:scale-95 transition-all cursor-pointer select-none"
                id="live-btn-go-live"
              >
                <Radio className="w-3.5 h-3.5" /> Transmitir Ao Vivo
              </button>
            ) : (
              <div className="text-xs text-yellow-800 font-bold font-sans border border-yellow-250 bg-yellow-50 px-4 py-2.5 rounded-xl">
                ⚠️ Crie um canal na página <b>Canais</b> para poder abrir lives!
              </div>
            )}
          </div>

          {/* Form Modal to go live */}
          {showCreateStream && (
            <div className="bg-white border border-zinc-200 p-5 rounded-2xl max-w-md shadow-xl" id="create-stream-modal">
              <h3 className="text-sm font-bold font-sans text-zinc-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" /> Configurar Transmissão
              </h3>

              <form onSubmit={handleStartCustomStreamSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs text-zinc-500 font-sans font-semibold">
                    Título do seu Programa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jogando Indie Retro RPG ou Desenvolvendo Interfaces!"
                    value={newStreamTitle}
                    onChange={(e) => setNewStreamTitle(e.target.value)}
                    className="bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 rounded-lg px-3 py-2 focus:outline-none focus:border-red-650 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs text-zinc-500 font-sans font-semibold">
                    Selecione a Categoria
                  </label>
                  <select
                    value={newStreamCategory}
                    onChange={(e) => setNewStreamCategory(e.target.value)}
                    className="bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 rounded-lg px-3 py-2 focus:outline-none focus:border-red-650 focus:bg-white"
                  >
                    <option value="Tecnologia">Tecnologia & Programação</option>
                    <option value="Música">Música & Beats</option>
                    <option value="Jogos">Jogos Eletrônicos</option>
                    <option value="Culinária">Culinária & Cozinha</option>
                  </select>
                </div>

                <div className="flex gap-2.5 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateStream(false)}
                    className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-red-650 hover:bg-red-600 rounded-full text-xs font-bold text-white transition-all active:scale-95 cursor-pointer"
                  >
                    Iniciar Transmissão
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Premium Tag Category Filter Ribbon and Explorer */}
          <div className="flex flex-col gap-4 bg-white border border-zinc-250 p-4.5 rounded-2xl shadow-xs text-left">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTagExplorer(!showTagExplorer)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold tracking-wide transition-all select-none shadow-xs active:scale-95 cursor-pointer
                    ${showTagExplorer 
                      ? "bg-red-650 border-red-700 text-white hover:bg-red-600" 
                      : "bg-zinc-900 border-zinc-950 text-white hover:bg-zinc-800"
                    }`}
                >
                  <Tags className="w-4 h-4 text-red-400" />
                  Todas as Categorias
                </button>

                {selectedTag && (
                  <span className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                    Filtro ativo: <span className="font-extrabold uppercase text-red-800">#{selectedTag}</span>
                    <button 
                      onClick={() => {
                        setSelectedTag(null);
                        setSelectedTagType(null);
                      }}
                      className="hover:text-red-950 p-0.5 ml-1 bg-red-100 hover:bg-red-200 rounded-full transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Limpar filtro"
                    >
                      <X className="w-3 h-3 shrink-0" />
                    </button>
                  </span>
                )}
              </div>

              {/* Quick shortcut tags for immediate exploration */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Pesquisas rápidas:</span>
                <div className="flex flex-wrap gap-1">
                  {["Latina", "Morenas", "Loiro", "Dança erótica", "Masturbação", "Lovense"].map((fastTag) => {
                    const isChosen = selectedTag === fastTag;
                    return (
                      <button
                        key={fastTag}
                        onClick={() => {
                          if (isChosen) {
                            setSelectedTag(null);
                            setSelectedTagType(null);
                          } else {
                            setSelectedTag(fastTag);
                            const isInAparencia = Object.values(APARENCIA_TAGS).some(list => list.includes(fastTag));
                            setSelectedTagType(isInAparencia ? "aparencia" : "atividades");
                          }
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer active:scale-95
                          ${isChosen 
                            ? "bg-red-650 border-red-750 text-white" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900"
                          }
                        `}
                      >
                        #{fastTag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Expanded panel displaying all categorized tags */}
            {showTagExplorer && (
              <div className="border-t border-zinc-100 pt-4.5 flex flex-col gap-5 text-left transition-all duration-300">
                
                {/* APARÊNCIA */}
                <div className="bg-red-50/15 border border-dashed border-red-200/60 p-4 sm:p-5 rounded-2xl shadow-inner">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-650 font-sans block mb-3 border-b border-red-100 pb-1.5">
                    💃 Tags de Aparência (Clique para filtrar os perfis em live)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {Object.entries(APARENCIA_TAGS).map(([groupName, list]) => (
                      <div key={groupName} className="flex flex-col gap-2">
                        <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest border-l-2 border-zinc-300 pl-1.5">
                          {groupName}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map((tag) => {
                            const isSelected = selectedTag === tag;
                            return (
                              <button
                                key={tag}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedTag(null);
                                    setSelectedTagType(null);
                                  } else {
                                    setSelectedTag(tag);
                                    setSelectedTagType("aparencia");
                                  }
                                }}
                                className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all active:scale-95 cursor-pointer
                                  ${isSelected
                                    ? "bg-red-650 border-red-750 text-white shadow-xs"
                                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-350"
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

                {/* ATIVIDADES MEDIANTE SOLICITAÇÃO */}
                <div className="bg-zinc-50 border border-zinc-200 p-4 sm:p-5 rounded-2xl shadow-inner">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-800 font-sans block mb-3 border-b border-zinc-200 pb-1.5">
                    ⚡ Atividades mediante solicitação (AÇÕES / BRINQUEDOS / DISPOSITIVOS)
                  </span>
                  
                  <div className="flex flex-col gap-4">
                    {Object.entries(ATIVIDADES_TAGS).map(([groupName, list]) => (
                      <div key={groupName} className="flex flex-col gap-2">
                        <span className="text-[9px] font-extrabold text-zinc-450 uppercase tracking-widest border-l-2 border-red-500 pl-1.5">
                          {groupName}
                        </span>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-zinc-150 rounded-xl max-h-40 overflow-y-auto scrollbar-thin">
                          {list.map((tag) => {
                            const isSelected = selectedTag === tag;
                            return (
                              <button
                                key={tag}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedTag(null);
                                    setSelectedTagType(null);
                                  } else {
                                    setSelectedTag(tag);
                                    setSelectedTagType("atividades");
                                  }
                                }}
                                className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded font-bold border transition-all active:scale-95 cursor-pointer
                                  ${isSelected
                                    ? "bg-zinc-950 border-zinc-950 text-white shadow-xs"
                                    : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:border-zinc-300"
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

              </div>
            )}
          </div>

          {/* Active streams grid */}
          {activeAndFilteredLives.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-zinc-50 rounded-2xl border border-zinc-200 text-center gap-3 animate-fadeIn" id="no-active-lives">
              <span className="text-4xl animate-bounce">📺</span>
              <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Nenhuma live com essa tag disponível</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Nenhum criador transmitindo no momento possui a tag <b className="text-red-650 uppercase font-extrabold font-mono">#{selectedTag}</b> em seu perfil. Preencha outro filtro acima ou clique na cruz para limpar o filtro!
              </p>
              {selectedTag && (
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setSelectedTagType(null);
                  }}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-850 cursor-pointer active:scale-95 transition-all mt-1"
                >
                  Limpar Filtros e Ver Tudo
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="lives-grid">
              {activeAndFilteredLives.map((str) => {
                const ch = channels.find((c) => c.id === str.channelId);
                return (
                  <div
                    key={str.id}
                    onClick={() => setActiveStream(str)}
                    className="group flex flex-col gap-3 bg-white p-2.5 rounded-2xl border border-zinc-150 shadow-xs hover:border-zinc-300 hover:bg-zinc-50 cursor-pointer transition-all duration-300"
                    id={`live-channel-card-${str.id}`}
                  >
                    {/* Thumbnail screen */}
                    <div className="relative aspect-video w-full bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-100 shadow-inner">
                      <img
                        src={str.thumbnailUrl}
                        alt={str.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* LIVE BADGE */}
                      <span className="absolute top-3 left-3 bg-red-650 text-[10px] font-bold tracking-widest text-white px-2 py-0.5 rounded uppercase flex items-center gap-1.5 shadow">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> AO VIVO
                      </span>

                      {/* VIEWERS BADGE */}
                      <span className="absolute bottom-3 right-3 bg-black/80 text-[10px] text-white/95 px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-400" />{" "}
                        {str.viewerCount >= 1000
                          ? `${(str.viewerCount / 1000).toFixed(1)}k`
                          : str.viewerCount}
                      </span>
                    </div>

                    {/* Meta items */}
                    <div className="flex gap-3 px-1">
                      <div className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-base border border-zinc-200 flex-shrink-0 animate-fadeIn">
                        <span>{ch?.avatar || "👤"}</span>
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0 flex-1 text-left">
                        <h3 className="text-xs sm:text-sm font-bold font-sans text-zinc-900 group-hover:text-red-655 leading-snug truncate transition-colors">
                          {str.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500 font-semibold truncate">
                            {ch?.name}
                          </span>
                          {ch?.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-555 mr-1 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold font-mono text-zinc-450 uppercase tracking-wider block">
                          Categoria: <span className="font-sans text-zinc-650 lowercase font-bold">{str.category}</span>
                        </span>

                        {/* Matching profile tags preview on the stream card */}
                        {ch && (ch.appearanceTags || ch.activityTags) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ch.appearanceTags?.slice(0, 3).map((tag) => (
                              <span 
                                key={tag} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tag);
                                  setSelectedTagType("aparencia");
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all border
                                  ${selectedTag === tag 
                                    ? "bg-red-650 border-red-700 text-white" 
                                    : "bg-red-50 border-red-100 text-red-700 hover:bg-red-100"
                                  }
                                `}
                              >
                                #{tag}
                              </span>
                            ))}
                            {ch.activityTags?.slice(0, 3).map((tag) => (
                              <span 
                                key={tag} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tag);
                                  setSelectedTagType("atividades");
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all border
                                  ${selectedTag === tag 
                                    ? "bg-zinc-950 border-zinc-950 text-white" 
                                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                                  }
                                `}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
