import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "fr" | "ar";

const LS_KEY = "mizani-lang";

/**
 * Dictionary keyed by FRENCH source text -> Arabic translation.
 * Strings not in the dictionary fall back to the source string.
 * Keep keys exactly as displayed in the UI.
 */
const AR: Record<string, string> = {
  // ---------- Header / Nav ----------
  "Domaines": "المجالات",
  "Comment ça marche": "كيف يعمل",
  "Tableau de bord": "لوحة التحكم",
  "Commencer": "ابدأ",
  "Accueil": "الرئيسية",
  "Chat": "محادثة",
  "Profil": "حسابي",

  // ---------- Index / Hero ----------
  "Maison de Justice": "دار العدالة",
  "— Code Marocain 2025": "— القانون المغربي 2025",
  "La justice,": "العدالة،",
  "à votre": "على",
  "mesure.": "مقاسك.",
  "l'équilibre": "الميزان",
  "Mizani — l'équilibre — vous lit la loi marocaine en darija ou en français. Articles cités, démarches expliquées, lettres prêtes à signer.":
    "ميزاني — التوازن — يقرأ لك القانون المغربي بالدارجة أو الفرنسية. مواد مذكورة، خطوات موضّحة، رسائل جاهزة للتوقيع.",
  "Consulter Mizani": "استشر ميزاني",
  "Comment ça marche ↓": "كيف يعمل ↓",
  "Anonyme": "مجهول الهوية",
  "+ Marocains lésés chaque année": "+ مغربي متضرر كل سنة",
  "Darija & Français": "دارجة وفرنسية",

  // Stats bar
  "Domaines juridiques": "المجالات القانونية",
  "Code marocain à jour": "قانون مغربي محدث",

  "Modèles de lettres": "نماذج رسائل",

  // Domaines section
  "Tous vos droits.": "كل حقوقك.",
  "Un seul agent.": "وكيل واحد.",
  "Travail": "الشغل",
  "Logement": "السكن",
  "Famille": "الأسرة",
  "Contrats": "العقود",
  "Administratif": "الإداري",
  "Consommateur": "المستهلك",
  "Licenciement, salaire, indemnités, CNSS.": "الفصل، الأجر، التعويضات، الصندوق الوطني للضمان الاجتماعي.",
  "Loyer, caution, expulsion, copropriété.": "الكراء، الضمانة، الإفراغ، الملكية المشتركة.",
  "Divorce, pension, garde, héritage.": "الطلاق، النفقة، الحضانة، الإرث.",
  "Clauses, résiliation, obligations.": "البنود، الفسخ، الالتزامات.",
  "Commune, état civil, recours.": "الجماعة، الحالة المدنية، الطعن.",
  "Achats, garanties, services défaillants.": "الشراء، الضمانات، الخدمات المعيبة.",
  "Consulter": "استشر",

  // Articles section
  "Articles cités": "مواد قانونية",
  "La loi,": "القانون،",
  "à la lettre.": "حرفياً.",
  "Chaque réponse de Mizani s'appuie sur des articles précis du droit marocain.":
    "كل جواب من ميزاني يستند إلى مواد دقيقة من القانون المغربي.",
  "Code du Travail": "مدونة الشغل",
  "Code de la Famille": "مدونة الأسرة",
  "Loi 67-12": "قانون 67-12",
  "Indemnité de licenciement": "تعويض الفصل",
  "Loyer & dépôt de garantie": "الكراء والضمانة",
  "Pension alimentaire": "النفقة",

  // How it works
  "Quatre étapes.": "أربع خطوات.",
  "Zéro jargon.": "بدون مصطلحات معقدة.",
  "Décrivez votre situation": "صف وضعيتك",
  "En français ou en darija. À l'écrit ou bientôt à l'oral.": "بالفرنسية أو الدارجة. كتابةً، وقريباً صوتياً.",
  "L'agent analyse": "الوكيل يحلّل",
  "Mizani identifie le droit applicable et la jurisprudence.": "يحدد ميزاني القانون المطبق والاجتهاد القضائي.",
  "Recevez une explication": "استلم الشرح",
  "Articles cités, démarches détaillées, langage clair.": "مواد مذكورة، خطوات مفصلة، لغة واضحة.",
  "Téléchargez votre lettre": "حمّل رسالتك",
  "Mise en demeure, recours, plainte — prête à signer.": "إنذار، طعن، شكاية — جاهزة للتوقيع.",

  // Testimonials
  "Témoignages": "شهادات",
  "Des droits.": "حقوق.",
  "Des résultats.": "نتائج.",

  // CTA footer
  "Vos droits,": "حقوقك،",
  "à portée de mot.": "على بُعد كلمة.",
  "Posez votre première question maintenant. C'est gratuit, anonyme et instantané.":
    "اطرح سؤالك الأول الآن. مجاني، مجهول الهوية، وفوري.",
  "Démarrer une consultation": "ابدأ استشارة",
  "© 2026 Mizani — Information juridique générale. Ne remplace pas un avocat agréé.":
    "© 2026 ميزاني — معلومات قانونية عامة. لا تحل محل محامٍ معتمد.",

  // ---------- Categories page ----------
  "Choisissez votre": "اختر",
  "domaine.": "مجالك.",
  "Survolez une carte pour voir les questions les plus fréquentes.":
    "مرّر فوق البطاقة لرؤية الأسئلة الأكثر تكراراً.",
  "Questions fréquentes": "أسئلة شائعة",

  // ---------- Login / Register ----------
  "Bon retour.": "أهلاً بعودتك.",
  "Vos droits vous attendent.": "حقوقك تنتظرك.",
  "Email": "البريد الإلكتروني",
  "Mot de passe": "كلمة السر",
  "Se connecter": "تسجيل الدخول",
  "Pas encore de compte ? S'inscrire": "ليس لديك حساب؟ سجل",
  "Créer un compte.": "إنشاء حساب.",
  "Vos consultations seront sauvegardées en privé.": "سيتم حفظ استشاراتك بشكل خاص.",
  "Prénom": "الاسم",
  "Confirmer le mot de passe": "تأكيد كلمة السر",
  "Créer mon compte": "إنشاء حسابي",
  "Déjà un compte ? Se connecter": "لديك حساب؟ تسجيل الدخول",
  "Compte créé.": "تم إنشاء الحساب.",
  "Redirection vers votre espace…": "إعادة التوجيه إلى فضائك…",
  "Très faible": "ضعيف جداً",
  "Faible": "ضعيف",
  "Moyen": "متوسط",
  "Bon": "جيد",
  "Excellent": "ممتاز",

  // ---------- Dashboard ----------
  "Bonjour.": "مرحباً.",
  "Voici votre situation juridique.": "إليك وضعيتك القانونية.",
  "Consultations": "استشارات",
  "Lettres générées": "رسائل مولّدة",
  "Mises en demeure, recours…": "إنذارات، طعون…",
  "Domaine principal": "المجال الرئيسي",
  "Résolues": "محلولة",
  "Mes consultations": "استشاراتي",
  "Nouvelle →": "جديدة →",
  "Date": "التاريخ",
  "Domaine": "المجال",
  "Résumé": "ملخص",
  "Statut": "الحالة",
  "Actions": "إجراءات",
  "Reprendre": "متابعة",
  "Supprimer": "حذف",
  "Domaines fréquents": "مجالات متكررة",
  "Radar Juridique": "رادار قانوني",
  "Vos domaines juridiques actifs": "مجالاتك القانونية النشطة",
  "Résolu": "محلول",
  "En cours": "جاري",
  "Urgent": "عاجل",

  // ---------- Chat ----------
  "Nouvelle consultation": "استشارة جديدة",
  "En ligne": "متصل",
  "Aujourd'hui": "اليوم",
  "Cette semaine": "هذا الأسبوع",
  "Plus ancien": "أقدم",
  "Aucune consultation pour le moment.": "لا توجد استشارات حالياً.",
  "Déconnexion": "تسجيل الخروج",
  "Bonjour, ": "مرحباً، ",
  "Effacer": "مسح",
  "Décrivez votre situation.": "صف وضعيتك.",
  "En français ou en darija. La conversation reste privée.": "بالفرنسية أو الدارجة. المحادثة تبقى خاصة.",
  "Mon loyer n'est pas remboursé": "كرائي لم يُسترجع",
  "Licenciement abusif, que faire ?": "فصل تعسفي، ما العمل؟",
  "Contrat non respecté par mon client": "عقد لم يحترمه زبوني",
  "Mizani peut faire des erreurs. Pour les cas sérieux, consultez un avocat agréé.":
    "قد يخطئ ميزاني. في الحالات الجدية، استشر محامياً معتمداً.",
  "Radar des sujets détectés": "رادار المواضيع المكتشفة",
  "Les domaines juridiques évoqués dans cette conversation.": "المجالات القانونية المذكورة في هذه المحادثة.",
  "Aucun sujet identifié pour l'instant.": "لم يُحدّد أي موضوع بعد.",
  "Situation urgente — consultez un avocat": "وضعية عاجلة — استشر محامياً",
  "Attention : démarche à délai limité": "تنبيه: إجراء بأجل محدود",
  "Pour une assistance rapide, contactez le Barreau du Maroc.":
    "للمساعدة السريعة، تواصل مع هيئة المحامين بالمغرب.",
  "Générer une lettre": "توليد رسالة",
  "Copier": "نسخ",
  "Copié.": "تم النسخ.",
  "Bienvenue.": "أهلاً وسهلاً.",
  "Déconnecté.": "تم تسجيل الخروج.",

  // ---------- NotFound ----------
  "Cette page n'existe pas.": "هذه الصفحة غير موجودة.",
  "Le droit que vous cherchez s'est perdu en chemin. Revenons à l'accueil.":
    "الحق الذي تبحث عنه ضاع في الطريق. لنعد إلى الرئيسية.",
  "Retour à l'accueil": "العودة إلى الرئيسية",
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (s: string) => string;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<Ctx | null>(null);

const applyToDocument = (lang: Lang) => {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
};

export const initLang = () => {
  const stored = (localStorage.getItem(LS_KEY) as Lang | null) || "fr";
  applyToDocument(stored);
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";
    return ((localStorage.getItem(LS_KEY) as Lang | null) || "fr");
  });

  useEffect(() => {
    applyToDocument(lang);
    localStorage.setItem(LS_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((p) => (p === "fr" ? "ar" : "fr")), []);
  const t = useCallback(
    (s: string) => (lang === "ar" ? AR[s] ?? s : s),
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, toggle, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
};

export const useT = () => useLang().t;