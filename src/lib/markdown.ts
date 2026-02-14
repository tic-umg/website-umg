function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isSafeUrl(url: string) {
  const u = url.trim().toLowerCase();
  return (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("mailto:") ||
    u.startsWith("tel:") ||
    u.startsWith("/") ||
    u.startsWith("#")
  );
}

function parseInline(text: string) {
  let s = escapeHtml(text);

  // Inline code
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt: string, url: string) => {
    const src = isSafeUrl(url) ? url : "#";
    return `<img src="${src}" alt="${alt}" class="max-w-full rounded-lg my-4" loading="lazy" />`;
  });

  // Bold / italic
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Links [label](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, url: string) => {
    const href = isSafeUrl(url) ? url : "#";
    return `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`;
  });

  return s;
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");

  const out: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function closeList() {
    if (!listType) return;
    out.push(`</${listType}>`);
    listType = null;
  }

  function flushCode() {
    if (!inCode) return;
    const code = escapeHtml(codeLines.join("\n"));
    out.push(`<pre><code>${code}</code></pre>`);
    inCode = false;
    codeLines = [];
  }

  for (const rawLine of lines) {
    const line = rawLine ?? "";

    if (line.trim().startsWith("```")) {
      if (inCode) flushCode();
      else {
        closeList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (trimmed.length === 0) {
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${parseInline(heading[2])}</h${level}>`);
      continue;
    }

    const bq = trimmed.match(/^>\s?(.*)$/);
    if (bq) {
      closeList();
      out.push(`<blockquote><p>${parseInline(bq[1])}</p></blockquote>`);
      continue;
    }

    const ol = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (ol) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        out.push("<ol>");
      }
      out.push(`<li>${parseInline(ol[2])}</li>`);
      continue;
    }

    const ul = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ul) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        out.push("<ul>");
      }
      out.push(`<li>${parseInline(ul[1])}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${parseInline(trimmed)}</p>`);
  }

  flushCode();
  closeList();

  return out.join("\n");
}
