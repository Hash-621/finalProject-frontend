"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Quote as QuoteIcon,
  Send,
} from "lucide-react";
import Cookies from "js-cookie";
import { userService } from "@/api/services";

export default function CommunutyPostDetail({
  postId,
  categoryLabel,
  listPath,
  apiEndpoints,
}: any) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [commentContent, setCommentContent] = useState("");

  // [핵심] JSON 파싱 함수 (문자열이 없어질 때까지 재귀 파싱)
  const deepParse = (content: any): any => {
    if (!content) return null;
    let temp = content;
    try {
      while (typeof temp === "string") {
        const parsed = JSON.parse(temp);
        if (parsed === temp) break;
        temp = parsed;
      }
    } catch (e) {
      return temp;
    }
    return temp;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        if (token) {
          const userRes = await userService.getUserInfo().catch(() => null);
          if (userRes?.data) {
            const data = userRes.data;
            setCurrentUser({
              userId: data.userId || data.id || data.loginId,
              nickname: data.userNickname || data.nickname,
            });
          }
        }
        const postRes = await api.get(apiEndpoints.fetchPost);
        setPost(postRes.data);
        const commentRes = await api.get(apiEndpoints.fetchComments);
        setComments(commentRes.data);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        router.push(listPath);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId, apiEndpoints, listPath, router]);

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !currentUser) return;
    try {
      await api.post(apiEndpoints.postComment, {
        postId,
        userId: currentUser.userId,
        userNickname: currentUser.nickname,
        content: commentContent,
      });
      setCommentContent("");
      const res = await api.get(apiEndpoints.fetchComments);
      setComments(res.data);
    } catch (error) {
      alert("댓글 등록 실패");
    }
  };

  // [렌더링] 파싱된 데이터를 화면에 그리는 함수
  const renderContent = (rawContent: any) => {
    let data = deepParse(rawContent);

    // 데이터 구조가 중첩되어 있을 경우 대비
    if (data && data.content) {
      data = deepParse(data.content);
    }

    // 데이터가 없거나 형식이 안 맞을 때
    if (!data || (!data.blocks && !data.ops)) {
      // React-Quill로 작성된 글(HTML형태)일 수도 있으므로 dangerouslySetInnerHTML 처리
      return (
        <div className="max-w-[850px] mx-auto px-6 py-10 prose">
          <div dangerouslySetInnerHTML={{ __html: String(rawContent || "") }} />
        </div>
      );
    }

    // Editor.js 블록 렌더링
    return (
      <div className="w-full">
        {data.headerImage && (
          <div className="w-full h-[400px] md:h-[550px] relative mb-12">
            <img
              src={data.headerImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center p-6 text-center">
              <h1 className="text-white text-4xl md:text-5xl font-black mb-4">
                {post?.title}
              </h1>
              <p className="text-white/80 font-bold tracking-widest text-xs border-t border-white/20 pt-4 uppercase">
                {categoryLabel}
              </p>
            </div>
          </div>
        )}

        <div className="max-w-[850px] mx-auto px-6 pb-20">
          {!data.headerImage && (
            <div className="mb-12 border-b pb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-4">
                {post?.title}
              </h1>
              <div className="text-slate-400 text-sm">
                {post?.userNickname} • {new Date().toLocaleDateString()}
              </div>
            </div>
          )}

          {data.blocks &&
            data.blocks.map((block: any, idx: number) => {
              const key = block.id || idx;
              switch (block.type) {
                case "header": {
                  const HeaderTag = `h${block.data.level || 2}` as any;
                  return (
                    <HeaderTag key={key} className="text-2xl font-bold my-6">
                      {block.data.text}
                    </HeaderTag>
                  );
                }
                case "paragraph":
                  return (
                    <p
                      key={key}
                      className="text-[18px] leading-[1.8] text-slate-700 mb-6"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    />
                  );
                case "image":
                  return (
                    <figure key={key} className="my-10 w-full">
                      <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                        <img
                          src={block.data.file.url}
                          alt={block.data.caption}
                          className="w-full h-auto"
                          onError={(e) =>
                            (e.currentTarget.src = "/no-image.png")
                          }
                        />
                      </div>
                      {block.data.caption && (
                        <figcaption className="mt-3 text-center text-slate-400 text-sm">
                          {block.data.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                default:
                  return null;
              }
            })}
        </div>
      </div>
    );
  };

  if (loading || !post) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-6">
        <button
          onClick={() => router.push(listPath)}
          className="flex items-center text-slate-500 font-bold"
        >
          <ChevronLeft size={24} /> <span>List</span>
        </button>
      </nav>

      <article>{renderContent(post.content)}</article>

      {/* 댓글 영역 */}
      <section className="max-w-[850px] mx-auto p-6">
        <h3 className="text-xl font-bold mb-6">댓글 ({comments.length})</h3>
        <div className="mb-10">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="w-full p-4 border rounded-xl h-24 resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder={
              currentUser ? "댓글을 입력하세요..." : "로그인이 필요합니다."
            }
            disabled={!currentUser}
          />
          <button
            onClick={handleCommentSubmit}
            className="mt-2 bg-[#00c73c] text-white px-6 py-2 rounded-lg font-bold float-right"
          >
            등록
          </button>
        </div>
        <div className="space-y-6 mt-16">
          {comments.map((c, i) => (
            <div key={i} className="border-b pb-4">
              <div className="font-bold text-slate-800 mb-1">
                {c.userNickname}
              </div>
              <div className="text-slate-600">{c.content}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
