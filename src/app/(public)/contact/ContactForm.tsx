"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { publicPost } from "@/lib/public-api";
import { useI18n } from "@/components/i18n/LanguageProvider";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChar() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
  return chars[randomInt(0, chars.length - 1)];
}

function generateCaptcha() {
  const text = Array.from({ length: 6 }, () => randomChar()).join("");
  const angles = Array.from({ length: 6 }, () => randomInt(-18, 18));
  return { text, angles };
}

export default function ContactForm() {
  const { t } = useI18n();
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const expected = useMemo(() => captcha.text, [captcha]);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setAnswer("");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (answer.trim() !== expected) {
      setError(t("contact.form.captchaError"));
      return;
    }
    setError("");
    setStatus("loading");
    setMessage("");
    try {
      const res = await publicPost<{ message: string }>("/contact", {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      setStatus("success");
      setMessage(res.message || t("contact.form.successDefault"));
      setForm({ name: "", email: "", subject: "", message: "" });
      refreshCaptcha();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("contact.form.errorDefault");
      setStatus("error");
      setMessage(msg);
    }
  };

  return (
    <form className="mt-4 flex flex-1 flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("contact.form.nameLabel")}
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder={t("contact.form.namePlaceholder")}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("contact.form.emailLabel")}
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="nom@umg.mg"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("contact.form.subjectLabel")}
        </label>
        <input
          id="subject"
          type="text"
          value={form.subject}
          onChange={(event) => setForm({ ...form, subject: event.target.value })}
          placeholder={t("contact.form.subjectPlaceholder")}
          required
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("contact.form.messageLabel")}
        </label>
        <textarea
          id="message"
          rows={12}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          minLength={10}
          maxLength={1000}
          placeholder={t("contact.form.messagePlaceholder")}
          required
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="captcha" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("contact.form.captchaLabel")}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 select-none">
            <div className="absolute left-2 right-2 top-1/2 h-[1px] -translate-y-1/2 bg-slate-300/60 dark:bg-slate-500/40" />
            <div className="absolute left-4 top-2 h-1 w-10 rotate-12 bg-amber-400/40 blur-[0.5px]" />
            <div className="relative flex items-center gap-1 font-mono tracking-[0.18em]">
              {captcha.text.split("").map((char, index) => (
                <span
                  key={`${char}-${index}`}
                  style={{ transform: `rotate(${captcha.angles[index]}deg)` }}
                  className="inline-block"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
          <input
            id="captcha"
            type="text"
            inputMode="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            placeholder={t("contact.form.captchaPlaceholder")}
            required
          />
          <button
            type="button"
            onClick={refreshCaptcha}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            {t("contact.form.captchaRefresh")}
          </button>
        </div>
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : null}
      </div>

      <div className="mt-auto">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:bg-amber-300 disabled:opacity-70"
        >
          {status === "loading" ? t("contact.form.submitting") : t("contact.form.submit")}
        </button>
        {message ? (
          <p className={`mt-3 text-xs ${status === "success" ? "text-emerald-600" : "text-red-500"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
