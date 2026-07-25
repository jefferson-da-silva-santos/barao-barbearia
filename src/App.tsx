import React, { useState, useEffect, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "boxicons/css/boxicons.min.css";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import styles from "./App.module.css";

/* ============================================================
   TIPOS
   ============================================================ */

interface Servico {
  id: string;
  nome: string;
  desc: string;
  preco: number;
  /** true = "a partir de R$X" (ex: Luzes, que varia por técnica) */
  apartirDe?: boolean;
  imgLink?: string;
  icone: string;
}

interface FotoGaleria {
  id: string;
  imgLink: string;
  alt: string;
}

interface Depoimento {
  nome: string;
  nota: number;
  texto: string;
}

/* ============================================================
   HELPERS DE LOCALSTORAGE
   ============================================================ */

function lsGet<T>(chave: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(chave);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (err) {
    console.log(err);
  }
}

function lsRemove(...chaves: string[]): void {
  try {
    chaves.forEach((c) => localStorage.removeItem(c));
  } catch (err) {
    console.log(err);
  }
}

const LS_SERVICO = "bb_servico";
const LS_DATA = "bb_data";
const LS_HORA = "bb_hora";
const LS_NOME = "bb_nome";
const LS_TELEFONE = "bb_telefone";

/* ============================================================
   DADOS — BARÃO BARBEARIA
   ============================================================
   Preencha `imgLink` com a URL da foto real do serviço (link do
   Instagram, Imgur, Google Drive público, ou arquivo salvo em
   public/, sem barra no início, ex: "cabelo-degrade.png"). Sem
   `imgLink`, o card mostra um selo com ícone dourado no lugar.
   ============================================================ */

const SERVICOS: Servico[] = [
  { id: "cabelo-degrade", nome: "Cabelo Degradê", desc: "Corte moderno com transição degradê na máquina.", preco: 15, icone: "bx-cut" },
  { id: "cabelo-social", nome: "Cabelo Social", desc: "Corte clássico, alinhado e discreto.", preco: 12, icone: "bx-cut" },
  { id: "barba", nome: "Barba", desc: "Barba alinhada e desenhada na navalha.", preco: 10, icone: "bxs-magic-wand" },
  { id: "cabelo-barba", nome: "Cabelo e Barba", desc: "Combo completo: corte + barba alinhada.", preco: 23, icone: "bx-cut" },
  { id: "luzes", nome: "Luzes", desc: "Luzes ou reflexo, valor final conforme técnica e comprimento.", preco: 25, apartirDe: true, icone: "bxs-sun" },
  { id: "pezinho", nome: "Pézinho", desc: "Acabamento rápido de contorno.", preco: 3, icone: "bx-time-five" },
];

const GALERIA: FotoGaleria[] = [
  { id: "foto-1", imgLink: "https://instagram.fcau4-1.fna.fbcdn.net/v/t51.82787-15/731495779_18103994852327079_1763769142743397795_n.webp?_nc_cat=103&ig_cache_key=MzkzMzk4OTIzMzk2NTIwODQxMQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=pLZAjSm3HrQQ7kNvwHIOg0j&_nc_oc=AdrervaB5K-J5BJwC4eQt3Ycm342MTHVKrZiMmLhkJJpjCTlPebYCoEe92Zv657FY6WXOfeboUbO3SSEkyRTAsR7&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fcau4-1.fna&_nc_gid=LIAwbL_EW2el9neYk_mrag&_nc_ss=7a22e&oh=00_AQBlm6DpqEASyHCInh7Y19-JAaW7y1p83Qkb0V7cqbenSQ&oe=6A6AADA9", alt: "Corte realizado na Barão Barbearia" },
  { id: "foto-2", imgLink: "https://instagram.fcau4-1.fna.fbcdn.net/v/t51.82787-15/733710420_18103979696327079_3021753043405523972_n.webp?_nc_cat=101&ig_cache_key=MzkzMzkwOTA2MzUwMTk3ODMwNg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=DwI1RLR2uKoQ7kNvwFZhFOQ&_nc_oc=AdpS6JakmgUYcl5MI2F3LB4IQ0ssq9N_5vu_wCn6vyuMKSK3cZNALsto-JI9ZxIGPCT_hLDOe2nMDnj4kQGT3G4q&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fcau4-1.fna&_nc_gid=LIAwbL_EW2el9neYk_mrag&_nc_ss=7a22e&oh=00_AQBCkxpqVfknJ1YtoXYW9hHvUPax4-Wb6CUdz1ZuwroQXQ&oe=6A6AAC9C", alt: "Corte realizado na Barão Barbearia" },
  { id: "foto-3", imgLink: "https://instagram.fcau4-1.fna.fbcdn.net/v/t51.82787-15/727689590_18102315578327079_1059437279412486197_n.webp?_nc_cat=101&ig_cache_key=MzkyMzk2MzEzNTM1NzM3ODY4OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=LxHZ8DP4r6MQ7kNvwFJTDLM&_nc_oc=AdqE1nDUySYw5oTsomCbXh3BgmKHlCjEBQB16E8H9nI-HBpJrZAr4CxlOzW0Yp49VLbTeepQ1kRm2D8wSn_BrtYi&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fcau4-1.fna&_nc_gid=LIAwbL_EW2el9neYk_mrag&_nc_ss=7a22e&oh=00_AQBepjaeLsTHh5LyAQuka78o969PTPaLxykEqmIWIJvKAg&oe=6A6AA96D", alt: "Corte realizado na Barão Barbearia" },
  { id: "foto-4", imgLink: "https://instagram.fcau4-1.fna.fbcdn.net/v/t51.82787-15/571833501_18078691016327079_4155126506447737259_n.webp?_nc_cat=110&ig_cache_key=Mzc1ODYyODk4Mjg0Njc4NDc0OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=yIq5gKgb7e4Q7kNvwGDqD_N&_nc_oc=AdozqxoqWarBBpGN52rcmNsiYqTD0S5Zs_7p2SurPZdU9Ch2r8VszzXhkvyy0KT-bnPWRQT3QdSE337V9GHCmUGR&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fcau4-1.fna&_nc_gid=V6gYVcGRMpcF3nU8EPbCxQ&_nc_ss=7a22e&oh=00_AQACuVBEi1LAMzAxGWN1gLqnJ1eopE24YMoZiW5pFJ7Ypw&oe=6A6AA95F", alt: "Corte realizado na Barão Barbearia" },
  { id: "foto-5", imgLink: "https://instagram.fcau4-1.fna.fbcdn.net/v/t51.82787-15/558919880_18074489279327079_4803383970866093322_n.webp?_nc_cat=104&ig_cache_key=MzczNDgzODk0NDQwNTMxMjkzNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=bv3u3hXrpTsQ7kNvwEDdXR5&_nc_oc=Adpgq6r6v80z_HWv1MklZ2EasCSjrLnRj5U4GrSDVEogTiM8jQo3f9Mpzt6etrSUnIFS6jwdzYVVy1b0Tr-T_xvt&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fcau4-1.fna&_nc_gid=mRIP1PaP8eLs2pWUgV6eIQ&_nc_ss=7a22e&oh=00_AQCDUiVewAMyVuNwKPQwBD-UjU6pXtjLeU2qyULAIibSkA&oe=6A6AA693", alt: "Corte realizado na Barão Barbearia" },
];

const DEPOIMENTOS: Depoimento[] = [
  {
    nome: "Eryson Santos",
    nota: 5,
    texto: "Melhor degradê de Limoeiro, sem dúvida. O Gustavo capricha em cada detalhe e o ambiente é super tranquilo.",
  },
  {
    nome: "Davi Alves",
    nota: 5,
    texto: "Marco meu horário pelo WhatsApp e nunca tive problema com atraso. Corte e barba sempre no capricho.",
  },
  {
    nome: "Renato Costa",
    nota: 4.5,
    texto: "Levei meu filho pra cortar o cabelo e ele adorou o resultado. Atendimento com paciência e muito profissionalismo.",
  },
];

/* ============================================================
   NOTYF
   ============================================================ */

const notyf = new Notyf({
  duration: 3800,
  ripple: true,
  position: { x: "right", y: "top" },
  dismissible: true,
  types: [
    { type: "success", background: "#c9a227", icon: { className: "bx bx-check", tagName: "i", color: "#0d0c0b" } },
    { type: "error", background: "#a32323", icon: { className: "bx bx-error-circle", tagName: "i", color: "#fff" } },
  ],
});

/* ============================================================
   HELPERS
   ============================================================ */

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarPreco(servico: Servico): string {
  return servico.apartirDe ? `A partir de ${formatarMoeda(servico.preco)}` : formatarMoeda(servico.preco);
}

function formatarDataBR(isoDate: string): string {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

/* ------------------------------------------------------------
   ATENÇÃO Jefferson: confirme o horário de funcionamento com o
   Gustavo. Deixei um padrão comum de barbearia (segunda a sábado,
   das 8h às 20h, fechado aos domingos) — ajuste os números abaixo
   se for diferente.
   ------------------------------------------------------------ */
const HORA_ABERTURA = 8;
const HORA_FECHAMENTO = 20;

// Aberto de segunda a sábado, das 8h às 20h. Fechado aos domingos.
function estaAberto(): { aberto: boolean; texto: string } {
  const agora = new Date();
  const dia = agora.getDay(); // 0 = domingo
  const hora = agora.getHours() + agora.getMinutes() / 60;

  if (dia === 0) return { aberto: false, texto: "Fechado hoje — abrimos amanhã às 8h" };
  if (hora >= HORA_ABERTURA && hora < HORA_FECHAMENTO) {
    return { aberto: true, texto: "Aberto agora — atendimento até às 20h" };
  }
  if (hora < HORA_ABERTURA) return { aberto: false, texto: "Abrimos hoje às 8h" };
  return { aberto: false, texto: "Fechado — abrimos amanhã às 8h" };
}

function gerarHorariosDisponiveis(): string[] {
  const horarios: string[] = [];
  for (let h = HORA_ABERTURA; h < HORA_FECHAMENTO; h++) {
    horarios.push(`${String(h).padStart(2, "0")}:00`);
    horarios.push(`${String(h).padStart(2, "0")}:30`);
  }
  return horarios;
}

function hojeISO(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function renderEstrelas(nota: number) {
  const cheias = Math.floor(nota);
  const meia = nota % 1 >= 0.5;
  const estrelas: React.ReactElement[] = [];
  for (let i = 0; i < cheias; i++) {
    estrelas.push(<i key={`f${i}`} className="bx bxs-star" aria-hidden="true" />);
  }
  if (meia) estrelas.push(<i key="half" className="bx bxs-star-half" aria-hidden="true" />);
  return estrelas;
}

/* ============================================================
   ÍCONES
   ============================================================ */

function IconScissors({ className = "" }: { className?: string }) {
  return <i className={`bx bx-cut ${className}`} aria-hidden="true" />;
}
function IconArrow({ className = "", direction = "right" }: { className?: string; direction?: "left" | "right" }) {
  return (
    <i
      className={`bx bx-right-arrow-alt ${className}`}
      style={{ transform: direction === "left" ? "rotate(180deg)" : undefined }}
      aria-hidden="true"
    />
  );
}
function IconMapPin({ className = "" }: { className?: string }) {
  return <i className={`bx bxs-map ${className}`} aria-hidden="true" />;
}
function IconClock({ className = "" }: { className?: string }) {
  return <i className={`bx bx-time-five ${className}`} aria-hidden="true" />;
}
function IconWhatsapp({ className = "" }: { className?: string }) {
  return <i className={`bx bxl-whatsapp ${className}`} aria-hidden="true" />;
}
function IconInstagram({ className = "" }: { className?: string }) {
  return <i className={`bx bxl-instagram-alt ${className}`} aria-hidden="true" />;
}
function IconCheck({ className = "" }: { className?: string }) {
  return <i className={`bx bx-check ${className}`} aria-hidden="true" />;
}
function IconInfo({ className = "" }: { className?: string }) {
  return <i className={`bx bx-info-circle ${className}`} aria-hidden="true" />;
}

/* ============================================================
   AOS
   ============================================================ */

function useAosInit() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 60 });
    const onLoad = () => AOS.refreshHard();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
}

/* ------------------------------------------------------------
   Dados do negócio
   ------------------------------------------------------------ */
const WHATSAPP_NUMERO = "5581995217970";
const INSTAGRAM = "barao_barbearia__";
const ENDERECO = "Vila Urucuba, Limoeiro - PE";
const BARBEIRO = "Gustavo José";
// Imagem do banner usada no Hero — troque por outra URL se preferir.
const BANNER_IMG_LINK = "banner.png";

/* ============================================================
   HERO
   ============================================================ */

function Hero() {
  const status = useMemo(() => estaAberto(), []);

  return (
    <header className={styles.hero} id="topo">
      <div className={styles.heroGlow} aria-hidden="true">
        <span className={`${styles.brasa} ${styles.brasa1}`} />
        <span className={`${styles.brasa} ${styles.brasa2}`} />
        <span className={`${styles.brasa} ${styles.brasa3}`} />
      </div>

      <div className={styles.heroInner}>
        <div data-aos="fade-up" data-aos-duration="700">
          <span className={`${styles.statusBadge} ${status.aberto ? styles.isOpen : styles.isClosed}`}>
            <span className={styles.statusBadgeDot} />
            {status.texto}
          </span>

          <h1 className={styles.heroTitle}>
            Barão <span className={styles.heroTitleAccent}>Barbearia</span>
          </h1>

          <p className={styles.heroSlogan}>
            Mais que um corte, uma experiência.
            <br />
            Cortes profissionais, barba alinhada e atendimento premium com {BARBEIRO}.
          </p>

          <div className={styles.heroActions}>
            <a href="#agendamento" className={`${styles.btn} ${styles.btnPrimary}`}>
              <IconScissors className={styles.btnIcon} />
              Agendar horário
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMERO}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnGhost}`}
            >
              <IconWhatsapp className={styles.btnIcon} />
              Falar no WhatsApp
            </a>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              <IconMapPin className={styles.heroMetaIcon} />
              <span>{ENDERECO}</span>
            </div>
            <div className={styles.heroMetaItem}>
              <IconClock className={styles.heroMetaIcon} />
              <span>Segunda a sábado, das 8h às 20h</span>
            </div>
            <a
              href={`https://instagram.com/${INSTAGRAM}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.heroMetaItem} ${styles.heroMetaItemLink}`}
            >
              <IconInstagram className={styles.heroMetaIcon} />
              <span>@{INSTAGRAM}</span>
            </a>
          </div>
        </div>

        <div className={styles.heroArt} data-aos="fade-up" data-aos-duration="700" data-aos-delay="120">
          <div className={styles.heroArtPlate}>
            <img src={BANNER_IMG_LINK} alt="Barão Barbearia" className={styles.heroArtImg} />
          </div>
          <div className={styles.heroArtInfo}>
            <p>"Melhor degradê de Limoeiro, sem dúvida. Ambiente tranquilo e resultado impecável."</p>
            <span className={styles.heroArtInfoAuthor}>Eryson Santos</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   VITRINE DE SERVIÇOS (informativa)
   ============================================================ */

function ImagemServico({ servico, className }: { servico: Servico; className?: string }) {
  if (servico.imgLink) {
    return <img src={servico.imgLink} alt={servico.nome} className={className} loading="lazy" />;
  }
  return (
    <div className={`${className ?? ""} ${styles.placeholderImg}`}>
      <i className={`bx ${servico.icone}`} aria-hidden="true" />
    </div>
  );
}

function Vitrine() {
  const metade = Math.ceil(SERVICOS.length / 2);
  const colunaA = SERVICOS.slice(0, metade);
  const colunaB = SERVICOS.slice(metade);

  const renderColuna = (itens: Servico[], chave: string) => (
    <div className={styles.precosColuna} key={chave}>
      {itens.map((servico) => (
        <div className={styles.precoItem} key={servico.id}>
          <span className={styles.precoIcone}>
            <i className={`bx ${servico.icone}`} aria-hidden="true" />
          </span>
          <span className={styles.precoNome}>{servico.nome}</span>
          <span className={styles.precoLinha} aria-hidden="true" />
          <span className={styles.precoValor}>{formatarPreco(servico)}</span>
          <p className={styles.precoDesc}>{servico.desc}</p>
        </div>
      ))}
    </div>
  );

  return (
    <section className={styles.precos} id="servicos">
      <div className={styles.precosInner} data-aos="fade-up">
        <span className={styles.sectionEyebrow}>Valores</span>
        <h2 className={styles.sectionTitle}>Nossos serviços</h2>
        <p className={styles.sectionSubtitle}>
          Cortes, barba e acabamentos com técnica e atenção aos detalhes. Escolha o serviço e agende
          seu horário abaixo.
        </p>

        <div className={styles.precosLista}>
          {renderColuna(colunaA, "coluna-a")}
          {renderColuna(colunaB, "coluna-b")}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CARD DE AGENDAMENTO (STEPPER)
   ============================================================ */

type StepId = "servico" | "data-hora" | "dados" | "revisao";

const STEPS: { id: StepId; label: string }[] = [
  { id: "servico", label: "Serviço" },
  { id: "data-hora", label: "Data e Hora" },
  { id: "dados", label: "Seus Dados" },
  { id: "revisao", label: "Revisão" },
];

function CardAgendamento() {
  const [stepAtual, setStepAtual] = useState(0);

  const [servicoId, setServicoId] = useState<string>(() => lsGet<string>(LS_SERVICO, ""));
  const [data, setData] = useState<string>(() => lsGet<string>(LS_DATA, ""));
  const [hora, setHora] = useState<string>(() => lsGet<string>(LS_HORA, ""));
  const [nome, setNome] = useState<string>(() => lsGet<string>(LS_NOME, ""));
  const [telefone, setTelefone] = useState<string>(() => lsGet<string>(LS_TELEFONE, ""));
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => { lsSet(LS_SERVICO, servicoId); }, [servicoId]);
  useEffect(() => { lsSet(LS_DATA, data); }, [data]);
  useEffect(() => { lsSet(LS_HORA, hora); }, [hora]);
  useEffect(() => { lsSet(LS_NOME, nome); }, [nome]);
  useEffect(() => { lsSet(LS_TELEFONE, telefone); }, [telefone]);

  const servicoEscolhido = useMemo(() => SERVICOS.find((s) => s.id === servicoId), [servicoId]);
  const horariosDisponiveis = useMemo(() => gerarHorariosDisponiveis(), []);

  const handleEscolherServico = (id: string) => {
    setErro(null);
    setServicoId(id);
  };

  const handleDataChange = (novaData: string) => {
    setErro(null);
    if (!novaData) {
      setData("");
      return;
    }
    const [ano, mes, dia] = novaData.split("-").map(Number);
    const dataEscolhida = new Date(ano, mes - 1, dia);
    if (dataEscolhida.getDay() === 0) {
      notyf.error("Fechado aos domingos. Escolha outro dia.");
      return;
    }
    setData(novaData);
    setHora("");
  };

  const avancar = () => {
    setErro(null);
    if (stepAtual === 0 && !servicoId) {
      setErro("Escolha um serviço para continuar.");
      return;
    }
    if (stepAtual === 1 && (!data || !hora)) {
      setErro("Escolha a data e o horário para continuar.");
      return;
    }
    if (stepAtual === 2 && !nome.trim()) {
      setErro("Informe seu nome para continuar.");
      return;
    }
    setStepAtual((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const voltar = () => {
    setErro(null);
    setStepAtual((s) => Math.max(s - 1, 0));
  };
  const irParaStep = (i: number) => {
    if (i <= stepAtual) { setErro(null); setStepAtual(i); }
  };

  const gerarMensagemWhatsapp = (): string => {
    return [
      "💈 NOVO AGENDAMENTO - BARÃO BARBEARIA 💈",
      "----------------------------------------",
      `Cliente: ${nome.trim()}`,
      telefone.trim() ? `Telefone: ${telefone.trim()}` : null,
      "----------------------------------------",
      `Serviço: ${servicoEscolhido ? servicoEscolhido.nome : ""}`,
      `Valor: ${servicoEscolhido ? formatarPreco(servicoEscolhido) : ""}`,
      `Data: ${formatarDataBR(data)}`,
      `Horário: ${hora}`,
      "----------------------------------------",
      "Aguardando confirmação, obrigado!",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const confirmarAgendamento = () => {
    if (!servicoId || !data || !hora || !nome.trim()) {
      const msg = "Preencha o serviço, data, horário e seu nome antes de confirmar.";
      setErro(msg);
      notyf.error(msg);
      setStepAtual(0);
      return;
    }

    const texto = encodeURIComponent(gerarMensagemWhatsapp());
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`, "_blank");
    notyf.success("Agendamento aberto no WhatsApp. Confirme o envio por lá.");

    lsRemove(LS_SERVICO, LS_DATA, LS_HORA, LS_NOME, LS_TELEFONE);
    setServicoId("");
    setData("");
    setHora("");
    setNome("");
    setTelefone("");
    setStepAtual(0);
  };

  const stepId = STEPS[stepAtual].id;
  const podeAvancar = stepId !== "revisao";

  return (
    <section className={styles.agendamentoSection} id="agendamento">
      <div className={styles.agendamentoInner} data-aos="fade-up">
        <span className={styles.sectionEyebrow}>Agendamento</span>
        <h2 className={styles.sectionTitle}>Marque seu horário em poucos passos</h2>
        <p className={styles.sectionSubtitle}>
          Escolha o serviço, a data e o horário, informe seus dados e confirme. No final, é só enviar
          pelo WhatsApp para o Gustavo confirmar seu agendamento.
        </p>

        <div className={styles.cardAgendamento}>
          <div className={styles.tabs}>
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                type="button"
                className={`${styles.tab} ${i === stepAtual ? styles.isAtivo : ""} ${i < stepAtual ? styles.isConcluido : ""}`}
                onClick={() => irParaStep(i)}
                disabled={i > stepAtual}
              >
                <span className={styles.tabDot}>{i < stepAtual ? <IconCheck /> : i + 1}</span>
                <span className={styles.tabLabel}>{step.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${(stepAtual / (STEPS.length - 1)) * 100}%` }} />
          </div>

          <div className={styles.body}>
            <span className={styles.stepCount}>Passo {stepAtual + 1} de {STEPS.length}</span>

            {stepId === "servico" && (
              <>
                <h3 className={styles.stepTitle}>Qual serviço você quer marcar?</h3>
                <p className={styles.stepHint}>Toque em um serviço para selecioná-lo.</p>
                <div className={styles.listaServicos}>
                  {SERVICOS.map((servico) => {
                    const selecionado = servicoId === servico.id;
                    return (
                      <button
                        key={servico.id}
                        type="button"
                        className={`${styles.servicoCard} ${selecionado ? styles.servicoCardSelecionado : ""}`}
                        onClick={() => handleEscolherServico(servico.id)}
                      >
                        <div className={styles.servicoCardIconWrap}>
                          <ImagemServico servico={servico} className={styles.servicoCardImg} />
                        </div>
                        <div className={styles.servicoCardInfo}>
                          <span className={styles.servicoCardNome}>{servico.nome}</span>
                          <p className={styles.servicoCardDesc}>{servico.desc}</p>
                          <span className={styles.servicoCardPreco}>{formatarPreco(servico)}</span>
                        </div>
                        <span className={styles.servicoCardCheck}>{selecionado && <IconCheck />}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {stepId === "data-hora" && (
              <>
                <h3 className={styles.stepTitle}>Escolha a data e o horário</h3>
                <p className={styles.stepHint}>Atendimento de segunda a sábado, das 8h às 20h.</p>
                <div className={styles.dataHoraWrap}>
                  <label className={styles.campoLabel} htmlFor="data-agendamento">Data</label>
                  <p className={styles.campoHint}>Fechado aos domingos.</p>
                  <input
                    id="data-agendamento"
                    type="date"
                    className={styles.campoInput}
                    value={data}
                    min={hojeISO()}
                    onChange={(e) => handleDataChange(e.target.value)}
                  />

                  {data && (
                    <>
                      <label className={styles.campoLabel} style={{ marginTop: "1.6em", display: "block" }}>
                        Horário
                      </label>
                      <div className={styles.horariosGrid}>
                        {horariosDisponiveis.map((h) => (
                          <button
                            key={h}
                            type="button"
                            className={`${styles.horarioBtn} ${hora === h ? styles.horarioBtnSelecionado : ""}`}
                            onClick={() => { setErro(null); setHora(h); }}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className={styles.avisoInfo}>
                    <IconInfo />
                    <p>
                      O horário escolhido aqui é uma preferência. A confirmação final acontece pelo
                      WhatsApp com o Gustavo.
                    </p>
                  </div>
                </div>
              </>
            )}

            {stepId === "dados" && (
              <>
                <h3 className={styles.stepTitle}>Seus dados</h3>
                <p className={styles.stepHint}>Para o Gustavo saber quem está agendando.</p>
                <div className={styles.dadosWrap}>
                  <div>
                    <label className={styles.campoLabel} htmlFor="nome-cliente">Seu nome</label>
                    <input
                      id="nome-cliente"
                      type="text"
                      className={styles.campoInput}
                      placeholder="Ex: João Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      maxLength={60}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className={styles.campoLabel} htmlFor="telefone-cliente">
                      Telefone para contato (opcional)
                    </label>
                    <p className={styles.campoHint}>Caso queira um número diferente do WhatsApp que vai enviar a mensagem.</p>
                    <input
                      id="telefone-cliente"
                      type="tel"
                      className={styles.campoInput}
                      placeholder="Ex: (81) 99999-9999"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      maxLength={20}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </>
            )}

            {stepId === "revisao" && (
              <>
                <h3 className={styles.stepTitle}>Revise antes de confirmar</h3>
                <p className={styles.stepHint}>Confira os dados do seu agendamento. Tudo certo? Envie pelo WhatsApp.</p>

                {!servicoEscolhido ? (
                  <div className={styles.revisaoVazia}>
                    <IconScissors className={styles.revisaoVaziaIcon} />
                    <p>Você ainda não escolheu um serviço.</p>
                    <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setStepAtual(0)}>
                      Voltar e escolher serviço
                    </button>
                  </div>
                ) : (
                  <div className={styles.revisaoResumo}>
                    <div className={styles.resumoLinha}>
                      <span className={styles.resumoLinhaLabel}>Serviço</span>
                      <span className={styles.resumoLinhaValor}>{servicoEscolhido.nome}</span>
                    </div>
                    <div className={styles.resumoLinha}>
                      <span className={styles.resumoLinhaLabel}>Data</span>
                      <span className={styles.resumoLinhaValor}>{formatarDataBR(data) || "—"}</span>
                    </div>
                    <div className={styles.resumoLinha}>
                      <span className={styles.resumoLinhaLabel}>Horário</span>
                      <span className={styles.resumoLinhaValor}>{hora || "—"}</span>
                    </div>
                    <div className={styles.resumoLinha}>
                      <span className={styles.resumoLinhaLabel}>Cliente</span>
                      <span className={styles.resumoLinhaValor}>{nome || "—"}</span>
                    </div>
                    {telefone.trim() && (
                      <div className={styles.resumoLinha}>
                        <span className={styles.resumoLinhaLabel}>Telefone</span>
                        <span className={styles.resumoLinhaValor}>{telefone}</span>
                      </div>
                    )}
                    <div className={`${styles.resumoLinha} ${styles.resumoLinhaTotal}`}>
                      <span className={styles.resumoLinhaLabel}>Valor</span>
                      <span className={styles.resumoLinhaValor}>{formatarPreco(servicoEscolhido)}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {erro && <div className={styles.erro}>{erro}</div>}
          </div>

          <div className={styles.footer}>
            <div className={styles.footerResumo}>
              <span className={styles.footerItens}>
                {servicoEscolhido ? servicoEscolhido.nome : "Nenhum serviço escolhido"}
              </span>
              <span className={styles.footerTotal}>
                {servicoEscolhido ? formatarPreco(servicoEscolhido) : "—"}
              </span>
            </div>
            <div className={styles.footerBtns}>
              {stepAtual > 0 && (
                <button type="button" className={`${styles.btn} ${styles.btnSecundario}`} onClick={voltar}>
                  Voltar
                </button>
              )}
              {podeAvancar ? (
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={avancar}>
                  Continuar
                  <IconArrow className={styles.btnIcon} />
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnWhatsapp}`}
                  onClick={confirmarAgendamento}
                  disabled={!servicoEscolhido}
                >
                  <IconWhatsapp className={styles.btnIcon} />
                  Confirmar via WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   GALERIA
   ============================================================ */

function Galeria() {
  return (
    <section className={styles.galeria} id="galeria">
      <div className={styles.galeriaInner} data-aos="fade-up">
        <span className={styles.sectionEyebrow}>Galeria</span>
        <h2 className={styles.sectionTitle}>Conheça o trabalho</h2>
        <p className={styles.sectionSubtitle}>
          Alguns cortes e barbas feitos por {BARBEIRO}. Veja mais no Instagram @{INSTAGRAM}.
        </p>
        <div className={styles.galeriaGrid}>
          {GALERIA.map((foto) => (
            <div className={styles.galeriaItem} key={foto.id}>
              <img src={foto.imgLink} alt={foto.alt} className={styles.galeriaImg} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   DEPOIMENTOS
   ============================================================ */

function Depoimentos() {
  const [indice, setIndice] = useState(0);
  const atual = DEPOIMENTOS[indice];

  return (
    <section className={styles.depoimentos} id="depoimentos">
      <div className={styles.depoimentosInner} data-aos="fade-up">
        <div>
          <div className={styles.depoimentosVisualCirculo}>
            <img src={BANNER_IMG_LINK} alt="Barão Barbearia" />
          </div>
        </div>
        <div>
          <span className={styles.sectionEyebrow}>Depoimentos</span>
          <h2 className={styles.sectionTitle}>O que dizem sobre nós?</h2>

          <div className={styles.depoimentoCard}>
            <div className={styles.depoimentoCardPessoa}>
              <div className={styles.depoimentoCardAvatar}>
                {atual.nome.split(" ").slice(0, 2).map((p) => p[0]).join("")}
              </div>
              <div>
                <p className={styles.depoimentoCardNome}>{atual.nome}</p>
                <div className={styles.depoimentoCardEstrelas}>
                  {renderEstrelas(atual.nota)}
                  <span className={styles.depoimentoCardNota}>{atual.nota}</span>
                </div>
              </div>
            </div>
            <div className={styles.depoimentoCardTextoWrap}>
              <span className={styles.depoimentoCardAspas}>"</span>
              <p className={styles.depoimentoCardTexto}>{atual.texto}</p>
            </div>
          </div>

          <div className={styles.depoimentosDots}>
            {DEPOIMENTOS.map((dep, i) => (
              <button
                key={dep.nome}
                type="button"
                className={`${styles.depoimentosDot} ${i === indice ? styles.depoimentosDotAtivo : ""}`}
                onClick={() => setIndice(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */

function Footer() {
  return (
    <footer className={styles.rodape}>
      <div className={styles.rodapeInner}>
        <div className={styles.rodapeMarca}>
          <span className={styles.rodapeLogo}>
            <IconScissors className={styles.rodapeLogoIcon} />
            Barão Barbearia
          </span>
          <p className={styles.rodapeEndereco}>{ENDERECO}</p>
        </div>
        <div className={styles.rodapeLinks}>
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.rodapeIconeBtn}
            aria-label="WhatsApp"
          >
            <IconWhatsapp />
          </a>
          <a
            href={`https://instagram.com/${INSTAGRAM}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.rodapeIconeBtn}
            aria-label="Instagram"
          >
            <IconInstagram />
          </a>
        </div>
      </div>
      <div className={styles.rodapeCopy}>
        Barão Barbearia · Segunda a sábado, das 8h às 20h
      </div>
    </footer>
  );
}

/* ============================================================
   BOTÃO TOPO
   ============================================================ */

function BotaoTopo() {
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visivel) return null;
  return (
    <a href="#topo" className={styles.botaoTopo} aria-label="Voltar ao topo">
      <i className="bx bx-up-arrow-alt" aria-hidden="true" />
    </a>
  );
}

/* ============================================================
   APP
   ============================================================ */

export default function App() {
  useAosInit();
  return (
    <div className={styles.app}>
      <Hero />
      <main>
        <Vitrine />
        <CardAgendamento />
        <Galeria />
        <Depoimentos />
      </main>
      <Footer />
      <BotaoTopo />
    </div>
  );
}