/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Play, CheckCircle2, Tv } from "lucide-react";
import { Video, Channel } from "../../types";

interface HomeTabProps {
  videos: Video[];
  channels: Channel[];
  searchQuery: string;
  onSelectVideo: (video: Video) => void;
  onSelectChannel: (chan: Channel) => void;
  onNavigate: (tab: 'inicio' | 'shorts' | 'videos' | 'live' | 'canais') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  videos,
  channels,
  searchQuery,
  onSelectVideo,
  onSelectChannel,
  onNavigate,
}) => {
  // Helper map to quickly lookup channel info
  const getChannelInfo = (channelId: string): Channel | undefined => {
    return channels.find((c) => c.id === channelId);
  };

  // Filter video list based on search query
  const filteredVideos = videos.filter((video) => {
    // Search query match
    let searchMatch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const channel = getChannelInfo(video.channelId);
      const titleMatch = video.title.toLowerCase().includes(q);
      const descMatch = video.description.toLowerCase().includes(q);
      const channelNameMatch = channel
        ? channel.name.toLowerCase().includes(q)
        : false;
      searchMatch = titleMatch || descMatch || channelNameMatch;
    }

    return searchMatch;
  });

  return (
    <div className="w-full" id="home-tab-container">

      {/* Main Grid Content */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-7 mt-3" id="home-videos-grid">
          {filteredVideos.map((video) => {
            const channel = getChannelInfo(video.channelId);
            return (
              <div
                key={video.id}
                className="group flex flex-col gap-3 cursor-pointer bg-white rounded-2xl overflow-hidden hover:bg-zinc-50 p-2 border border-zinc-100 hover:border-zinc-200 hover:shadow-xs transition-all duration-300"
                onClick={() => onSelectVideo(video)}
                id={`video-card-${video.id}`}
              >
                {/* Thumbnail Layer */}
                <div className="relative w-full aspect-video bg-zinc-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Duration Label */}
                  <span className="absolute bottom-2 right-2 bg-black/85 text-[10px] font-mono text-white/95 px-1.5 py-0.5 rounded font-bold tracking-wider">
                    {video.duration}
                  </span>
                  {/* Play Overlay Trigger */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <div className="w-11 h-11 bg-red-655 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-5 h-5 fill-white pb-0.5 pl-0.5" />
                    </div>
                  </div>
                </div>

                {/* Information Layer */}
                <div className="flex gap-3 px-1 pb-1">
                  {/* Channel Avatar bubble */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (channel) {
                        onSelectChannel(channel);
                        onNavigate('canais');
                      }
                    }}
                    className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center text-lg select-none flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-red-550 transition-all"
                    title={`Ver Canal: ${channel?.name}`}
                  >
                    <span>{channel?.avatar || "👤"}</span>
                  </div>

                  {/* Text attributes */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <h3 className="text-sm font-bold font-sans leading-tight text-zinc-900 group-hover:text-red-650 line-clamp-2 transition-colors">
                      {video.title}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (channel) {
                            onSelectChannel(channel);
                            onNavigate('canais');
                          }
                        }}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors truncate cursor-pointer"
                      >
                        {channel?.name || "Canal Removido"}
                      </span>
                      {channel?.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 font-mono mt-0.5">
                      <span>
                        {video.views >= 1000
                          ? `${(video.views / 1000).toFixed(0)}mil`
                          : video.views}{" "}
                        visualizações
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(video.uploadDate).toLocaleDateString("pt-BR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                         })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl bg-zinc-50 border border-zinc-200 mt-3" id="home-search-empty">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Tv className="w-8 h-8 text-zinc-400" />
          </div>
          {videos.length === 0 ? (
            <>
              <h3 className="text-lg font-bold font-sans text-zinc-850">O Feed está Pronto e Vazio! 🚀</h3>
              <p className="text-sm text-zinc-500 max-w-sm mt-1.5">
                Não há conteúdos publicados no momento. Acesse a aba <b>Canais</b> para criar o seu próprio canal informativo e começar a publicar!
              </p>
              <button
                onClick={() => onNavigate('canais')}
                className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-sans rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Criar Meu Canal
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold font-sans text-zinc-800">Nenhum vídeo localizado</h3>
              <p className="text-sm text-zinc-500 max-w-sm mt-1.5">
                Não encontramos resultados para "{searchQuery}". Tente pesquisar outros termos ou confira as categorias.
              </p>
              <button
                onClick={() => {
                  if (searchQuery !== "") {
                    window.location.reload(); // Just reset local search
                  }
                }}
                className="mt-5 px-5 py-2 bg-zinc-850 hover:bg-zinc-900 text-white text-xs font-bold rounded-full tracking-wide transition-all cursor-pointer"
              >
                Limpar Filtros
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
