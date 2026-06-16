/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { HomeTab } from "./components/Tabs/HomeTab";
import { ShortsTab } from "./components/Tabs/ShortsTab";
import { LiveTab } from "./components/Tabs/LiveTab";
import { ChannelsTab } from "./components/Tabs/ChannelsTab";
import { VideoDetailView } from "./components/VideoDetailView";
import { UploadModal } from "./components/UploadModal";
import { PRESEEDED_CHANNELS, PRESEEDED_VIDEOS, PRESEEDED_SHORTS, PRESEEDED_LIVES } from "./data";
import { Channel, Video, Short, LiveStream, Comment } from "./types";
import { Sparkles, MessageCircle } from "lucide-react";

export default function App() {
  // --- Persistent Storage State Initializers ---
  // Run one-time clearance check to empty out previous user browser storage data
  const resetCacheToEmptyOnce = () => {
    const alreadyCleared = localStorage.getItem("vidflow_cleared_v5_empty_all");
    if (!alreadyCleared) {
      localStorage.removeItem("vidflow_channels");
      localStorage.removeItem("vidflow_videos");
      localStorage.removeItem("vidflow_shorts");
      localStorage.removeItem("vidflow_lives");
      localStorage.removeItem("vidflow_user_channel");
      localStorage.setItem("vidflow_cleared_v5_empty_all", "true");
    }
  };
  resetCacheToEmptyOnce();

  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem("vidflow_channels");
    return saved ? JSON.parse(saved) : PRESEEDED_CHANNELS;
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem("vidflow_videos");
    return saved ? JSON.parse(saved) : PRESEEDED_VIDEOS;
  });

  const [shorts, setShorts] = useState<Short[]>(() => {
    const saved = localStorage.getItem("vidflow_shorts");
    return saved ? JSON.parse(saved) : PRESEEDED_SHORTS;
  });

  const [lives, setLives] = useState<LiveStream[]>(() => {
    const saved = localStorage.getItem("vidflow_lives");
    return saved ? JSON.parse(saved) : PRESEEDED_LIVES;
  });

  const [userChannel, setUserChannel] = useState<Channel | null>(() => {
    const saved = localStorage.getItem("vidflow_user_channel");
    return saved ? JSON.parse(saved) : null;
  });

  // --- UI Navigation State Orchestrations ---
  const [activeTab, setActiveTab] = useState<'inicio' | 'shorts' | 'videos' | 'live' | 'canais'>('inicio');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // --- Dynamic Sidebar Interactive Filter States ---
  const [selectedCountry, setSelectedCountry] = useState("Tudo");
  const [selectedLanguage, setSelectedLanguage] = useState("Tudo");
  const [selectedPopularity, setSelectedPopularity] = useState("Geral");
  const [selectedAgeRating, setSelectedAgeRating] = useState("Tudo");
  const [selectedFeature, setSelectedFeature] = useState("Tudo");

  // --- Dynamic Tag Category Filter States ---
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTagType, setSelectedTagType] = useState<"aparencia" | "atividades" | null>(null);
  const [showTagExplorer, setShowTagExplorer] = useState(false);

  // Dynamic filtering calculation
  const filteredChannels = channels.filter((chan) => {
    // 1. Country & Language filter
    if (selectedCountry !== "Tudo") {
      if (chan.country && chan.country !== selectedCountry) return false;
    }
    if (selectedLanguage !== "Tudo") {
      if (chan.language && chan.language !== selectedLanguage) return false;
    }

    // 2. Popularity filter
    if (selectedPopularity === "Mais Populares") {
      if (chan.subscribers < 50000) return false;
    } else if (selectedPopularity === "Em Crescimento") {
      if (chan.subscribers < 10000 || chan.subscribers >= 50000) return false;
    } else if (selectedPopularity === "Novos Criadores") {
      if (chan.subscribers >= 10000) return false;
    }

    // 3. Age Rating filter
    if (selectedAgeRating !== "Tudo") {
      if (chan.ageRating && chan.ageRating !== selectedAgeRating) return false;
    }

    // 4. Feature space filter (Verification, status)
    if (selectedFeature === "Verificados") {
      if (!chan.verified) return false;
    } else if (selectedFeature === "Recentes") {
      if (!chan.isUser && chan.subscribers > 5000) return false;
    }

    return true;
  });

  const filteredChannelIds = new Set(filteredChannels.map((c) => c.id));

  const filteredVideos = videos.filter((vid) => {
    return filteredChannelIds.has(vid.channelId);
  });

  const filteredShorts = shorts.filter((sh) => {
    return filteredChannelIds.has(sh.channelId);
  });

  const filteredLives = lives.filter((lv) => {
    return filteredChannelIds.has(lv.channelId);
  });

  const handleClearAllFilters = () => {
    setSelectedCountry("Tudo");
    setSelectedLanguage("Tudo");
    setSelectedPopularity("Geral");
    setSelectedAgeRating("Tudo");
    setSelectedFeature("Tudo");
    setSelectedTag(null);
    setSelectedTagType(null);
    showToast("Todos os filtros foram redefinidos! 🧹");
  };

  // --- Sync database with LocalStorage on mutation ---
  useEffect(() => {
    localStorage.setItem("vidflow_channels", JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem("vidflow_videos", JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem("vidflow_shorts", JSON.stringify(shorts));
  }, [shorts]);

  useEffect(() => {
    localStorage.setItem("vidflow_lives", JSON.stringify(lives));
  }, [lives]);

  useEffect(() => {
    if (userChannel) {
      localStorage.setItem("vidflow_user_channel", JSON.stringify(userChannel));
    } else {
      localStorage.removeItem("vidflow_user_channel");
    }
  }, [userChannel]);

  // Toast Notification service representation
  const showToast = (message: string) => {
    setNotificationMsg(message);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  // --- Action Handlers ---

  // 1. Create Channel
  const handleCreateChannel = (
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
  ) => {
    const newChan: Channel = {
      id: `chan_user_${Date.now()}`,
      name,
      handle,
      description: desc,
      avatar,
      banner,
      subscribers: 0,
      verified: false,
      isUser: true,
      createdAt: new Date().toISOString().split("T")[0],
      country: country || "Brasil",
      language: language || "Português",
      ageRating: ageRating || "Geral",
      appearanceTags: appearanceTags || [],
      activityTags: activityTags || [],
    };

    setChannels((prev) => [newChan, ...prev]);
    setUserChannel(newChan);
    setSelectedChannel(newChan);
    setActiveTab('canais'); // Focus back on channels detail
    showToast(`O seu canal "${name}" foi criado com absoluto sucesso! 🎉`);
  };

  // 2. Custom meta updating of user channel banner / profile description
  const handleUpdateChannelMeta = (chanId: string, desc: string, banner: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === chanId ? { ...c, description: desc, banner } : c))
    );
    if (userChannel && userChannel.id === chanId) {
      const updatedUser = { ...userChannel, description: desc, banner };
      setUserChannel(updatedUser);
    }
    showToast("Canal personalizado com sucesso!");
  };

  // 3. Publish Horizontal long video or vertical short
  const handlePublishVideo = (
    title: string,
    desc: string,
    videoUrl: string,
    thumbnailUrl: string,
    category: string,
    duration: string,
    isShort: boolean
  ) => {
    if (!userChannel) return;

    if (isShort) {
      const newShort: Short = {
        id: `short_${Date.now()}`,
        title,
        videoUrl,
        channelId: userChannel.id,
        likes: 0,
        commentsCount: 0,
        shares: 0,
        views: 1,
        comments: [],
      };
      setShorts((prev) => [newShort, ...prev]);
      setActiveTab('shorts');
      showToast("Seu Short vertical foi publicado! Vá na aba Shorts para assistir. ⚡");
    } else {
      const newVideo: Video = {
        id: `video_${Date.now()}`,
        title,
        description: desc,
        videoUrl,
        thumbnailUrl,
        channelId: userChannel.id,
        views: 1,
        likes: 0,
        dislikes: 0,
        uploadDate: new Date().toISOString().split("T")[0],
        duration,
        category,
        comments: [],
      };
      setVideos((prev) => [newVideo, ...prev]);
      setActiveTab('inicio');
      setSelectedVideo(newVideo); // Play video immediately!
      showToast("Seu vídeo horizontal foi publicado! Iniciando reprodução... 🎬");
    }
  };

  // 4. Like / Dislike Horizontal Video
  const handleLikeVideo = (videoId: string, isLike: boolean) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            likes: isLike ? v.likes + 1 : Math.max(0, v.likes - 1),
          };
        }
        return v;
      })
    );
    // Keep detailed view in sync if opened
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo((prev) =>
        prev
          ? {
              ...prev,
              likes: isLike ? prev.likes + 1 : Math.max(0, prev.likes - 1),
            }
          : null
      );
    }
  };

  // 5. Add Comment to Horizontal Video
  const handleAddComment = (videoId: string, commentText: string) => {
    const author = userChannel ? userChannel.name : "Visitante";
    const authorAvatar = userChannel ? userChannel.avatar : "💬";

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      userName: author,
      userAvatar: authorAvatar,
      text: commentText,
      timestamp: "Agora",
      likes: 0,
    };

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            comments: [newComment, ...v.comments],
          };
        }
        return v;
      })
    );

    // Keep detailed view in sync
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo((prev) =>
        prev
          ? {
              ...prev,
              comments: [newComment, ...prev.comments],
            }
          : null
      );
    }
  };

  // 6. Delete Comment from Horizontal Video
  const handleDeleteComment = (videoId: string, commentId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            comments: v.comments.filter((c) => c.id !== commentId),
          };
        }
        return v;
      })
    );

    // Keep detailed view in sync
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter((c) => c.id !== commentId),
            }
          : null
      );
    }
  };

  // 7. Like Short
  const handleLikeShort = (shortId: string, isLike: boolean) => {
    setShorts((prev) =>
      prev.map((s) => {
        if (s.id === shortId) {
          return {
            ...s,
            likes: isLike ? s.likes + 1 : Math.max(0, s.likes - 1),
          };
        }
        return s;
      })
    );
  };

  // 8. Add short comment
  const handleAddShortComment = (shortId: string, text: string) => {
    const author = userChannel ? userChannel.name : "Visitante";
    const authorAvatar = userChannel ? userChannel.avatar : "💬";

    const newComment: Comment = {
      id: `sc_comm_${Date.now()}`,
      userName: author,
      userAvatar: authorAvatar,
      text,
      timestamp: "Agora",
      likes: 0,
    };

    setShorts((prev) =>
      prev.map((s) => {
        if (s.id === shortId) {
          return {
            ...s,
            comments: [newComment, ...s.comments],
          };
        }
        return s;
      })
    );
  };

  // 9. Delete short comment
  const handleDeleteShortComment = (shortId: string, commentId: string) => {
    setShorts((prev) =>
      prev.map((s) => {
        if (s.id === shortId) {
          return {
            ...s,
            comments: s.comments.filter((c) => c.id !== commentId),
          };
        }
        return s;
      })
    );
  };

  // 10. Start broadcasting live stream
  const handleGoLive = (title: string, category: string) => {
    if (!userChannel) throw new Error("Canal de usuário deve estar ativo.");

    const newLive: LiveStream = {
      id: `live_user_${Date.now()}`,
      title,
      channelId: userChannel.id,
      viewerCount: 52, // Seed audience joins instantly!
      category,
      isLive: true,
      videoUrl: "", // Handled retro-analytically by webcam stream OR visual synthesizer falling scripts
      thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=80",
      isUserStream: true,
    };

    setLives((prev) => [newLive, ...prev]);
    showToast(`Sua Transmissão Ao Vivo "${title}" começou com sucesso! Coletando tráfego... 🔴`);
    return newLive;
  };

  // 11. End broadcasting live stream
  const handleEndLive = (streamId: string) => {
    setLives((prev) => prev.filter((l) => l.id !== streamId));
    showToast("Transmissão ao vivo encerrada.");
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans flex flex-col selection:bg-red-650 selection:text-white" id="vidflow-app-root">
      {/* Top Navigation Frame */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setSelectedVideo(null);
          setSelectedChannel(null);
          if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
          }
        }}
        userChannel={userChannel}
        onOpenUpload={() => {
          setSelectedVideo(null);
          setSelectedChannel(null);
          if (userChannel) {
            setShowUploadModal(true);
          } else {
            setActiveTab('canais');
            showToast("Atenção: Por favor, crie seu canal primeiro para poder liberar uploads!");
          }
        }}
        onOpenCreateChannel={() => {
          setSelectedChannel(null);
          setSelectedVideo(null);
          setActiveTab('canais');
          showToast("Preencha o formulário abaixo para criar seu canal!");
        }}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Structural Core Workspace Layout */}
      <div className="flex flex-1 pt-16" id="app-workspace-body">
        {/* Responsive Side menu */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setSelectedVideo(null);
            if (window.innerWidth < 1024) {
              setSidebarCollapsed(true);
            }
          }}
          collapsed={sidebarCollapsed}
          channels={channels}
          selectedCountry={selectedCountry}
          selectedLanguage={selectedLanguage}
          onSelectCountryAndLang={(country, lang) => {
            setSelectedCountry(country);
            setSelectedLanguage(lang);
          }}
          selectedPopularity={selectedPopularity}
          onSelectPopularity={setSelectedPopularity}
          selectedAgeRating={selectedAgeRating}
          onSelectAgeRating={setSelectedAgeRating}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
          onClearAllFilters={handleClearAllFilters}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          selectedTagType={selectedTagType}
          setSelectedTagType={setSelectedTagType}
          showTagExplorer={showTagExplorer}
          setShowTagExplorer={setShowTagExplorer}
          onSelectChannel={(chan) => {
            setSelectedChannel(chan);
            setSelectedVideo(null);
            if (chan !== null) {
              setActiveTab('canais');
            }
            if (window.innerWidth < 1024) {
              setSidebarCollapsed(true);
            }
          }}
        />

        {/* Dynamic Context Tabs panel content */}
        <main
          className={`flex-1 min-w-0 px-4 sm:px-6 py-6 transition-all duration-300
            ${sidebarCollapsed ? "sm:pl-20" : "sm:pl-68"} bg-black
          `}
          id="app-tab-context-outlet"
        >
          {/* Detailed horizontal video playing overlay context matches prior state */}
          {selectedVideo ? (
            <VideoDetailView
              selectedVideo={selectedVideo}
              channels={channels}
              allVideos={videos}
              onSelectVideo={setSelectedVideo}
              onClose={() => setSelectedVideo(null)}
              onLikeVideo={handleLikeVideo}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              userChannel={userChannel}
            />
          ) : (
            /* Tab Navigators router switch representation */
            <>
              {activeTab === "inicio" && (
                <HomeTab
                  videos={filteredVideos}
                  channels={filteredChannels}
                  searchQuery={searchQuery}
                  onSelectVideo={setSelectedVideo}
                  onSelectChannel={setSelectedChannel}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    setSelectedVideo(null);
                    if (window.innerWidth < 1024) {
                      setSidebarCollapsed(true);
                    }
                  }}
                />
              )}

              {activeTab === "shorts" && (
                <ShortsTab
                  shorts={filteredShorts}
                  channels={filteredChannels}
                  userChannel={userChannel}
                  onLikeShort={handleLikeShort}
                  onAddShortComment={handleAddShortComment}
                  onDeleteShortComment={handleDeleteShortComment}
                />
              )}

              {activeTab === "videos" && (
                // Displays classic full category search & horizontal grid as requested
                <div>
                  <div className="border-b border-zinc-200 pb-4 mb-6 text-left">
                    <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-zinc-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-red-500" /> Vídeos de Formato Longo
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1">
                      Assista, curta e comente nos vídeos mais assistidos da comunidade horizontal.
                    </p>
                  </div>
                  <HomeTab
                    videos={filteredVideos}
                    channels={filteredChannels}
                    searchQuery={searchQuery}
                    onSelectVideo={setSelectedVideo}
                    onSelectChannel={setSelectedChannel}
                    onNavigate={(tab) => {
                      setActiveTab(tab);
                      setSelectedVideo(null);
                      if (window.innerWidth < 1024) {
                        setSidebarCollapsed(true);
                      }
                    }}
                  />
                </div>
              )}

              {activeTab === "live" && (
                <LiveTab
                  lives={filteredLives}
                  channels={filteredChannels}
                  userChannel={userChannel}
                  onGoLive={handleGoLive}
                  onEndLive={handleEndLive}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                  selectedTagType={selectedTagType}
                  setSelectedTagType={setSelectedTagType}
                  showTagExplorer={showTagExplorer}
                  setShowTagExplorer={setShowTagExplorer}
                />
              )}

              {activeTab === "canais" && (
                <ChannelsTab
                  channels={filteredChannels}
                  videos={videos}
                  shorts={shorts}
                  userChannel={userChannel}
                  selectedChannel={selectedChannel}
                  onSelectChannel={setSelectedChannel}
                  onSelectVideo={setSelectedVideo}
                  onCreateChannelSubmit={handleCreateChannel}
                  onUpdateChannelMeta={handleUpdateChannelMeta}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Upload modal overlays */}
      {showUploadModal && userChannel && (
        <UploadModal
          userChannel={userChannel}
          onClose={() => setShowUploadModal(false)}
          onPublishVideo={handlePublishVideo}
        />
      )}

      {/* Floating System micro toast notifications panel */}
      {notificationMsg && (
        <div
          className="fixed bottom-5 right-5 z-50 bg-zinc-900 border border-zinc-800 px-4.5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 max-w-sm animate-bounce text-left font-sans text-xs sm:text-sm text-zinc-100"
          id="system-toast-alert"
        >
          <MessageCircle className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}
    </div>
  );
}
