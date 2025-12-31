import { useState, useEffect } from "react";
import { boardService } from "@/api/services";
import { PostData } from "@/types/board";

export const useBoardData = () => {
  const [freePosts, setFreePosts] = useState<PostData[]>([]);
  const [bestPosts, setBestPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const [freeRes, bestRes] = await Promise.all([
          boardService.getBoardPosts("free"),
          boardService.getBoardPosts("recommend"),
        ]);

        // 데이터 필드 표준화 함수
        const normalize = (data: any[]): PostData[] =>
          (data || []).slice(0, 5).map(
            (item) =>
              ({
                id: item.ID ?? item.id,
                userId: item.USER_ID ?? item.userId,
                title: item.TITLE ?? item.title,
                viewCount: item.VIEW_COUNT ?? item.viewCount ?? 0,
                createdAt: item.CREATED_AT ?? item.createdAt,
              } as PostData)
          );

        setFreePosts(normalize(freeRes.data));
        setBestPosts(normalize(bestRes.data));
      } catch (error) {
        console.error("게시판 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  return { freePosts, bestPosts, loading };
};
