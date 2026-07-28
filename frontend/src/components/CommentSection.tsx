"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageCircle, Reply, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

interface Comment {
  id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles: { username: string; display_name: string; avatar_url: string | null };
  replies: Comment[];
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user, getAccessToken } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/comments/post/${postId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      console.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [API, postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getAccessToken();
    if (!token || !newComment.trim()) return;

    try {
      const res = await fetch(`${API}/api/v1/comments/post/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch {
      console.error("Failed to post comment");
    }
  };

  const handleReply = async (parentId: string) => {
    const token = await getAccessToken();
    if (!token || !replyContent.trim()) return;

    try {
      const res = await fetch(`${API}/api/v1/comments/post/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyContent.trim(), parent_id: parentId }),
      });
      if (res.ok) {
        setReplyContent("");
        setReplyTo(null);
        setExpanded((prev) => ({ ...prev, [parentId]: true }));
        fetchComments();
      }
    } catch {
      console.error("Failed to post reply");
    }
  };

  const handleDelete = async (commentId: string) => {
    const token = await getAccessToken();
    if (!token) return;
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`${API}/api/v1/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchComments();
    } catch {
      console.error("Failed to delete comment");
    }
  };

  const toggleReplies = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} style={{ marginLeft: depth > 0 ? "2rem" : 0, marginTop: "1rem" }}>
      <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: depth > 0 ? "2px solid var(--accent-border)" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)" }}>
              {comment.profiles?.display_name?.charAt(0) || "?"}
            </div>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>
              {comment.profiles?.display_name || comment.profiles?.username || "Anonymous"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{formatDate(comment.created_at)}</span>
          </div>
          <button
            onClick={() => handleDelete(comment.id)}
            style={{ background: "none", border: "none", color: "var(--text-subtle)", cursor: "pointer", padding: "0.2rem" }}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{comment.content}</p>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          {user && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", padding: 0 }}
            >
              <Reply size={11} /> Reply
            </button>
          )}
          {comment.replies?.length > 0 && (
            <button
              onClick={() => toggleReplies(comment.id)}
              style={{ background: "none", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", padding: 0 }}
            >
              {expanded[comment.id] ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {replyTo === comment.id && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleReply(comment.id); }}
            style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}
          >
            <input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              style={{ flex: 1, fontSize: "0.8125rem" }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!replyContent.trim()}>
              Reply
            </button>
          </form>
        )}
      </div>

      {expanded[comment.id] && comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  const totalComments = (cmts: Comment[]): number => {
    let count = 0;
    for (const c of cmts) {
      count += 1;
      count += totalComments(c.replies || []);
    }
    return count;
  };

  return (
    <section style={{ marginTop: "3rem" }}>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <MessageCircle size={18} /> Comments ({totalComments(comments)})
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            style={{ marginBottom: "0.5rem", resize: "vertical" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link> to join the conversation.
          </p>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-subtle)", fontSize: "0.875rem" }}>
          No comments yet. Be the first to share your thoughts.
        </div>
      ) : (
        comments.map((comment) => renderComment(comment))
      )}
    </section>
  );
}
