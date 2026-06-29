(function () {
  const root = document.querySelector("[data-comments]");
  if (!root) return;

  const postSlug = root.getAttribute("data-post-slug");
  const list = root.querySelector("[data-comment-list]");
  const form = root.querySelector("[data-comment-form]");
  const status = root.querySelector("[data-comment-status]");
  const count = root.querySelector("[data-comment-count]");
  const apiUrl = `/api/comments?post=${encodeURIComponent(postSlug)}`;
  let replyTarget = null;
  const cancelReplyButton = document.createElement("button");
  cancelReplyButton.type = "button";
  cancelReplyButton.className = "comment-cancel-reply";
  cancelReplyButton.textContent = "Cancel reply";
  cancelReplyButton.hidden = true;
  status.after(cancelReplyButton);

  function setStatus(message, kind) {
    status.textContent = message || "";
    status.dataset.kind = kind || "";
  }

  function render(comments) {
    count.textContent = comments.length ? `${comments.length}` : "0";
    if (!comments.length) {
      list.innerHTML = '<p class="comment-empty">No comments yet.</p>';
      return;
    }

    const repliesByParent = new Map();
    const topLevel = [];
    for (const comment of comments) {
      if (comment.parent_id) {
        const replies = repliesByParent.get(comment.parent_id) || [];
        replies.push(comment);
        repliesByParent.set(comment.parent_id, replies);
      } else {
        topLevel.push(comment);
      }
    }

    list.innerHTML = topLevel
      .map((comment) => {
        const replies = repliesByParent.get(comment.id) || [];
        return `
          <article class="comment-thread">
            ${renderComment(comment, false)}
            ${
              replies.length
                ? `<div class="comment-replies">${replies.map((reply) => renderComment(reply, true)).join("")}</div>`
                : ""
            }
          </article>
        `;
      })
      .join("");
  }

  function renderComment(comment, isReply) {
    const date = new Date(`${comment.created_at}Z`);
    const dateText = Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    return `
      <div class="comment-item ${isReply ? "comment-reply" : ""}" data-comment-id="${comment.id}" data-comment-name="${escapeHtml(comment.name)}">
        <header>
          <strong>${escapeHtml(comment.name)}</strong>
          <span>${escapeHtml(dateText)}</span>
        </header>
        <p>${escapeHtml(comment.comment).replace(/\n/g, "<br>")}</p>
        ${isReply ? "" : '<button type="button" class="comment-reply-button" data-reply-button>Reply</button>'}
      </div>
    `;
  }

  async function loadComments() {
    try {
      const response = await fetch(apiUrl, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error("Could not load comments.");
      const data = await response.json();
      render(data.comments || []);
    } catch {
      list.innerHTML = '<p class="comment-empty">Comments are unavailable right now.</p>';
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Submitting...", "");
    const formData = new FormData(form);
    const payload = {
      postSlug,
      parentId: replyTarget ? replyTarget.id : null,
      name: formData.get("name"),
      comment: formData.get("comment"),
      familyCode: formData.get("familyCode"),
      website: formData.get("website"),
    };

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Comment was not submitted.");
      form.reset();
      clearReplyTarget();
      setStatus("Posted. Thanks for commenting.", "success");
      await loadComments();
    } catch (error) {
      setStatus(error.message || "Comment was not submitted.", "error");
    }
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reply-button]");
    if (!button) return;
    const item = button.closest("[data-comment-id]");
    replyTarget = {
      id: Number(item.dataset.commentId),
      name: item.dataset.commentName || "comment",
    };
    cancelReplyButton.hidden = false;
    form.querySelector("textarea[name='comment']").focus();
    setStatus(`Replying to ${replyTarget.name}.`, "");
  });

  cancelReplyButton.addEventListener("click", () => {
    clearReplyTarget();
    setStatus("", "");
  });

  function clearReplyTarget() {
    replyTarget = null;
    cancelReplyButton.hidden = true;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  loadComments();
})();
