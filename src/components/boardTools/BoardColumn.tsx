import Link from "next/link";
import { PostData } from "@/types/board";
import { PostCard } from "@/components/boardTools/PostCard";

interface BoardColumnProps {
  title: string;
  posts: PostData[];
  loading: boolean;
  type: "free" | "recommend";
  cardClassName?: string;
}

export const BoardColumn = ({
  title,
  posts,
  loading,
  type,
  cardClassName,
}: BoardColumnProps) => {
  const isBest = type === "recommend";
  const accentColor = isBest ? "text-blue-500" : "text-green-600";

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between px-2">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-tight mb-3 ${
              isBest
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBest ? "bg-blue-400" : "bg-green-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBest ? "bg-blue-500" : "bg-green-500"
                }`}
              ></span>
            </span>

            <p className="uppercase">{isBest ? "Popular" : "Community"}</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-900 tracking-tighter">
            {title}
          </h3>
        </div>
        <Link
          href={`/community/${type}`}
          className="text-[11px] font-bold text-slate-300 hover:text-slate-600 tracking-widest transition-colors"
        >
          SEE ALL
        </Link>
      </div>

      <div className="space-y-4">
        {loading
          ? Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`skeleton-${type}-${i}`}
                  className="h-24 bg-white border border-slate-50 rounded-[1.8rem] animate-pulse"
                />
              ))
          : posts.map((post, idx) => (
              <PostCard
                key={`${type}-post-${post.id}-${idx}`}
                post={post}
                type={type}
                className={cardClassName}
              />
            ))}
      </div>
    </div>
  );
};
