import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";

export default function PendingHostBanner() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || user.role !== "host" || user.isApproved) {
    return null;
  }

  return (
    <div
      style={{
        background:
          "linear-gradient(90deg, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.04) 100%)",
        borderBottom: "1px solid rgba(251,191,36,0.2)",
        padding: "0.65rem clamp(1rem, 3vw, 2.5rem)",
      }}
    >
      <div
        style={{
          maxWidth: "1360px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span
            style={{
              width: "1.5rem",
              height: "1.5rem",
              borderRadius: "50%",
              background: "rgba(251,191,36,0.15)",
              border: "1px solid rgba(251,191,36,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              flexShrink: 0,
            }}
          >
            {" "}
            ⏳
          </span>{" "}
          <div>
            <strong
              style={{
                display: "block",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--amber-400)",
                lineHeight: 1.2,
              }}
            >
              Host approval pending{" "}
            </strong>{" "}
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              Your account is awaiting admin approval.Host tools are locked
              until approval is granted.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <Link
          to="/profile"
          style={{
            padding: "0.35rem 0.9rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.25)",
            color: "var(--amber-400)",
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
        >
          Review profile→{" "}
        </Link>{" "}
      </div>{" "}
    </div>
  );
}
