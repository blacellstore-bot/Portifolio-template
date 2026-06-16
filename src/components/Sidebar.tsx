/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Home, Zap, PlaySquare, Radio, Users, CheckCircle2, Tags, X } from "lucide-react";
import { Channel } from "../types";
import { APARENCIA_TAGS, ATIVIDADES_TAGS } from "../tags";

interface SidebarProps {
  activeTab: 'inicio' | 'shorts' | 'videos' | 'live' | 'canais';
  onNavigate: (tab: 'inicio' | 'shorts' | 'videos' | 'live' | 'canais') => void;
  collapsed: boolean;
  onSelectChannel: (channel: Channel | null) => void;
  channels: Channel[];
  
  // New props for sidebar interactive filtering
  selectedCountry: string;
  selectedLanguage: string;
  onSelectCountryAndLang: (country: string, lang: string) => void;
  
  selectedPopularity: string;
  onSelectPopularity: (popularity: string) => void;
  
  selectedAgeRating: string;
  onSelectAgeRating: (ageRating: string) => void;
  
  selectedFeature: string;
  onSelectFeature: (feature: string) => void;
  
  onClearAllFilters: () => void;

  // Lifted tag props for Sidebar category selector
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  selectedTagType: "aparencia" | "atividades" | null;
  setSelectedTagType: (type: "aparencia" | "atividades" | null) => void;
  showTagExplorer: boolean;
  setShowTagExplorer: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  collapsed,
  onSelectChannel,
  channels,
  selectedCountry,
  selectedLanguage,
  onSelectCountryAndLang,
  selectedPopularity,
  onSelectPopularity,
  selectedAgeRating,
  onSelectAgeRating,
  selectedFeature,
  onSelectFeature,
  onClearAllFilters,
  selectedTag,
  setSelectedTag,
  selectedTagType,
  setSelectedTagType,
  showTagExplorer,
  setShowTagExplorer,
}) => {
  const mainNavItems = [
    { id: "inicio", label: "Início", icon: Home },
    { id: "shorts", label: "Shorts", icon: Zap },
    { id: "videos", label: "Vídeos", icon: PlaySquare },
    { id: "live", label: "Ao Vivo", icon: Radio },
    { id: "canais", label: "Canais", icon: Users },
  ];

  const COUNTRIES_LANGS = [
    { label: "🌐 Todos os Países", country: "Tudo", lang: "Tudo" },
    { label: "🇧🇷 Brasil (PT)", country: "Brasil", lang: "Português" },
    { label: "🇵🇹 Portugal (PT)", country: "Portugal", lang: "Português" },
    { label: "🇺🇸 EUA (EN)", country: "EUA", lang: "Inglês" },
    { label: "🇦🇴 Angola (PT)", country: "Angola", lang: "Português" },
    { label: "🇪🇸 Espanha (ES)", country: "Espanha", lang: "Espanhol" },
  ];

  const POPULARITY_OPTIONS = [
    { label: "🔥 Todos os Canais", value: "Geral" },
    { label: "🌟 Mais Populares (>50k)", value: "Mais Populares" },
    { label: "📈 Em Crescimento", value: "Em Crescimento" },
    { label: "🌱 Novos Criadores", value: "Novos Criadores" },
  ];

  const AGE_RATINGS = [
    { label: "🔞 Conteúdo Adulto (18+)", value: "Conteúdo Adulto" },
  ];

  const FEATURE_OPTIONS = [
    { label: "🏆 Sem Selos / Todos", value: "Tudo" },
    { label: "🛡️ Apenas Verificados", value: "Verificados" },
    { label: "📅 Criados Recentemente", value: "Recentes" },
  ];

  const hasActiveFilters = 
    selectedCountry !== "Tudo" || 
    selectedLanguage !== "Tudo" || 
    selectedPopularity !== "Geral" || 
    selectedAgeRating !== "Tudo" || 
    selectedFeature !== "Tudo";

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-black border-r border-zinc-800 transition-all duration-300 z-30 flex flex-col justify-between overflow-y-auto select-none
        ${collapsed ? "w-0 sm:w-16" : "w-64"}
      `}
      id="vidflow-sidebar"
    >
      {/* Upper Navigation items */}
      <div className="py-4 flex flex-col gap-1 px-2" id="sidebar-navigation-items">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id as any);
                onSelectChannel(null); // Clear selected channel filter when navigating
              }}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all cursor-pointer font-sans duration-200 group
                ${isActive
                  ? "bg-red-900/50 text-red-300 font-bold"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                }
              `}
              title={collapsed ? item.label : undefined}
              id={`sidebar-link-${item.id}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-red-650" : "text-zinc-500 group-hover:text-zinc-800"}`} />
                {item.id === "live" && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                )}
              </div>
              {!collapsed && (
                <span className="text-sm tracking-wide opacity-90">{item.label}</span>
              )}
            </button>
          );
        })}

        {!collapsed && (
          <div className="my-3 border-t border-zinc-800" id="sidebar-divider"></div>
        )}

        {/* Dynamic Reset Filter Button */}
        {!collapsed && hasActiveFilters && (
          <div className="px-3 mb-3">
            <button
              onClick={onClearAllFilters}
              className="w-full py-1.5 bg-red-900/50 hover:bg-red-900/80 border border-red-800 hover:border-red-700 text-red-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all text-center cursor-pointer"
            >
              🧹 Limpar Filtros Globais
            </button>
          </div>
        )}

        {/* Subscriptions section */}
        {!collapsed && (
          <div className="px-3" id="sidebar-subscriptions">
            <h3 className="text-[10px] font-bold font-sans text-zinc-500 uppercase tracking-widest mb-2">
              Canais Recomendados
            </h3>
            <div className="flex flex-col gap-0.5">
              {channels.length === 0 ? (
                <span className="text-[10px] text-zinc-400 font-sans italic px-2">Crie canais para ver aqui</span>
              ) : (
                channels.slice(0, 3).map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => {
                      onSelectChannel(chan);
                      onNavigate('canais');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-colors cursor-pointer group font-sans text-left"
                    id={`sidebar-subscription-${chan.id}`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] border border-zinc-700">
                        <span>{chan.avatar || "👤"}</span>
                      </div>
                      <span className="text-xs font-semibold truncate text-zinc-100">{chan.name}</span>
                    </div>
                    {chan.verified && (
                      <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="my-2.5 border-t border-zinc-800" id="sidebar-divider-filters-start"></div>
        )}

        {/* 0. Todas as Categorias Section */}
        {!collapsed && (
          <div className="px-3" id="sidebar-tags-explorer-section">
            <button
              onClick={() => {
                setShowTagExplorer(!showTagExplorer);
                // Navigate to live stream view to show results
                if (activeTab !== "live") {
                  onNavigate("live");
                }
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition-all select-none shadow-xs active:scale-95 cursor-pointer text-left
                ${showTagExplorer 
                  ? "bg-red-650 text-white hover:bg-red-600" 
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
            >
              <span className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-red-200" />
                Todas as Categorias
              </span>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
                {showTagExplorer ? "Fechar" : "Abrir"}
              </span>
            </button>

            {selectedTag && (
              <div className="mt-2 flex items-center justify-between bg-red-900/50 text-red-300 border border-red-800 px-2.5 py-1.5 rounded-lg text-[10px] font-bold animate-fadeIn">
                <span className="truncate">Filtro: <b className="uppercase text-red-200">#{selectedTag}</b></span>
                <button 
                  onClick={() => {
                    setSelectedTag(null);
                    setSelectedTagType(null);
                  }}
                  className="hover:text-red-950 p-0.5 ml-1 bg-red-100 hover:bg-red-200 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                  title="Limpar filtro"
                >
                  <X className="w-3 h-3 shrink-0 text-red-400" />
                </button>
              </div>
            )}

            {/* Display tags inside sidebar if expanded */}
            {showTagExplorer && (
              <div className="mt-3.5 border-t border-zinc-800 pt-3 flex flex-col gap-4 text-left animate-fadeIn">
                
                {/* APARÊNCIA */}
                <div className="bg-red-950/40 border border-red-900/60 p-2.5 rounded-xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 block mb-2 font-sans border-b border-red-900/50 pb-1">
                    💃 Aparência
                  </span>
                  <div className="flex flex-col gap-2">
                    {Object.entries(APARENCIA_TAGS).map(([groupName, list]) => (
                      <div key={groupName} className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest pl-0.5 leading-none">
                          {groupName}
                        </span>
                        <div className="flex flex-wrap gap-1">
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
                                    if (activeTab !== "live") onNavigate("live");
                                  }
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold border transition-all active:scale-95 cursor-pointer
                                  ${isSelected
                                    ? "bg-red-650 border-red-750 text-white shadow-xs"
                                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600"
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
                <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-200 block mb-2 font-sans border-b border-zinc-800 pb-1">
                    ⚡ Atividades / Solicitação
                  </span>
                  <div className="flex flex-col gap-2">
                    {Object.entries(ATIVIDADES_TAGS).map(([groupName, list]) => (
                      <div key={groupName} className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest border-l-2 border-red-500 pl-1 leading-none">
                          {groupName}
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto scrollbar-thin p-1 bg-zinc-800 border border-zinc-700 rounded">
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
                                    if (activeTab !== "live") onNavigate("live");
                                  }
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold border transition-all active:scale-95 cursor-pointer
                                  ${isSelected
                                    ? "bg-zinc-950 border-zinc-950 text-white shadow-xs"
                                    : "bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
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
        )}

        {!collapsed && (
          <div className="my-2.5 border-t border-zinc-800" id="sidebar-divider-filters-start-tags"></div>
        )}

        {/* 1. Countries and Languages Filter Section */}
        {!collapsed && (
          <div className="px-3" id="sidebar-countries-and-languages">
            <h3 className="text-[10px] font-bold font-sans text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              Países e idiomas
            </h3>
            <div className="flex flex-col gap-0.5">
              {COUNTRIES_LANGS.map((col) => {
                const isActive = selectedCountry === col.country && (col.lang === "Tudo" ? true : selectedLanguage === col.lang);
                return (
                  <button
                    key={col.label}
                    onClick={() => onSelectCountryAndLang(col.country, col.lang)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer font-medium
                      ${isActive 
                        ? "bg-red-900/50 text-red-300 font-bold border-l-2 border-red-500 rounded-l-none" 
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                      }
                    `}
                  >
                    {col.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="my-2.5 border-t border-zinc-800" id="sidebar-divider-filters-2"></div>
        )}

        {/* 2. Popular Space */}
        {!collapsed && (
          <div className="px-3" id="sidebar-popular-space">
            <h3 className="text-[10px] font-bold font-sans text-zinc-400 uppercase tracking-widest mb-2">
              Popular
            </h3>
            <div className="flex flex-col gap-0.5">
              {POPULARITY_OPTIONS.map((opt) => {
                const isActive = selectedPopularity === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onSelectPopularity(opt.value)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer font-medium
                      ${isActive 
                        ? "bg-red-900/50 text-red-300 font-bold border-l-2 border-red-500 rounded-l-none" 
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="my-2.5 border-t border-zinc-800" id="sidebar-divider-filters-3"></div>
        )}

        {/* 3. Idade Space */}
        {!collapsed && (
          <div className="px-3" id="sidebar-idade-space">
            <h3 className="text-[10px] font-bold font-sans text-zinc-400 uppercase tracking-widest mb-2">
              Idade
            </h3>
            <div className="flex flex-col gap-0.5">
              {AGE_RATINGS.map((rate) => {
                const isActive = selectedAgeRating === rate.value;
                return (
                  <button
                    key={rate.value}
                    onClick={() => onSelectAgeRating(isActive ? "Tudo" : rate.value)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer font-medium
                      ${isActive 
                        ? "bg-red-900/50 text-red-300 font-bold border-l-2 border-red-500 rounded-l-none" 
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                      }
                    `}
                  >
                    {rate.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="my-2.5 border-t border-zinc-800" id="sidebar-divider-filters-4"></div>
        )}

        {/* 4. Outro Espaço (Status e Certificação) */}
        {!collapsed && (
          <div className="px-3 pb-4" id="sidebar-outro-espaco">
            <h3 className="text-[10px] font-bold font-sans text-zinc-400 uppercase tracking-widest mb-2">
              Selo de Certificação
            </h3>
            <div className="flex flex-col gap-0.5">
              {FEATURE_OPTIONS.map((feat) => {
                const isActive = selectedFeature === feat.value;
                return (
                  <button
                    key={feat.value}
                    onClick={() => onSelectFeature(feat.value)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-medium
                      ${isActive 
                        ? "bg-red-900/50 text-red-300 font-bold border-l-2 border-red-500 rounded-l-none" 
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                      }
                    `}
                  >
                    {feat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer metadata built in a humble aesthetic */}
      {!collapsed && (
        <div className="p-4 text-[10px] text-zinc-500 font-sans border-t border-zinc-800 flex flex-col gap-1 bg-black rounded-b-xl">
          <p>© 2026 Novinhas Brasileiras</p>
          <p className="text-zinc-600">Reprodução instantânea e interatividade inteligente por países e classificações.</p>
        </div>
      )}
    </aside>
  );
};
