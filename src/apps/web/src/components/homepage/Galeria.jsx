import React, { useEffect, useMemo, useState } from "react";
import { Camera, Film, Image as ImageIcon, Loader2 } from "lucide-react";
import { collectionGroup, getDocs } from "firebase/firestore";
import { firestore } from "@packages/firebase/config";

export default function Galeria() {
  const [midias, setMidias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todas"); // 'todas' | 'imagem' | 'video'
  const [selecionada, setSelecionada] = useState(null); // mídia selecionada no modal

  // Carregar TODAS as mídias salvas pelo mobile (Clientes/*/midias)
  useEffect(() => {
    let cancelado = false;

    async function carregarMidias() {
      try {
        setLoading(true);
        setErro("");

        // Busca todos os documentos de TODAS as subcoleções "midias"
        const cg = collectionGroup(firestore, "midias");
        const snap = await getDocs(cg);
        if (cancelado) return;

        let itens = snap.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              url: data.url,
              tipo: data.tipo === "video" ? "video" : "imagem",
              nome: data.nome,
              criadoEm: data.criadoEm || null,
            };
          })
          .filter((m) => !!m.url);

        // Ordena em JS pelos mais recentes (criadoEm desc)
        itens.sort((a, b) => {
          const da =
            a.criadoEm?.toDate?.() instanceof Date
              ? a.criadoEm.toDate().getTime()
              : new Date(a.criadoEm || 0).getTime();

          const db =
            b.criadoEm?.toDate?.() instanceof Date
              ? b.criadoEm.toDate().getTime()
              : new Date(b.criadoEm || 0).getTime();

          return db - da; // mais recente primeiro
        });

        setMidias(itens);
      } catch (e) {
        console.error(e);
        if (!cancelado) {
          setErro("Não foi possível carregar a galeria no momento.");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregarMidias();

    return () => {
      cancelado = true;
    };
  }, []);

  // Aplica filtro (todas / imagem / video)
  const filtradas = useMemo(() =>
      midias.filter(
        (m) => tipoFiltro === "todas" || m.tipo === tipoFiltro
      ),
    [midias, tipoFiltro]
  );

  return (
    <section
      id="galeria"
      className="section-padding bg-neutral-950 border-t border-neutral-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho da seção */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-white">
              Nossa <span className="text-amber-500 italic">Galeria</span>
            </h2>
            <p className="text-neutral-400 mt-3 max-w-xl">
              Aqui você vê as fotos e vídeos do salão, registrando os melhores momentos de
              eventos anteriores.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setTipoFiltro("todas")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${
                tipoFiltro === "todas"
                  ? "bg-amber-500 text-black border-amber-500"
                  : "border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-400"
              }`}
            >
              <Camera size={16} />
              Todas ({midias.length})
            </button>

            <button
              onClick={() => setTipoFiltro("imagem")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${
                tipoFiltro === "imagem"
                  ? "bg-amber-500 text-black border-amber-500"
                  : "border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-400"
              }`}
            >
              <ImageIcon size={16} />
              Fotos (
              {midias.filter((m) => m.tipo === "imagem").length})
            </button>

            <button
              onClick={() => setTipoFiltro("video")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${
                tipoFiltro === "video"
                  ? "bg-amber-500 text-black border-amber-500"
                  : "border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-400"
              }`}
            >
              <Film size={16} />
              Vídeos (
              {midias.filter((m) => m.tipo === "video").length})
            </button>
          </div>
        </div>

        {/* Estados: carregando / erro / vazio */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span>Carregando galeria...</span>
          </div>
        )}

        {!loading && erro && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {erro}
          </div>
        )}

        {!loading && !erro && filtradas.length === 0 && (
          <div className="text-center text-neutral-500 py-16 max-w-lg mx-auto">
            <p className="mb-2">
              Ainda não há fotos ou vídeos cadastrados.
            </p>
          </div>
        )}

        {/* Grade de mídias */}
        {!loading && !erro && filtradas.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtradas.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelecionada(m)}
                className="relative group overflow-hidden rounded-xl aspect-square bg-neutral-900 border border-neutral-800 hover:border-amber-500/70 transition-all"
              >
                {m.tipo === "video" ? (
                  <video
                    src={m.url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={m.url}
                    alt={m.nome || "Foto do evento"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}

                {/* Badge de tipo */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-[11px] font-medium bg-black/60 text-neutral-100 flex items-center gap-1">
                  {m.tipo === "video" ? (
                    <>
                      <Film size={12} />
                      <span>Vídeo</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={12} />
                      <span>Foto</span>
                    </>
                  )}
                </div>

                {/* Overlay + legenda */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                {m.nome && (
                  <div className="absolute bottom-2 left-2 right-2 text-[11px] text-neutral-100 line-clamp-2 text-left">
                    {m.nome}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Modal */}
        {selecionada && (
          <div
            className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelecionada(null)}
          >
            <div
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelecionada(null)}
                className="absolute -top-10 right-0 text-neutral-300 hover:text-white text-sm"
              >
                Fechar ✕
              </button>

              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-neutral-200 text-sm">
                    {selecionada.tipo === "video" ? (
                      <Film size={16} className="text-amber-500" />
                    ) : (
                      <ImageIcon size={16} className="text-amber-500" />
                    )}
                    <span>
                      {selecionada.nome || "Registro do evento"}
                    </span>
                  </div>
                </div>

                <div className="bg-black flex items-center justify-center p-4 md:p-6">
                  {selecionada.tipo === "video" ? (
                    <video
                      src={selecionada.url}
                      controls
                      className="max-h-[75vh] max-w-full rounded-lg"
                    />
                  ) : (
                    <img
                      src={selecionada.url}
                      alt={selecionada.nome || "Foto do evento"}
                      className="max-h-[75vh] max-w-full rounded-lg object-contain"
                    /> 
                    
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
