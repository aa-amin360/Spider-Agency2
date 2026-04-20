import React, { useEffect, useRef, useState } from "react";
import {
  CONTENT_STORAGE_KEY,
  cloneData,
  createInitialForm,
  defaultContent,
  itemTemplates,
  loadStoredContent,
  normalizeContent,
} from "./content.js";

const e = React.createElement;

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function getValueAtPath(source, path) {
  return path.reduce((current, key) => current[key], source);
}

function setValueAtPath(source, path, value) {
  const nextValue = cloneData(source);
  let cursor = nextValue;

  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = cursor[path[index]];
  }

  cursor[path[path.length - 1]] = value;
  return nextValue;
}

function moveItem(items, index, direction) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = items.slice();
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(targetIndex, 0, item);
  return nextItems;
}

function applyMetadata(content) {
  if (typeof document === "undefined") {
    return;
  }

  document.title = content.seo.title;

  const descriptionTag = document.querySelector('meta[name="description"]');
  const themeColorTag = document.querySelector('meta[name="theme-color"]');

  if (descriptionTag) {
    descriptionTag.setAttribute("content", content.seo.description);
  }

  if (themeColorTag) {
    themeColorTag.setAttribute("content", content.seo.themeColor);
  }
}

function AdminField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  type = "text",
  placeholder = "",
  hint = "",
  className = "",
  hideLabel = false,
}) {
  const commonProps = {
    className: classNames("admin-input", multiline && "admin-input--textarea"),
    value: value ?? "",
    placeholder,
    onChange: (event) => onChange(event.target.value),
  };

  return e(
    "label",
    { className: classNames("admin-field", className) },
    hideLabel
      ? null
      : e("span", { className: "admin-field__label" }, label),
    multiline
      ? e("textarea", { ...commonProps, rows })
      : e("input", { ...commonProps, type }),
    hint ? e("small", { className: "admin-field__hint" }, hint) : null
  );
}

function AdminPanel({ title, description, action, children }) {
  return e(
    "section",
    { className: "panel admin-panel" },
    e(
      "div",
      { className: "admin-panel__head" },
      e(
        "div",
        { className: "admin-panel__copy" },
        e("h2", { className: "admin-panel__title" }, title),
        description
          ? e("p", { className: "admin-panel__description" }, description)
          : null
      ),
      action ? e("div", { className: "admin-panel__action" }, action) : null
    ),
    children
  );
}

function AdminActionButton({ label, onClick, disabled, tone = "default" }) {
  return e(
    "button",
    {
      type: "button",
      className: classNames(
        "admin-action-button",
        tone === "danger" && "admin-action-button--danger"
      ),
      onClick,
      disabled,
    },
    label
  );
}

function StringListEditor({
  label,
  items,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
  addLabel = "Add item",
  emptyMessage = "No items added yet.",
  placeholder = "",
}) {
  return e(
    AdminPanel,
    {
      title: label,
      description: `Manage the ${label.toLowerCase()} shown on the site.`,
      action: e(
        "button",
        {
          type: "button",
          className: "btn btn--secondary admin-panel-button",
          onClick: onAdd,
        },
        addLabel
      ),
    },
    items.length
      ? e(
          "div",
          { className: "admin-stack" },
          items.map((item, index) =>
            e(
              "article",
              { key: `${label}-${index}`, className: "admin-item" },
              e(
                "div",
                { className: "admin-item__header" },
                e(
                  "div",
                  { className: "admin-item__heading" },
                  e(
                    "p",
                    { className: "admin-item__eyebrow" },
                    `${label} ${index + 1}`
                  ),
                  e(
                    "h3",
                    { className: "admin-item__title" },
                    item || "Untitled entry"
                  )
                ),
                e(
                  "div",
                  { className: "admin-row-actions" },
                  e(AdminActionButton, {
                    label: "Up",
                    onClick: () => onMove(index, -1),
                    disabled: index === 0,
                  }),
                  e(AdminActionButton, {
                    label: "Down",
                    onClick: () => onMove(index, 1),
                    disabled: index === items.length - 1,
                  }),
                  e(AdminActionButton, {
                    label: "Remove",
                    onClick: () => onRemove(index),
                    tone: "danger",
                  })
                )
              ),
              e(AdminField, {
                label: `${label} ${index + 1}`,
                value: item,
                onChange: (value) => onUpdate(index, value),
                placeholder,
                hideLabel: true,
              })
            )
          )
        )
      : e("p", { className: "admin-empty" }, emptyMessage)
  );
}

function CollectionEditor({
  title,
  description,
  itemLabel,
  items,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
  getItemTitle,
  renderFields,
  addLabel = "Add item",
  emptyMessage = "No items added yet.",
}) {
  return e(
    AdminPanel,
    {
      title,
      description,
      action: e(
        "button",
        {
          type: "button",
          className: "btn btn--secondary admin-panel-button",
          onClick: onAdd,
        },
        addLabel
      ),
    },
    items.length
      ? e(
          "div",
          { className: "admin-stack" },
          items.map((item, index) =>
            e(
              "article",
              { key: `${itemLabel}-${index}`, className: "admin-item" },
              e(
                "div",
                { className: "admin-item__header" },
                e(
                  "div",
                  { className: "admin-item__heading" },
                  e(
                    "p",
                    { className: "admin-item__eyebrow" },
                    `${itemLabel} ${index + 1}`
                  ),
                  e(
                    "h3",
                    { className: "admin-item__title" },
                    getItemTitle(item, index)
                  )
                ),
                e(
                  "div",
                  { className: "admin-row-actions" },
                  e(AdminActionButton, {
                    label: "Up",
                    onClick: () => onMove(index, -1),
                    disabled: index === 0,
                  }),
                  e(AdminActionButton, {
                    label: "Down",
                    onClick: () => onMove(index, 1),
                    disabled: index === items.length - 1,
                  }),
                  e(AdminActionButton, {
                    label: "Remove",
                    onClick: () => onRemove(index),
                    tone: "danger",
                  })
                )
              ),
              e(
                "div",
                { className: "admin-grid" },
                renderFields(item, index, onUpdate)
              )
            )
          )
        )
      : e("p", { className: "admin-empty" }, emptyMessage)
  );
}

function Section({ id, eyebrow, title, lead, alternate, children }) {
  return e(
    "section",
    {
      id,
      className: classNames("section", alternate && "section--alt"),
      "data-reveal": "true",
    },
    e(
      "div",
      { className: "container" },
      e(
        "div",
        { className: "section-head" },
        eyebrow ? e("p", { className: "eyebrow" }, eyebrow) : null,
        title ? e("h2", { className: "section-title" }, title) : null,
        lead ? e("p", { className: "section-lead" }, lead) : null
      ),
      children
    )
  );
}

function ActionLink({ href, label, variant = "primary", onClick }) {
  return e(
    "a",
    {
      href,
      className: classNames(
        "btn",
        variant === "secondary" ? "btn--secondary" : "btn--primary"
      ),
      onClick,
    },
    label
  );
}

function ServiceCard({ title, description, outcomes }) {
  return e(
    "article",
    { className: "panel card" },
    e("p", { className: "card-kicker" }, "Service"),
    e("h3", { className: "card-title" }, title),
    e("p", { className: "card-copy" }, description),
    e(
      "ul",
      { className: "tag-list", "aria-label": `${title} outcomes` },
      outcomes.map((item) => e("li", { key: item, className: "tag" }, item))
    )
  );
}

function getVideoEmbedInfo(videoUrl) {
  if (!videoUrl) {
    return null;
  }

  const normalizedUrl = videoUrl.trim();

  if (!normalizedUrl) {
    return null;
  }

  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(normalizedUrl)) {
    return { type: "file", src: normalizedUrl };
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.replace("/", "");

      if (videoId) {
        return {
          type: "iframe",
          src: `https://www.youtube.com/embed/${videoId}`,
        };
      }
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        const videoId = parsedUrl.searchParams.get("v");

        if (videoId) {
          return {
            type: "iframe",
            src: `https://www.youtube.com/embed/${videoId}`,
          };
        }
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return { type: "iframe", src: normalizedUrl };
      }
    }

    if (hostname === "vimeo.com") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];

      if (videoId) {
        return {
          type: "iframe",
          src: `https://player.vimeo.com/video/${videoId}`,
        };
      }
    }

    if (hostname === "player.vimeo.com") {
      return { type: "iframe", src: normalizedUrl };
    }
  } catch (error) {
    return null;
  }

  return null;
}

function ProjectCard({
  title,
  industry,
  imageUrl,
  imageAlt,
  videoUrl,
  videoTitle,
  summary,
  results,
}) {
  const videoEmbed = getVideoEmbedInfo(videoUrl);

  return e(
    "article",
    { className: "panel project-card" },
    e(
      "div",
      { className: "project-media-grid" },
      e(
        "div",
        { className: "project-visual" },
        imageUrl
          ? e("img", {
              src: imageUrl,
              alt: imageAlt || `${title} preview`,
              className: "project-visual__image",
              loading: "lazy",
            })
          : e(
              "div",
              { className: "project-visual__placeholder" },
              e("span", { className: "project-media-label" }, "Image Placeholder"),
              e("strong", null, title),
              e(
                "p",
                null,
                "Add a project screenshot, mockup, or branded visual from the admin dashboard."
              )
            )
      ),
      e(
        "div",
        { className: "project-video-shell" },
        e("span", { className: "project-media-label" }, "Video Section"),
        videoEmbed
          ? e(
              "div",
              { className: "project-video-frame" },
              videoEmbed.type === "file"
                ? e("video", {
                    controls: true,
                    className: "project-video",
                    src: videoEmbed.src,
                    title: videoTitle || `${title} video walkthrough`,
                  })
                : e("iframe", {
                    src: videoEmbed.src,
                    title: videoTitle || `${title} video walkthrough`,
                    loading: "lazy",
                    allow:
                      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                    allowFullScreen: true,
                    referrerPolicy: "strict-origin-when-cross-origin",
                  })
            )
          : e(
              "div",
              { className: "project-video-placeholder" },
              e("strong", null, "Video walkthrough ready"),
              e(
                "p",
                null,
                "Paste a YouTube, Vimeo, or direct MP4 URL in the dashboard to activate this section."
              )
            )
      )
    ),
    e("p", { className: "card-kicker" }, industry),
    e("h3", { className: "card-title" }, title),
    e("p", { className: "card-copy" }, summary),
    e(
      "ul",
      { className: "result-list" },
      results.map((item) => e("li", { key: item }, item))
    ),
    e(
      "a",
      { href: "#contact", className: "text-link" },
      "Discuss a similar project"
    )
  );
}

function ProcessCard({ index, title, copy }) {
  return e(
    "article",
    { className: "panel process-card" },
    e("span", { className: "step-number" }, `0${index + 1}`),
    e("h3", { className: "card-title" }, title),
    e("p", { className: "card-copy" }, copy)
  );
}

function TestimonialCard({ quote, name, role }) {
  return e(
    "figure",
    { className: "panel testimonial-card" },
    e("blockquote", { className: "testimonial-quote" }, quote),
    e(
      "figcaption",
      { className: "testimonial-meta" },
      e("span", { className: "testimonial-name" }, name),
      e("span", { className: "testimonial-role" }, role)
    )
  );
}

function FaqItem({ item, open, onToggle }) {
  return e(
    "article",
    { className: classNames("faq-item", open && "faq-item--open") },
    e(
      "button",
      {
        type: "button",
        className: "faq-question",
        onClick: onToggle,
        "aria-expanded": open,
      },
      e("span", null, item.question),
      e(
        "span",
        { className: "faq-symbol", "aria-hidden": "true" },
        open ? "-" : "+"
      )
    ),
    e("div", { className: "faq-answer" }, e("p", null, item.answer))
  );
}

function AdminDashboard({
  content,
  onValueChange,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onMoveArrayItem,
  onReplaceContent,
}) {
  const [activeTab, setActiveTab] = useState("brand");
  const [statusMessage, setStatusMessage] = useState(
    "Changes auto-save in this browser."
  );
  const fileInputRef = useRef(null);

  const tabs = [
    { id: "brand", label: "Brand" },
    { id: "navigation", label: "Navigation" },
    { id: "hero", label: "Hero" },
    { id: "services", label: "Services" },
    { id: "work", label: "Work" },
    { id: "process", label: "Process" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
    { id: "footer", label: "Footer" },
  ];

  useEffect(() => {
    setStatusMessage("Changes auto-save in this browser.");
  }, [activeTab]);

  function triggerImport() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function exportContent() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "techreion-content.json";
    link.click();

    window.URL.revokeObjectURL(downloadUrl);
    setStatusMessage("Content exported as techreion-content.json.");
  }

  async function importContent(event) {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const fileText = await file.text();
      const parsedContent = JSON.parse(fileText);
      onReplaceContent(normalizeContent(parsedContent));
      setStatusMessage("Content imported successfully.");
    } catch (error) {
      setStatusMessage("Import failed. Please choose a valid JSON file.");
    } finally {
      event.target.value = "";
    }
  }

  function resetContent() {
    const confirmed = window.confirm(
      "Reset all site content to the default Techreion copy?"
    );

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(CONTENT_STORAGE_KEY);
    onReplaceContent(cloneData(defaultContent));
    setStatusMessage("Content reset to defaults.");
  }

  function renderSectionMetaEditor(sectionKey, title) {
    const sectionValue = content.sections[sectionKey];

    return e(
      AdminPanel,
      {
        title,
        description: "Edit the section label, heading, and supporting copy.",
      },
      e(
        "div",
        { className: "admin-grid" },
        e(AdminField, {
          key: `${sectionKey}-eyebrow`,
          label: "Eyebrow",
          value: sectionValue.eyebrow,
          onChange: (value) =>
            onValueChange(["sections", sectionKey, "eyebrow"], value),
        }),
        e(AdminField, {
          key: `${sectionKey}-title`,
          label: "Title",
          value: sectionValue.title,
          onChange: (value) =>
            onValueChange(["sections", sectionKey, "title"], value),
        }),
        e(AdminField, {
          key: `${sectionKey}-lead`,
          label: "Lead text",
          value: sectionValue.lead,
          multiline: true,
          rows: 4,
          className: "admin-field--full",
          onChange: (value) =>
            onValueChange(["sections", sectionKey, "lead"], value),
        })
      )
    );
  }

  function renderActiveTab() {
    if (activeTab === "brand") {
      return [
        e(
          AdminPanel,
          {
            key: "brand-meta",
            title: "Brand and metadata",
            description:
              "Manage the core brand details and metadata used across the public site.",
          },
          e(
            "div",
            { className: "admin-grid" },
            e(AdminField, {
              key: "site-name",
              label: "Platform name",
              value: content.siteConfig.name,
              onChange: (value) => onValueChange(["siteConfig", "name"], value),
            }),
            e(AdminField, {
              key: "site-mark",
              label: "Brand mark",
              value: content.siteConfig.mark,
              onChange: (value) => onValueChange(["siteConfig", "mark"], value),
              hint: "Used as the fallback initials when no logo image is set.",
            }),
            e(AdminField, {
              key: "site-logo-url",
              label: "Logo image URL",
              type: "url",
              value: content.siteConfig.logoUrl,
              onChange: (value) =>
                onValueChange(["siteConfig", "logoUrl"], value),
              hint: "Shown beside the platform name in the top-left header.",
            }),
            e(AdminField, {
              key: "site-logo-alt",
              label: "Logo alt text",
              value: content.siteConfig.logoAlt,
              onChange: (value) =>
                onValueChange(["siteConfig", "logoAlt"], value),
            }),
            e(AdminField, {
              key: "site-tagline",
              label: "Brand tagline",
              value: content.siteConfig.tagline,
              onChange: (value) =>
                onValueChange(["siteConfig", "tagline"], value),
            }),
            e(AdminField, {
              key: "site-email",
              label: "Contact email",
              type: "email",
              value: content.siteConfig.email,
              onChange: (value) =>
                onValueChange(["siteConfig", "email"], value),
            }),
            e(AdminField, {
              key: "site-location",
              label: "Location",
              value: content.siteConfig.location,
              onChange: (value) =>
                onValueChange(["siteConfig", "location"], value),
            }),
            e(AdminField, {
              key: "site-response",
              label: "Response time",
              value: content.siteConfig.responseTime,
              onChange: (value) =>
                onValueChange(["siteConfig", "responseTime"], value),
            }),
            e(AdminField, {
              key: "site-calendar",
              label: "Booking URL",
              type: "url",
              value: content.siteConfig.calendarUrl,
              onChange: (value) =>
                onValueChange(["siteConfig", "calendarUrl"], value),
              hint: "Leave blank to keep buttons linked to the contact section.",
              className: "admin-field--full",
            }),
            e(AdminField, {
              key: "seo-title",
              label: "SEO title",
              value: content.seo.title,
              onChange: (value) => onValueChange(["seo", "title"], value),
              className: "admin-field--full",
            }),
            e(AdminField, {
              key: "seo-description",
              label: "SEO description",
              value: content.seo.description,
              multiline: true,
              rows: 4,
              onChange: (value) =>
                onValueChange(["seo", "description"], value),
              className: "admin-field--full",
            }),
            e(AdminField, {
              key: "seo-theme",
              label: "Theme color",
              value: content.seo.themeColor,
              onChange: (value) => onValueChange(["seo", "themeColor"], value),
            })
          )
        ),
      ];
    }

    if (activeTab === "navigation") {
      return [
        e(CollectionEditor, {
          key: "navigation-items",
          title: "Navigation links",
          description:
            "Control the links shown in the site header and footer.",
          itemLabel: "Link",
          items: content.navItems,
          addLabel: "Add link",
          onAdd: () =>
            onAddArrayItem(["navItems"], cloneData(itemTemplates.navItem)),
          onUpdate: (index, field, value) =>
            onValueChange(["navItems", index, field], value),
          onRemove: (index) => onRemoveArrayItem(["navItems"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["navItems"], index, direction),
          getItemTitle: (item) => item.label || "Untitled link",
          renderFields: (item, index, handleUpdate) => [
            e(AdminField, {
              key: `nav-label-${index}`,
              label: "Label",
              value: item.label,
              onChange: (value) => handleUpdate(index, "label", value),
            }),
            e(AdminField, {
              key: `nav-href-${index}`,
              label: "Href",
              value: item.href,
              onChange: (value) => handleUpdate(index, "href", value),
              hint: "Use anchors like #services or a full external URL.",
            }),
          ],
        }),
      ];
    }

    if (activeTab === "hero") {
      return [
        e(
          AdminPanel,
          {
            key: "hero-copy",
            title: "Hero content",
            description:
              "Edit the opening section, CTA labels, and hero panel messaging.",
          },
          e(
            "div",
            { className: "admin-grid" },
            e(AdminField, {
              key: "hero-eyebrow",
              label: "Eyebrow",
              value: content.hero.eyebrow,
              onChange: (value) => onValueChange(["hero", "eyebrow"], value),
            }),
            e(AdminField, {
              key: "hero-primary-cta",
              label: "Primary CTA label",
              value: content.hero.primaryCtaLabel,
              onChange: (value) =>
                onValueChange(["hero", "primaryCtaLabel"], value),
            }),
            e(AdminField, {
              key: "hero-title",
              label: "Main title",
              value: content.hero.title,
              multiline: true,
              rows: 4,
              onChange: (value) => onValueChange(["hero", "title"], value),
              className: "admin-field--full",
            }),
            e(AdminField, {
              key: "hero-lead",
              label: "Lead copy",
              value: content.hero.lead,
              multiline: true,
              rows: 5,
              onChange: (value) => onValueChange(["hero", "lead"], value),
              className: "admin-field--full",
            }),
            e(AdminField, {
              key: "hero-secondary-cta",
              label: "Secondary CTA label",
              value: content.hero.secondaryCtaLabel,
              onChange: (value) =>
                onValueChange(["hero", "secondaryCtaLabel"], value),
            }),
            e(AdminField, {
              key: "hero-panel-kicker",
              label: "Panel kicker",
              value: content.hero.panelKicker,
              onChange: (value) =>
                onValueChange(["hero", "panelKicker"], value),
            }),
            e(AdminField, {
              key: "hero-panel-title",
              label: "Panel title",
              value: content.hero.panelTitle,
              multiline: true,
              rows: 3,
              onChange: (value) => onValueChange(["hero", "panelTitle"], value),
              className: "admin-field--full",
            })
          )
        ),
        e(StringListEditor, {
          key: "hero-pills",
          label: "Trust pills",
          items: content.hero.trustPills,
          addLabel: "Add pill",
          placeholder: "Short trust statement",
          onAdd: () => onAddArrayItem(["hero", "trustPills"], "New trust pill"),
          onUpdate: (index, value) =>
            onArrayItemChange(["hero", "trustPills"], index, value),
          onRemove: (index) => onRemoveArrayItem(["hero", "trustPills"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["hero", "trustPills"], index, direction),
        }),
        e(StringListEditor, {
          key: "hero-panel-items",
          label: "Hero panel bullets",
          items: content.hero.panelItems,
          addLabel: "Add bullet",
          placeholder: "Describe a need or outcome",
          onAdd: () => onAddArrayItem(["hero", "panelItems"], "New panel point"),
          onUpdate: (index, value) =>
            onArrayItemChange(["hero", "panelItems"], index, value),
          onRemove: (index) => onRemoveArrayItem(["hero", "panelItems"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["hero", "panelItems"], index, direction),
        }),
        e(CollectionEditor, {
          key: "hero-stats",
          title: "Hero stats",
          description: "Edit the numeric highlights shown in the hero panel.",
          itemLabel: "Stat",
          items: content.hero.stats,
          addLabel: "Add stat",
          onAdd: () =>
            onAddArrayItem(["hero", "stats"], cloneData(itemTemplates.heroStat)),
          onUpdate: (index, field, value) =>
            onValueChange(["hero", "stats", index, field], value),
          onRemove: (index) => onRemoveArrayItem(["hero", "stats"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["hero", "stats"], index, direction),
          getItemTitle: (item) => item.label || "Untitled stat",
          renderFields: (item, index, handleUpdate) => [
            e(AdminField, {
              key: `hero-stat-value-${index}`,
              label: "Value",
              value: item.value,
              onChange: (value) => handleUpdate(index, "value", value),
            }),
            e(AdminField, {
              key: `hero-stat-label-${index}`,
              label: "Label",
              value: item.label,
              onChange: (value) => handleUpdate(index, "label", value),
            }),
          ],
        }),
      ];
    }

    if (activeTab === "services") {
      return [
        e("div", { key: "services-meta" }, renderSectionMetaEditor("services", "Services section")),
        e(CollectionEditor, {
          key: "services-items",
          title: "Service cards",
          description:
            "Manage service offerings and the outcome tags shown on each card.",
          itemLabel: "Service",
          items: content.services,
          addLabel: "Add service",
          onAdd: () =>
            onAddArrayItem(["services"], cloneData(itemTemplates.service)),
          onUpdate: (index, field, value) =>
            onValueChange(["services", index, field], value),
          onRemove: (index) => onRemoveArrayItem(["services"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["services"], index, direction),
          getItemTitle: (item) => item.title || "Untitled service",
          renderFields: (item, index, handleUpdate) => [
            e(AdminField, {
              key: `service-title-${index}`,
              label: "Title",
              value: item.title,
              onChange: (value) => handleUpdate(index, "title", value),
            }),
            e(AdminField, {
              key: `service-description-${index}`,
              label: "Description",
              value: item.description,
              multiline: true,
              rows: 4,
              onChange: (value) => handleUpdate(index, "description", value),
              className: "admin-field--full",
            }),
            e(
              "div",
              {
                key: `service-outcomes-${index}`,
                className: "admin-field admin-field--full",
              },
              e(
                StringListEditor,
                {
                  label: "Outcome tags",
                  items: item.outcomes,
                  addLabel: "Add tag",
                  placeholder: "Add an outcome tag",
                  onAdd: () =>
                    onAddArrayItem(["services", index, "outcomes"], "New outcome"),
                  onUpdate: (outcomeIndex, value) =>
                    onArrayItemChange(
                      ["services", index, "outcomes"],
                      outcomeIndex,
                      value
                    ),
                  onRemove: (outcomeIndex) =>
                    onRemoveArrayItem(["services", index, "outcomes"], outcomeIndex),
                  onMove: (outcomeIndex, direction) =>
                    onMoveArrayItem(
                      ["services", index, "outcomes"],
                      outcomeIndex,
                      direction
                    ),
                }
              )
            ),
          ],
        }),
      ];
    }

    if (activeTab === "work") {
      return [
        e("div", { key: "work-meta" }, renderSectionMetaEditor("work", "Work section")),
        e(CollectionEditor, {
          key: "projects-items",
          title: "Project cards",
          description:
            "Edit portfolio examples, supporting copy, and visible results.",
          itemLabel: "Project",
          items: content.projects,
          addLabel: "Add project",
          onAdd: () =>
            onAddArrayItem(["projects"], cloneData(itemTemplates.project)),
          onUpdate: (index, field, value) =>
            onValueChange(["projects", index, field], value),
          onRemove: (index) => onRemoveArrayItem(["projects"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["projects"], index, direction),
          getItemTitle: (item) => item.title || "Untitled project",
          renderFields: (item, index, handleUpdate) => [
            e(AdminField, {
              key: `project-title-${index}`,
              label: "Title",
              value: item.title,
              onChange: (value) => handleUpdate(index, "title", value),
            }),
            e(AdminField, {
              key: `project-industry-${index}`,
              label: "Industry",
              value: item.industry,
              onChange: (value) => handleUpdate(index, "industry", value),
            }),
            e(AdminField, {
              key: `project-image-url-${index}`,
              label: "Image URL",
              type: "url",
              value: item.imageUrl,
              onChange: (value) => handleUpdate(index, "imageUrl", value),
              hint: "Paste an image URL for the project preview.",
            }),
            e(AdminField, {
              key: `project-image-alt-${index}`,
              label: "Image alt text",
              value: item.imageAlt,
              onChange: (value) => handleUpdate(index, "imageAlt", value),
            }),
            e(AdminField, {
              key: `project-video-url-${index}`,
              label: "Video URL",
              type: "url",
              value: item.videoUrl,
              onChange: (value) => handleUpdate(index, "videoUrl", value),
              hint: "Supports YouTube, Vimeo, or direct MP4/WebM links.",
              className: "admin-field--full",
            }),
            e(AdminField, {
              key: `project-video-title-${index}`,
              label: "Video title",
              value: item.videoTitle,
              onChange: (value) => handleUpdate(index, "videoTitle", value),
            }),
            e(AdminField, {
              key: `project-summary-${index}`,
              label: "Summary",
              value: item.summary,
              multiline: true,
              rows: 4,
              onChange: (value) => handleUpdate(index, "summary", value),
              className: "admin-field--full",
            }),
            e(
              "div",
              {
                key: `project-results-${index}`,
                className: "admin-field admin-field--full",
              },
              e(StringListEditor, {
                label: "Result bullets",
                items: item.results,
                addLabel: "Add result",
                placeholder: "Add a visible result",
                onAdd: () =>
                  onAddArrayItem(["projects", index, "results"], "New result"),
                onUpdate: (resultIndex, value) =>
                  onArrayItemChange(
                    ["projects", index, "results"],
                    resultIndex,
                    value
                  ),
                onRemove: (resultIndex) =>
                  onRemoveArrayItem(["projects", index, "results"], resultIndex),
                onMove: (resultIndex, direction) =>
                  onMoveArrayItem(
                    ["projects", index, "results"],
                    resultIndex,
                    direction
                  ),
              })
            ),
          ],
        }),
      ];
    }

    if (activeTab === "process") {
      return [
        e("div", { key: "process-meta" }, renderSectionMetaEditor("process", "Process section")),
        e(CollectionEditor, {
          key: "process-items",
          title: "Process steps",
          description:
            "Edit the delivery sequence and supporting explanation for each step.",
          itemLabel: "Step",
          items: content.processSteps,
          addLabel: "Add step",
          onAdd: () =>
            onAddArrayItem(["processSteps"], cloneData(itemTemplates.processStep)),
          onUpdate: (index, field, value) =>
            onValueChange(["processSteps", index, field], value),
          onRemove: (index) => onRemoveArrayItem(["processSteps"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["processSteps"], index, direction),
          getItemTitle: (item) => item.title || "Untitled step",
          renderFields: (item, index, handleUpdate) => [
            e(AdminField, {
              key: `process-title-${index}`,
              label: "Step title",
              value: item.title,
              onChange: (value) => handleUpdate(index, "title", value),
            }),
            e(AdminField, {
              key: `process-copy-${index}`,
              label: "Step copy",
              value: item.copy,
              multiline: true,
              rows: 4,
              onChange: (value) => handleUpdate(index, "copy", value),
              className: "admin-field--full",
            }),
          ],
        }),
      ];
    }

    if (activeTab === "testimonials") {
      return [
        e(
          "div",
          { key: "testimonials-meta" },
          renderSectionMetaEditor("testimonials", "Testimonials section")
        ),
        e(CollectionEditor, {
          key: "testimonial-items",
          title: "Testimonials",
          description:
            "Manage client quotes, names, and roles shown as proof points.",
          itemLabel: "Testimonial",
          items: content.testimonials,
          addLabel: "Add testimonial",
          onAdd: () =>
            onAddArrayItem(
              ["testimonials"],
              cloneData(itemTemplates.testimonial)
            ),
          onUpdate: (index, field, value) =>
            onValueChange(["testimonials", index, field], value),
          onRemove: (index) => onRemoveArrayItem(["testimonials"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["testimonials"], index, direction),
          getItemTitle: (item) => item.name || "Untitled testimonial",
          renderFields: (item, index, handleUpdate) => [
            e(AdminField, {
              key: `testimonial-quote-${index}`,
              label: "Quote",
              value: item.quote,
              multiline: true,
              rows: 4,
              onChange: (value) => handleUpdate(index, "quote", value),
              className: "admin-field--full",
            }),
            e(AdminField, {
              key: `testimonial-name-${index}`,
              label: "Name",
              value: item.name,
              onChange: (value) => handleUpdate(index, "name", value),
            }),
            e(AdminField, {
              key: `testimonial-role-${index}`,
              label: "Role",
              value: item.role,
              onChange: (value) => handleUpdate(index, "role", value),
            }),
          ],
        }),
      ];
    }

    if (activeTab === "faq") {
      return [
        e("div", { key: "faq-meta" }, renderSectionMetaEditor("faq", "FAQ section")),
        e(CollectionEditor, {
          key: "faq-items",
          title: "FAQ items",
          description: "Add, remove, and reorder common questions.",
          itemLabel: "Question",
          items: content.faqs,
          addLabel: "Add FAQ",
          onAdd: () => onAddArrayItem(["faqs"], cloneData(itemTemplates.faq)),
          onUpdate: (index, field, value) =>
            onValueChange(["faqs", index, field], value),
          onRemove: (index) => onRemoveArrayItem(["faqs"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["faqs"], index, direction),
          getItemTitle: (item) => item.question || "Untitled question",
          renderFields: (item, index, handleUpdate) => [
            e(AdminField, {
              key: `faq-question-${index}`,
              label: "Question",
              value: item.question,
              onChange: (value) => handleUpdate(index, "question", value),
            }),
            e(AdminField, {
              key: `faq-answer-${index}`,
              label: "Answer",
              value: item.answer,
              multiline: true,
              rows: 4,
              onChange: (value) => handleUpdate(index, "answer", value),
              className: "admin-field--full",
            }),
          ],
        }),
      ];
    }

    if (activeTab === "contact") {
      return [
        e(
          "div",
          { key: "contact-meta" },
          renderSectionMetaEditor("contact", "Contact section")
        ),
        e(
          AdminPanel,
          {
            key: "contact-copy",
            title: "Contact cards and form",
            description:
              "Edit the static form label and the two supporting contact cards.",
          },
          e(
            "div",
            { className: "admin-grid" },
            e(AdminField, {
              key: "contact-button",
              label: "Form button label",
              value: content.contact.formButtonLabel,
              onChange: (value) =>
                onValueChange(["contact", "formButtonLabel"], value),
            }),
            e(AdminField, {
              key: "contact-direct-kicker",
              label: "Direct card kicker",
              value: content.contact.directKicker,
              onChange: (value) =>
                onValueChange(["contact", "directKicker"], value),
            }),
            e(AdminField, {
              key: "contact-direct-title",
              label: "Direct card title",
              value: content.contact.directTitle,
              onChange: (value) =>
                onValueChange(["contact", "directTitle"], value),
            }),
            e(AdminField, {
              key: "contact-direct-copy",
              label: "Direct card copy",
              value: content.contact.directCopy,
              multiline: true,
              rows: 4,
              onChange: (value) =>
                onValueChange(["contact", "directCopy"], value),
              className: "admin-field--full",
            }),
            e(AdminField, {
              key: "contact-next-kicker",
              label: "Next-step card kicker",
              value: content.contact.nextStepKicker,
              onChange: (value) =>
                onValueChange(["contact", "nextStepKicker"], value),
            }),
            e(AdminField, {
              key: "contact-next-title",
              label: "Next-step card title",
              value: content.contact.nextStepTitle,
              onChange: (value) =>
                onValueChange(["contact", "nextStepTitle"], value),
            })
          )
        ),
        e(StringListEditor, {
          key: "contact-next-steps",
          label: "Next-step bullets",
          items: content.contact.nextSteps,
          addLabel: "Add step",
          placeholder: "Add the next step text",
          onAdd: () =>
            onAddArrayItem(["contact", "nextSteps"], "New next-step item"),
          onUpdate: (index, value) =>
            onArrayItemChange(["contact", "nextSteps"], index, value),
          onRemove: (index) =>
            onRemoveArrayItem(["contact", "nextSteps"], index),
          onMove: (index, direction) =>
            onMoveArrayItem(["contact", "nextSteps"], index, direction),
        }),
      ];
    }

    return [
      e(
        AdminPanel,
        {
          key: "footer-panel",
          title: "Footer",
          description: "Manage the footer copy shown beneath the navigation.",
        },
        e(
          "div",
          { className: "admin-grid" },
          e(AdminField, {
            key: "footer-blurb",
            label: "Footer blurb",
            value: content.footer.blurb,
            multiline: true,
            rows: 4,
            className: "admin-field--full",
            onChange: (value) => onValueChange(["footer", "blurb"], value),
          })
        )
      ),
    ];
  }

  return e(
    "div",
    { className: "admin-shell" },
    e(
      "main",
      { id: "main-content", className: "admin-main" },
      e(
        "div",
        { className: "container admin-layout" },
        e(
          "section",
          { className: "panel admin-hero" },
          e(
            "div",
            { className: "admin-hero__copy" },
            e("p", { className: "eyebrow" }, "Content control center"),
            e("h1", { className: "admin-hero__title" }, "Techreion admin dashboard"),
            e(
              "p",
              { className: "admin-hero__lead" },
              "Update the public site from one place. Every change is stored in this browser, and you can import or export the full content model as JSON."
            )
          ),
          e(
            "div",
            { className: "admin-hero__actions" },
            e("a", { href: "#page-top", className: "btn btn--secondary" }, "Back to site"),
            e(
              "button",
              {
                type: "button",
                className: "btn btn--secondary",
                onClick: triggerImport,
              },
              "Import JSON"
            ),
            e(
              "button",
              {
                type: "button",
                className: "btn btn--secondary",
                onClick: exportContent,
              },
              "Export JSON"
            ),
            e(
              "button",
              {
                type: "button",
                className: "btn btn--primary",
                onClick: resetContent,
              },
              "Reset defaults"
            ),
            e("input", {
              ref: fileInputRef,
              type: "file",
              accept: "application/json",
              className: "admin-file-input",
              onChange: importContent,
            })
          ),
          e(
            "div",
            { className: "admin-summary-grid" },
            e(
              "div",
              { className: "admin-summary-card" },
              e("strong", null, content.services.length),
              e("span", null, "Services")
            ),
            e(
              "div",
              { className: "admin-summary-card" },
              e("strong", null, content.projects.length),
              e("span", null, "Projects")
            ),
            e(
              "div",
              { className: "admin-summary-card" },
              e("strong", null, content.testimonials.length),
              e("span", null, "Testimonials")
            ),
            e(
              "div",
              { className: "admin-summary-card" },
              e("strong", null, content.faqs.length),
              e("span", null, "FAQs")
            )
          ),
          e("p", { className: "admin-status" }, statusMessage)
        ),
        e(
          "aside",
          { className: "panel admin-sidebar" },
          e("p", { className: "card-kicker" }, "Dashboard sections"),
          e(
            "nav",
            { className: "admin-tabs", "aria-label": "Admin sections" },
            tabs.map((tab) =>
              e(
                "button",
                {
                  key: tab.id,
                  type: "button",
                  className: classNames(
                    "admin-tab",
                    activeTab === tab.id && "admin-tab--active"
                  ),
                  onClick: () => setActiveTab(tab.id),
                },
                tab.label
              )
            )
          )
        ),
        e("div", { className: "admin-content" }, renderActiveTab())
      )
    )
  );
}

export function App() {
  const [content, setContent] = useState(() => loadStoredContent());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [formData, setFormData] = useState(() =>
    createInitialForm(loadStoredContent())
  );
  const [formState, setFormState] = useState({ type: "idle", message: "" });
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#admin"
      ? "admin"
      : "site"
  );

  useEffect(() => {
    applyMetadata(content);
  }, [content]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    function handleHashChange() {
      setRoute(window.location.hash === "#admin" ? "admin" : "site");
      setMobileOpen(false);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (route !== "site") {
      return undefined;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (reducedMotion.matches) {
      elements.forEach((element) => element.classList.add("active"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [route, content]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!content.faqs.length) {
      setActiveFaq(-1);
      return;
    }

    if (activeFaq >= content.faqs.length || activeFaq < 0) {
      setActiveFaq(0);
    }
  }, [activeFaq, content.faqs.length]);

  useEffect(() => {
    const validService = content.services.some(
      (service) => service.title === formData.service
    );

    if (validService) {
      return;
    }

    setFormData((current) => ({
      ...current,
      service: content.services[0] ? content.services[0].title : "",
    }));
  }, [content.services, formData.service]);

  function updateContentValue(path, value) {
    setContent((current) => setValueAtPath(current, path, value));
  }

  function updateArrayItemValue(path, index, value) {
    setContent((current) => {
      const nextItems = getValueAtPath(current, path).slice();
      nextItems[index] = value;
      return setValueAtPath(current, path, nextItems);
    });
  }

  function addArrayItem(path, item) {
    setContent((current) => {
      const nextItems = getValueAtPath(current, path).slice();
      nextItems.push(item);
      return setValueAtPath(current, path, nextItems);
    });
  }

  function removeArrayItem(path, index) {
    setContent((current) => {
      const nextItems = getValueAtPath(current, path).slice();
      nextItems.splice(index, 1);
      return setValueAtPath(current, path, nextItems);
    });
  }

  function moveArrayItem(path, index, direction) {
    setContent((current) => {
      const nextItems = moveItem(getValueAtPath(current, path), index, direction);
      return setValueAtPath(current, path, nextItems);
    });
  }

  function replaceContent(nextContent) {
    setContent(nextContent);
    setFormData(createInitialForm(nextContent));
    setFormState({ type: "idle", message: "" });
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormState({
        type: "error",
        message: "Please add your name, email, and a short project brief.",
      });
      return;
    }

    const messageLines = [
      `Name: ${formData.name.trim()}`,
      `Company: ${formData.company.trim() || "Not provided"}`,
      `Email: ${formData.email.trim()}`,
      `Service: ${formData.service}`,
      `Budget: ${formData.budget.trim() || "Not provided"}`,
      `Timeline: ${formData.timeline.trim() || "Not provided"}`,
      "",
      "Project brief:",
      formData.message.trim(),
      "",
      `Sent from the ${content.siteConfig.name} website.`,
    ];

    const plainMessage = messageLines.join("\n");
    const subject = encodeURIComponent(
      `Project inquiry from ${formData.name.trim()}`
    );
    const body = encodeURIComponent(plainMessage);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainMessage);
      }
    } catch (error) {
      // Clipboard access is optional. The mailto flow still works without it.
    }

    window.location.href = `mailto:${content.siteConfig.email}?subject=${subject}&body=${body}`;

    setFormState({
      type: "success",
      message:
        "Your email app should open now. We also copied the inquiry to your clipboard as a backup when allowed by your browser.",
    });
    setFormData(createInitialForm(content));
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  if (route === "admin") {
    return e(AdminDashboard, {
      content,
      onValueChange: updateContentValue,
      onArrayItemChange: updateArrayItemValue,
      onAddArrayItem: addArrayItem,
      onRemoveArrayItem: removeArrayItem,
      onMoveArrayItem: moveArrayItem,
      onReplaceContent: replaceContent,
    });
  }

  const bookingHref = content.siteConfig.calendarUrl || "#contact";
  const currentYear = new Date().getFullYear();

  return e(
    "div",
    { className: "site-shell", id: "page-top" },
    e(
      "header",
      { className: "site-header" },
      e(
        "div",
        { className: "container nav-shell" },
        e(
          "a",
          { href: "#page-top", className: "brand", onClick: closeMobileMenu },
          content.siteConfig.logoUrl
            ? e(
                "span",
                { className: "brand-mark brand-mark--image" },
                e("img", {
                  src: content.siteConfig.logoUrl,
                  alt: content.siteConfig.logoAlt || `${content.siteConfig.name} logo`,
                  className: "brand-logo",
                  loading: "eager",
                })
              )
            : e(
                "span",
                { className: "brand-mark", "aria-hidden": "true" },
                content.siteConfig.mark || "TR"
              ),
          e(
            "span",
            { className: "brand-text" },
            e("strong", null, content.siteConfig.name),
            e("span", null, content.siteConfig.tagline)
          )
        ),
        e(
          "nav",
          { className: "nav-links", "aria-label": "Primary" },
          content.navItems.map((item) =>
            e(
              "a",
              {
                key: `${item.label}-${item.href}`,
                href: item.href,
                className: "nav-link",
                onClick: closeMobileMenu,
              },
              item.label
            )
          )
        ),
        e(
          "div",
          { className: "nav-actions" },
          e(
            "button",
            {
              type: "button",
              className: classNames("mobile-toggle", mobileOpen && "mobile-toggle--open"),
              "aria-expanded": mobileOpen,
              "aria-controls": "mobile-menu",
              onClick: () => setMobileOpen((current) => !current),
            },
            e("span", null, "Menu")
          ),
          e(ActionLink, {
            href: "#admin",
            label: "Admin",
            variant: "secondary",
            onClick: closeMobileMenu,
          }),
          e(ActionLink, {
            href: bookingHref,
            label: content.hero.primaryCtaLabel,
            onClick: closeMobileMenu,
          })
        )
      ),
      e(
        "div",
        {
          id: "mobile-menu",
          className: classNames("mobile-menu", mobileOpen && "mobile-menu--open"),
        },
        e(
          "nav",
          { className: "mobile-menu__links", "aria-label": "Mobile" },
          content.navItems.map((item) =>
            e(
              "a",
              {
                key: `${item.label}-${item.href}`,
                href: item.href,
                className: "mobile-link",
                onClick: closeMobileMenu,
              },
              item.label
            )
          ),
          e(ActionLink, {
            href: bookingHref,
            label: content.hero.secondaryCtaLabel,
            variant: "secondary",
            onClick: closeMobileMenu,
          }),
          e(ActionLink, {
            href: "#admin",
            label: "Open Admin Dashboard",
            variant: "secondary",
            onClick: closeMobileMenu,
          })
        )
      )
    ),
    e(
      "main",
      { id: "main-content", className: "main-content" },
      e(
        "section",
        { className: "hero", "data-reveal": "true" },
        e(
          "div",
          { className: "container hero-grid" },
          e(
            "div",
            { className: "hero-copy" },
            e("p", { className: "eyebrow" }, content.hero.eyebrow),
            e("h1", { className: "hero-title" }, content.hero.title),
            e("p", { className: "hero-lead" }, content.hero.lead),
            e(
              "div",
              { className: "cta-row" },
              e(ActionLink, {
                href: "#contact",
                label: content.hero.primaryCtaLabel,
              }),
              e(ActionLink, {
                href: bookingHref,
                label: content.hero.secondaryCtaLabel,
                variant: "secondary",
              })
            ),
            e(
              "div",
              { className: "trust-row" },
              content.hero.trustPills.map((item) =>
                e("span", { key: item, className: "trust-pill" }, item)
              )
            )
          ),
          e(
            "aside",
            { className: "panel hero-panel" },
            e("p", { className: "card-kicker" }, content.hero.panelKicker),
            e("h2", { className: "card-title" }, content.hero.panelTitle),
            e(
              "ul",
              { className: "feature-list" },
              content.hero.panelItems.map((item) => e("li", { key: item }, item))
            ),
            e(
              "div",
              { className: "hero-stats" },
              content.hero.stats.map((stat) =>
                e(
                  "div",
                  { key: `${stat.value}-${stat.label}`, className: "stat-card" },
                  e("strong", null, stat.value),
                  e("span", null, stat.label)
                )
              )
            )
          )
        )
      ),
      e(
        Section,
        {
          id: "services",
          eyebrow: content.sections.services.eyebrow,
          title: content.sections.services.title,
          lead: content.sections.services.lead,
        },
        e(
          "div",
          { className: "service-grid" },
          content.services.map((service) =>
            e(ServiceCard, {
              key: service.title,
              title: service.title,
              description: service.description,
              outcomes: service.outcomes,
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "work",
          eyebrow: content.sections.work.eyebrow,
          title: content.sections.work.title,
          lead: content.sections.work.lead,
          alternate: true,
        },
        e(
          "div",
          { className: "project-grid" },
          content.projects.map((project) =>
            e(ProjectCard, {
              key: project.title,
              title: project.title,
              industry: project.industry,
              imageUrl: project.imageUrl,
              imageAlt: project.imageAlt,
              videoUrl: project.videoUrl,
              videoTitle: project.videoTitle,
              summary: project.summary,
              results: project.results,
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "process",
          eyebrow: content.sections.process.eyebrow,
          title: content.sections.process.title,
          lead: content.sections.process.lead,
        },
        e(
          "div",
          { className: "process-grid" },
          content.processSteps.map((step, index) =>
            e(ProcessCard, {
              key: `${step.title}-${index}`,
              index,
              title: step.title,
              copy: step.copy,
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "testimonials",
          eyebrow: content.sections.testimonials.eyebrow,
          title: content.sections.testimonials.title,
          lead: content.sections.testimonials.lead,
          alternate: true,
        },
        e(
          "div",
          { className: "testimonial-grid" },
          content.testimonials.map((item, index) =>
            e(TestimonialCard, {
              key: `${item.name}-${index}`,
              quote: item.quote,
              name: item.name,
              role: item.role,
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "faq",
          eyebrow: content.sections.faq.eyebrow,
          title: content.sections.faq.title,
          lead: content.sections.faq.lead,
        },
        e(
          "div",
          { className: "faq-list" },
          content.faqs.map((item, index) =>
            e(FaqItem, {
              key: `${item.question}-${index}`,
              item,
              open: activeFaq === index,
              onToggle: () => setActiveFaq(activeFaq === index ? -1 : index),
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "contact",
          eyebrow: content.sections.contact.eyebrow,
          title: content.sections.contact.title,
          lead: content.sections.contact.lead,
          alternate: true,
        },
        e(
          "div",
          { className: "contact-grid" },
          e(
            "form",
            { className: "panel contact-form", onSubmit: handleSubmit },
            e(
              "div",
              { className: "form-grid" },
              e(
                "label",
                { className: "field" },
                e("span", null, "Name"),
                e("input", {
                  type: "text",
                  name: "name",
                  value: formData.name,
                  onChange: handleFieldChange,
                  placeholder: "Your name",
                  autoComplete: "name",
                  required: true,
                })
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Company"),
                e("input", {
                  type: "text",
                  name: "company",
                  value: formData.company,
                  onChange: handleFieldChange,
                  placeholder: "Company or brand",
                  autoComplete: "organization",
                })
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Email"),
                e("input", {
                  type: "email",
                  name: "email",
                  value: formData.email,
                  onChange: handleFieldChange,
                  placeholder: "you@example.com",
                  autoComplete: "email",
                  required: true,
                })
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Service"),
                e(
                  "select",
                  {
                    name: "service",
                    value: formData.service,
                    onChange: handleFieldChange,
                  },
                  content.services.map((service) =>
                    e(
                      "option",
                      { key: service.title, value: service.title },
                      service.title
                    )
                  )
                )
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Budget"),
                e("input", {
                  type: "text",
                  name: "budget",
                  value: formData.budget,
                  onChange: handleFieldChange,
                  placeholder: "Example: $3k-$8k",
                })
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Timeline"),
                e("input", {
                  type: "text",
                  name: "timeline",
                  value: formData.timeline,
                  onChange: handleFieldChange,
                  placeholder: "Example: 2-4 weeks",
                })
              )
            ),
            e(
              "label",
              { className: "field field--full" },
              e("span", null, "Project brief"),
              e("textarea", {
                name: "message",
                value: formData.message,
                onChange: handleFieldChange,
                placeholder:
                  "Share your goals, current bottlenecks, and what success would look like.",
                rows: 7,
                required: true,
              })
            ),
            formState.message
              ? e(
                  "p",
                  {
                    className: classNames(
                      "form-status",
                      formState.type === "success"
                        ? "form-status--success"
                        : "form-status--error"
                    ),
                    role: "status",
                    "aria-live": "polite",
                  },
                  formState.message
                )
              : null,
            e(
              "div",
              { className: "form-actions" },
              e(
                "button",
                { type: "submit", className: "btn btn--primary" },
                content.contact.formButtonLabel
              ),
              e(
                "a",
                {
                  href: `mailto:${content.siteConfig.email}`,
                  className: "text-link",
                },
                content.siteConfig.email
              )
            )
          ),
          e(
            "aside",
            { className: "contact-sidebar" },
            e(
              "div",
              { className: "panel contact-card" },
              e("p", { className: "card-kicker" }, content.contact.directKicker),
              e("h3", { className: "card-title" }, content.contact.directTitle),
              e("p", { className: "card-copy" }, content.contact.directCopy),
              e(
                "div",
                { className: "contact-points" },
                e(
                  "a",
                  {
                    href: `mailto:${content.siteConfig.email}`,
                    className: "contact-point",
                  },
                  content.siteConfig.email
                ),
                e("p", { className: "contact-meta" }, content.siteConfig.location),
                e(
                  "p",
                  { className: "contact-meta" },
                  content.siteConfig.responseTime
                )
              )
            ),
            e(
              "div",
              { className: "panel contact-card" },
              e("p", { className: "card-kicker" }, content.contact.nextStepKicker),
              e("h3", { className: "card-title" }, content.contact.nextStepTitle),
              e(
                "ol",
                { className: "next-step-list" },
                content.contact.nextSteps.map((item) =>
                  e("li", { key: item }, item)
                )
              )
            )
          )
        )
      )
    ),
    e(
      "footer",
      { className: "site-footer" },
      e(
        "div",
        { className: "container footer-grid" },
        e(
          "div",
          { className: "footer-copy" },
          e("strong", null, content.siteConfig.name),
          e("p", null, content.footer.blurb)
        ),
        e(
          "nav",
          { className: "footer-links", "aria-label": "Footer" },
          content.navItems.map((item) =>
            e(
              "a",
              { key: `${item.label}-${item.href}`, href: item.href },
              item.label
            )
          ),
          e("a", { href: `mailto:${content.siteConfig.email}` }, "Email"),
          e("a", { href: "#admin" }, "Admin")
        ),
        e(
          "p",
          { className: "footer-note" },
          `Copyright ${currentYear} ${content.siteConfig.name}.`
        )
      )
    )
  );
}
