import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import {
  ArrowRight,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  Heart,
  Home as HomeIcon,
  LockKeyhole,
  MapPin,
  Menu,
  MessageCircle,
  PenLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";

// Імпорт фонових зображень та ілюстрацій
import heroBg from "../assets/hero-bg.png";
import ctaBg from "../assets/cta-bg.png";

const stats = [
  { value: "1200+", label: "активних анкет", icon: UsersRound },
  { value: "87%", label: "успішних матчів", icon: Heart },
  { value: "24", label: "міста в Україні", icon: HomeIcon },
];

const steps = [
  {
    number: "1",
    title: "Створіть анкету",
    description: "Заповніть анкету про себе, свої звички та вподобання. Це займе лише кілька хвилин.",
    icon: PenLine,
  },
  {
    number: "2",
    title: "Отримуйте підбірки",
    description: "Ми підбираємо для вас сумісних людей на основі ваших критеріїв та цінностей.",
    icon: SlidersHorizontal,
  },
  {
    number: "3",
    title: "Спілкуйтесь та домовляйтесь",
    description: "Обговорюйте деталі, домовляйтесь про зустріч і знаходьте свого сусіда.",
    icon: MessageCircle,
  },
];

const profiles = [
  {
    name: "Марія", age: 22, city: "Київ, здає квартиру", role: "Студентка", price: "9 500 грн/міс",
    avatar: "https://i.pinimg.com/1200x/f4/29/40/f429406b4dd227dc87e53f7c1031aeb9.jpg",
    compatibility: "100 %", compatibilityTone: "green",
    tags: ["Не курить", "Любить тишу", "Жайворонок", "Є кошеня"],
  },
  {
    name: "Олександр", age: 24, city: "Львів, шукає квартиру", role: "Працює віддалено", price: "12 000 грн/міс",
    avatar: "https://i.pinimg.com/736x/44/6b/6d/446b6db9682f95fdbfb7e4030c7c5bc2.jpg",
    compatibility: "88, 5 %", compatibilityTone: "yellow",
    tags: ["Курить", "Грає на гітарі", "Любить музику", "З тваринами ок"],
  },
  {
    name: "Ірина", age: 21, city: "Харків, шукає квартиру", role: "Студентка", price: "10 500 грн/міс",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    compatibility: "94, 3 %", compatibilityTone: "green",
    tags: ["Не курить", "Любить спорт", "Сова", "Чистота і порядок"],
  },
];

function StatCard({ value, label, icon: Icon }) {
  return (
    <div style={statStyles.wrapper}>
      <div style={statStyles.iconBox}>
        <Icon size={22} strokeWidth={2.1} />
      </div>
      <div>
        <p style={statStyles.val}>{value}</p>
        <p style={statStyles.lbl}>{label}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description, icon: Icon }) {
  return (
    <article style={stepStyles.card}>
      <div style={stepStyles.header}>
        <div style={stepStyles.iconBox}>
          <Icon size={30} strokeWidth={1.9} />
        </div>
        <span style={stepStyles.num}>{number}</span>
      </div>
      <h3 style={stepStyles.title}>{title}</h3>
      <p style={stepStyles.desc}>{description}</p>
    </article>
  );
}

function ProfileCard({ profile, onViewClick }) {
  const isGreen = profile.compatibilityTone === "green";

  return (
    <article style={profileStyles.card}>
      <div style={profileStyles.header}>
        <span style={profileStyles.badge(profile.compatibilityTone)}>
          {isGreen ? <Heart size={13} fill="currentColor" /> : <Star size={13} fill="currentColor" />}
          {profile.compatibility}
        </span>
        <button style={profileStyles.bookmark}>
          <Bookmark size={22} strokeWidth={1.9} />
        </button>
      </div>

      <div style={profileStyles.infoRow}>
        <img src={profile.avatar} alt={profile.name} style={profileStyles.avatar} />
        <div style={{ minWidth: 0, paddingTop: "8px" }}>
          <h3 style={profileStyles.name}>{profile.name}, {profile.age}</h3>
          <div style={profileStyles.metaList}>
            <p style={profileStyles.metaItem}><MapPin size={17} color="var(--accent)" /> {profile.city}</p>
            <p style={profileStyles.metaItem}><BriefcaseBusiness size={17} color="var(--accent)" /> {profile.role}</p>
          </div>
        </div>
      </div>

      <div style={profileStyles.tagList}>
        {profile.tags.map((tag) => (
          <span key={tag} style={profileStyles.tag}>{tag}</span>
        ))}
      </div>

      <div style={profileStyles.footer}>
        <p style={profileStyles.price}>{profile.price}</p>
        <button style={profileStyles.btn} onClick={onViewClick}>
          Переглянути анкету
        </button>
      </div>
    </article>
  );
}

function RevealWrapper({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal-section ${isVisible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');

  const handleCTA = () => {
    if (user) navigate('/search');
    else {
      setAuthMode('register');
      setAuthOpen(true);
    }
  };

  return (
    <main style={styles.root}>
      {/* Навігацію (<nav>) видалено, оскільки App.jsx вже рендерить глобальний Navbar.
        Це вирішує проблему дублювання хедерів.
      */}

      {/* HERO СЕКЦІЯ */}
      <section id="top" style={styles.heroSection} className="animate-fade-in">
        {/* ФОНОВЕ ЗОБРАЖЕННЯ НА ВСЮ ШИРИНУ */}
        <img src={heroBg} alt="Nestmate Background" style={styles.heroBgImg} />

        {/* напівпрозорий шар, шоб текст було гарно видно і в світлій, і в темній темі (опціонально) */}
        <div style={styles.heroOverlay}></div>

        <div style={styles.heroContainer}>

          {/* Ліва колонка (Текст та Кнопки) */}
          <div style={styles.heroLeft}>
            <span style={styles.heroBadge}>
              <Sparkles size={16} /> Розумний підбір сусідів
            </span>
            <h1 style={styles.heroTitle}>
              Знайди свого ідеального сусіда
            </h1>
            <p style={styles.heroDesc}>
              Nestmate допомагає знайти сумісного сусіда швидко, просто та безпечно. Заповни анкету та отримуй персональні рекомендації.
            </p>
            <div style={styles.heroBtnGroup}>
              <button style={styles.mainBtn} onClick={handleCTA}>Створити анкету</button>
              <a href="#how" style={styles.secBtn}>Дізнатися більше <ArrowRight size={19} /></a>
            </div>

            <div style={styles.statsGroup}>
              {stats.map((stat, index) => (
                <React.Fragment key={stat.value}>
                  <StatCard {...stat} />
                  {index < stats.length - 1 && <div style={{ width: '1px', height: '56px', background: 'var(--border)' }} className="desktop-nav" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Права колонка з 3D інтерфейсними картками */}
          <div className="desktop-nav" style={styles.heroRight}>

            {/* Віджет 1: Рекомендація */}
            <div style={styles.floatingCard1}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text)' }}>
                <Menu size={20} />
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                  Ваші рекомендації
                </p>
                <Bell size={19} />
              </div>

              <div
                style={{
                  borderRadius: '24px',
                  border: '1px solid var(--border)',
                  background: 'var(--floating-card-inner-bg)',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <img
                    src="https://i.pinimg.com/1200x/f4/29/40/f429406b4dd227dc87e53f7c1031aeb9.jpg"
                    alt="Марія"
                    style={{
                      height: '80px',
                      width: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />

                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text)' }}>
                      Марія, 22
                    </h3>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#047857',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginTop: '8px',
                      }}
                    >
                      <Heart size={11} fill="currentColor" /> Висока сумісність
                    </span>

                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Київ
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={styles.miniTag}>Не курить</span>
                  <span style={styles.miniTag}>Любить тишу</span>
                </div>

                <p
                  style={{
                    margin: '14px 0 0',
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Люблю ранкову каву, йогу та затишні вечори з фільмами.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '14px',
                }}
              >
                <span
                  style={{
                    color: 'var(--accent)',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  Детальніше
                </span>

                <button
                  style={{
                    height: '42px',
                    width: '42px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'var(--floating-card-inner-bg)',
                    color: 'var(--accent)',
                    boxShadow: '0 10px 28px rgba(45, 35, 95, 0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Віджет 2: Безпека */}
            <div style={styles.floatingCard2}>
              <div style={{ height: '56px', width: '56px', borderRadius: '16px', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
                <LockKeyhole size={25} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text)' }}>Безпечно та конфіденційно</h3>
            </div>

            {/* Віджет 3: Метч */}
            <div style={styles.floatingCard3}>
              <div style={{ display: 'flex', marginLeft: '10px' }}>
                <img src="https://i.pinimg.com/736x/44/6b/6d/446b6db9682f95fdbfb7e4030c7c5bc2.jpg" alt="Олександр" style={{ height: '56px', width: '56px', borderRadius: '50%', border: '4px solid var(--surface)', objectFit: 'cover', marginLeft: '-10px' }} />
                <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80" alt="Ірина" style={{ height: '56px', width: '56px', borderRadius: '50%', border: '4px solid var(--surface)', objectFit: 'cover', marginLeft: '-10px' }} />
              </div>
              <p style={{ margin: '16px 0', fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>Олександр надсилає вам запит!</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '14px' }}>Прийняти заявку</span>
                <MessageCircle size={22} color="var(--accent)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ЯК ЦЕ ПРАЦЮЄ */}
      <RevealWrapper>
        <section id="how" style={styles.howSection}>
          <div style={styles.howContainer}>
            <h2 style={styles.sectionTitle}>Як це працює?</h2>
            <p style={styles.sectionDesc}>Три прості кроки, щоб знайти людину, з якою буде комфортно жити.</p>
            <div style={styles.grid3}>
              {steps.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </div>
        </section>
      </RevealWrapper>

      {/* АКТИВНІ АНКЕТИ */}
      <RevealWrapper>
        <section id="profiles" style={styles.profilesSection}>
          <div style={styles.profilesHeader}>
            <div>
              <p style={styles.profilesBadge}><CheckCircle2 size={16} /> Перевірені профілі</p>
              <h2 style={styles.sectionTitle}>Активні анкети</h2>
            </div>
            <button style={styles.secBtn} onClick={handleCTA}>Переглянути всі анкети <ArrowRight size={19} /></button>
          </div>
          <div style={{ margin: '0 auto', maxWidth: '1360px', ...styles.grid3 }}>
            {profiles.map((profile) => (
              <ProfileCard key={profile.name} profile={profile} onViewClick={handleCTA} />
            ))}
          </div>
        </section>
      </RevealWrapper>

      {/* ФІНАЛЬНИЙ БАНЕР */}
      <RevealWrapper>
        <section style={styles.ctaSection}>
          <div style={styles.ctaContainer}>
            <img src={ctaBg} alt="" style={styles.ctaImg} />
            <div style={styles.ctaContent}>
              <h2 style={styles.ctaTitle}>Готові знайти свого ідеального сусіда?</h2>
              <p style={{ marginTop: '20px', fontSize: '18px', lineHeight: 1.6, color: 'var(--text-secondary)', opacity: 0.9 }}>
                Створіть анкету зараз і почніть отримувати сумісні пропозиції вже сьогодні. Ваш новий дім чекає на вас!
              </p>
              <button style={{ ...styles.mainBtn, marginTop: '30px' }} onClick={handleCTA}>Створити анкету</button>
            </div>
          </div>
        </section>
      </RevealWrapper>

      {/* ФУТЕР */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', fontWeight: 'bold', color: 'var(--accent)', margin: 0 }}>nestmate</p>
          <p style={{ margin: 0 }}>© 2026 Nestmate. Створено для комфортного пошуку сусідів.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 'bold' }}>
            <ShieldCheck size={18} /> Безпечні анкети
          </div>
        </div>
      </footer>

      {/* МОДАЛЬНЕ ВІКНО */}
      {authOpen && (
        <AuthModal mode={authMode} onClose={() => setAuthOpen(false)} onSwitchMode={setAuthMode} />
      )}
    </main>
  );
}

// ─── СТИЛІ КОМПОНЕНТІВ (Відновлено підтримку змінних для Темної теми) ───

const styles = {
  root: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Manrope, sans-serif' },

  heroSection: { position: 'relative', overflow: 'hidden', background: 'var(--bg)' },
  heroBgImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
  heroContainer: { position: 'relative', zIndex: 2, margin: '0 auto', maxWidth: '1440px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', padding: '5rem 2rem 4rem' },
  heroLeft: { flex: '1 1 500px', zIndex: 10, maxWidth: '650px' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '50px', border: '1px solid var(--border)', background: 'var(--surface)', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' },
  heroTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(48px, 6vw, 78px)', fontWeight: 'bold', lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 },
  heroDesc: { marginTop: '1.75rem', maxWidth: '540px', fontSize: '18px', lineHeight: 1.6, color: 'var(--text-secondary)' },
  heroBtnGroup: { marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' },

  mainBtn: { borderRadius: '16px', background: 'var(--accent)', padding: '16px 32px', fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF', border: 'none', cursor: 'pointer', boxShadow: '0 12px 28px rgba(124,92,191,0.25)', transition: 'background 0.2s' },
  secBtn: { display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', textDecoration: 'none', cursor: 'pointer', background: 'transparent', border: 'none' },

  statsGroup: { marginTop: '3.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem' },

  heroRight: {
    flex: '1 1 500px',
    position: 'relative',
    minHeight: '640px',
    display: 'flex',
  },

  floatingCard1: {
    position: 'absolute',
    left: '6%',
    top: '8%',
    width: '360px',
    borderRadius: '30px',
    border: '1px solid var(--border)',
    padding: '20px',
    background: 'var(--floating-card-bg)',
    boxShadow: 'var(--floating-card-shadow)',
    backdropFilter: 'blur(18px)',
    zIndex: 3,
  },

  floatingCard2: {
    position: 'absolute',
    left: '58%',
    top: '18%',
    width: '240px',
    minHeight: '150px',
    borderRadius: '28px',
    border: '1px solid var(--border)',
    padding: '26px',
    background: 'var(--floating-card-bg)',
    boxShadow: 'var(--floating-card-shadow)',
    backdropFilter: 'blur(18px)',
    zIndex: 2,
  },

  floatingCard3: {
    position: 'absolute',
    right: '6%',
    bottom: '22%',
    width: '315px',
    borderRadius: '28px',
    border: '1px solid var(--border)',
    padding: '22px',
    background: 'var(--floating-card-bg)',
    boxShadow: 'var(--floating-card-shadow)',
    backdropFilter: 'blur(18px)',
    zIndex: 4,
  },
  miniTag: {
    borderRadius: '999px',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    background: 'var(--floating-card-inner-bg)',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'var(--hero-overlay)',
    zIndex: 1,
  },

  howSection: { padding: '2rem', background: 'var(--bg)' },
  howContainer: { margin: '0 auto', maxWidth: '1360px', borderRadius: '36px', background: 'var(--surface)', padding: '4rem 2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' },
  sectionTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 'bold', color: 'var(--text)', textAlign: 'center', margin: 0 },
  sectionDesc: { marginTop: '1rem', fontSize: '16px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '600px', margin: '1rem auto 3rem' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' },

  profilesSection: { background: 'var(--bg)', padding: '4rem 2rem' },
  profilesHeader: { margin: '0 auto', maxWidth: '1360px', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem' },
  profilesBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '50px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '1rem' },

  ctaSection: { padding: '0 2rem 3rem', background: 'var(--bg)' },
  ctaContainer: { position: 'relative', margin: '0 auto', minHeight: '300px', maxWidth: '1360px', overflow: 'hidden', borderRadius: '36px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow)' },
  ctaImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  ctaContent: { position: 'relative', zIndex: 10, margin: '0 auto', display: 'flex', minHeight: '300px', maxWidth: '720px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' },
  ctaTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 'bold', color: '#000000', lineHeight: 1.1, margin: 0 }, // Білий текст завжди, бо фон картинки

  footer: { borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '2rem' },
  footerContent: { margin: '0 auto', maxWidth: '1360px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }
};

const statStyles = {
  wrapper: { display: 'flex', alignItems: 'center', gap: '1rem' },
  iconBox: { display: 'flex', height: '48px', width: '48px', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', background: 'var(--accent-secondary)', color: 'var(--accent)' },
  val: { fontFamily: 'DM Serif Display, serif', fontSize: '36px', fontWeight: 'bold', lineHeight: 1, color: 'var(--text)', margin: 0 },
  lbl: { marginTop: '4px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', margin: 0 }
};

const stepStyles = {
  card: { position: 'relative', borderRadius: '28px', border: '1px solid var(--border)', background: 'var(--surface)', padding: '2rem', boxShadow: 'var(--shadow)' },
  header: { marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  iconBox: { display: 'flex', height: '64px', width: '64px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--accent-secondary)', color: 'var(--accent)' },
  num: { display: 'flex', height: '32px', width: '32px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--accent-secondary)', fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' },
  title: { fontSize: '20px', fontWeight: 'bold', color: 'var(--text)', margin: 0 },
  desc: { marginTop: '12px', fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }
};

const profileStyles = {
  card: { borderRadius: '28px', border: '1px solid var(--border)', background: 'var(--surface)', padding: '1.5rem', boxShadow: 'var(--shadow)' },
  header: { marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  badge: (tone) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '50px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold',
    background: tone === 'green' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
    color: tone === 'green' ? '#047857' : '#b45309',
    border: `1px solid ${tone === 'green' ? '#d1fae5' : '#fef3c7'}`
  }),
  bookmark: { borderRadius: '12px', padding: '8px', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' },
  infoRow: { display: 'flex', gap: '1.25rem' },
  avatar: { height: '96px', width: '96px', flexShrink: 0, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--border)' },
  name: { fontSize: '24px', fontWeight: 'bold', color: 'var(--text)', margin: 0 },
  metaList: { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  tagList: { marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '10px' },
  tag: { borderRadius: '50px', border: '1px solid var(--border)', background: 'var(--surface)', padding: '8px 14px', fontSize: '14px', fontWeight: '600', color: 'var(--accent)' },
  footer: { marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' },
  price: { whiteSpace: 'nowrap', fontSize: '20px', fontWeight: '800', color: 'var(--text)', margin: 0 },
  btn: { borderRadius: '16px', background: 'var(--accent)', padding: '12px 20px', fontSize: '14px', fontWeight: 'bold', color: '#FFFFFF', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,92,191,0.25)' }
};